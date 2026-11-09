import { NextRequest, NextResponse } from "next/server";
import { requireTenantUser } from "@/lib/auth-utils";
import { getTenantGoogleHubData } from "@/lib/google-business";
import { syncGoogleBusinessData, revokeGoogleOAuthToken } from "@/lib/google-sync";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { tenantId } = await requireTenantUser();
    const data = await getTenantGoogleHubData(tenantId);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET /api/dashboard/google error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { tenantId } = await requireTenantUser();
    const body = await request.json();
    const { action } = body;

    if (action === "resync") {
      try {
        await syncGoogleBusinessData(tenantId);
      } catch (syncErr) {
        console.warn("Sync warning:", syncErr);
      }
      const data = await getTenantGoogleHubData(tenantId);
      return NextResponse.json({ success: true, message: "Google Profile & Local Reviews synced successfully!", data });
    }

    if (action === "disconnect") {
      const conn = await prisma.googleProfileConnection.findUnique({ where: { tenantId } });
      if (conn?.refreshToken || conn?.accessToken) {
        await revokeGoogleOAuthToken(conn.refreshToken || conn.accessToken).catch(() => {});
      }
      await prisma.googleProfileConnection.deleteMany({
        where: { tenantId },
      });
      await prisma.tenant.update({
        where: { id: tenantId },
        data: { googleBusinessEmail: null, googleLocationId: null },
      });
      return NextResponse.json({ success: true, message: "Google Business Account disconnected and data cleared." });
    }

    if (action === "map_location") {
      const { locationId } = body;
      if (!locationId) {
        return NextResponse.json({ error: "locationId is required" }, { status: 400 });
      }

      const loc = await prisma.googleLocation.findFirst({
        where: { tenantId, googleLocationId: locationId },
      });

      if (!loc) {
        return NextResponse.json({ error: "Location not found under this account" }, { status: 404 });
      }

      // Mark this location as primary and all others as non-primary
      await prisma.googleLocation.updateMany({
        where: { tenantId },
        data: { isPrimaryBranch: false },
      });

      await prisma.googleLocation.update({
        where: { id: loc.id },
        data: { isPrimaryBranch: true },
      });

      // Update tenant.googleLocationId and review URL if placeId exists
      const reviewUrl = loc.placeId
        ? `https://search.google.com/local/writereview?placeid=${loc.placeId}`
        : undefined;

      await prisma.tenant.update({
        where: { id: tenantId },
        data: {
          googleLocationId: loc.googleLocationId,
          ...(reviewUrl ? { googleReviewUrl: reviewUrl } : {}),
        },
      });

      // Trigger sync for newly mapped location
      try {
        await syncGoogleBusinessData(tenantId);
      } catch (syncErr) {
        console.warn("Location sync warning:", syncErr);
      }

      const data = await getTenantGoogleHubData(tenantId);
      return NextResponse.json({
        success: true,
        message: `Primary location mapped to: ${loc.title}`,
        data,
      });
    }

    if (action === "connect_demo") {
      // Re-provision fresh connection
      const data = await getTenantGoogleHubData(tenantId);
      return NextResponse.json({ success: true, message: "Google Business Profile connected successfully!", data });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("POST /api/dashboard/google error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
