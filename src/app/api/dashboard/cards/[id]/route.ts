import { NextRequest, NextResponse } from "next/server";
import { requireTenantUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { tenantId } = await requireTenantUser();
    const { id } = await params;
    const body = await request.json();
    const { label, status } = body;

    // Verify card belongs to tenant
    const existing = await prisma.card.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    const updated = await prisma.card.update({
      where: { id },
      data: {
        label: typeof label === "string" ? label.trim() : undefined,
        status: status ? status : undefined,
        deactivatedAt: status === "DEACTIVATED" ? new Date() : undefined,
      },
    });

    return NextResponse.json({ success: true, card: updated });
  } catch (err) {
    console.error("Failed to update card:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
