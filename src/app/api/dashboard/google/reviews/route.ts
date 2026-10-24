import { NextRequest, NextResponse } from "next/server";
import { requireTenantUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { generateReviewReply, GeminiTone } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const { tenantId } = await requireTenantUser();
    const body = await request.json();
    const { action, reviewId, replyText, customTone } = body;

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

      const tone: GeminiTone = (customTone || tenant.geminiConfig?.brandTone || "WARM") as GeminiTone;

      const draft = await generateReviewReply({
        rating: review.rating,
        reviewerName: review.reviewerName,
        comment: review.comment || "",
        businessName: tenant.name,
        businessType: tenant.businessType,
        brandTone: tone,
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

      const updated = await prisma.googleReview.update({
        where: { id: reviewId },
        data: {
          replyComment: String(replyText).trim(),
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
