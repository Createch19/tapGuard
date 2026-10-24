import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireSuperAdmin();
    const configs = await prisma.planConfig.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ configs });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await requireSuperAdmin();
    const body = await request.json();
    const {
      id,
      displayName,
      description,
      price,
      currency,
      billingCycle,
      maxCards,
      smartGate,
      multiGateTemplates,
      customBranding,
      webhookAlerts,
      keywordSuggestions,
      googleHub,
      qrCodeTier,
      analyticsRetDays,
      prioritySupport,
      isActive,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Plan ID is required" }, { status: 400 });
    }

    const updated = await prisma.planConfig.update({
      where: { id },
      data: {
        displayName: displayName ? String(displayName).trim() : undefined,
        description: typeof description === "string" ? description.trim() : undefined,
        price: typeof price !== "undefined" ? Number(price) : undefined,
        currency: currency || "INR",
        billingCycle: billingCycle || undefined,
        maxCards: typeof maxCards !== "undefined" ? Number(maxCards) : undefined,
        smartGate: typeof smartGate === "boolean" ? smartGate : undefined,
        multiGateTemplates: typeof multiGateTemplates === "boolean" ? multiGateTemplates : undefined,
        customBranding: typeof customBranding === "boolean" ? customBranding : undefined,
        webhookAlerts: typeof webhookAlerts === "boolean" ? webhookAlerts : undefined,
        keywordSuggestions: typeof keywordSuggestions === "boolean" ? keywordSuggestions : undefined,
        googleHub: typeof googleHub === "boolean" ? googleHub : undefined,
        qrCodeTier: qrCodeTier || undefined,
        analyticsRetDays: typeof analyticsRetDays !== "undefined" ? Number(analyticsRetDays) : undefined,
        prioritySupport: typeof prioritySupport === "boolean" ? prioritySupport : undefined,
        isActive: typeof isActive === "boolean" ? isActive : undefined,
      },
    });

    // Record in Audit Log
    await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        actorEmail: admin.email,
        action: "PLAN_CONFIG_UPDATED",
        targetType: "PlanConfig",
        targetId: updated.id,
        metadata: {
          plan: updated.plan,
          price: Number(updated.price),
          billingCycle: updated.billingCycle,
          maxCards: updated.maxCards,
        },
      },
    });

    return NextResponse.json({ success: true, config: updated });
  } catch (err) {
    console.error("Failed to update plan config:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
