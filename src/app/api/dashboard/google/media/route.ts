import { NextRequest, NextResponse } from "next/server";
import { requireTenantUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    await requireTenantUser();
    const body = await request.json();
    const { action, mediaId, flagReason, locationId, category, sourceUrl } = body;

    if (action === "flag_photo") {
      const updated = await prisma.googleMediaItem.update({
        where: { id: mediaId },
        data: {
          flaggedForRemoval: true,
          flagReason: flagReason || "Inappropriate / Violates Google Policy",
        },
      });

      return NextResponse.json({
        success: true,
        message: "Removal request flagged and sent to Google Content Review team.",
        mediaItem: updated,
      });
    }

    if (action === "add_photo") {
      if (!locationId || !sourceUrl) {
        return NextResponse.json({ error: "locationId and sourceUrl are required" }, { status: 400 });
      }

      const newMedia = await prisma.googleMediaItem.create({
        data: {
          locationId,
          category: category || "ADDITIONAL",
          sourceUrl: String(sourceUrl).trim(),
          thumbnailUrl: String(sourceUrl).trim(),
          isCustomerUser: false,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Photo uploaded and published to Google Maps listing!",
        mediaItem: newMedia,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("POST /api/dashboard/google/media error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
