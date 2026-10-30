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
    const {
      label,
      status,
      overrideGate,
      gateTemplate,
      customRedirectUrl,
      customRedirectTitle,
      customRedirectDirect,
      googleReviewUrl,
      smartGateEnabled,
      zomatoUrl,
      swiggyUrl,
      instagramUrl,
      facebookUrl,
      youtubeUrl,
      deliveryOfferText,
      deliveryPhone,
      greetingTitle,
      greetingSubtitle,
    } = body;

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
        overrideGate: typeof overrideGate === "boolean" ? overrideGate : undefined,
        gateTemplate: gateTemplate !== undefined ? gateTemplate : undefined,
        customRedirectUrl: customRedirectUrl !== undefined ? customRedirectUrl : undefined,
        customRedirectTitle: customRedirectTitle !== undefined ? customRedirectTitle : undefined,
        customRedirectDirect: typeof customRedirectDirect === "boolean" ? customRedirectDirect : undefined,
        googleReviewUrl: googleReviewUrl !== undefined ? googleReviewUrl : undefined,
        smartGateEnabled: typeof smartGateEnabled === "boolean" ? smartGateEnabled : undefined,
        zomatoUrl: zomatoUrl !== undefined ? zomatoUrl : undefined,
        swiggyUrl: swiggyUrl !== undefined ? swiggyUrl : undefined,
        instagramUrl: instagramUrl !== undefined ? instagramUrl : undefined,
        facebookUrl: facebookUrl !== undefined ? facebookUrl : undefined,
        youtubeUrl: youtubeUrl !== undefined ? youtubeUrl : undefined,
        deliveryOfferText: deliveryOfferText !== undefined ? deliveryOfferText : undefined,
        deliveryPhone: deliveryPhone !== undefined ? deliveryPhone : undefined,
        greetingTitle: greetingTitle !== undefined ? greetingTitle : undefined,
        greetingSubtitle: greetingSubtitle !== undefined ? greetingSubtitle : undefined,
      },
    });

    return NextResponse.json({ success: true, card: updated });
  } catch (err) {
    console.error("Failed to update card:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
