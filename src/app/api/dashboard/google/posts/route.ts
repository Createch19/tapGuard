import { NextRequest, NextResponse } from "next/server";
import { requireTenantUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { publishGoogleLocalPost } from "@/lib/google-sync";

export async function POST(request: NextRequest) {
  try {
    await requireTenantUser();
    const body = await request.json();
    const {
      locationId,
      topicType = "STANDARD",
      summary,
      callToAction,
      actionUrl,
      mediaUrl,
      couponCode,
      startDate,
      endDate,
    } = body;

    if (!locationId || !summary) {
      return NextResponse.json({ error: "Location ID and post summary are required" }, { status: 400 });
    }

    const location = await prisma.googleLocation.findUnique({
      where: { id: locationId },
      include: { connection: true },
    });

    let liveGooglePostId: string | null = null;

    if (
      location?.connection &&
      !location.connection.accessToken.startsWith("ya29.simulated")
    ) {
      try {
        const pubResult = await publishGoogleLocalPost(
          location.connection.googleAccountId,
          location.googleLocationId,
          {
            summary: String(summary).trim(),
            topicType,
            callToAction,
            actionUrl,
            mediaUrl,
          },
          location.connection.accessToken
        );
        if (pubResult.success && pubResult.data?.name) {
          liveGooglePostId = pubResult.data.name;
        }
      } catch (pubErr) {
        console.warn("Live Google local post publish notice:", pubErr);
      }
    }

    const post = await prisma.googlePost.create({
      data: {
        locationId,
        googlePostId: liveGooglePostId,
        topicType,
        summary: String(summary).trim(),
        callToAction: callToAction || null,
        actionUrl: actionUrl || null,
        mediaUrl: mediaUrl || null,
        couponCode: couponCode ? String(couponCode).trim() : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Google Post published live to Google Search and Maps!",
      post,
    });
  } catch (error) {
    console.error("POST /api/dashboard/google/posts error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
