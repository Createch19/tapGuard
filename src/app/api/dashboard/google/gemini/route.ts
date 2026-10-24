import { NextRequest, NextResponse } from "next/server";
import { requireTenantUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest) {
  try {
    const { tenantId } = await requireTenantUser();
    const body = await request.json();

    const {
      model,
      brandTone,
      customPersona,
      knowledgeBase,
      escalationPhone,
      escalationEmail,
      autoPilot5Star,
      minConfidence,
      autoMatchLanguage,
      customApiKey,
    } = body;

    const updated = await prisma.tenantGeminiConfig.upsert({
      where: { tenantId },
      update: {
        model: model || "gemini-1.5-flash",
        brandTone: brandTone || "WARM",
        customPersona: customPersona ?? undefined,
        knowledgeBase: knowledgeBase ?? undefined,
        escalationPhone: escalationPhone ?? undefined,
        escalationEmail: escalationEmail ?? undefined,
        autoPilot5Star: typeof autoPilot5Star === "boolean" ? autoPilot5Star : false,
        minConfidence: typeof minConfidence === "number" ? minConfidence : 85,
        autoMatchLanguage: typeof autoMatchLanguage === "boolean" ? autoMatchLanguage : true,
        customApiKey: customApiKey ? String(customApiKey).trim() : undefined,
      },
      create: {
        tenantId,
        model: model || "gemini-1.5-flash",
        brandTone: brandTone || "WARM",
        customPersona: customPersona || null,
        knowledgeBase: knowledgeBase || null,
        escalationPhone: escalationPhone || null,
        escalationEmail: escalationEmail || null,
        autoPilot5Star: typeof autoPilot5Star === "boolean" ? autoPilot5Star : false,
        minConfidence: typeof minConfidence === "number" ? minConfidence : 85,
        autoMatchLanguage: typeof autoMatchLanguage === "boolean" ? autoMatchLanguage : true,
        customApiKey: customApiKey ? String(customApiKey).trim() : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Gemini AI grounding configuration saved successfully!",
      config: updated,
    });
  } catch (error) {
    console.error("PUT /api/dashboard/google/gemini error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
