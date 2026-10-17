import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    await requireSuperAdmin();
    const tenants = await prisma.tenant.findMany({
      include: {
        cards: true,
        users: true,
        subscription: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ tenants });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireSuperAdmin();
    const body = await request.json();
    const {
      name,
      slug,
      plan,
      businessType,
      googleReviewUrl,
      maxCards,
      ownerName,
      ownerEmail,
      ownerPassword,
    } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Business name and slug are required" },
        { status: 400 }
      );
    }

    const cleanSlug = String(slug)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, "-");

    // Check unique slug
    const existing = await prisma.tenant.findUnique({
      where: { slug: cleanSlug },
    });
    if (existing) {
      return NextResponse.json(
        { error: "A tenant with this slug already exists" },
        { status: 409 }
      );
    }

    // If owner email is provided, verify uniqueness before creating tenant
    let cleanOwnerEmail: string | null = null;
    if (ownerEmail) {
      cleanOwnerEmail = String(ownerEmail).toLowerCase().trim();
      const existingUser = await prisma.user.findUnique({
        where: { email: cleanOwnerEmail },
      });
      if (existingUser) {
        return NextResponse.json(
          { error: `An account with email "${cleanOwnerEmail}" already exists` },
          { status: 409 }
        );
      }
    }

    const tenant = await prisma.tenant.create({
      data: {
        name: String(name).trim(),
        slug: cleanSlug,
        plan: plan || "BASIC",
        businessType: businessType ? String(businessType).trim() : "Restaurant & Café",
        googleReviewUrl: googleReviewUrl ? String(googleReviewUrl).trim() : null,
        maxCards: maxCards ? Number(maxCards) : plan === "PRO" ? 50 : 5,
        isActive: true,
      },
    });

    // Create default branding
    await prisma.tenantBranding.create({
      data: {
        tenantId: tenant.id,
        primaryColor: "#0D9488",
        secondaryColor: "#F0FDFA",
        accentColor: "#14B8A6",
      },
    });

    // Create subscription
    await prisma.subscription.create({
      data: {
        tenantId: tenant.id,
        status: "ACTIVE",
        plan: tenant.plan,
        billingCycle: tenant.plan === "BASIC" ? "LIFETIME" : "MONTHLY",
        pricePaid: tenant.plan === "BASIC" ? 999 : tenant.plan === "PRO" ? 499 : 0,
        currency: "INR",
        currentPeriodStart: new Date(),
      },
    });

    // Optionally create initial owner user
    let createdOwner = null;
    if (cleanOwnerEmail && ownerPassword) {
      const hashedPassword = await bcrypt.hash(ownerPassword, 10);
      createdOwner = await prisma.user.create({
        data: {
          name: ownerName ? String(ownerName).trim() : `${tenant.name} Owner`,
          email: cleanOwnerEmail,
          password: hashedPassword,
          role: "OWNER",
          tenantId: tenant.id,
        },
      });
    }

    // Log in audit log
    await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        actorEmail: admin.email,
        action: "TENANT_CREATED",
        targetType: "Tenant",
        targetId: tenant.id,
        metadata: {
          name: tenant.name,
          slug: tenant.slug,
          plan: tenant.plan,
          initialOwnerCreated: Boolean(createdOwner),
          ownerEmail: cleanOwnerEmail,
        },
      },
    });

    return NextResponse.json({
      success: true,
      tenant,
      owner: createdOwner
        ? {
            id: createdOwner.id,
            email: createdOwner.email,
            name: createdOwner.name,
            role: createdOwner.role,
          }
        : null,
    });
  } catch (err) {
    console.error("Failed to create tenant:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
