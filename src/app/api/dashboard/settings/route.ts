import { NextRequest, NextResponse } from "next/server";
import { requireTenantUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest) {
  try {
    const { tenantId } = await requireTenantUser();
    const body = await request.json();
    const { googleReviewUrl, smartGateEnabled, alertEmail, webhookUrl } = body;

    const updated = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        googleReviewUrl: googleReviewUrl ? String(googleReviewUrl).trim() : null,
        smartGateEnabled: Boolean(smartGateEnabled),
        alertEmail: alertEmail ? String(alertEmail).trim() : null,
        webhookUrl: webhookUrl ? String(webhookUrl).trim() : null,
      },
    });

    return NextResponse.json({ success: true, tenant: updated });
  } catch (err) {
    console.error("Failed to update settings:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
