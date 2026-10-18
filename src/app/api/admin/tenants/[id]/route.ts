import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireSuperAdmin();
    const { id } = await params;
    const body = await request.json();
    const {
      name,
      plan,
      businessType,
      isActive,
      maxCards,
      googleReviewUrl,
      smartGateEnabled,
      gateTemplate,
    } = body;

    const updated = await prisma.tenant.update({
      where: { id },
      data: {
        name: name ? String(name).trim() : undefined,
        plan: plan || undefined,
        businessType: typeof businessType === "string" ? businessType.trim() : undefined,
        gateTemplate: gateTemplate || undefined,
        isActive: typeof isActive === "boolean" ? isActive : undefined,
        maxCards: typeof maxCards !== "undefined" ? Number(maxCards) : undefined,
        googleReviewUrl:
          typeof googleReviewUrl === "string"
            ? googleReviewUrl.trim()
            : undefined,
        smartGateEnabled:
          typeof smartGateEnabled === "boolean" ? smartGateEnabled : undefined,
      },
    });

    // If plan changed, keep subscription record in sync
    if (plan) {
      await prisma.subscription.upsert({
        where: { tenantId: id },
        update: {
          plan,
          status: "ACTIVE",
        },
        create: {
          tenantId: id,
          plan,
          status: "ACTIVE",
          billingCycle: plan === "BASIC" ? "LIFETIME" : "MONTHLY",
          pricePaid: plan === "BASIC" ? 999 : plan === "PRO" ? 499 : 0,
          currency: "INR",
        },
      });
    }

    // Record in Audit Log
    await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        actorEmail: admin.email,
        action:
          typeof isActive === "boolean" && !isActive
            ? "TENANT_SUSPENDED"
            : "TENANT_UPDATED",
        targetType: "Tenant",
        targetId: updated.id,
        metadata: { name: updated.name, plan: updated.plan, isActive: updated.isActive },
      },
    });

    return NextResponse.json({ success: true, tenant: updated });
  } catch (err) {
    console.error("Failed to update tenant:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireSuperAdmin();
    const { id } = await params;

    const tenant = await prisma.tenant.findUnique({
      where: { id },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    await prisma.tenant.delete({
      where: { id },
    });

    await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        actorEmail: admin.email,
        action: "TENANT_DELETED",
        targetType: "Tenant",
        targetId: id,
        metadata: { name: tenant.name, slug: tenant.slug },
      },
    });

    return NextResponse.json({ success: true, message: "Tenant deleted" });
  } catch (err) {
    console.error("Failed to delete tenant:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
