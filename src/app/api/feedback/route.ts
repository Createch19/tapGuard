import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { dispatchFeedbackAlerts } from "@/lib/alerts";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      tapEventId,
      cardId,
      tenantId,
      rating,
      feedbackText,
      phoneNumber,
      customerName,
    } = body;

    if (!tapEventId || !cardId || !tenantId || !rating) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify tenant and card
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const card = await prisma.card.findUnique({
      where: { id: cardId },
    });

    // Create private feedback record
    const feedback = await prisma.privateFeedback.create({
      data: {
        tenantId,
        cardId,
        tapEventId,
        rating: Number(rating),
        feedbackText: feedbackText ? String(feedbackText).trim() : null,
        phoneNumber: phoneNumber ? String(phoneNumber).trim() : null,
        customerName: customerName ? String(customerName).trim() : null,
        isResolved: false,
      },
    });

    // Update the tap event outcome & ensure tenantId is attached
    if (tapEventId) {
      await prisma.tapEvent
        .update({
          where: { id: tapEventId },
          data: {
            tenantId,
            rating: Number(rating),
            outcome: "FEEDBACK_CAPTURED",
          },
        })
        .catch((err) => {
          console.warn("Could not update tap event outcome for feedback:", err);
        });
    }

    // Dispatch webhook & email alert
    await dispatchFeedbackAlerts(tenant.webhookUrl, tenant.alertEmail, {
      tenantName: tenant.name,
      cardLabel: card?.label || "NFC Review Card",
      rating: Number(rating),
      customerName,
      phoneNumber,
      feedbackText,
      createdAt: feedback.createdAt,
    });

    return NextResponse.json({ success: true, feedbackId: feedback.id });
  } catch (err) {
    console.error("Failed to capture private feedback:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
