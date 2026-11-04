import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // Find card by urlSlug or shortCode, or fallback to tenant by slug
  const card = await prisma.card.findFirst({
    where: {
      OR: [{ urlSlug: slug }, { shortCode: slug.toUpperCase() }],
    },
    include: {
      tenant: true,
    },
  });

  const tenant =
    card?.tenant ||
    (await prisma.tenant.findUnique({
      where: { slug },
    }));

  if (!tenant) {
    return new NextResponse("Not found", { status: 404 });
  }

  // Parse business profile overrides or tenant defaults
  const rawProfile = (card?.businessProfile || tenant.businessProfile) as Record<string, unknown> | null;
  const displayName = card?.label ? `${tenant.name} (${card.label})` : tenant.name;
  const phone = (rawProfile?.contactPhone as string) || (rawProfile?.whatsappNumber as string) || tenant.deliveryPhone || "";
  const email = (rawProfile?.contactEmail as string) || tenant.alertEmail || "";
  const address = (rawProfile?.address as string) || "";
  const website = (rawProfile?.websiteUrl as string) || tenant.customRedirectUrl || "";
  const category = (rawProfile?.category as string) || tenant.businessType || "Business";
  const bio = (rawProfile?.bio as string) || tenant.greetingSubtitle || "";

  // Standard vCard 3.0 formatted string
  const vcard = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${displayName.replace(/[;\n]/g, " ")}`,
    `ORG:${tenant.name.replace(/[;\n]/g, " ")}`,
    `TITLE:${category.replace(/[;\n]/g, " ")}`,
    phone ? `TEL;TYPE=WORK,VOICE:${phone}` : "",
    phone ? `TEL;TYPE=CELL:${phone}` : "",
    email ? `EMAIL;TYPE=PREF,INTERNET:${email}` : "",
    address ? `ADR;TYPE=WORK:;;${address.replace(/[;\n]/g, ", ")};;;;` : "",
    website ? `URL:${website}` : "",
    bio ? `NOTE:${bio.replace(/[;\n]/g, " ")}` : "",
    "PRODID:-//TapGate//Smart NFC Business Card//EN",
    "END:VCARD",
  ]
    .filter(Boolean)
    .join("\r\n");

  const safeFilename = tenant.name.replace(/[^a-zA-Z0-9_-]/g, "_");

  return new NextResponse(vcard, {
    status: 200,
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${safeFilename}.vcf"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
