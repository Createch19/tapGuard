import { NextRequest, NextResponse } from "next/server";
import { requireTenantUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { seedInitialGoogleProfile } from "@/lib/google-business";

export async function PUT(request: NextRequest) {
  try {
    const { tenantId } = await requireTenantUser();
    const body = await request.json();
    const {
      googleReviewUrl,
      smartGateEnabled,
      alertEmail,
      webhookUrl,
      googleBusinessEmail,
      googleLocationId,
      googleAccountId,
      geminiApiKey,
      customGoogleClientId,
      customGoogleClientSecret,
      disconnectGoogle,
    } = body;

    if (disconnectGoogle) {
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
      return NextResponse.json({ success: true, message: "Google Business account disconnected successfully." });
    }

    const updated = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        googleReviewUrl: googleReviewUrl ? String(googleReviewUrl).trim() : null,
        smartGateEnabled: Boolean(smartGateEnabled),
        alertEmail: alertEmail ? String(alertEmail).trim() : null,
        webhookUrl: webhookUrl ? String(webhookUrl).trim() : null,
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

    // Save Gemini API key if provided
    if (typeof geminiApiKey !== "undefined") {
      await prisma.tenantGeminiConfig.upsert({
        where: { tenantId },
        update: {
          customApiKey: geminiApiKey ? String(geminiApiKey).trim() : null,
        },
        create: {
          tenantId,
          customApiKey: geminiApiKey ? String(geminiApiKey).trim() : null,
          model: "gemini-1.5-flash",
          brandTone: "WARM",
        },
      });
    }

    // If Google account ID or email is provided, ensure connection record exists
    if (googleBusinessEmail || googleAccountId) {
      const email = googleBusinessEmail ? String(googleBusinessEmail).trim() : "owner@business.com";
      const accountId = googleAccountId ? String(googleAccountId).trim() : `accounts/${Date.now()}`;
      const locationId = googleLocationId ? String(googleLocationId).trim() : `locations/${Date.now()}`;

      const existingConnection = await prisma.googleProfileConnection.findUnique({
        where: { tenantId },
        include: { locations: true },
      });

      if (!existingConnection) {
        await seedInitialGoogleProfile(
          tenantId,
          updated.name,
          updated.businessType || "Restaurant & Café",
          email,
          accountId,
          locationId
        );
      } else {
        await prisma.googleProfileConnection.update({
          where: { tenantId },
          data: {
            connectedEmail: email,
            googleAccountId: accountId,
            lastSyncedAt: new Date(),
          },
        });

        if (existingConnection.locations.length > 0) {
          await prisma.googleLocation.update({
            where: { id: existingConnection.locations[0].id },
            data: { googleLocationId: locationId },
          });
        }
      }
    }

    return NextResponse.json({ success: true, tenant: updated });
  } catch (err) {
    console.error("Failed to update settings:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
