import { NextRequest, NextResponse } from "next/server";
import { requireTenantUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { computeProfileAuditScore, getLatestProfileAuditScore } from "@/lib/profile-audit";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { tenantId } = await requireTenantUser();
    const { searchParams } = new URL(request.url);
    const locationIdParam = searchParams.get("locationId");

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        googleConnection: {
          include: { locations: true },
        },
      },
    });

    if (!tenant || !tenant.googleConnection) {
      return NextResponse.json({
        hasConnection: false,
        message: "No Google Business connection found for this tenant.",
      });
    }

    const locations = tenant.googleConnection.locations;
    if (!locations || locations.length === 0) {
      return NextResponse.json({
        hasConnection: true,
        hasLocation: false,
        message: "Google account is connected, but no verified storefront locations were found.",
      });
    }

    const targetLoc =
      (locationIdParam && locations.find((l) => l.id === locationIdParam || l.googleLocationId === locationIdParam)) ||
      locations.find((l) => l.isPrimaryBranch) ||
      locations[0];

    let auditData = await getLatestProfileAuditScore(targetLoc.id);

    // If no audit has been performed yet, compute one automatically
    if (!auditData.latest) {
      const computed = await computeProfileAuditScore(targetLoc.id, tenantId);
      auditData = await getLatestProfileAuditScore(targetLoc.id);
    }

    return NextResponse.json({
      success: true,
      hasConnection: true,
      hasLocation: true,
      location: {
        id: targetLoc.id,
        googleLocationId: targetLoc.googleLocationId,
        title: targetLoc.title,
        primaryCategory: targetLoc.primaryCategory,
        primaryPhone: targetLoc.primaryPhone,
        websiteUri: targetLoc.websiteUri,
        description: targetLoc.description,
      },
      audit: auditData.latest,
      history: auditData.history,
    });
  } catch (err: any) {
    if (err?.message === "NEXT_REDIRECT" || err?.digest?.includes?.("NEXT_REDIRECT")) {
      throw err;
    }
    console.error("[Audit API Error]:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error fetching audit score" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { tenantId } = await requireTenantUser();
    const body = await request.json().catch(() => ({}));
    const locationIdParam = body?.locationId;

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        googleConnection: {
          include: { locations: true },
        },
      },
    });

    if (!tenant || !tenant.googleConnection?.locations?.length) {
      return NextResponse.json(
        { error: "No location available to audit." },
        { status: 400 }
      );
    }

    const targetLoc =
      (locationIdParam && tenant.googleConnection.locations.find((l) => l.id === locationIdParam || l.googleLocationId === locationIdParam)) ||
      tenant.googleConnection.locations.find((l) => l.isPrimaryBranch) ||
      tenant.googleConnection.locations[0];

    const result = await computeProfileAuditScore(targetLoc.id, tenantId);

    return NextResponse.json({
      success: true,
      message: `Audit completed successfully for ${targetLoc.title}. Score: ${result.overallScore}/100.`,
      result,
    });
  } catch (err: any) {
    if (err?.message === "NEXT_REDIRECT" || err?.digest?.includes?.("NEXT_REDIRECT")) {
      throw err;
    }
    console.error("[Audit Run API Error]:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to execute profile audit" },
      { status: 500 }
    );
  }
}
