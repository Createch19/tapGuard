import { NextRequest, NextResponse } from "next/server";
import { requireTenantUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { revokeGoogleOAuthToken } from "@/lib/google-sync";
import { dispatchGoogleReviewAlert } from "@/lib/alerts";

export async function PUT(request: NextRequest) {
  try {
    const { tenantId } = await requireTenantUser();
    const body = await request.json();
    const {
      googleReviewUrl,
      smartGateEnabled,
      alertEmail,
      webhookUrl,
      reviewAlertFilter,
      reviewAlertEmail,
      reviewAlertWebhook,
      googleBusinessEmail,
      googleLocationId,
      googleAccountId,
      geminiApiKey,
      brandTone,
      replyLength,
      customGoogleClientId,
      customGoogleClientSecret,
      disconnectGoogle,
      testAlert,
      testRating,
    } = body;

    // Handle sending a test notification
    if (testAlert) {
      const targetEmail = reviewAlertEmail || alertEmail;
      if (!targetEmail && !webhookUrl) {
        return NextResponse.json(
          { error: "Please enter an alert email or webhook URL first." },
          { status: 400 }
        );
      }

      const tenantRec = await prisma.tenant.findUnique({ where: { id: tenantId } });
      await dispatchGoogleReviewAlert({
        tenantName: tenantRec?.name || "Business",
        locationTitle: "Main Location (Test Notification)",
        reviewerName: "Alex Morgan (Test Review)",
        rating: testRating ? Number(testRating) : 5,
        comment: "This is a test notification from TapGenie to verify your review alert delivery settings. Everything is working correctly!",
        reviewCreatedAt: new Date(),
        googleReviewId: "test_alert_" + Date.now(),
        alertEmail: targetEmail ? String(targetEmail).trim() : null,
        webhookUrl: webhookUrl ? String(webhookUrl).trim() : null,
        filterPreference: "ALL",
        webhookEnabled: true,
      });

      return NextResponse.json({
        success: true,
        message: `Test alert dispatched${targetEmail ? ` to ${targetEmail}` : ""}!`,
      });
    }

    if (disconnectGoogle) {
      const conn = await prisma.googleProfileConnection.findUnique({
        where: { tenantId },
      });

      if (conn?.refreshToken || conn?.accessToken) {
        await revokeGoogleOAuthToken(conn.refreshToken || conn.accessToken).catch(() => {});
      }

      await prisma.googleProfileConnection.deleteMany({
        where: { tenantId },
      });

      await prisma.tenant.update({
        where: { id: tenantId },
        data: {
          googleBusinessEmail: null,
          googleLocationId: null,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Google Business connection revoked and all cached data cleared.",
      });
    }

    const updated = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        googleReviewUrl: googleReviewUrl ? String(googleReviewUrl).trim() : null,
        smartGateEnabled: Boolean(smartGateEnabled),
        alertEmail: alertEmail ? String(alertEmail).trim() : null,
        webhookUrl: webhookUrl ? String(webhookUrl).trim() : null,
        reviewAlertFilter: typeof reviewAlertFilter !== "undefined" ? String(reviewAlertFilter) : undefined,
        reviewAlertEmail: typeof reviewAlertEmail !== "undefined"
          ? (reviewAlertEmail ? String(reviewAlertEmail).trim() : null)
          : undefined,
        reviewAlertWebhook: typeof reviewAlertWebhook !== "undefined" ? Boolean(reviewAlertWebhook) : undefined,
        googleBusinessEmail: googleBusinessEmail ? String(googleBusinessEmail).trim() : null,
        googleLocationId: googleLocationId ? String(googleLocationId).trim() : null,
        customGoogleClientId: typeof customGoogleClientId !== "undefined"
          ? (customGoogleClientId ? String(customGoogleClientId).trim() : null)
          : undefined,
        customGoogleClientSecret: typeof customGoogleClientSecret !== "undefined"
          ? (customGoogleClientSecret ? String(customGoogleClientSecret).trim() : null)
          : undefined,
      },
    });

    // Save Gemini AI reply settings (API key, tone, sentence length) if provided
    if (typeof geminiApiKey !== "undefined" || brandTone || replyLength) {
      await prisma.tenantGeminiConfig.upsert({
        where: { tenantId },
        update: {
          ...(typeof geminiApiKey !== "undefined"
            ? { customApiKey: geminiApiKey ? String(geminiApiKey).trim() : null }
            : {}),
          ...(brandTone ? { brandTone: String(brandTone) } : {}),
          ...(replyLength ? { replyLength: String(replyLength) } : {}),
        },
        create: {
          tenantId,
          customApiKey: geminiApiKey ? String(geminiApiKey).trim() : null,
          model: "gemini-1.5-flash",
          brandTone: brandTone ? String(brandTone) : "SOFT",
          replyLength: replyLength ? String(replyLength) : "2_SENTENCES",
        },
      });
    }

    // If Google account ID or email is provided, ensure connection record exists
    if (googleBusinessEmail || googleAccountId) {
      const email = googleBusinessEmail ? String(googleBusinessEmail).trim() : "owner@business.com";
      const accountId = googleAccountId ? String(googleAccountId).trim() : null;
      const locationId = googleLocationId ? String(googleLocationId).trim() : null;

      const existingConnection = await prisma.googleProfileConnection.findUnique({
        where: { tenantId },
        include: { locations: true },
      });

      if (existingConnection) {
        await prisma.googleProfileConnection.update({
          where: { tenantId },
          data: {
            connectedEmail: email,
            ...(accountId ? { googleAccountId: accountId } : {}),
            lastSyncedAt: new Date(),
          },
        });

        if (locationId && existingConnection.locations.length > 0) {
          await prisma.googleLocation.update({
            where: { id: existingConnection.locations[0].id },
            data: { googleLocationId: locationId },
          });
        }
      }
    }

    return NextResponse.json({ success: true, tenant: updated });
  } catch (err: any) {
    if (err?.digest?.startsWith?.("NEXT_REDIRECT")) {
      throw err;
    }
    console.error("Failed to update settings:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
