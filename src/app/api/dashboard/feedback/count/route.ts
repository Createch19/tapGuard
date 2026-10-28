import { NextResponse } from "next/server";
import { requireTenantUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const { tenantId } = await requireTenantUser();
    const count = await prisma.privateFeedback.count({
      where: {
        tenantId,
        isResolved: { not: true },
      },
    });

    return NextResponse.json({ count });
  } catch (err) {
    console.error("Failed to fetch unresolved feedback count:", err);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}
