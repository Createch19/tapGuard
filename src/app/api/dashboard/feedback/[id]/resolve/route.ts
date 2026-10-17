import { NextRequest, NextResponse } from "next/server";
import { requireTenantUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, tenantId } = await requireTenantUser();
    const { id } = await params;
    const body = await request.json();
    const { isResolved } = body;

    const existing = await prisma.privateFeedback.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Feedback not found" }, { status: 404 });
    }

    const updated = await prisma.privateFeedback.update({
      where: { id },
      data: {
        isResolved: Boolean(isResolved),
        resolvedAt: isResolved ? new Date() : null,
        resolvedById: isResolved ? user.id : null,
      },
    });

    return NextResponse.json({ success: true, feedback: updated });
  } catch (err) {
    console.error("Failed to update feedback resolution:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
