import { NextRequest, NextResponse } from "next/server";
import { requireTenantUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest) {
  try {
    const { tenantId } = await requireTenantUser();
    const body = await request.json();
    const {
      gateTemplate,
      googleReviewUrl,
      instagramUrl,
      facebookUrl,
      youtubeUrl,
      swiggyUrl,
      zomatoUrl,
      deliveryOfferText,
      deliveryPhone,
      customRedirectUrl,
      customRedirectTitle,
      customRedirectDirect,
      businessProfile,
      greetingTitle,
      greetingSubtitle,
      primaryColor,
      secondaryColor,
      accentColor,
      logoUrl,
    } = body;

    // Check tenant plan
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { plan: true },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // Lite-only restriction: Lite plan only allows BUSINESS_PROFILE
    if (tenant.plan === "LITE" && gateTemplate && gateTemplate !== "BUSINESS_PROFILE") {
      return NextResponse.json(
        {
          error:
            "The Lite plan includes the Business Branding Gateway only. Upgrade to Starter, Growth, or Business to unlock Google Review Gate and other card modes.",
        },
        { status: 403 }
      );
    }

    // Update Tenant with template settings
    const updatedTenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        greetingTitle: greetingTitle ? String(greetingTitle).trim() : undefined,
        greetingSubtitle: greetingSubtitle ? String(greetingSubtitle).trim() : null,
        gateTemplate: tenant.plan === "LITE" ? "BUSINESS_PROFILE" : gateTemplate || "GOOGLE_REVIEW",
        googleReviewUrl: googleReviewUrl !== undefined ? (googleReviewUrl ? String(googleReviewUrl).trim() : null) : undefined,
        instagramUrl: instagramUrl !== undefined ? (instagramUrl ? String(instagramUrl).trim() : null) : undefined,
        facebookUrl: facebookUrl !== undefined ? (facebookUrl ? String(facebookUrl).trim() : null) : undefined,
        youtubeUrl: youtubeUrl !== undefined ? (youtubeUrl ? String(youtubeUrl).trim() : null) : undefined,
        swiggyUrl: swiggyUrl !== undefined ? (swiggyUrl ? String(swiggyUrl).trim() : null) : undefined,
        zomatoUrl: zomatoUrl !== undefined ? (zomatoUrl ? String(zomatoUrl).trim() : null) : undefined,
        deliveryOfferText: deliveryOfferText !== undefined ? (deliveryOfferText ? String(deliveryOfferText).trim() : null) : undefined,
        deliveryPhone: deliveryPhone !== undefined ? (deliveryPhone ? String(deliveryPhone).trim() : null) : undefined,
        customRedirectUrl: customRedirectUrl !== undefined ? (customRedirectUrl ? String(customRedirectUrl).trim() : null) : undefined,
        customRedirectTitle: customRedirectTitle !== undefined ? (customRedirectTitle ? String(customRedirectTitle).trim() : "View Online Menu") : undefined,
        customRedirectDirect: customRedirectDirect !== undefined ? Boolean(customRedirectDirect) : undefined,
        businessProfile: businessProfile !== undefined ? businessProfile : undefined,
      },
    });

    // Upsert TenantBranding
    const branding = await prisma.tenantBranding.upsert({
      where: { tenantId },
      create: {
        tenantId,
        primaryColor: primaryColor || "#0D9488",
        secondaryColor: secondaryColor || "#F0FDFA",
        accentColor: accentColor || "#14B8A6",
        logoUrl: logoUrl || null,
      },
      update: {
        primaryColor: primaryColor || "#0D9488",
        secondaryColor: secondaryColor || "#F0FDFA",
        accentColor: accentColor || "#14B8A6",
        logoUrl: logoUrl || null,
      },
    });

    return NextResponse.json({
      success: true,
      tenant: updatedTenant,
      branding,
    });
  } catch (err) {
    console.error("Failed to update branding:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
