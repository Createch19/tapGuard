import { NextRequest, NextResponse } from "next/server";
import { requireTenantUser } from "@/lib/auth-utils";
import {
  buildGoogleAuthUrl,
  getGoogleOAuthRedirectUri,
  getGoogleOAuthCredentials,
} from "@/lib/google-sync";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { tenantId, user } = await requireTenantUser();
    const searchParams = request.nextUrl.searchParams;
    const forceSandbox = searchParams.get("sandbox") === "true";

    const { clientId, clientSecret } = await getGoogleOAuthCredentials(tenantId);
    const redirectUri = getGoogleOAuthRedirectUri(request);

    // Sandbox simulation mode is ONLY executed if explicitly requested via query parameter
    if (forceSandbox) {
      const callbackUrl = new URL("/api/auth/google/callback", request.url);
      callbackUrl.searchParams.set("mode", "sandbox");
      callbackUrl.searchParams.set("tenantId", tenantId);
      callbackUrl.searchParams.set("email", user.email || "owner@business.com");
      return NextResponse.redirect(callbackUrl.toString());
    }

    // If Google OAuth credentials are not configured, do NOT fake a sandbox connection.
    // Instead, halt and direct the user to provide their Google Cloud credentials with the exact redirect URI.
    if (!clientId || !clientSecret) {
      console.warn("GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing in environment");
      const settingsUrl = new URL("/dashboard/settings", request.url);
      settingsUrl.searchParams.set("error", "google_credentials_missing");
      settingsUrl.searchParams.set("redirect_uri", redirectUri);
      return NextResponse.redirect(settingsUrl.toString());
    }

    // Initiate real Google OAuth 2.0 authorization screen
    const authUrl = buildGoogleAuthUrl(tenantId, redirectUri, clientId);
    return NextResponse.redirect(authUrl);
  } catch (err) {
    console.error("Google connect error:", err);
    return NextResponse.redirect(new URL("/dashboard/settings?error=auth_failed", request.url));
  }
}
