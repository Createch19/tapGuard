import { NextRequest, NextResponse } from "next/server";
import { requireTenantUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { fetchNearbyCompetitorRadar } from "@/lib/gemini";

export async function GET(request: NextRequest) {
  try {
    const { tenantId } = await requireTenantUser();

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        geminiConfig: true,
        googleConnection: {
          include: {
            locations: {
              include: {
                reviews: {
                  select: { rating: true },
                },
              },
            },
          },
        },
      },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const location = tenant.googleConnection?.locations?.[0];
    let detectedLocation = "";

    if (location?.addressJson) {
      const addr = location.addressJson as Record<string, any>;
      detectedLocation = [addr.locality, addr.administrativeArea].filter(Boolean).join(", ");
    }

    if (!detectedLocation && tenant.businessProfile) {
      const bp = tenant.businessProfile as Record<string, any>;
      detectedLocation = [bp.city, bp.address].filter(Boolean).join(", ");
    }

    const reviews = location?.reviews || [];
    const ourReviewCount = reviews.length;
    const ourRating =
      ourReviewCount > 0
        ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / ourReviewCount).toFixed(1))
        : 5.0;

    const apiKey =
      tenant.geminiConfig?.customApiKey ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      null;

    const categoryParam = request.nextUrl.searchParams.get("category");
    const locationParam = request.nextUrl.searchParams.get("location");
    const scopeParam = request.nextUrl.searchParams.get("scope") || "DISTRICT";

    const defaultCategory =
      tenant.name.toLowerCase().includes("sport")
        ? "Sports Goods & Equipment Store"
        : (location?.primaryCategory || tenant.businessType || "Business");

    const targetCategory = categoryParam?.trim() || defaultCategory;
    const targetLoc =
      locationParam?.trim() ||
      (detectedLocation ? `${detectedLocation} (Chengalpattu District)` : "Chengalpattu District, Tamil Nadu");

    const result = await fetchNearbyCompetitorRadar({
      businessName: tenant.name,
      businessType: targetCategory,
      location: targetLoc,
      scope: scopeParam,
      ourRating,
      ourReviewCount,
      apiKey,
      model: tenant.geminiConfig?.model || "gemini-3.5-flash",
    });

    return NextResponse.json({
      success: true,
      scope: scopeParam,
      ...result,
    });
  } catch (err: any) {
    if (err?.message === "NEXT_REDIRECT" || err?.digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    console.error("GET /api/dashboard/google/competitors error:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { tenantId } = await requireTenantUser();
    const body = await request.json().catch(() => ({}));

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        geminiConfig: true,
        googleConnection: {
          include: {
            locations: {
              include: {
                reviews: {
                  select: { rating: true },
                },
              },
            },
          },
        },
      },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const location = tenant.googleConnection?.locations?.[0];
    let defaultLoc = "";

    if (location?.addressJson) {
      const addr = location.addressJson as Record<string, any>;
      defaultLoc = [addr.locality, addr.administrativeArea].filter(Boolean).join(", ");
    }

    const reviews = location?.reviews || [];
    const ourReviewCount = reviews.length;
    const ourRating =
      ourReviewCount > 0
        ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / ourReviewCount).toFixed(1))
        : 5.0;

    const defaultCategory =
      tenant.name.toLowerCase().includes("sport")
        ? "Sports Goods & Equipment Store"
        : (location?.primaryCategory || tenant.businessType || "Business");

    const targetCategory = (body.category && String(body.category).trim())
      ? String(body.category).trim()
      : defaultCategory;

    const targetLoc = (body.location && String(body.location).trim())
      ? String(body.location).trim()
      : (defaultLoc ? `${defaultLoc} (Chengalpattu District)` : "Chengalpattu District, Tamil Nadu");

    const targetScope = body.scope || "DISTRICT";

    const apiKey =
      tenant.geminiConfig?.customApiKey ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      null;

    const result = await fetchNearbyCompetitorRadar({
      businessName: tenant.name,
      businessType: targetCategory,
      location: targetLoc,
      scope: targetScope,
      ourRating,
      ourReviewCount,
      apiKey,
      model: tenant.geminiConfig?.model || "gemini-3.5-flash",
    });

    return NextResponse.json({
      success: true,
      scope: targetScope,
      ...result,
    });
  } catch (err: any) {
    if (err?.message === "NEXT_REDIRECT" || err?.digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    console.error("POST /api/dashboard/google/competitors error:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}

