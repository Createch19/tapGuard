import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireSuperAdmin();
    const businessTypes = await prisma.businessType.findMany({
      orderBy: [
        { isDefault: "desc" },
        { name: "asc" },
      ],
    });

    return NextResponse.json({ businessTypes });
  } catch (err) {
    console.error("GET /api/admin/business-types error:", err);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireSuperAdmin();
    const body = await request.json();
    const { name, icon } = body;

    if (!name || !String(name).trim()) {
      return NextResponse.json(
        { error: "Business type name is required" },
        { status: 400 }
      );
    }

    const cleanName = String(name).trim();
    const cleanSlug = cleanName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Check if already exists
    const existing = await prisma.businessType.findFirst({
      where: {
        OR: [
          { name: { equals: cleanName, mode: "insensitive" } },
          { slug: cleanSlug },
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: true,
          businessType: existing,
          alreadyExists: true,
        },
        { status: 200 }
      );
    }

    const newType = await prisma.businessType.create({
      data: {
        name: cleanName,
        slug: cleanSlug,
        icon: icon ? String(icon).trim() : "Store",
        isDefault: false,
      },
    });

    return NextResponse.json({
      success: true,
      businessType: newType,
    });
  } catch (err: unknown) {
    console.error("POST /api/admin/business-types error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Failed to create business type",
      },
      { status: 500 }
    );
  }
}
