import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
  try {
    const admin = await requireSuperAdmin();
    const body = await request.json();
    const { name, quantity, prefix, notes } = body;

    const count = Number(quantity);
    if (!name || isNaN(count) || count < 1 || count > 500) {
      return NextResponse.json(
        { error: "Valid batch name and quantity (1-500) are required." },
        { status: 400 }
      );
    }

    const cleanPrefix = (prefix || "TAP").toUpperCase().trim();

    // 1. Create CardBatch record
    const batch = await prisma.cardBatch.create({
      data: {
        name: String(name).trim(),
        quantity: count,
        prefix: cleanPrefix,
        notes: notes ? String(notes).trim() : null,
      },
    });

    // 2. Generate Ghost Cards
    const cardsToCreate = [];
    const timestamp = Date.now().toString().slice(-4);

    for (let i = 1; i <= count; i++) {
      const codeNumber = `${timestamp}${String(i).padStart(3, "0")}`;
      const shortCode = `${cleanPrefix}-${codeNumber}`;
      const urlSlug = `${cleanPrefix.toLowerCase()}-${codeNumber}-${nanoid(4).toLowerCase()}`;

      cardsToCreate.push({
        shortCode,
        urlSlug,
        batchId: batch.id,
        status: "UNASSIGNED" as const,
      });
    }

    await prisma.card.createMany({
      data: cardsToCreate,
    });

    // 3. Log Audit
    await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        actorEmail: admin.email,
        action: "CARD_BATCH_GENERATED",
        targetType: "CardBatch",
        targetId: batch.id,
        metadata: {
          batchName: batch.name,
          quantity: count,
          prefix: cleanPrefix,
        },
      },
    });

    return NextResponse.json({
      success: true,
      batchId: batch.id,
      quantity: count,
      message: `Generated batch of ${count} ghost link cards successfully!`,
    });
  } catch (err) {
    console.error("Batch generation error:", err);
    return NextResponse.json(
      { error: "Internal server error creating batch" },
      { status: 500 }
    );
  }
}
