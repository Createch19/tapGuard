import { NextRequest, NextResponse } from "next/server";
import { requireTenantUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { generateLocationTrendingKeywords } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const { tenantId } = await requireTenantUser();
    const body = await request.json().catch(() => ({}));

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        geminiConfig: true,
        reviewKeywords: true,
        googleConnection: {
          include: { locations: true },
        },
      },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // Resolve location info from Google Business Profile or Tenant Business Profile
    const googleLoc = tenant.googleConnection?.locations?.[0];
    let detectedLocation = "";

    if (googleLoc?.addressJson) {
      const addr = googleLoc.addressJson as Record<string, any>;
      const parts = [
        addr.locality,
        addr.administrativeArea,
      ].filter(Boolean);
      detectedLocation = parts.join(", ");
    }

    if (!detectedLocation && tenant.businessProfile) {
      const bp = tenant.businessProfile as Record<string, any>;
      detectedLocation = [bp.city, bp.address].filter(Boolean).join(", ");
    }

    const {
      serviceLocation = "",
      existingKeywords = [],
    } = body;

    const targetLocation = (serviceLocation && String(serviceLocation).trim())
      ? String(serviceLocation).trim()
      : (detectedLocation || "Local Area");

    // Extract services or specialties from Google Location or Business Profile
    let services = "";
    if (googleLoc?.description) {
      services = googleLoc.description;
    } else if (googleLoc?.primaryCategory) {
      services = googleLoc.primaryCategory;
    } else if (tenant.businessProfile) {
      const bp = tenant.businessProfile as Record<string, any>;
      if (Array.isArray(bp.catalogCategories)) {
        services = bp.catalogCategories.join(", ");
      }
    }

    const currentKeywords = Array.isArray(existingKeywords) && existingKeywords.length > 0
      ? existingKeywords
      : tenant.reviewKeywords?.keywords || [];

    const apiKey =
      tenant.geminiConfig?.customApiKey ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      null;

    const suggestions = await generateLocationTrendingKeywords({
      businessName: tenant.name,
      businessType: googleLoc?.primaryCategory || tenant.businessType || "Business",
      location: targetLocation,
      services,
      existingKeywords: currentKeywords,
      apiKey,
      model: tenant.geminiConfig?.model || "gemini-3.5-flash",
    });

    return NextResponse.json({
      success: true,
      serviceLocation: targetLocation,
      detectedLocation,
      suggestions,
      count: suggestions.length,
    });
  } catch (err: any) {
    if (err?.message === "NEXT_REDIRECT" || err?.digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    console.error("POST /api/dashboard/keywords/suggest error:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}

