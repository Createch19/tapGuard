import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import type { NextRequest } from "next/server";
import { seedLocationStarterData } from "@/lib/google-business";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";
const GOOGLE_ACCOUNTS_URL = "https://mybusinessaccountmanagement.googleapis.com/v1/accounts";

export const GOOGLE_SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/business.manage",
].join(" ");

/**
 * Retrieves Google OAuth credentials.
 * Priority:
 * 1. Tenant-specific custom credentials in database (Tenant.customGoogleClientId & customGoogleClientSecret)
 * 2. Platform environment variables (GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET)
 * 3. Platform database settings in SystemSetting (configured in /admin/plan-config)
 */
export async function getGoogleOAuthCredentials(tenantId?: string): Promise<{
  clientId: string | null;
  clientSecret: string | null;
  isTenantCustom: boolean;
}> {
  // 1. Check if specific tenant configured their own custom Google Cloud credentials in database
  if (tenantId) {
    try {
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: {
          customGoogleClientId: true,
          customGoogleClientSecret: true,
        },
      });

      if (
        tenant?.customGoogleClientId?.trim() &&
        tenant?.customGoogleClientSecret?.trim()
      ) {
        return {
          clientId: tenant.customGoogleClientId.trim(),
          clientSecret: tenant.customGoogleClientSecret.trim(),
          isTenantCustom: true,
        };
      }
    } catch (err) {
      console.warn("Could not retrieve tenant custom Google credentials:", err);
    }
  }

  // 2. Check platform-level environment variables
  const envClientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const envClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

  if (envClientId && envClientSecret) {
    return { clientId: envClientId, clientSecret: envClientSecret, isTenantCustom: false };
  }

  // 3. Check platform-level database SystemSetting (set by Super Admin in /admin/plan-config)
  try {
    const settings = await prisma.systemSetting.findMany({
      where: {
        key: { in: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"] },
      },
    });

    const dbClientId = settings.find((s) => s.key === "GOOGLE_CLIENT_ID")?.value?.trim();
    const dbClientSecret = settings.find((s) => s.key === "GOOGLE_CLIENT_SECRET")?.value?.trim();

    return {
      clientId: envClientId || dbClientId || null,
      clientSecret: envClientSecret || dbClientSecret || null,
      isTenantCustom: false,
    };
  } catch {
    return {
      clientId: envClientId || null,
      clientSecret: envClientSecret || null,
      isTenantCustom: false,
    };
  }
}

/**
 * Returns dynamic base URL based on incoming request headers or env fallback
 */
export function getAppBaseUrl(reqOrHeaders?: Request | NextRequest | Headers | string | null): string {
  if (typeof reqOrHeaders === "string" && reqOrHeaders.trim()) {
    return reqOrHeaders.trim().replace(/\/$/, "");
  }

  if (reqOrHeaders && typeof reqOrHeaders === "object") {
    let host: string | null = null;
    let proto = "https";

    if ("headers" in reqOrHeaders && reqOrHeaders.headers) {
      // It's a Request or NextRequest
      host = reqOrHeaders.headers.get("x-forwarded-host") || reqOrHeaders.headers.get("host");
      proto = reqOrHeaders.headers.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
    } else if ("get" in reqOrHeaders && typeof (reqOrHeaders as Headers).get === "function") {
      // It's a Headers instance (e.g. from await headers())
      host = (reqOrHeaders as Headers).get("x-forwarded-host") || (reqOrHeaders as Headers).get("host");
      proto = (reqOrHeaders as Headers).get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
    }

    if (host) {
      return `${proto}://${host}`.replace(/\/$/, "");
    }

    if ("nextUrl" in reqOrHeaders && (reqOrHeaders as NextRequest).nextUrl?.origin) {
      return (reqOrHeaders as NextRequest).nextUrl.origin.replace(/\/$/, "");
    }
  }

  // Automatic platform domain detection for Vercel and Netlify
  const vercelUrl =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL;
  const netlifyUrl =
    process.env.URL ||
    process.env.DEPLOY_PRIME_URL;

  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    (vercelUrl ? `https://${vercelUrl}` : null) ||
    netlifyUrl ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

/**
 * Returns exact OAuth callback URI for Google Cloud configuration
 */
export function getGoogleOAuthRedirectUri(reqOrHeaders?: Request | NextRequest | Headers | string | null): string {
  return `${getAppBaseUrl(reqOrHeaders)}/api/auth/google/callback`;
}

/**
 * Generate secure state token for OAuth CSRF protection
 */
export function generateOAuthState(tenantId: string): string {
  const secret = process.env.NEXTAUTH_SECRET || "tapgate-oauth-state-secret";
  const timestamp = Date.now();
  const payload = JSON.stringify({ tenantId, timestamp });
  const hmac = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return Buffer.from(JSON.stringify({ payload, hmac })).toString("base64url");
}

/**
 * Verify and decode OAuth state token
 */
export function verifyOAuthState(stateStr: string): { tenantId: string } | null {
  try {
    const secret = process.env.NEXTAUTH_SECRET || "tapgate-oauth-state-secret";
    const decoded = JSON.parse(Buffer.from(stateStr, "base64url").toString("utf8"));
    const { payload, hmac } = decoded;
    const expectedHmac = crypto.createHmac("sha256", secret).update(payload).digest("hex");

    if (hmac !== expectedHmac) {
      console.error("OAuth state HMAC mismatch");
      return null;
    }

    const { tenantId, timestamp } = JSON.parse(payload);
    // 15-minute expiration
    if (Date.now() - timestamp > 15 * 60 * 1000) {
      console.error("OAuth state expired");
      return null;
    }

    return { tenantId };
  } catch (err) {
    console.error("Failed to verify OAuth state:", err);
    return null;
  }
}

/**
 * Builds the official Google OAuth authorization consent URL.
 * Forces consent prompt & account selection so the business owner explicitly chooses their account and grants permissions.
 */
export function buildGoogleAuthUrl(
  tenantId: string,
  customRedirectUri?: string,
  customClientId?: string
): string {
  const clientId = customClientId || process.env.GOOGLE_CLIENT_ID;
  const redirectUri = customRedirectUri || getGoogleOAuthRedirectUri();
  const state = generateOAuthState(tenantId);

  const params = new URLSearchParams({
    client_id: clientId || "",
    redirect_uri: redirectUri,
    response_type: "code",
    scope: GOOGLE_SCOPES,
    access_type: "offline",
    prompt: "consent select_account", // ALWAYS force Google account picker & permissions consent screen
    include_granted_scopes: "true",
    state,
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchanges authorization code for access and refresh tokens
 */
export async function exchangeCodeForTokens(
  code: string,
  customRedirectUri?: string,
  tenantId?: string
): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  id_token?: string;
}> {
  const { clientId, clientSecret } = await getGoogleOAuthCredentials(tenantId);
  const redirectUri = customRedirectUri || getGoogleOAuthRedirectUri();

  if (!clientId || !clientSecret) {
    throw new Error("GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing");
  }

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const json = await res.json();
  if (!res.ok) {
    console.error("Google token exchange failed:", json);
    throw new Error(json.error_description || json.error || "Failed to exchange Google OAuth code");
  }

  return json;
}

/**
 * Refresh an expired Google access token
 */
export async function refreshGoogleAccessToken(connectionId: string): Promise<string> {
  const connection = await prisma.googleProfileConnection.findUnique({
    where: { id: connectionId },
  });

  if (!connection) {
    throw new Error("Google connection not found");
  }

  // If token is still valid for > 5 minutes, reuse it
  if (connection.tokenExpiresAt.getTime() - Date.now() > 5 * 60 * 1000) {
    return connection.accessToken;
  }

  const { clientId, clientSecret } = await getGoogleOAuthCredentials(connection.tenantId);

  if (!clientId || !clientSecret || connection.refreshToken.startsWith("1//simulated")) {
    const newExpiresAt = new Date(Date.now() + 3600000 * 24);
    await prisma.googleProfileConnection.update({
      where: { id: connectionId },
      data: { tokenExpiresAt: newExpiresAt },
    });
    return connection.accessToken;
  }

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: connection.refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const json = await res.json();
  if (!res.ok) {
    console.error("Google token refresh failed:", json);
    throw new Error(json.error_description || "Failed to refresh Google token");
  }

  const expiresAt = new Date(Date.now() + json.expires_in * 1000);
  await prisma.googleProfileConnection.update({
    where: { id: connectionId },
    data: {
      accessToken: json.access_token,
      tokenExpiresAt: expiresAt,
    },
  });

  return json.access_token;
}

/**
 * Fetch verified Google User Profile (email, name, picture, sub)
 */
export async function fetchGoogleUserInfo(accessToken: string): Promise<{
  email: string;
  name?: string;
  picture?: string;
  sub: string;
}> {
  const res = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch Google user info");
  }

  return res.json();
}

export interface GoogleSyncDiagnostic {
  status: "LIVE_CONNECTED" | "NO_ACCOUNTS" | "NO_LOCATIONS" | "API_ERROR" | "NO_REVIEWS";
  endpoint: string;
  httpStatus?: number;
  googleResponseText?: string;
  errorTitle: string;
  errorMessage: string;
  rootCause: string;
  resolutionSteps: string[];
  checkedAt: string;
}

export interface GoogleDetailedResponse<T> {
  success: boolean;
  data: T | null;
  httpStatus?: number;
  rawResponse?: string;
  errorMessage?: string;
  endpoint: string;
}

/**
 * Fetch Google Business Profile Accounts with full live HTTP diagnostics
 */
export async function fetchGoogleBusinessAccountsDetailed(
  accessToken: string
): Promise<GoogleDetailedResponse<Array<{ name: string; accountName: string; type: string }>>> {
  const endpoint = GOOGLE_ACCOUNTS_URL;
  try {
    const res = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const text = await res.text();
    let json: any = null;
    try {
      json = JSON.parse(text);
    } catch {}

    if (!res.ok) {
      return {
        success: false,
        data: null,
        httpStatus: res.status,
        rawResponse: text,
        errorMessage: json?.error?.message || `Google API error: status ${res.status}`,
        endpoint,
      };
    }

    const accounts = Array.isArray(json?.accounts) ? json.accounts : [];
    return {
      success: true,
      data: accounts,
      httpStatus: res.status,
      rawResponse: text,
      endpoint,
    };
  } catch (err: any) {
    return {
      success: false,
      data: null,
      errorMessage: err.message || "Network error contacting Google Accounts API",
      endpoint,
    };
  }
}

/**
 * Fetch Google Business Profile Accounts (simple legacy helper)
 */
export async function fetchGoogleBusinessAccounts(accessToken: string): Promise<Array<{
  name: string; // "accounts/123456789"
  accountName: string;
  type: string;
}>> {
  const res = await fetchGoogleBusinessAccountsDetailed(accessToken);
  return res.data || [];
}

/**
 * Normalize account name format (e.g. "accounts/12345")
 */
export function normalizeAccountName(accountName: string): string {
  if (!accountName) return "accounts/primary";
  const clean = accountName.trim();
  return clean.startsWith("accounts/") ? clean : `accounts/${clean}`;
}

/**
 * Normalize location name format (e.g. "locations/12345")
 */
export function normalizeLocationName(locName: string): string {
  if (!locName) return "locations/primary";
  const clean = locName.trim();
  if (clean.includes("/")) {
    const parts = clean.split("/");
    return `locations/${parts[parts.length - 1]}`;
  }
  return `locations/${clean}`;
}

/**
 * Format Google time representation to HH:mm string
 */
function formatGoogleTime(t: any): string {
  if (!t) return "08:00";
  if (typeof t === "string") return t;
  const hours = String(t.hours ?? 0).padStart(2, "0");
  const minutes = String(t.minutes ?? 0).padStart(2, "0");
  return `${hours}:${minutes}`;
}

/**
 * Parse Google regularHours periods into standard weekday key-value map
 */
export function parseGoogleRegularHours(regularHours: any): Record<string, { open: string; close: string }> {
  const result: Record<string, { open: string; close: string }> = {
    monday: { open: "08:00", close: "22:00" },
    tuesday: { open: "08:00", close: "22:00" },
    wednesday: { open: "08:00", close: "22:00" },
    thursday: { open: "08:00", close: "22:00" },
    friday: { open: "08:00", close: "23:00" },
    saturday: { open: "08:00", close: "23:30" },
    sunday: { open: "08:30", close: "22:30" },
  };

  if (regularHours?.periods && Array.isArray(regularHours.periods)) {
    for (const p of regularHours.periods) {
      const day = (p.openDay || "").toLowerCase();
      if (day && result[day]) {
        result[day] = {
          open: formatGoogleTime(p.openTime),
          close: formatGoogleTime(p.closeTime),
        };
      }
    }
  }

  return result;
}

/**
 * Parse Google specialHours into structured date-based array
 */
export function parseGoogleSpecialHours(specialHours: any): Array<{
  date: string;
  open: string;
  close: string;
  isClosed?: boolean;
  note?: string;
}> {
  if (!specialHours?.specialHourPeriods || !Array.isArray(specialHours.specialHourPeriods)) {
    return [];
  }

  return specialHours.specialHourPeriods
    .map((sp: any) => {
      let dateStr = "";
      if (sp.startDate) {
        const y = sp.startDate.year || new Date().getFullYear();
        const m = String(sp.startDate.month || 1).padStart(2, "0");
        const d = String(sp.startDate.day || 1).padStart(2, "0");
        dateStr = `${y}-${m}-${d}`;
      }
      return {
        date: dateStr,
        open: sp.closed ? "00:00" : formatGoogleTime(sp.openTime),
        close: sp.closed ? "00:00" : formatGoogleTime(sp.closeTime),
        isClosed: Boolean(sp.closed),
        note: sp.closed ? "Holiday / Closed" : "Special Operating Hours",
      };
    })
    .filter((s: any) => Boolean(s.date));
}

export const STAR_RATING_MAP: Record<string, number> = {
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
};

/**
 * Fetch Google Business Locations with detailed diagnostic output
 */
export async function fetchGoogleLocationsDetailed(
  accountName: string,
  accessToken: string
): Promise<GoogleDetailedResponse<Array<{
  name: string; // "locations/12345"
  title?: string;
  storeCode?: string;
  storefrontAddress?: {
    addressLines?: string[];
    locality?: string;
    administrativeArea?: string;
    postalCode?: string;
  };
  websiteUri?: string;
  phoneNumbers?: { primaryPhone?: string };
  categories?: { primaryCategory?: { displayName?: string } };
  latlng?: { latitude?: number; longitude?: number };
  regularHours?: any;
  specialHours?: any;
  metadata?: {
    placeId?: string;
    newReviewUrl?: string;
    mapsUri?: string;
  };
}>>> {
  const acc = normalizeAccountName(accountName);
  const readMask = "name,title,storeCode,regularHours,specialHours,phoneNumbers,categories,storefrontAddress,websiteUri,metadata,latlng,profile";
  const endpoint = `https://mybusinessbusinessinformation.googleapis.com/v1/${acc}/locations?readMask=${readMask}`;

  try {
    const res = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const text = await res.text();
    let json: any = null;
    try {
      json = JSON.parse(text);
    } catch {}

    if (!res.ok) {
      return {
        success: false,
        data: null,
        httpStatus: res.status,
        rawResponse: text,
        errorMessage: json?.error?.message || `Google API error: status ${res.status}`,
        endpoint,
      };
    }

    const locations = Array.isArray(json?.locations) ? json.locations : [];
    return {
      success: true,
      data: locations,
      httpStatus: res.status,
      rawResponse: text,
      endpoint,
    };
  } catch (err: any) {
    return {
      success: false,
      data: null,
      errorMessage: err.message || "Network error contacting Google Locations API",
      endpoint,
    };
  }
}

/**
 * Fetch Google Business Locations for an account (simple helper)
 */
export async function fetchGoogleLocations(
  accountName: string,
  accessToken: string
): Promise<Array<any>> {
  const res = await fetchGoogleLocationsDetailed(accountName, accessToken);
  return res.data || [];
}

/**
 * Fetch real customer reviews from Google Business Profile v4 API with full live diagnostics
 */
export async function fetchGoogleReviewsDetailed(
  accountName: string,
  locationName: string,
  accessToken: string
): Promise<GoogleDetailedResponse<{
  reviews: Array<{
    reviewId: string;
    reviewer?: {
      displayName?: string;
      profilePhotoUrl?: string;
      isAnonymous?: boolean;
    };
    starRating: string | number;
    comment?: string;
    createTime?: string;
    updateTime?: string;
    reviewReply?: {
      comment?: string;
      updateTime?: string;
    };
  }>;
  averageRating?: number;
  totalReviewCount?: number;
}>> {
  const acc = normalizeAccountName(accountName);
  const loc = normalizeLocationName(locationName);
  const endpoint = `https://mybusiness.googleapis.com/v4/${acc}/${loc}/reviews?pageSize=50`;

  try {
    const res = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const text = await res.text();
    let json: any = null;
    try {
      json = JSON.parse(text);
    } catch {}

    if (!res.ok) {
      return {
        success: false,
        data: null,
        httpStatus: res.status,
        rawResponse: text,
        errorMessage: json?.error?.message || `Google Reviews API error: status ${res.status}`,
        endpoint,
      };
    }

    return {
      success: true,
      data: {
        reviews: Array.isArray(json?.reviews) ? json.reviews : [],
        averageRating: json?.averageRating,
        totalReviewCount: json?.totalReviewCount,
      },
      httpStatus: res.status,
      rawResponse: text,
      endpoint,
    };
  } catch (err: any) {
    return {
      success: false,
      data: null,
      errorMessage: err.message || "Network error contacting Google Reviews API",
      endpoint,
    };
  }
}

/**
 * Fetch real customer reviews from Google Business Profile v4 API (simple helper)
 */
export async function fetchGoogleReviews(
  accountName: string,
  locationName: string,
  accessToken: string
): Promise<{
  reviews: Array<{
    reviewId: string;
    reviewer?: {
      displayName?: string;
      profilePhotoUrl?: string;
      isAnonymous?: boolean;
    };
    starRating: string | number;
    comment?: string;
    createTime?: string;
    updateTime?: string;
    reviewReply?: {
      comment?: string;
      updateTime?: string;
    };
  }>;
  averageRating?: number;
  totalReviewCount?: number;
}> {
  const res = await fetchGoogleReviewsDetailed(accountName, locationName, accessToken);
  return res.data || { reviews: [] };
}

/**
 * Fetch live media/photos from Google Business Profile v4 API
 */
export async function fetchGooglePhotos(
  accountName: string,
  locationName: string,
  accessToken: string
): Promise<Array<{
  name: string;
  mediaFormat?: string;
  locationAssociation?: { category?: string };
  googleUrl?: string;
  thumbnailUrl?: string;
  createTime?: string;
  attribution?: { profileName?: string };
}>> {
  try {
    const acc = normalizeAccountName(accountName);
    const loc = normalizeLocationName(locationName);
    const url = `https://mybusiness.googleapis.com/v4/${acc}/${loc}/media?pageSize=100`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      console.warn("GBP v4 media query notice:", res.status, await res.text());
      return [];
    }

    const data = await res.json();
    return data.mediaItems || [];
  } catch (err) {
    console.warn("Error fetching GBP photos:", err);
    return [];
  }
}

/**
 * Fetch live local posts from Google Business Profile v4 API
 */
export async function fetchGoogleLocalPosts(
  accountName: string,
  locationName: string,
  accessToken: string
): Promise<Array<{
  name: string;
  languageCode?: string;
  summary?: string;
  callToAction?: { actionType?: string; url?: string };
  createTime?: string;
  media?: Array<{ googleUrl?: string; sourceUrl?: string }>;
  topicType?: string;
  state?: string;
}>> {
  try {
    const acc = normalizeAccountName(accountName);
    const loc = normalizeLocationName(locationName);
    const url = `https://mybusiness.googleapis.com/v4/${acc}/${loc}/localPosts?pageSize=50`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      console.warn("GBP v4 localPosts query notice:", res.status, await res.text());
      return [];
    }

    const data = await res.json();
    return data.localPosts || [];
  } catch (err) {
    console.warn("Error fetching GBP local posts:", err);
    return [];
  }
}

/**
 * Fetch real performance time-series from Google Business Profile Performance API
 */
export async function fetchGooglePerformanceMetrics(
  locationName: string,
  accessToken: string
): Promise<Array<{
  date: Date;
  searchImpressions: number;
  mapsImpressions: number;
  callClicks: number;
  websiteClicks: number;
  directionsRequests: number;
  bookingsClicks: number;
}>> {
  try {
    const loc = normalizeLocationName(locationName);
    const now = new Date();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);

    const metrics = [
      "BUSINESS_IMPRESSIONS_DESKTOP_MAPS",
      "BUSINESS_IMPRESSIONS_DESKTOP_SEARCH",
      "BUSINESS_IMPRESSIONS_MOBILE_MAPS",
      "BUSINESS_IMPRESSIONS_MOBILE_SEARCH",
      "CALL_CLICKS",
      "WEBSITE_CLICKS",
      "BUSINESS_DIRECTION_REQUESTS",
    ];

    const params = new URLSearchParams();
    for (const m of metrics) {
      params.append("dailyMetrics", m);
    }
    params.set("dailyRange.startDate.year", String(thirtyDaysAgo.getFullYear()));
    params.set("dailyRange.startDate.month", String(thirtyDaysAgo.getMonth() + 1));
    params.set("dailyRange.startDate.day", String(thirtyDaysAgo.getDate()));
    params.set("dailyRange.endDate.year", String(now.getFullYear()));
    params.set("dailyRange.endDate.month", String(now.getMonth() + 1));
    params.set("dailyRange.endDate.day", String(now.getDate()));

    const url = `https://businessprofileperformance.googleapis.com/v1/${loc}:fetchMultiDailyMetricsTimeSeries?${params.toString()}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      console.warn("Google Performance API query notice:", res.status, await res.text());
      return [];
    }

    const data = await res.json();
    const seriesList = data.multiDailyMetricTimeSeries || [];
    const dateMap: Record<string, {
      search: number;
      maps: number;
      calls: number;
      website: number;
      directions: number;
      bookings: number;
    }> = {};

    for (const series of seriesList) {
      const metric = series.dailyMetric;
      const datedValues = series.dailyMetricTimeSeries?.timeSeries?.datedValues || [];

      for (const dv of datedValues) {
        if (!dv.date) continue;
        const y = dv.date.year;
        const m = String(dv.date.month).padStart(2, "0");
        const d = String(dv.date.day).padStart(2, "0");
        const dateKey = `${y}-${m}-${d}`;

        if (!dateMap[dateKey]) {
          dateMap[dateKey] = { search: 0, maps: 0, calls: 0, website: 0, directions: 0, bookings: 0 };
        }

        const val = Number(dv.value || 0);
        if (metric === "BUSINESS_IMPRESSIONS_DESKTOP_SEARCH" || metric === "BUSINESS_IMPRESSIONS_MOBILE_SEARCH") {
          dateMap[dateKey].search += val;
        } else if (metric === "BUSINESS_IMPRESSIONS_DESKTOP_MAPS" || metric === "BUSINESS_IMPRESSIONS_MOBILE_MAPS") {
          dateMap[dateKey].maps += val;
        } else if (metric === "CALL_CLICKS") {
          dateMap[dateKey].calls += val;
        } else if (metric === "WEBSITE_CLICKS") {
          dateMap[dateKey].website += val;
        } else if (metric === "BUSINESS_DIRECTION_REQUESTS") {
          dateMap[dateKey].directions += val;
        }
      }
    }

    return Object.entries(dateMap).map(([dateStr, counts]) => ({
      date: new Date(dateStr),
      searchImpressions: counts.search,
      mapsImpressions: counts.maps,
      callClicks: counts.calls,
      websiteClicks: counts.website,
      directionsRequests: counts.directions,
      bookingsClicks: counts.bookings,
    }));
  } catch (err) {
    console.warn("Error fetching Google Performance metrics:", err);
    return [];
  }
}

/**
 * Push Review Reply directly to Google Business Profile v4 API
 */
export async function publishGoogleReviewReply(
  accountName: string,
  locationName: string,
  reviewId: string,
  replyComment: string,
  accessToken: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const acc = normalizeAccountName(accountName);
    const loc = normalizeLocationName(locationName);
    const url = `https://mybusiness.googleapis.com/v4/${acc}/${loc}/reviews/${reviewId}/reply`;

    const res = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ comment: replyComment }),
    });

    const json = await res.json();
    if (!res.ok) {
      return { success: false, error: json.error?.message || "Failed to publish reply to Google" };
    }
    return { success: true, data: json };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

/**
 * Publish Local Post directly to Google Business Profile v4 API
 */
export async function publishGoogleLocalPost(
  accountName: string,
  locationName: string,
  postData: {
    summary: string;
    topicType?: string;
    callToAction?: string;
    actionUrl?: string;
    mediaUrl?: string;
  },
  accessToken: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const acc = normalizeAccountName(accountName);
    const loc = normalizeLocationName(locationName);
    const url = `https://mybusiness.googleapis.com/v4/${acc}/${loc}/localPosts`;

    const body: any = {
      languageCode: "en",
      summary: postData.summary,
      topicType: postData.topicType || "STANDARD",
    };

    if (postData.callToAction && postData.actionUrl) {
      body.callToAction = {
        actionType: postData.callToAction,
        url: postData.actionUrl,
      };
    }

    if (postData.mediaUrl) {
      body.media = [
        {
          mediaFormat: "PHOTO",
          sourceUrl: postData.mediaUrl,
        },
      ];
    }

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const json = await res.json();
    if (!res.ok) {
      return { success: false, error: json.error?.message || "Failed to publish local post to Google" };
    }
    return { success: true, data: json };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

/**
 * Push Operating Hours update to Google Business Information API
 */
export async function publishGoogleHours(
  locationName: string,
  regularHoursJson: Record<string, { open: string; close: string }>,
  specialHoursJson: any[],
  accessToken: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const loc = normalizeLocationName(locationName);
    const url = `https://mybusinessbusinessinformation.googleapis.com/v1/${loc}?updateMask=regularHours,specialHours`;

    const dayKeys = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    const periods = [];

    for (const d of dayKeys) {
      const conf = regularHoursJson?.[d];
      if (conf && conf.open && conf.close) {
        const [openH, openM] = conf.open.split(":").map(Number);
        const [closeH, closeM] = conf.close.split(":").map(Number);
        periods.push({
          openDay: d.toUpperCase(),
          openTime: { hours: openH || 0, minutes: openM || 0 },
          closeDay: d.toUpperCase(),
          closeTime: { hours: closeH || 0, minutes: closeM || 0 },
        });
      }
    }

    const specialHourPeriods = Array.isArray(specialHoursJson)
      ? specialHoursJson.map((sp) => {
          const [y, m, d] = (sp.date || "").split("-").map(Number);
          const [openH, openM] = (sp.open || "09:00").split(":").map(Number);
          const [closeH, closeM] = (sp.close || "18:00").split(":").map(Number);
          return {
            startDate: { year: y || 2026, month: m || 1, day: d || 1 },
            openTime: sp.isClosed ? undefined : { hours: openH, minutes: openM },
            endDate: { year: y || 2026, month: m || 1, day: d || 1 },
            closeTime: sp.isClosed ? undefined : { hours: closeH, minutes: closeM },
            closed: Boolean(sp.isClosed),
          };
        })
      : [];

    const res = await fetch(url, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        regularHours: { periods },
        specialHours: { specialHourPeriods },
      }),
    });

    const json = await res.json();
    if (!res.ok) {
      return { success: false, error: json.error?.message || "Failed to update hours on Google" };
    }
    return { success: true, data: json };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

/**
 * Synchronize Google Business Profile Data for a Tenant.
 * Fetches real reviews, hours, media, posts, and performance metrics from Google APIs.
 */
export async function syncGoogleBusinessData(tenantId: string): Promise<{
  success: boolean;
  message: string;
  syncedReviewsCount?: number;
}> {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      googleConnection: {
        include: { locations: true },
      },
    },
  });

  if (!tenant || !tenant.googleConnection) {
    throw new Error("No Google Business connection found for this tenant");
  }

  const connection = tenant.googleConnection;

  // Refresh token if needed
  let validToken = connection.accessToken;
  try {
    validToken = await refreshGoogleAccessToken(connection.id);
  } catch (refreshErr) {
    console.warn("Token refresh notice:", refreshErr);
  }

  // Ensure primary location exists in database
  let primaryLoc = connection.locations[0];
  if (!primaryLoc) {
    const isGenZ =
      connection.connectedEmail?.toLowerCase() === "genzsportshub@gmail.com" ||
      tenant.name.toLowerCase().includes("genz") ||
      tenant.name.toLowerCase().includes("gen z");

    primaryLoc = await prisma.googleLocation.create({
      data: {
        connectionId: connection.id,
        tenantId,
        googleLocationId: tenant.googleLocationId || `locations/${Date.now()}`,
        title: isGenZ ? "Gen Z Sports" : (connection.accountName || `${tenant.name} (Main Branch)`),
        primaryPhone: isGenZ ? "076398 07707" : "+91 98450 12345",
        websiteUri: tenant.googleReviewUrl || "https://tapgate.io",
        addressJson: isGenZ
          ? {
              addressLines: ["Kazunkuzhi road", "Oragadam R.F."],
              locality: "Tirukazhukundram",
              administrativeArea: "Tamil Nadu",
              postalCode: "603109",
              country: "IN",
            }
          : {
              addressLines: ["Main Street"],
              locality: "City Center",
              administrativeArea: "State",
              postalCode: "600001",
            },
        coordinatesLat: isGenZ ? 12.5284 : 12.9716,
        coordinatesLng: isGenZ ? 80.0544 : 77.5946,
        primaryCategory: isGenZ ? "Sports complex" : (tenant.businessType || "Business"),
        regularHoursJson: isGenZ
          ? {
              monday: { open: "06:00", close: "21:00" },
              tuesday: { open: "06:00", close: "21:00" },
              wednesday: { open: "06:00", close: "21:00" },
              thursday: { open: "06:00", close: "21:00" },
              friday: { open: "06:00", close: "21:00" },
              saturday: { open: "06:00", close: "21:00" },
              sunday: { open: "06:00", close: "21:00" },
            }
          : {
              monday: { open: "08:00", close: "22:00" },
              tuesday: { open: "08:00", close: "22:00" },
              wednesday: { open: "08:00", close: "22:00" },
              thursday: { open: "08:00", close: "22:00" },
              friday: { open: "08:00", close: "23:00" },
              saturday: { open: "08:00", close: "23:30" },
              sunday: { open: "08:30", close: "22:30" },
            },
        specialHoursJson: isGenZ
          ? [
              { date: "2026-11-01", open: "06:00", close: "21:00", note: "Festival Sports Matches" },
              { date: "2026-12-25", open: "06:00", close: "21:00", note: "Holiday Tournament Open" },
            ]
          : [
              { date: "2026-11-01", open: "10:00", close: "20:00", note: "Festival Hours" },
              { date: "2026-12-25", open: "09:00", close: "23:00", note: "Holiday Special" },
            ],
        isPrimaryBranch: true,
      },
    });
  }

  const isLiveGoogleAccount = validToken && !validToken.startsWith("ya29.simulated");

  if (isLiveGoogleAccount) {
    // 1. Purge all mock/simulated reviews from this live account so only genuine Google API data is shown
    await prisma.googleReview.deleteMany({
      where: {
        locationId: primaryLoc.id,
        OR: [
          { googleReviewId: { startsWith: "review_" } },
          { googleReviewId: { startsWith: "g_rev_" } },
        ],
      },
    });

    // 2. Purge all mock/simulated Q&A questions
    await prisma.googleQuestion.deleteMany({
      where: {
        locationId: primaryLoc.id,
        OR: [
          { googleQuestionId: { startsWith: "qa_" } },
          { googleQuestionId: { startsWith: "g_qa_" } },
        ],
      },
    });

    // 3. Purge mock/simulated posts
    await prisma.googlePost.deleteMany({
      where: {
        locationId: primaryLoc.id,
        OR: [
          { googlePostId: { startsWith: "post_" } },
          { googlePostId: null },
          { summary: { contains: "croissant", mode: "insensitive" } },
          { summary: { contains: "coffee", mode: "insensitive" } },
          { summary: { contains: "Seasonal Specialty", mode: "insensitive" } },
          { summary: { contains: "Baker Box", mode: "insensitive" } },
        ],
      },
    });

    // 4. Purge mock photos
    await prisma.googleMediaItem.deleteMany({
      where: {
        locationId: primaryLoc.id,
        OR: [
          { googleMediaId: null },
          { googleMediaId: { startsWith: "media_" } },
          { sourceUrl: { contains: "unsplash.com" } },
        ],
      },
    });

    // 5. Purge simulated daily performance metrics
    await prisma.googlePerformanceDaily.deleteMany({
      where: {
        locationId: primaryLoc.id,
      },
    });

    let syncDiagnostic: GoogleSyncDiagnostic | null = null;
    let liveAccName = connection.googleAccountId;
    let liveLocName = primaryLoc.googleLocationId;
    let syncedReviewsCount = 0;

    try {
      // Step 1: Query verified Google Business Accounts from live REST API
      const accountsRes = await fetchGoogleBusinessAccountsDetailed(validToken);

      if (!accountsRes.success) {
        syncDiagnostic = {
          status: "API_ERROR",
          endpoint: accountsRes.endpoint,
          httpStatus: accountsRes.httpStatus,
          googleResponseText: accountsRes.rawResponse,
          errorTitle: `Google API Access Restricted (HTTP ${accountsRes.httpStatus || 403})`,
          errorMessage: accountsRes.errorMessage || "Google returned an error accessing Business Profile Accounts.",
          rootCause: "Your Google Cloud Project has not been granted access to the Google Business Profile APIs, or the API is disabled in Google Cloud Console.",
          resolutionSteps: [
            "Enable 'My Business Account Management API' and 'My Business Business Information API' in Google Cloud Console.",
            "Submit the Google Business Profile API Access Request Form in Google Cloud Console to whitelist your project.",
            "Verify that your OAuth Client ID and Secret in TapGate match the authorized Google Cloud Project.",
          ],
          checkedAt: new Date().toISOString(),
        };
      } else if (!accountsRes.data || accountsRes.data.length === 0) {
        syncDiagnostic = {
          status: "NO_ACCOUNTS",
          endpoint: accountsRes.endpoint,
          httpStatus: 200,
          googleResponseText: accountsRes.rawResponse || '{"accounts": []}',
          errorTitle: "No Managed Business Profile Found in this Google Account",
          errorMessage: `Google API returned 0 business accounts (accounts: []) for ${connection.connectedEmail}.`,
          rootCause: `The authenticated Google account (${connection.connectedEmail}) is not an Owner or Manager of any business listing in Google Business Profile Manager (business.google.com). On Google Maps, the listing displays 'Own this business?', confirming that it has not been claimed/verified under this Google account.`,
          resolutionSteps: [
            `Sign in to https://business.google.com using ${connection.connectedEmail}.`,
            "Search for your listing (e.g. 'Gen Z Sports' in Tirukazhukundram) and click 'Claim this business' to complete Google verification.",
            `If the listing was already created under another email, open business.google.com under that email and invite ${connection.connectedEmail} as an Owner or Manager.`,
            "Once the location appears in your Google Business Profile dashboard, return here and click 'Re-sync with Google'.",
          ],
          checkedAt: new Date().toISOString(),
        };
      } else {
        // Live Account(s) found!
        liveAccName = accountsRes.data[0].name;
        if (connection.googleAccountId !== liveAccName) {
          await prisma.googleProfileConnection.update({
            where: { id: connection.id },
            data: {
              googleAccountId: liveAccName,
              accountName: accountsRes.data[0].accountName || connection.accountName,
            },
          });
        }

        // Step 2: Query verified Locations for this account
        const locationsRes = await fetchGoogleLocationsDetailed(liveAccName, validToken);

        if (!locationsRes.success) {
          syncDiagnostic = {
            status: "API_ERROR",
            endpoint: locationsRes.endpoint,
            httpStatus: locationsRes.httpStatus,
            googleResponseText: locationsRes.rawResponse,
            errorTitle: `Google Locations API Error (HTTP ${locationsRes.httpStatus || "Failed"})`,
            errorMessage: locationsRes.errorMessage || "Google returned an error fetching locations.",
            rootCause: "Could not retrieve locations from Google Business Information API.",
            resolutionSteps: [
              "Ensure 'My Business Business Information API' is enabled in your Google Cloud Project.",
              "Verify the OAuth token permissions include 'https://www.googleapis.com/auth/business.manage'.",
            ],
            checkedAt: new Date().toISOString(),
          };
        } else if (!locationsRes.data || locationsRes.data.length === 0) {
          syncDiagnostic = {
            status: "NO_LOCATIONS",
            endpoint: locationsRes.endpoint,
            httpStatus: 200,
            googleResponseText: locationsRes.rawResponse || '{"locations": []}',
            errorTitle: "No Active Locations Found in Google Business Account",
            errorMessage: `Google API returned 0 locations for account ${liveAccName}.`,
            rootCause: "The Google account is connected, but has no verified storefront locations listed under this account in Google Business Profile Manager.",
            resolutionSteps: [
              "Visit https://business.google.com and ensure your business location is fully verified by Google (not in pending review/suspended state).",
              "Once verified, return here and click 'Re-sync with Google'.",
            ],
            checkedAt: new Date().toISOString(),
          };
        } else {
          // Live location found!
          const liveLoc = locationsRes.data[0];
          liveLocName = liveLoc.name;

          const realRegularHours = liveLoc.regularHours
            ? parseGoogleRegularHours(liveLoc.regularHours)
            : (primaryLoc.regularHoursJson as any);

          const realSpecialHours = liveLoc.specialHours
            ? parseGoogleSpecialHours(liveLoc.specialHours)
            : (primaryLoc.specialHoursJson as any);

          const realAddress = (liveLoc.storefrontAddress as any) || primaryLoc.addressJson;
          const realPlaceId = liveLoc.metadata?.placeId || primaryLoc.placeId || null;

          await prisma.googleLocation.update({
            where: { id: primaryLoc.id },
            data: {
              googleLocationId: liveLoc.name,
              title: liveLoc.title || primaryLoc.title,
              storeCode: liveLoc.storeCode || primaryLoc.storeCode,
              placeId: realPlaceId,
              primaryPhone: liveLoc.phoneNumbers?.primaryPhone || primaryLoc.primaryPhone,
              websiteUri: liveLoc.websiteUri || primaryLoc.websiteUri,
              addressJson: realAddress,
              regularHoursJson: realRegularHours,
              specialHoursJson: realSpecialHours,
              primaryCategory: liveLoc.categories?.primaryCategory?.displayName || primaryLoc.primaryCategory,
              coordinatesLat: liveLoc.latlng?.latitude || primaryLoc.coordinatesLat,
              coordinatesLng: liveLoc.latlng?.longitude || primaryLoc.coordinatesLng,
            },
          });

          if (liveLoc.metadata?.newReviewUrl && !tenant.googleReviewUrl) {
            await prisma.tenant.update({
              where: { id: tenantId },
              data: { googleReviewUrl: liveLoc.metadata.newReviewUrl },
            });
          }

          // Step 3: Fetch real reviews from Google GBP v4 API
          const reviewsRes = await fetchGoogleReviewsDetailed(liveAccName, liveLocName, validToken);
          if (reviewsRes.success && reviewsRes.data?.reviews && reviewsRes.data.reviews.length > 0) {
            for (const r of reviewsRes.data.reviews) {
              if (!r.reviewId) continue;
              const starNum = STAR_RATING_MAP[String(r.starRating)] || Number(r.starRating) || 5;
              const reviewDate = r.createTime ? new Date(r.createTime) : new Date();
              const replyDate = r.reviewReply?.updateTime ? new Date(r.reviewReply.updateTime) : null;

              await prisma.googleReview.upsert({
                where: { googleReviewId: r.reviewId },
                update: {
                  reviewerName: r.reviewer?.displayName || "Google Customer",
                  reviewerPhotoUrl: r.reviewer?.profilePhotoUrl || null,
                  isAnonymous: Boolean(r.reviewer?.isAnonymous),
                  rating: starNum,
                  comment: r.comment || null,
                  replyComment: r.reviewReply?.comment || null,
                  replyUpdatedAt: replyDate,
                  reviewCreatedAt: reviewDate,
                },
                create: {
                  locationId: primaryLoc.id,
                  googleReviewId: r.reviewId,
                  reviewerName: r.reviewer?.displayName || "Google Customer",
                  reviewerPhotoUrl: r.reviewer?.profilePhotoUrl || null,
                  isAnonymous: Boolean(r.reviewer?.isAnonymous),
                  rating: starNum,
                  comment: r.comment || null,
                  replyComment: r.reviewReply?.comment || null,
                  replyUpdatedAt: replyDate,
                  reviewCreatedAt: reviewDate,
                },
              });
              syncedReviewsCount++;
            }
          }

          // Step 4: Fetch live media from Google
          const photos = await fetchGooglePhotos(liveAccName, liveLocName, validToken);
          if (photos && photos.length > 0) {
            for (const p of photos) {
              if (!p.name) continue;
              const photoUrl = p.googleUrl || p.thumbnailUrl;
              if (!photoUrl) continue;

              await prisma.googleMediaItem.upsert({
                where: { googleMediaId: p.name },
                update: {
                  mediaFormat: p.mediaFormat || "PHOTO",
                  category: p.locationAssociation?.category || "ADDITIONAL",
                  sourceUrl: photoUrl,
                  thumbnailUrl: p.thumbnailUrl || photoUrl,
                },
                create: {
                  locationId: primaryLoc.id,
                  googleMediaId: p.name,
                  mediaFormat: p.mediaFormat || "PHOTO",
                  category: p.locationAssociation?.category || "ADDITIONAL",
                  sourceUrl: photoUrl,
                  thumbnailUrl: p.thumbnailUrl || photoUrl,
                  isCustomerUser: Boolean(p.attribution?.profileName),
                },
              });
            }
          }

          // Step 5: Fetch live posts from Google
          const posts = await fetchGoogleLocalPosts(liveAccName, liveLocName, validToken);
          if (posts && posts.length > 0) {
            for (const post of posts) {
              if (!post.name) continue;
              const media = post.media?.[0]?.googleUrl || post.media?.[0]?.sourceUrl || null;

              await prisma.googlePost.upsert({
                where: { googlePostId: post.name },
                update: {
                  summary: post.summary || "",
                  topicType: post.topicType || "STANDARD",
                  callToAction: post.callToAction?.actionType || null,
                  actionUrl: post.callToAction?.url || null,
                  mediaUrl: media,
                  status: post.state === "LIVE" ? "PUBLISHED" : (post.state || "PUBLISHED"),
                },
                create: {
                  locationId: primaryLoc.id,
                  googlePostId: post.name,
                  summary: post.summary || "",
                  topicType: post.topicType || "STANDARD",
                  callToAction: post.callToAction?.actionType || null,
                  actionUrl: post.callToAction?.url || null,
                  mediaUrl: media,
                  status: post.state === "LIVE" ? "PUBLISHED" : (post.state || "PUBLISHED"),
                  publishedAt: post.createTime ? new Date(post.createTime) : new Date(),
                },
              });
            }
          }

          // Step 6: Fetch live performance metrics from Google
          const perfMetrics = await fetchGooglePerformanceMetrics(liveLocName, validToken);
          if (perfMetrics && perfMetrics.length > 0) {
            for (const m of perfMetrics) {
              await prisma.googlePerformanceDaily.upsert({
                where: { locationId_date: { locationId: primaryLoc.id, date: m.date } },
                update: m,
                create: { ...m, locationId: primaryLoc.id },
              });
            }
          }

          syncDiagnostic = {
            status: "LIVE_CONNECTED",
            endpoint: locationsRes.endpoint,
            httpStatus: 200,
            googleResponseText: JSON.stringify({ location: liveLocName, syncedReviews: syncedReviewsCount }),
            errorTitle: "Connected to Live Google Business Profile",
            errorMessage: `Successfully connected to live Google Business Profile for ${liveLoc.title || tenant.name}. (${syncedReviewsCount} live reviews imported).`,
            rootCause: "Live API connection is fully functional.",
            resolutionSteps: [],
            checkedAt: new Date().toISOString(),
          };
        }
      }
    } catch (liveSyncErr: any) {
      console.warn("Live Google GBP synchronization error:", liveSyncErr);
      syncDiagnostic = {
        status: "API_ERROR",
        endpoint: GOOGLE_ACCOUNTS_URL,
        errorTitle: "Live Google Synchronization Error",
        errorMessage: liveSyncErr.message || "An unexpected error occurred during Google sync.",
        rootCause: "Network or runtime exception occurred while querying Google Business Profile APIs.",
        resolutionSteps: ["Verify your Google Cloud project settings and click 'Re-sync with Google'."],
        checkedAt: new Date().toISOString(),
      };
    }

    // Save live diagnostic into location attributes
    await prisma.googleLocation.update({
      where: { id: primaryLoc.id },
      data: {
        attributesJson: { syncDiagnostic } as any,
      },
    });

    // Update connection sync status
    await prisma.googleProfileConnection.update({
      where: { id: connection.id },
      data: {
        isVerified: syncDiagnostic?.status === "LIVE_CONNECTED",
        lastSyncedAt: new Date(),
      },
    });

    return {
      success: true,
      message: syncDiagnostic?.errorMessage || `Synchronized live Google Profile: ${syncedReviewsCount} review(s) imported directly from Google.`,
      syncedReviewsCount,
    };
  } else {
    // Sandbox / simulated preview mode: self-heal preview starter data if empty
    await seedLocationStarterData(
      primaryLoc.id,
      tenant.name,
      tenant.businessType || "Business"
    );

    await prisma.googleProfileConnection.update({
      where: { id: connection.id },
      data: {
        isVerified: true,
        lastSyncedAt: new Date(),
      },
    });

    return {
      success: true,
      message: "Preview Google Business Profile metrics synchronized.",
    };
  }
}
