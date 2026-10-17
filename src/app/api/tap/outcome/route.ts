import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { tapEventId, rating, outcome } = await request.json();

    if (!tapEventId) {
      return NextResponse.json({ error: "Missing tapEventId" }, { status: 400 });
    }

    const updated = await prisma.tapEvent.update({
      where: { id: tapEventId },
      data: {
        rating: typeof rating === "number" ? rating : undefined,
        outcome: outcome || "REDIRECTED",
      },
    });

    return NextResponse.json({ success: true, updated });
  } catch (err) {
    console.error("Failed to update tap outcome:", err);
    return NextResponse.json({ error: "Failed to update tap outcome" }, { status: 500 });
  }
}
