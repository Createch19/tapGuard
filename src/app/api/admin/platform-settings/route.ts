import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import {
  getGoogleOAuthCredentials,
  getGoogleOAuthRedirectUri,
} from "@/lib/google-sync";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await requireSuperAdmin();
    const { clientId, clientSecret } = await getGoogleOAuthCredentials();
    const redirectUri = getGoogleOAuthRedirectUri(request);

    return NextResponse.json({
      success: true,
      hasGoogleClientId: Boolean(clientId && clientId.trim()),
      hasGoogleClientSecret: Boolean(clientSecret && clientSecret.trim()),
      clientIdPreview: clientId ? `${clientId.slice(0, 16)}...` : null,
      redirectUri,
    });
  } catch (err) {
    console.error("GET /api/admin/platform-settings error:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Unauthorized" },
      { status: 401 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireSuperAdmin();
    const body = await request.json();
    const { googleClientId, googleClientSecret } = body;

    if (googleClientId !== undefined) {
      const trimmedId = String(googleClientId).trim();
      if (trimmedId) {
        await prisma.systemSetting.upsert({
          where: { key: "GOOGLE_CLIENT_ID" },
          update: { value: trimmedId },
          create: { key: "GOOGLE_CLIENT_ID", value: trimmedId },
        });
      } else {
        await prisma.systemSetting.deleteMany({
          where: { key: "GOOGLE_CLIENT_ID" },
        });
      }
    }

    if (googleClientSecret !== undefined) {
      const trimmedSecret = String(googleClientSecret).trim();
      if (trimmedSecret) {
        await prisma.systemSetting.upsert({
          where: { key: "GOOGLE_CLIENT_SECRET" },
          update: { value: trimmedSecret },
          create: { key: "GOOGLE_CLIENT_SECRET", value: trimmedSecret },
        });
      } else {
        await prisma.systemSetting.deleteMany({
          where: { key: "GOOGLE_CLIENT_SECRET" },
        });
      }
    }

    await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        actorEmail: admin.email,
        action: "PLAN_CONFIG_UPDATED",
        targetType: "SystemSetting",
        metadata: {
          setting: "GOOGLE_OAUTH",
          clientIdUpdated: Boolean(googleClientId),
          clientSecretUpdated: Boolean(googleClientSecret),
        },
      },
    }).catch((e) => console.warn("Audit log notice:", e));

    return NextResponse.json({
      success: true,
      message: "Google Cloud Platform OAuth credentials updated successfully!",
    });
  } catch (err) {
    console.error("POST /api/admin/platform-settings error:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Failed to update platform settings" },
      { status: 500 }
    );
  }
}
