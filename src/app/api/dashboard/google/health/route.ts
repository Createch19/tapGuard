import { NextResponse } from "next/server";
import { requireTenantUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import {
  getGoogleOAuthCredentials,
  getGoogleOAuthRedirectUri,
  fetchGoogleBusinessAccountsDetailed,
  refreshGoogleAccessToken,
} from "@/lib/google-sync";

export const dynamic = "force-dynamic";

interface HealthCheckResult {
  overall: "HEALTHY" | "DEGRADED" | "DISCONNECTED" | "MISCONFIGURED";
  checks: {
    name: string;
    status: "PASS" | "FAIL" | "WARN" | "SKIP";
    detail: string;
  }[];
  checkedAt: string;
}

/**
 * Google Business API Connection Health Check
 * Validates: credentials, token, redirect URI, API quota, and account access
 */
export async function GET() {
  try {
    const { tenantId } = await requireTenantUser();
    const checks: HealthCheckResult["checks"] = [];
    let hasBlocker = false;
    let hasWarning = false;

    // Check 1: OAuth Credentials
    const { clientId, clientSecret, isTenantCustom } = await getGoogleOAuthCredentials(tenantId);
    if (!clientId || !clientSecret) {
      checks.push({
        name: "OAuth Credentials",
        status: "FAIL",
        detail: "GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing. Set them in environment variables or tenant settings.",
      });
      hasBlocker = true;
    } else {
      checks.push({
        name: "OAuth Credentials",
        status: "PASS",
        detail: `Using ${isTenantCustom ? "tenant-custom" : "platform"} credentials. Client ID: ${clientId.substring(0, 20)}...`,
      });
    }

    // Check 2: Redirect URI
    const redirectUri = getGoogleOAuthRedirectUri();
    const isLocalhost = redirectUri.includes("localhost");
    checks.push({
      name: "Redirect URI",
      status: isLocalhost ? "WARN" : "PASS",
      detail: `Computed redirect URI: ${redirectUri}${isLocalhost ? " — WARNING: This is a localhost URL. In production, ensure NEXT_PUBLIC_APP_URL or x-forwarded-host resolves to your production domain." : ""}`,
    });
    if (isLocalhost) hasWarning = true;

    // Check 3: Google Connection Exists
    const connection = await prisma.googleProfileConnection.findUnique({
      where: { tenantId },
      include: { locations: true },
    });

    if (!connection) {
      checks.push({
        name: "Google Connection",
        status: "FAIL",
        detail: "No Google Business Profile connection found for this tenant. Connect via Settings → Google Business Profile.",
      });
      hasBlocker = true;
    } else {
      const isSimulated = connection.accessToken.startsWith("ya29.simulated");
      checks.push({
        name: "Google Connection",
        status: isSimulated ? "WARN" : "PASS",
        detail: isSimulated
          ? `Connected in sandbox mode (${connection.connectedEmail}). Re-connect with real Google OAuth for live data.`
          : `Live connection: ${connection.connectedEmail} | Account: ${connection.googleAccountId}`,
      });
      if (isSimulated) hasWarning = true;

      // Check 4: Token Validity
      if (!isSimulated) {
        const isExpired = connection.tokenExpiresAt.getTime() < Date.now();
        if (isExpired) {
          try {
            await refreshGoogleAccessToken(connection.id);
            checks.push({
              name: "Access Token",
              status: "PASS",
              detail: "Token was expired but successfully refreshed.",
            });
          } catch (refreshErr: any) {
            checks.push({
              name: "Access Token",
              status: "FAIL",
              detail: `Token expired and refresh failed: ${refreshErr.message}`,
            });
            hasBlocker = true;
          }
        } else {
          const minutesLeft = Math.round((connection.tokenExpiresAt.getTime() - Date.now()) / 60000);
          checks.push({
            name: "Access Token",
            status: "PASS",
            detail: `Token valid for ${minutesLeft} more minutes.`,
          });
        }

        // Check 5: Live API Access (quota check)
        if (!hasBlocker) {
          const refreshedConn = await prisma.googleProfileConnection.findUnique({
            where: { id: connection.id },
          });
          const token = refreshedConn?.accessToken || connection.accessToken;

          const accountsRes = await fetchGoogleBusinessAccountsDetailed(token);
          if (!accountsRes.success) {
            const isQuotaZero =
              accountsRes.httpStatus === 429 ||
              accountsRes.rawResponse?.includes("quota_limit_value") ||
              accountsRes.rawResponse?.includes("RESOURCE_EXHAUSTED");

            checks.push({
              name: "Google Business API Access",
              status: "FAIL",
              detail: isQuotaZero
                ? "API quota is 0. Submit the Google Business Profile API Access Request Form to raise quota for your project."
                : `API returned HTTP ${accountsRes.httpStatus}: ${accountsRes.errorMessage}`,
            });
            hasBlocker = true;
          } else if (!accountsRes.data || accountsRes.data.length === 0) {
            checks.push({
              name: "Google Business API Access",
              status: "WARN",
              detail: `API returned 0 business accounts for ${connection.connectedEmail}. The business may not be claimed/verified under this Google account.`,
            });
            hasWarning = true;
          } else {
            checks.push({
              name: "Google Business API Access",
              status: "PASS",
              detail: `Found ${accountsRes.data.length} business account(s): ${accountsRes.data.map((a) => a.accountName).join(", ")}`,
            });
          }
        }
      } else {
        checks.push({
          name: "Access Token",
          status: "SKIP",
          detail: "Skipped — sandbox mode uses simulated tokens.",
        });
        checks.push({
          name: "Google Business API Access",
          status: "SKIP",
          detail: "Skipped — sandbox mode does not call live Google APIs.",
        });
      }

      // Check 6: Location Data
      if (connection.locations.length === 0) {
        checks.push({
          name: "Location Data",
          status: "WARN",
          detail: "No location records found in database. A sync will create one.",
        });
        hasWarning = true;
      } else {
        checks.push({
          name: "Location Data",
          status: "PASS",
          detail: `${connection.locations.length} location(s) stored. Primary: ${connection.locations[0].title}`,
        });
      }
    }

    const overall: HealthCheckResult["overall"] = hasBlocker
      ? (connection ? "DEGRADED" : "DISCONNECTED")
      : hasWarning
        ? "DEGRADED"
        : (!clientId || !clientSecret)
          ? "MISCONFIGURED"
          : "HEALTHY";

    const result: HealthCheckResult = {
      overall,
      checks,
      checkedAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("GET /api/dashboard/google/health error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Health check failed" },
      { status: 500 }
    );
  }
}
