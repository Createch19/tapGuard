import { NextRequest, NextResponse } from "next/server";
import { requireTenantUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    await requireTenantUser();
    const body = await request.json();
    const { action, itemId, sectionId, name, description, price, isAvailable, dietaryTags } = body;

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

    if (action === "add_item") {
      if (!sectionId || !name || price === undefined) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }

      const newItem = await prisma.googleMenuItem.create({
        data: {
          sectionId,
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
