import { NextRequest, NextResponse } from "next/server";
import { requireTenantUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { generateQuestionAnswer, GeminiTone } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const { tenantId } = await requireTenantUser();
    const body = await request.json();
    const { action, questionId, answerText } = body;

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { geminiConfig: true },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    if (action === "generate_answer") {
      const q = await prisma.googleQuestion.findUnique({
        where: { id: questionId },
      });

      if (!q) {
        return NextResponse.json({ error: "Question not found" }, { status: 404 });
      }

      const tone: GeminiTone = (tenant.geminiConfig?.brandTone || "WARM") as GeminiTone;

      const draft = await generateQuestionAnswer({
        question: q.questionText,
        businessName: tenant.name,
        businessType: tenant.businessType,
        brandTone: tone,
        knowledgeBase: tenant.geminiConfig?.knowledgeBase,
        escalationPhone: tenant.geminiConfig?.escalationPhone,
        apiKey: tenant.geminiConfig?.customApiKey || process.env.GEMINI_API_KEY,
        model: tenant.geminiConfig?.model || "gemini-1.5-flash",
      });

      const updated = await prisma.googleQuestion.update({
        where: { id: questionId },
        data: { geminiDraftAnswer: draft },
      });

      return NextResponse.json({ success: true, draft, question: updated });
    }

    if (action === "publish_answer") {
      if (!answerText || !String(answerText).trim()) {
        return NextResponse.json({ error: "Answer text is required" }, { status: 400 });
      }

      const updated = await prisma.googleQuestion.update({
        where: { id: questionId },
        data: {
          officialAnswer: String(answerText).trim(),
          officialAnswerId: `ans_${Date.now()}`,
          isAnswered: true,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Answer published to Google Maps Q&A successfully!",
        question: updated,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("POST /api/dashboard/google/qa error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
