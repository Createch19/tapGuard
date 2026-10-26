import { NextRequest, NextResponse } from "next/server";
import { requireTenantUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { tenantId } = await requireTenantUser();
    const body = await request.json();
    const {
      action,
      itemId,
      sectionId,
      sectionName,
      categoryName,
      name,
      description,
      price,
      isAvailable,
      dietaryTags,
    } = body;

    if (action === "toggle_stock") {
      const item = await prisma.googleMenuItem.findUnique({
        where: { id: itemId },
      });

      if (!item) {
        return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
      }

      const updated = await prisma.googleMenuItem.update({
        where: { id: itemId },
        data: { isAvailable: !item.isAvailable },
      });

      return NextResponse.json({
        success: true,
        message: `Updated stock: ${updated.name} is now ${updated.isAvailable ? "In Stock" : "Out of Stock"} on Google Maps!`,
        item: updated,
      });
    }

    if (action === "add_section") {
      const title = String(sectionName || categoryName || "").trim();
      if (!title) {
        return NextResponse.json({ error: "Category name is required" }, { status: 400 });
      }

      const location = await prisma.googleLocation.findFirst({
        where: { tenantId },
        include: { menuSections: true },
      });

      if (!location) {
        return NextResponse.json({ error: "No Google business location found" }, { status: 404 });
      }

      const newSection = await prisma.googleMenuSection.create({
        data: {
          locationId: location.id,
          title,
          sortOrder: location.menuSections.length + 1,
        },
        include: { items: true },
      });

      return NextResponse.json({
        success: true,
        message: `Category "${title}" created successfully!`,
        section: newSection,
      });
    }

    if (action === "add_item") {
      if (!name || price === undefined) {
        return NextResponse.json({ error: "Item name and price are required" }, { status: 400 });
      }

      let targetSectionId = sectionId;

      if (!targetSectionId || targetSectionId === "") {
        const location = await prisma.googleLocation.findFirst({
          where: { tenantId },
          include: { menuSections: true },
        });

        if (!location) {
          return NextResponse.json({ error: "No Google business location found" }, { status: 404 });
        }

        const desiredCategory = String(categoryName || sectionName || "").trim();

        if (desiredCategory) {
          let matched = location.menuSections.find(
            (s) => s.title.toLowerCase() === desiredCategory.toLowerCase()
          );
          if (!matched) {
            matched = await prisma.googleMenuSection.create({
              data: {
                locationId: location.id,
                title: desiredCategory,
                sortOrder: location.menuSections.length + 1,
              },
            });
          }
          targetSectionId = matched.id;
        } else if (location.menuSections.length > 0) {
          targetSectionId = location.menuSections[0].id;
        } else {
          const autoSection = await prisma.googleMenuSection.create({
            data: {
              locationId: location.id,
              title: "Featured Items & Services",
              sortOrder: 1,
            },
          });
          targetSectionId = autoSection.id;
        }
      }

      const newItem = await prisma.googleMenuItem.create({
        data: {
          sectionId: targetSectionId,
          name: String(name).trim(),
          description: description ? String(description).trim() : null,
          price: Number(price),
          isAvailable: isAvailable !== false,
          dietaryTags: Array.isArray(dietaryTags) ? dietaryTags : [],
        },
      });

      return NextResponse.json({
        success: true,
        message: "New menu item pushed to Google Structured Menu!",
        item: newItem,
        sectionId: targetSectionId,
      });
    }

    if (action === "delete_item") {
      if (!itemId) {
        return NextResponse.json({ error: "itemId is required" }, { status: 400 });
      }

      await prisma.googleMenuItem.delete({
        where: { id: itemId },
      });

      return NextResponse.json({
        success: true,
        message: "Menu item removed from Google listing.",
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("POST /api/dashboard/google/menu error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
