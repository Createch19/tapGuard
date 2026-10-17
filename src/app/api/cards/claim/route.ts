import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let tenantId = user.tenantId;

    // If super admin is claiming on behalf of a tenant or specified tenantId
    const body = await request.json();
    const { shortCode, label, targetTenantId } = body;

    if (user.role === "SUPER_ADMIN" && targetTenantId) {
      tenantId = targetTenantId;
    }

    if (!tenantId) {
      return NextResponse.json(
        { error: "No business account associated with this user." },
        { status: 400 }
      );
    }

    if (!shortCode) {
      return NextResponse.json(
        { error: "Card activation code is required." },
        { status: 400 }
      );
    }

    // 1. Fetch Tenant and check limits
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        cards: { where: { status: "ACTIVE" } },
        subscription: true,
      },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const currentCardCount = tenant.cards.length;
    if (currentCardCount >= tenant.maxCards) {
      return NextResponse.json(
        {
          error: `Card quota reached (${currentCardCount}/${tenant.maxCards}). Please upgrade your plan to activate additional cards.`,
        },
        { status: 403 }
      );
    }

    // 2. Lookup Card by short code (case insensitive)
    const code = String(shortCode).trim().toUpperCase();
    const card = await prisma.card.findFirst({
      where: {
        OR: [{ shortCode: code }, { urlSlug: String(shortCode).trim().toLowerCase() }],
      },
    });

    if (!card) {
      return NextResponse.json(
        { error: `No card found with code "${shortCode}". Please check the code on your physical card.` },
        { status: 404 }
      );
    }

    if (card.status === "ACTIVE" && card.tenantId && card.tenantId !== tenantId) {
      return NextResponse.json(
        { error: "This card is already assigned to another business account." },
        { status: 409 }
      );
    }

    // 3. Activate Card
    const updatedCard = await prisma.card.update({
      where: { id: card.id },
      data: {
        tenantId,
        status: "ACTIVE",
        activatedAt: card.activatedAt || new Date(),
        label: label ? String(label).trim() : card.label || `Card ${card.shortCode}`,
      },
    });

    // 4. Create Audit Log
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        actorEmail: user.email,
        action: "CARD_REASSIGNED",
        targetType: "Card",
        targetId: updatedCard.id,
        metadata: {
          shortCode: updatedCard.shortCode,
          tenantId,
          label: updatedCard.label,
        },
      },
    });

    return NextResponse.json({
      success: true,
      card: updatedCard,
      message: `Card ${updatedCard.shortCode} activated successfully!`,
    });
  } catch (err) {
    console.error("Card claim error:", err);
    return NextResponse.json(
      { error: "Internal server error claiming card." },
      { status: 500 }
    );
  }
}
