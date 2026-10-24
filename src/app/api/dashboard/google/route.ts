import { NextRequest, NextResponse } from "next/server";
import { requireTenantUser } from "@/lib/auth-utils";
import { getTenantGoogleHubData } from "@/lib/google-business";
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
      // Update lastSyncedAt on connection
      await prisma.googleProfileConnection.updateMany({
        where: { tenantId },
        data: { lastSyncedAt: new Date() },
      });
      const data = await getTenantGoogleHubData(tenantId);
      return NextResponse.json({ success: true, message: "Google Profile synced successfully!", data });
    }

    if (action === "disconnect") {
      await prisma.googleProfileConnection.deleteMany({
        where: { tenantId },
      });
      return NextResponse.json({ success: true, message: "Google Business Account disconnected." });
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
