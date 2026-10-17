import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { UserRole } from "@/generated/prisma/client";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireSuperAdmin();
    const { id } = await params;
    const body = await request.json();
    const { name, email, password, role, tenantId } = body;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updateData: {
      name?: string | null;
      email?: string;
      password?: string;
      role?: UserRole;
      tenantId?: string | null;
    } = {};

    if (name !== undefined) updateData.name = name ? String(name).trim() : null;
    if (email) {
      const cleanEmail = String(email).toLowerCase().trim();
      if (cleanEmail !== user.email) {
        const existing = await prisma.user.findUnique({
          where: { email: cleanEmail },
        });
        if (existing) {
          return NextResponse.json(
            { error: "Email is already taken by another account" },
            { status: 409 }
          );
        }
        updateData.email = cleanEmail;
      }
    }

    if (password) {
      if (password.length < 6) {
        return NextResponse.json(
          { error: "Password must be at least 6 characters" },
          { status: 400 }
        );
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    if (role) {
      const validRoles = ["SUPER_ADMIN", "OWNER", "MANAGER", "STAFF"];
      if (!validRoles.includes(role)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
      }
      updateData.role = role as UserRole;
    }

    if (tenantId !== undefined) {
      updateData.tenantId = tenantId || null;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      include: { tenant: true },
    });

    await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        actorEmail: admin.email,
        action: "USER_ROLE_CHANGED",
        targetType: "User",
        targetId: updatedUser.id,
        metadata: {
          updatedFields: Object.keys(updateData),
          userEmail: updatedUser.email,
        },
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        tenantId: updatedUser.tenantId,
        tenantName: updatedUser.tenant?.name || null,
      },
    });
  } catch (err: unknown) {
    console.error("PATCH /api/admin/users/[id] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireSuperAdmin();
    const { id } = await params;

    // Prevent self deletion
    if (admin.id === id) {
      return NextResponse.json(
        { error: "You cannot delete your own Super Admin account" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await prisma.user.delete({
      where: { id },
    });

    await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        actorEmail: admin.email,
        action: "USER_ROLE_CHANGED",
        targetType: "User",
        targetId: id,
        metadata: {
          deletedUserEmail: user.email,
          role: user.role,
          tenantId: user.tenantId,
        },
      },
    });

    return NextResponse.json({ success: true, message: "User deleted" });
  } catch (err: unknown) {
    console.error("DELETE /api/admin/users/[id] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete user" },
      { status: 500 }
    );
  }
}
