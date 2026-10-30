import { NextRequest, NextResponse } from "next/server";
import { requireTenantUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { tenantId } = await requireTenantUser();
    const body = await request.json();
    const {
      action,
      cardIds,
      gateTemplate,
      customRedirectUrl,
      customRedirectTitle,
      customRedirectDirect,
      googleReviewUrl,
      smartGateEnabled,
      zomatoUrl,
      swiggyUrl,
    } = body;

    // 1. One-Click Reset All Cards to Business Default (Google Review)
    if (action === "RESET_ALL_TO_DEFAULT") {
      const result = await prisma.card.updateMany({
        where: { tenantId },
        data: {
          overrideGate: false,
        },
      });

      return NextResponse.json({
        success: true,
        message: "All cards reset to default brand gate",
        updatedCount: result.count,
      });
    }

    // 2. Set All Cards to a Custom URL (e.g. Festival Menu / Promo / Direct Link)
    if (action === "SET_ALL_CUSTOM_URL") {
      if (!customRedirectUrl) {
        return NextResponse.json(
          { error: "customRedirectUrl is required for this action" },
          { status: 400 }
        );
      }

      const result = await prisma.card.updateMany({
        where: { tenantId },
        data: {
          overrideGate: true,
          gateTemplate: "CUSTOM_REDIRECT",
          customRedirectUrl,
          customRedirectTitle: customRedirectTitle || "View Promotion / Menu",
          customRedirectDirect: customRedirectDirect !== undefined ? Boolean(customRedirectDirect) : true,
        },
      });

      return NextResponse.json({
        success: true,
        message: "All cards updated to custom redirect URL",
        updatedCount: result.count,
      });
    }

    // 3. Set All Cards to Zomato
    if (action === "SET_ALL_ZOMATO") {
      if (!zomatoUrl) {
        return NextResponse.json(
          { error: "zomatoUrl is required for this action" },
          { status: 400 }
        );
      }

      const direct = customRedirectDirect !== undefined ? Boolean(customRedirectDirect) : true;
      const result = await prisma.card.updateMany({
        where: { tenantId },
        data: {
          overrideGate: true,
          gateTemplate: direct ? "CUSTOM_REDIRECT" : "DELIVERY_DINING",
          customRedirectUrl: direct ? zomatoUrl : undefined,
          customRedirectTitle: "Order on Zomato",
          customRedirectDirect: direct,
          zomatoUrl,
        },
      });

      return NextResponse.json({
        success: true,
        message: "All cards updated to Zomato",
        updatedCount: result.count,
      });
    }

    // 4. Set Selected Cards (e.g. 2 cards for Zomato, 2 cards for Google Review, etc.)
    if (action === "UPDATE_SELECTED") {
      if (!Array.isArray(cardIds) || cardIds.length === 0) {
        return NextResponse.json(
          { error: "cardIds array is required" },
          { status: 400 }
        );
      }

      const updateData: Record<string, unknown> = {};
      if (body.overrideGate !== undefined) {
        updateData.overrideGate = Boolean(body.overrideGate);
      }
      if (gateTemplate !== undefined) updateData.gateTemplate = gateTemplate;
      if (customRedirectUrl !== undefined) updateData.customRedirectUrl = customRedirectUrl;
      if (customRedirectTitle !== undefined) updateData.customRedirectTitle = customRedirectTitle;
      if (customRedirectDirect !== undefined) updateData.customRedirectDirect = Boolean(customRedirectDirect);
      if (googleReviewUrl !== undefined) updateData.googleReviewUrl = googleReviewUrl;
      if (smartGateEnabled !== undefined) updateData.smartGateEnabled = Boolean(smartGateEnabled);
      if (zomatoUrl !== undefined) updateData.zomatoUrl = zomatoUrl;
      if (swiggyUrl !== undefined) updateData.swiggyUrl = swiggyUrl;

      const result = await prisma.card.updateMany({
        where: {
          tenantId,
          id: { in: cardIds },
        },
        data: updateData,
      });

      return NextResponse.json({
        success: true,
        message: `Updated ${result.count} selected card(s)`,
        updatedCount: result.count,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("Bulk gate update failed:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
