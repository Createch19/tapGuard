import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function detectDeviceOs(userAgent: string | null): "IOS" | "ANDROID" | "DESKTOP" | "UNKNOWN" {
  if (!userAgent) return "UNKNOWN";
  const ua = userAgent.toLowerCase();
  if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ipod")) {
    return "IOS";
  }
  if (ua.includes("android")) {
    return "ANDROID";
  }
  if (ua.includes("macintosh") || ua.includes("windows") || ua.includes("linux")) {
    return "DESKTOP";
  }
  return "UNKNOWN";
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const userAgent = request.headers.get("user-agent");
  const deviceOs = detectDeviceOs(userAgent);

  // Look up card by urlSlug or shortCode
  const card = await prisma.card.findFirst({
    where: {
      OR: [{ urlSlug: slug }, { shortCode: slug.toUpperCase() }],
    },
    include: {
      tenant: {
        include: {
          branding: true,
        },
      },
    },
  });

  const baseUrl = request.nextUrl.origin;

  // 1. Card Not Found
  if (!card) {
    return NextResponse.redirect(new URL(`/card-status?status=not_found&slug=${slug}`, baseUrl));
  }

  // 2. Card Unassigned (Ghost Link)
  if (card.status === "UNASSIGNED" || !card.tenantId || !card.tenant) {
    return NextResponse.redirect(
      new URL(`/claim?code=${encodeURIComponent(card.shortCode)}`, baseUrl)
    );
  }

  // 3. Card Deactivated or Lost
  if (card.status === "DEACTIVATED" || card.status === "LOST") {
    return NextResponse.redirect(
      new URL(`/card-status?status=${card.status.toLowerCase()}&name=${encodeURIComponent(card.tenant.name)}`, baseUrl)
    );
  }

  // 4. Active Card: Log Tap Event
  const tapEvent = await prisma.tapEvent.create({
    data: {
      cardId: card.id,
      tenantId: card.tenant.id,
      deviceOs,
      userAgent: userAgent ? userAgent.substring(0, 500) : null,
      country: request.headers.get("x-vercel-ip-country") || "IN",
      outcome: "BOUNCED", // Default until redirected or feedback captured
    },
  });

  // 5. If Custom Redirect Template is active with Direct 307 Redirect enabled
  if (
    card.tenant.gateTemplate === "CUSTOM_REDIRECT" &&
    card.tenant.customRedirectDirect &&
    card.tenant.customRedirectUrl
  ) {
    await prisma.tapEvent.update({
      where: { id: tapEvent.id },
      data: { outcome: "DIRECT_REDIRECT" },
    });
    return NextResponse.redirect(card.tenant.customRedirectUrl, 307);
  }

  // 6. If Google Review Gate is active and Smart Gate is DISABLED -> Direct Google Review Redirect
  if (
    card.tenant.gateTemplate === "GOOGLE_REVIEW" &&
    !card.tenant.smartGateEnabled
  ) {
    await prisma.tapEvent.update({
      where: { id: tapEvent.id },
      data: { outcome: "DIRECT_REDIRECT" },
    });

    const destination = card.tenant.googleReviewUrl || "https://google.com";
    return NextResponse.redirect(destination, 307);
  }

  // 7. Forward to Dynamic Gate UI
  const rateUrl = new URL(`/rate/${card.urlSlug}`, baseUrl);
  rateUrl.searchParams.set("tid", tapEvent.id);

  return NextResponse.redirect(rateUrl, 307);
}
