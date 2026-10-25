import { NextRequest, NextResponse } from "next/server";
import { requireTenantUser } from "@/lib/auth-utils";
import { buildGoogleAuthUrl } from "@/lib/google-sync";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { tenantId, user } = await requireTenantUser();
    const searchParams = request.nextUrl.searchParams;
    const forceSandbox = searchParams.get("sandbox") === "true";

    const clientId = process.env.GOOGLE_CLIENT_ID;

    // If Google Client ID is configured and not forcing sandbox, initiate real Google OAuth
    if (clientId && clientId.trim() && !forceSandbox) {
      const authUrl = buildGoogleAuthUrl(tenantId);
      return NextResponse.redirect(authUrl);
    }

    // In local development or when GOOGLE_CLIENT_ID is not yet set in .env:
    // Seamlessly complete authorization through the sandbox flow
    const callbackUrl = new URL("/api/auth/google/callback", request.url);
    callbackUrl.searchParams.set("mode", "sandbox");
    callbackUrl.searchParams.set("tenantId", tenantId);
    callbackUrl.searchParams.set("email", user.email || "owner@business.com");

    return NextResponse.redirect(callbackUrl.toString());
  } catch (err) {
    console.error("Google connect error:", err);
    return NextResponse.redirect(new URL("/dashboard/settings?error=auth_failed", request.url));
  }
}
