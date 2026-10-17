import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { UserRole } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  try {
    await requireSuperAdmin();
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get("tenantId");

    const users = await prisma.user.findMany({
      where: tenantId ? { tenantId } : undefined,
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
            plan: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        tenantId: u.tenantId,
        tenantName: u.tenant?.name || null,
        tenantSlug: u.tenant?.slug || null,
        createdAt: u.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    console.error("GET /api/admin/users error:", err);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireSuperAdmin();
    const body = await request.json();
    const { name, email, password, role, tenantId } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).toLowerCase().trim();

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    const validRoles = ["SUPER_ADMIN", "OWNER", "MANAGER", "STAFF"];
    const targetRole = (role || "OWNER") as UserRole;
    if (!validRoles.includes(targetRole)) {
      return NextResponse.json(
        { error: "Invalid role specified" },
        { status: 400 }
      );
    }

    // If role is tenant-specific, tenantId is required
    let assignedTenantId: string | null = null;
    if (targetRole !== "SUPER_ADMIN") {
      if (!tenantId) {
        return NextResponse.json(
          { error: "A business tenant must be selected for non-admin accounts" },
          { status: 400 }
        );
      }
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
      });
      if (!tenant) {
        return NextResponse.json(
          { error: "Target tenant does not exist" },
          { status: 404 }
        );
      }
      assignedTenantId = tenant.id;
    }

    // Check if email already taken
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name ? String(name).trim() : null,
        email: cleanEmail,
        password: hashedPassword,
        role: targetRole,
        tenantId: assignedTenantId,
      },
      include: {
        tenant: true,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        actorEmail: admin.email,
        action: "USER_ROLE_CHANGED",
        targetType: "User",
        targetId: user.id,
        metadata: {
          createdUserEmail: user.email,
          role: user.role,
          tenantId: user.tenantId,
          tenantName: user.tenant?.name || null,
        },
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        tenantName: user.tenant?.name || null,
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch (err: unknown) {
    console.error("POST /api/admin/users error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create user" },
      { status: 500 }
    );
  }
}
