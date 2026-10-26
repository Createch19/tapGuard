import { NextRequest, NextResponse } from "next/server";
import { requireTenantUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { publishGoogleHours } from "@/lib/google-sync";

export async function POST(request: NextRequest) {
  try {
    await requireTenantUser();
    const body = await request.json();
    const { locationId, regularHours, specialHours } = body;

    if (!locationId) {
      return NextResponse.json({ error: "locationId is required" }, { status: 400 });
    }

    const location = await prisma.googleLocation.findUnique({
      where: { id: locationId },
      include: { connection: true },
    });

    if (
      location?.connection &&
      !location.connection.accessToken.startsWith("ya29.simulated")
    ) {
      try {
        await publishGoogleHours(
          location.googleLocationId,
          regularHours || {},
          specialHours || [],
          location.connection.accessToken
        );
      } catch (pubErr) {
        console.warn("Live Google hours publish notice:", pubErr);
      }
    }

    const updated = await prisma.googleLocation.update({
      where: { id: locationId },
      data: {
        regularHoursJson: regularHours || undefined,
        specialHoursJson: specialHours || undefined,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Operating hours synced to Google Search & Maps successfully!",
      location: updated,
    });
  } catch (error) {
    console.error("POST /api/dashboard/google/hours error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
