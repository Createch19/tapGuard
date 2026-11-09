import { NextRequest, NextResponse } from "next/server";
import { requireTenantUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { generateReviewReply, GeminiTone } from "@/lib/gemini";
import { publishGoogleReviewReply, refreshGoogleAccessToken } from "@/lib/google-sync";

export async function POST(request: NextRequest) {
  try {
    const { tenantId } = await requireTenantUser();
    const body = await request.json();
    const { action, reviewId, replyText, customTone, customLength } = body;

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { geminiConfig: true },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    if (action === "generate_reply") {
      const review = await prisma.googleReview.findUnique({
        where: { id: reviewId },
      });

      if (!review) {
        return NextResponse.json({ error: "Review not found" }, { status: 404 });
      }

      const tone: GeminiTone = (customTone || tenant.geminiConfig?.brandTone || "SOFT") as GeminiTone;
      const length = customLength || tenant.geminiConfig?.replyLength || "2_SENTENCES";

      const draft = await generateReviewReply({
        rating: review.rating,
        reviewerName: review.reviewerName,
        comment: review.comment || "",
        businessName: tenant.name,
        businessType: tenant.businessType,
        brandTone: tone,
        replyLength: length,
        knowledgeBase: tenant.geminiConfig?.knowledgeBase,
        customPersona: tenant.geminiConfig?.customPersona,
        apiKey: tenant.geminiConfig?.customApiKey || process.env.GEMINI_API_KEY,
        model: tenant.geminiConfig?.model || "gemini-1.5-flash",
      });

      // Save draft to review
      const updated = await prisma.googleReview.update({
        where: { id: reviewId },
        data: { geminiDraftReply: draft },
      });

      return NextResponse.json({ success: true, draft, review: updated });
    }

    if (action === "publish_reply") {
      if (!replyText || !String(replyText).trim()) {
        return NextResponse.json({ error: "Reply text is required" }, { status: 400 });
      }

      const review = await prisma.googleReview.findUnique({
        where: { id: reviewId },
        include: {
          location: {
            include: { connection: true },
          },
        },
      });

      if (!review) {
        return NextResponse.json({ error: "Review not found" }, { status: 404 });
      }

      const trimmedReply = String(replyText).trim();

      // If live Google account, push reply to Google GBP v4 API
      if (
        review.location?.connection &&
        !review.location.connection.accessToken.startsWith("ya29.simulated") &&
        !review.googleReviewId.startsWith("review_")
      ) {
        try {
          // 1. Ensure access token is fresh (auto-refreshes if within 5m of expiry)
          const validAccessToken = await refreshGoogleAccessToken(
            review.location.connection.id
          );

          // 2. Publish reply to Google GBP v4 API
          const result = await publishGoogleReviewReply(
            review.location.connection.googleAccountId,
            review.location.googleLocationId,
            review.googleReviewId,
            trimmedReply,
            validAccessToken
          );

          if (!result.success) {
            console.error("Google API rejected review reply:", result.error);
            return NextResponse.json(
              { error: result.error || "Failed to publish reply to Google Maps" },
              { status: 502 }
            );
          }
        } catch (apiErr) {
          console.error("Exception publishing reply to Google:", apiErr);
          return NextResponse.json(
            { error: (apiErr as Error).message || "Failed to contact Google API" },
            { status: 502 }
          );
        }
      }

      const updated = await prisma.googleReview.update({
        where: { id: reviewId },
        data: {
          replyComment: trimmedReply,
          replyUpdatedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Reply published to Google Maps successfully!",
        review: updated,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("POST /api/dashboard/google/reviews error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
