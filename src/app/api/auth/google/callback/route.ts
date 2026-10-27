import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  verifyOAuthState,
  exchangeCodeForTokens,
  fetchGoogleUserInfo,
  fetchGoogleBusinessAccounts,
  fetchGoogleLocations,
  getGoogleOAuthRedirectUri,
  syncGoogleBusinessData,
  GOOGLE_SCOPES,
} from "@/lib/google-sync";
import { seedInitialGoogleProfile, seedLocationStarterData } from "@/lib/google-business";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const mode = searchParams.get("mode");
  const error = searchParams.get("error");

  const settingsUrl = new URL("/dashboard/settings", request.url);

  // If user cancelled on Google screen or denied permissions
  if (error) {
    console.warn("Google OAuth error from query:", error);
    settingsUrl.searchParams.set("error", error);
    return NextResponse.redirect(settingsUrl.toString());
  }

  // --- 1. Sandbox Authorization Flow (only used when explicitly opted into ?mode=sandbox) ---
  if (mode === "sandbox") {
    const tenantId = searchParams.get("tenantId");
    const email = searchParams.get("email") || "owner@business.com";

    if (!tenantId) {
      settingsUrl.searchParams.set("error", "missing_tenant_id");
      return NextResponse.redirect(settingsUrl.toString());
    }

    try {
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        include: { googleConnection: true },
      });

      if (!tenant) {
        settingsUrl.searchParams.set("error", "tenant_not_found");
        return NextResponse.redirect(settingsUrl.toString());
      }

      if (tenant.googleConnection) {
        await prisma.googleProfileConnection.update({
          where: { tenantId },
          data: {
            connectedEmail: email,
            isVerified: true,
            lastSyncedAt: new Date(),
          },
        });
      } else {
        await seedInitialGoogleProfile(
          tenantId,
          tenant.name,
          tenant.businessType || "Restaurant & Café",
          email,
          `accounts/${Date.now()}`,
          `locations/${Date.now()}`
        );
      }

      await prisma.tenant.update({
        where: { id: tenantId },
        data: { googleBusinessEmail: email },
      });

      settingsUrl.searchParams.set("google_connected", "true");
      settingsUrl.searchParams.set("mode", "sandbox");
      return NextResponse.redirect(settingsUrl.toString());
    } catch (sandboxErr) {
      console.error("Sandbox authorization failed:", sandboxErr);
      settingsUrl.searchParams.set("error", "sandbox_auth_failed");
      return NextResponse.redirect(settingsUrl.toString());
    }
  }

  // --- 2. Live Google OAuth Flow ---
  if (!code || !state) {
    settingsUrl.searchParams.set("error", "missing_oauth_params");
    return NextResponse.redirect(settingsUrl.toString());
  }

  // Verify CSRF state token
  const verifiedState = verifyOAuthState(state);
  if (!verifiedState) {
    settingsUrl.searchParams.set("error", "invalid_oauth_state");
    return NextResponse.redirect(settingsUrl.toString());
  }

  const { tenantId } = verifiedState;

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        googleConnection: {
          include: { locations: true },
        },
      },
    });

    if (!tenant) {
      settingsUrl.searchParams.set("error", "tenant_not_found");
      return NextResponse.redirect(settingsUrl.toString());
    }

    // Exchange code for tokens using dynamic redirect URI matching the request domain
    const redirectUri = getGoogleOAuthRedirectUri(request);
    const tokens = await exchangeCodeForTokens(code, redirectUri, tenantId);

    // Fetch live user profile info from Google
    const userInfo = await fetchGoogleUserInfo(tokens.access_token);
    const connectedEmail = userInfo.email;

    // Discover Google Business Accounts from live GBP API
    const accounts = await fetchGoogleBusinessAccounts(tokens.access_token);
    const primaryAccount = accounts[0];
    const googleAccountId = primaryAccount?.name || `accounts/${userInfo.sub}`;
    const accountName = primaryAccount?.accountName || userInfo.name || tenant.name;

    // Discover Google Locations from live GBP API
    let realLocations = await fetchGoogleLocations(googleAccountId, tokens.access_token);
    const primaryRealLoc = realLocations[0];

    // Use live data from Google API when available, with generic defaults as fallback
    const locationId = primaryRealLoc?.name || `locations/${Date.now()}`;
    const locationTitle = primaryRealLoc?.title || tenant.name;
    const locationPhone = primaryRealLoc?.phoneNumbers?.primaryPhone || "";
    const addressJson = (primaryRealLoc?.storefrontAddress as object) || {
      addressLines: [""],
      locality: "",
      administrativeArea: "",
      postalCode: "",
    };
    const defaultCategory = tenant.businessType || "Business";
    const defaultHours = {
      monday: { open: "08:00", close: "22:00" },
      tuesday: { open: "08:00", close: "22:00" },
      wednesday: { open: "08:00", close: "22:00" },
      thursday: { open: "08:00", close: "22:00" },
      friday: { open: "08:00", close: "23:00" },
      saturday: { open: "08:00", close: "23:30" },
      sunday: { open: "08:30", close: "22:30" },
    };
    const defaultSpecialHours = [
      { date: "2026-11-01", open: "10:00", close: "20:00", note: "Festival Special" },
      { date: "2026-12-25", open: "09:00", close: "23:00", note: "Christmas Holiday" },
    ];
    const coordinatesLat = primaryRealLoc?.latlng?.latitude || 0;
    const coordinatesLng = primaryRealLoc?.latlng?.longitude || 0;

    const expiresAt = new Date(Date.now() + (tokens.expires_in || 3600) * 1000);

    // Upsert GoogleProfileConnection
    let connection = tenant.googleConnection;

    if (!connection) {
      connection = await prisma.googleProfileConnection.create({
        data: {
          tenantId,
          googleAccountId,
          accountName,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token || "1//persisted_live_refresh_token",
          tokenExpiresAt: expiresAt,
          scope: tokens.scope || GOOGLE_SCOPES,
          connectedEmail,
          isVerified: true,
          lastSyncedAt: new Date(),
        },
        include: { locations: true },
      });

      const primaryLoc = await prisma.googleLocation.create({
        data: {
          connectionId: connection.id,
          tenantId,
          googleLocationId: locationId,
          title: locationTitle,
          primaryPhone: locationPhone,
          websiteUri: tenant.googleReviewUrl || "https://creaitechnology.com",
          addressJson,
          coordinatesLat,
          coordinatesLng,
          primaryCategory: defaultCategory,
          regularHoursJson: defaultHours,
          specialHoursJson: defaultSpecialHours,
          isPrimaryBranch: true,
        },
      });

    } else {
      await prisma.googleProfileConnection.update({
        where: { tenantId },
        data: {
          googleAccountId,
          accountName,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token || connection.refreshToken,
          tokenExpiresAt: expiresAt,
          scope: tokens.scope || connection.scope,
          connectedEmail,
          isVerified: true,
          lastSyncedAt: new Date(),
        },
      });

      if (connection.locations.length > 0) {
        await prisma.googleLocation.update({
          where: { id: connection.locations[0].id },
          data: {
            googleLocationId: locationId,
            title: locationTitle,
            primaryPhone: locationPhone,
            primaryCategory: defaultCategory,
            addressJson,
            regularHoursJson: defaultHours,
            coordinatesLat,
            coordinatesLng,
          },
        });
      } else {
        await prisma.googleLocation.create({
          data: {
            connectionId: connection.id,
            tenantId,
            googleLocationId: locationId,
            title: locationTitle,
            primaryPhone: locationPhone,
            websiteUri: tenant.googleReviewUrl || "https://creaitechnology.com",
            addressJson,
            coordinatesLat,
            coordinatesLng,
            primaryCategory: defaultCategory,
            regularHoursJson: defaultHours,
            specialHoursJson: defaultSpecialHours,
            isPrimaryBranch: true,
          },
        });
      }
    }

    // Immediately synchronize real data (reviews, hours, photos, posts, performance) from connected Google account
    try {
      await syncGoogleBusinessData(tenantId);
    } catch (syncErr) {
      console.warn("Initial sync after live Google OAuth connection notice:", syncErr);
    }

    // Update Tenant email and location reference
    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        googleBusinessEmail: connectedEmail,
        googleLocationId: locationId,
      },
    });

    settingsUrl.searchParams.set("google_connected", "true");
    settingsUrl.searchParams.set("account_email", connectedEmail);
    return NextResponse.redirect(settingsUrl.toString());
  } catch (authErr) {
    console.error("Google OAuth callback error:", authErr);
    settingsUrl.searchParams.set("error", "token_exchange_failed");
    return NextResponse.redirect(settingsUrl.toString());
  }
}
