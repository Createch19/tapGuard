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
      instagramUrl,
      facebookUrl,
      youtubeUrl,
      deliveryOfferText,
      deliveryPhone,
      greetingTitle,
      greetingSubtitle,
    } = body;

    // 1. One-Click Reset All Cards to Business Default (Inherited Gate)
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

    // 2. Set Template for All or Selected Cards
    if (action === "SET_TEMPLATE" || action === "UPDATE_SELECTED") {
      const isAll = action === "SET_TEMPLATE" && (!cardIds || cardIds.length === 0);
      const whereClause = isAll
        ? { tenantId }
        : { tenantId, id: { in: cardIds } };

      if (!isAll && (!Array.isArray(cardIds) || cardIds.length === 0)) {
        return NextResponse.json(
          { error: "cardIds array is required for selected update" },
          { status: 400 }
        );
      }

      if (body.overrideGate === false) {
        const result = await prisma.card.updateMany({
          where: whereClause,
          data: {
            overrideGate: false,
          },
        });
        return NextResponse.json({
          success: true,
          message: `Reset ${result.count} card(s) to business default`,
          updatedCount: result.count,
        });
      }

      const updateData: Record<string, unknown> = {
        overrideGate: true,
      };

      if (gateTemplate !== undefined) updateData.gateTemplate = gateTemplate;
      if (swiggyUrl !== undefined) updateData.swiggyUrl = swiggyUrl;
      if (zomatoUrl !== undefined) updateData.zomatoUrl = zomatoUrl;
      if (deliveryOfferText !== undefined) updateData.deliveryOfferText = deliveryOfferText;
      if (deliveryPhone !== undefined) updateData.deliveryPhone = deliveryPhone;
      if (googleReviewUrl !== undefined) updateData.googleReviewUrl = googleReviewUrl;
      if (smartGateEnabled !== undefined) updateData.smartGateEnabled = Boolean(smartGateEnabled);
      if (instagramUrl !== undefined) updateData.instagramUrl = instagramUrl;
      if (facebookUrl !== undefined) updateData.facebookUrl = facebookUrl;
      if (youtubeUrl !== undefined) updateData.youtubeUrl = youtubeUrl;
      if (customRedirectUrl !== undefined) updateData.customRedirectUrl = customRedirectUrl;
      if (customRedirectTitle !== undefined) updateData.customRedirectTitle = customRedirectTitle;
      if (customRedirectDirect !== undefined) updateData.customRedirectDirect = Boolean(customRedirectDirect);
      if (greetingTitle !== undefined) updateData.greetingTitle = greetingTitle;
      if (greetingSubtitle !== undefined) updateData.greetingSubtitle = greetingSubtitle;

      const result = await prisma.card.updateMany({
        where: whereClause,
        data: updateData,
      });

      return NextResponse.json({
        success: true,
        message: `Updated ${result.count} card(s) with selected template`,
        updatedCount: result.count,
      });
    }

    // 3. Backward Compatibility: Set All Cards to a Custom URL
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

    // 4. Backward Compatibility: Set All Cards to Zomato
    if (action === "SET_ALL_ZOMATO") {
      if (!zomatoUrl) {
        return NextResponse.json(
          { error: "zomatoUrl is required for this action" },
          { status: 400 }
        );
      }

      const result = await prisma.card.updateMany({
        where: { tenantId },
        data: {
          overrideGate: true,
          gateTemplate: "DELIVERY_DINING",
          zomatoUrl,
          customRedirectTitle: "Order on Zomato",
          customRedirectDirect: false,
        },
      });

      return NextResponse.json({
        success: true,
        message: "All cards updated to Zomato Delivery template",
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
