import { NextRequest, NextResponse } from "next/server";
import { requireTenantUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { patchGoogleProfileFields, refreshGoogleAccessToken, type ProfileFieldChanges } from "@/lib/google-sync";
import { computeProfileAuditScore } from "@/lib/profile-audit";

export const dynamic = "force-dynamic";

/**
 * GET current profile attributes for editing and recent profile update audit logs.
 */
export async function GET(request: NextRequest) {
  try {
    const { tenantId } = await requireTenantUser();
    const { searchParams } = new URL(request.url);
    const locationIdParam = searchParams.get("locationId");

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        googleConnection: {
          include: { locations: true },
        },
      },
    });

    if (!tenant || !tenant.googleConnection?.locations?.length) {
      return NextResponse.json({
        hasConnection: false,
        message: "No Google profile connection or locations found.",
      });
    }

    const locations = tenant.googleConnection.locations;
    const location =
      (locationIdParam && locations.find((l) => l.id === locationIdParam || l.googleLocationId === locationIdParam)) ||
      locations.find((l) => l.isPrimaryBranch) ||
      locations[0];

    // Fetch last 10 audit logs for this location
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        targetType: "GoogleLocation",
        targetId: location.id,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      location: {
        id: location.id,
        googleLocationId: location.googleLocationId,
        title: location.title,
        primaryCategory: location.primaryCategory,
        secondaryCategories: location.secondaryCategories,
        description: location.description || "",
        primaryPhone: location.primaryPhone || "",
        websiteUri: location.websiteUri || "",
        regularHours: location.regularHoursJson || {},
        specialHours: location.specialHoursJson || [],
        serviceItems: location.serviceItemsJson || [],
        attributes: location.attributesJson || {},
      },
      auditLogs,
    });
  } catch (err: any) {
    if (err?.message === "NEXT_REDIRECT" || err?.digest?.includes?.("NEXT_REDIRECT")) {
      throw err;
    }
    console.error("[Profile Editor GET Error]:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to load profile details" },
      { status: 500 }
    );
  }
}

/**
 * POST / PATCH: Validates diffs, updates Google via precise updateMask,
 * writes audit log, and recalculates audit score.
 */
export async function POST(request: NextRequest) {
  try {
    const { tenantId, user } = await requireTenantUser();
    const body = await request.json();
    const { locationId, changes, syncMicrosite } = body as {
      locationId: string;
      changes: ProfileFieldChanges;
      syncMicrosite?: boolean;
    };

    if (!locationId || !changes || typeof changes !== "object") {
      return NextResponse.json(
        { error: "locationId and changes object are required." },
        { status: 400 }
      );
    }

    const location = await prisma.googleLocation.findUnique({
      where: { id: locationId },
      include: { connection: true },
    });

    if (!location || location.tenantId !== tenantId) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    // Determine actual changed fields and build comparison diff
    const diffs: Array<{ field: string; before: any; after: any }> = [];
    const fieldsToPatch: ProfileFieldChanges = {};

    if (typeof changes.description !== "undefined") {
      const oldVal = (location.description || "").trim();
      const newVal = String(changes.description || "").trim();
      if (oldVal !== newVal) {
        diffs.push({ field: "description", before: oldVal, after: newVal });
        fieldsToPatch.description = newVal;
      }
    }

    if (typeof changes.primaryPhone !== "undefined") {
      const oldVal = (location.primaryPhone || "").trim();
      const newVal = String(changes.primaryPhone || "").trim();
      if (oldVal !== newVal) {
        diffs.push({ field: "primaryPhone", before: oldVal, after: newVal });
        fieldsToPatch.primaryPhone = newVal;
      }
    }

    if (typeof changes.websiteUri !== "undefined") {
      const oldVal = (location.websiteUri || "").trim();
      const newVal = String(changes.websiteUri || "").trim();
      if (oldVal !== newVal) {
        diffs.push({ field: "websiteUri", before: oldVal, after: newVal });
        fieldsToPatch.websiteUri = newVal;
      }
    }

    if (typeof changes.regularHours !== "undefined") {
      const oldStr = JSON.stringify(location.regularHoursJson || {});
      const newStr = JSON.stringify(changes.regularHours || {});
      if (oldStr !== newStr) {
        diffs.push({ field: "regularHours", before: location.regularHoursJson, after: changes.regularHours });
        fieldsToPatch.regularHours = changes.regularHours;
      }
    }

    if (typeof changes.specialHours !== "undefined") {
      const oldStr = JSON.stringify(location.specialHoursJson || []);
      const newStr = JSON.stringify(changes.specialHours || []);
      if (oldStr !== newStr) {
        diffs.push({ field: "specialHours", before: location.specialHoursJson, after: changes.specialHours });
        fieldsToPatch.specialHours = changes.specialHours;
      }
    }

    if (typeof changes.serviceItems !== "undefined") {
      const oldStr = JSON.stringify(location.serviceItemsJson || []);
      const newStr = JSON.stringify(changes.serviceItems || []);
      if (oldStr !== newStr) {
        diffs.push({ field: "serviceItems", before: location.serviceItemsJson, after: changes.serviceItems });
        fieldsToPatch.serviceItems = changes.serviceItems;
      }
    }

    if (diffs.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No changes detected. Profile is already up-to-date.",
        diffs: [],
      });
    }

    // If connected to Google with live token, dispatch PATCH with precise updateMask
    let googleUpdateResult: any = null;
    if (location.connection && !location.connection.accessToken.startsWith("ya29.simulated")) {
      let token = location.connection.accessToken;
      try {
        token = await refreshGoogleAccessToken(location.connection.id);
      } catch (tokenErr) {
        console.warn("Using existing token for profile patch:", tokenErr);
      }

      googleUpdateResult = await patchGoogleProfileFields(
        location.googleLocationId,
        fieldsToPatch,
        token
      );

      if (!googleUpdateResult.success) {
        return NextResponse.json(
          {
            error: googleUpdateResult.error || "Failed to update profile on Google Business Profile.",
            updateMask: googleUpdateResult.updateMask,
          },
          { status: 502 }
        );
      }
    }

    // Save changes to database
    const updateData: any = {};
    if (typeof fieldsToPatch.description !== "undefined") updateData.description = fieldsToPatch.description;
    if (typeof fieldsToPatch.primaryPhone !== "undefined") updateData.primaryPhone = fieldsToPatch.primaryPhone;
    if (typeof fieldsToPatch.websiteUri !== "undefined") updateData.websiteUri = fieldsToPatch.websiteUri;
    if (typeof fieldsToPatch.regularHours !== "undefined") updateData.regularHoursJson = fieldsToPatch.regularHours;
    if (typeof fieldsToPatch.specialHours !== "undefined") updateData.specialHoursJson = fieldsToPatch.specialHours;
    if (typeof fieldsToPatch.serviceItems !== "undefined") updateData.serviceItemsJson = fieldsToPatch.serviceItems;

    const updatedLocation = await prisma.googleLocation.update({
      where: { id: location.id },
      data: updateData,
    });

    // Optionally sync microsite / tenant hours
    if (syncMicrosite && typeof fieldsToPatch.regularHours !== "undefined") {
      try {
        const tenantRec = await prisma.tenant.findUnique({ where: { id: tenantId } });
        const existingProfile = (tenantRec?.businessProfile as any) || {};
        await prisma.tenant.update({
          where: { id: tenantId },
          data: {
            businessProfile: {
              ...existingProfile,
              operatingHours: fieldsToPatch.regularHours,
            },
          },
        });
      } catch (microErr) {
        console.warn("Microsite hours sync note:", microErr);
      }
    }

    // Record change in AuditLog
    const auditRecord = await prisma.auditLog.create({
      data: {
        actorId: user?.id || location.tenantId,
        actorEmail: user?.email || "owner@business.com",
        action: "PROFILE_UPDATED",
        targetType: "GoogleLocation",
        targetId: location.id,
        metadata: {
          locationTitle: location.title,
          diffs,
          updateMask: googleUpdateResult?.updateMask || diffs.map((d) => d.field).join(","),
          syncedMicrosite: Boolean(syncMicrosite),
          googleUpdated: Boolean(googleUpdateResult?.success),
        },
      },
    });

    // Recompute Profile Audit Score immediately to reflect improvements
    let auditScore: any = null;
    try {
      auditScore = await computeProfileAuditScore(location.id, tenantId);
    } catch (auditErr) {
      console.warn("Audit re-computation notice:", auditErr);
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${diffs.length} profile field(s) successfully on Google Search & Maps.`,
      updateMask: googleUpdateResult?.updateMask,
      diffs,
      auditLogId: auditRecord.id,
      location: updatedLocation,
      auditScore,
    });
  } catch (err: any) {
    if (err?.message === "NEXT_REDIRECT" || err?.digest?.includes?.("NEXT_REDIRECT")) {
      throw err;
    }
    console.error("[Profile Editor POST Error]:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error updating profile." },
      { status: 500 }
    );
  }
}
