import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString =
  process.env.DATABASE_URL ||
  "postgres://postgres:postgres@localhost:51214/template1?sslmode=disable";

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting TapGate database seed...");

  // 1. Clean existing records in reverse dependency order
  await prisma.privateFeedback.deleteMany();
  await prisma.tapEvent.deleteMany();
  await prisma.card.deleteMany();
  await prisma.cardBatch.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.tenantBranding.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();
  await prisma.planConfig.deleteMany();
  await prisma.businessType.deleteMany();
  await prisma.auditLog.deleteMany();

  console.log("🧹 Cleaned database tables.");

  // Seed default business types
  const defaultBusinessTypes = [
    { name: "Restaurant & Café", slug: "restaurant-cafe", icon: "Utensils", isDefault: true },
    { name: "Salon & Spa", slug: "salon-spa", icon: "Scissors", isDefault: true },
    { name: "Hotel & Hospitality", slug: "hotel-hospitality", icon: "Hotel", isDefault: true },
    { name: "Drug Store & Pharmacy", slug: "drug-store-pharmacy", icon: "Pill", isDefault: true },
    { name: "General Store & Supermarket", slug: "general-store-supermarket", icon: "ShoppingBag", isDefault: true },
    { name: "Gym & Fitness Studio", slug: "gym-fitness-studio", icon: "Dumbbell", isDefault: true },
    { name: "Sports & Recreation", slug: "sports-recreation", icon: "Trophy", isDefault: true },
    { name: "Healthcare & Dental Clinic", slug: "healthcare-dental-clinic", icon: "Stethoscope", isDefault: true },
    { name: "Automobile & Repair Service", slug: "automobile-repair-service", icon: "Wrench", isDefault: true },
    { name: "Boutique & Fashion Retail", slug: "boutique-fashion-retail", icon: "Shirt", isDefault: true },
    { name: "Bakery & Desserts", slug: "bakery-desserts", icon: "Cake", isDefault: true },
    { name: "Other / Professional Services", slug: "other-professional-services", icon: "Building", isDefault: true },
  ];
  for (const bt of defaultBusinessTypes) {
    await prisma.businessType.create({ data: bt });
  }
  console.log("✅ Seeded default business types.");

  // 2. Seed Plan Configurations
  const planConfigs = [
    {
      plan: "BASIC" as const,
      displayName: "Basic Lifetime",
      description: "Ideal for single-location shops and independent retail",
      price: 999.0,
      currency: "INR",
      billingCycle: "LIFETIME" as const,
      maxCards: 5,
      smartGate: true,
      multiGateTemplates: false,
      customBranding: false,
      webhookAlerts: false,
      qrCodeTier: "Basic",
      analyticsRetDays: 30,
      prioritySupport: false,
      isActive: true,
      sortOrder: 1,
    },
    {
      plan: "PRO" as const,
      displayName: "Pro Monthly",
      description: "For busy restaurants, multi-table venues, and clinics",
      price: 499.0,
      currency: "INR",
      billingCycle: "MONTHLY" as const,
      maxCards: 50,
      smartGate: true,
      multiGateTemplates: true,
      customBranding: true,
      webhookAlerts: true,
      qrCodeTier: "Branded",
      analyticsRetDays: 365,
      prioritySupport: false,
      isActive: true,
      sortOrder: 2,
    },
    {
      plan: "ENTERPRISE" as const,
      displayName: "Enterprise Custom",
      description: "For hotel chains, franchise networks, and enterprise fleets",
      price: 0.0,
      currency: "INR",
      billingCycle: "CUSTOM" as const,
      maxCards: 999999,
      smartGate: true,
      multiGateTemplates: true,
      customBranding: true,
      webhookAlerts: true,
      qrCodeTier: "White-label",
      analyticsRetDays: 3650,
      prioritySupport: true,
      isActive: true,
      sortOrder: 3,
    },
  ];

  for (const pc of planConfigs) {
    await prisma.planConfig.create({ data: pc });
  }
  console.log("✅ Seeded PlanConfigs (Basic ₹999, Pro ₹499, Enterprise Custom).");

  // 3. Seed Super Admin User
  const adminPasswordHash = await bcrypt.hash("Admin@123456", 10);
  const superAdmin = await prisma.user.create({
    data: {
      name: "Platform Super Admin",
      email: "admin@tapgate.io",
      password: adminPasswordHash,
      role: "SUPER_ADMIN",
    },
  });
  console.log("✅ Seeded Super Admin: admin@tapgate.io / Admin@123456");

  // 4. Seed Demo Tenant: The Artisan Bakery & Café
  const demoTenant = await prisma.tenant.create({
    data: {
      name: "The Artisan Bakery & Café",
      slug: "artisan-bakery",
      googleReviewUrl: "https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4",
      smartGateEnabled: true,
      greetingTitle: "How was your visit to The Artisan Bakery?",
      greetingSubtitle: "Your feedback helps us bake better bread and craft smoother espresso every day!",
      gateTemplate: "GOOGLE_REVIEW",
      instagramUrl: "https://instagram.com/theartisanbakery",
      facebookUrl: "https://facebook.com/theartisanbakery",
      youtubeUrl: "https://youtube.com/@theartisanbakery",
      swiggyUrl: "https://www.swiggy.com/restaurants/artisan-bakery-indiranagar-bangalore",
      zomatoUrl: "https://www.zomato.com/bangalore/the-artisan-bakery-indiranagar",
      deliveryOfferText: "Flat 15% OFF on direct takeaway orders! Call ahead.",
      deliveryPhone: "+91 98765 43210",
      customRedirectUrl: "https://theartisanbakery.com/menu",
      customRedirectTitle: "View Seasonal Bakery Menu",
      customRedirectDirect: false,
      plan: "PRO",
      businessType: "Restaurant & Café",
      maxCards: 50,
      alertEmail: "feedback@artisanbakery.com",
      webhookUrl: "https://webhook.site/demo-tapgate-endpoint",
      isActive: true,
    },
  });

  // Tenant Branding
  await prisma.tenantBranding.create({
    data: {
      tenantId: demoTenant.id,
      primaryColor: "#0D9488", // Teal 600
      secondaryColor: "#F0FDFA", // Teal 50
      accentColor: "#14B8A6", // Teal 500
      fontFamily: "Inter, sans-serif",
    },
  });

  // Tenant Subscription
  const oneMonthFromNow = new Date();
  oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

  await prisma.subscription.create({
    data: {
      tenantId: demoTenant.id,
      status: "ACTIVE",
      plan: "PRO",
      billingCycle: "MONTHLY",
      pricePaid: 499.0,
      currency: "INR",
      currentPeriodStart: new Date(),
      currentPeriodEnd: oneMonthFromNow,
    },
  });

  // Tenant Owner and Staff
  const ownerPasswordHash = await bcrypt.hash("Owner@123456", 10);
  const ownerUser = await prisma.user.create({
    data: {
      name: "Elena Rostova",
      email: "owner@artisanbakery.com",
      password: ownerPasswordHash,
      role: "OWNER",
      tenantId: demoTenant.id,
    },
  });

  const staffPasswordHash = await bcrypt.hash("Staff@123456", 10);
  await prisma.user.create({
    data: {
      name: "Marcus Vance",
      email: "staff@artisanbakery.com",
      password: staffPasswordHash,
      role: "STAFF",
      tenantId: demoTenant.id,
    },
  });
  console.log("✅ Seeded Demo Tenant: The Artisan Bakery & Café (owner@artisanbakery.com / Owner@123456)");

  // 5. Seed Card Batches
  const batch1 = await prisma.cardBatch.create({
    data: {
      name: "Batch-2026-ALPHA",
      quantity: 10,
      prefix: "TAP",
      notes: "NFC Glossy PVC 85.6x54mm cards manufactured for Q1 launch",
    },
  });

  // Seed Assigned Cards for Demo Tenant
  const card1 = await prisma.card.create({
    data: {
      shortCode: "ART-01",
      urlSlug: "artisan-counter",
      tenantId: demoTenant.id,
      batchId: batch1.id,
      status: "ACTIVE",
      label: "Front Register Counter Stand",
      activatedAt: new Date(Date.now() - 30 * 86400000),
    },
  });

  const card2 = await prisma.card.create({
    data: {
      shortCode: "ART-02",
      urlSlug: "artisan-table-patio",
      tenantId: demoTenant.id,
      batchId: batch1.id,
      status: "ACTIVE",
      label: "Patio Table 4 NFC Puck",
      activatedAt: new Date(Date.now() - 14 * 86400000),
    },
  });

  const card3 = await prisma.card.create({
    data: {
      shortCode: "ART-03",
      urlSlug: "artisan-takeaway",
      tenantId: demoTenant.id,
      batchId: batch1.id,
      status: "ACTIVE",
      label: "Takeaway Bag Insert Sticker",
      activatedAt: new Date(Date.now() - 5 * 86400000),
    },
  });

  // Seed Unassigned "Ghost Links" Ready to be Claimed
  const ghostCards = [
    { shortCode: "TAP-801", urlSlug: "tap-801-ghost" },
    { shortCode: "TAP-802", urlSlug: "tap-802-ghost" },
    { shortCode: "TAP-803", urlSlug: "tap-803-ghost" },
    { shortCode: "TAP-804", urlSlug: "tap-804-ghost" },
    { shortCode: "TAP-805", urlSlug: "tap-805-ghost" },
  ];

  for (const gc of ghostCards) {
    await prisma.card.create({
      data: {
        shortCode: gc.shortCode,
        urlSlug: gc.urlSlug,
        batchId: batch1.id,
        status: "UNASSIGNED",
      },
    });
  }
  console.log("✅ Seeded Active & Ghost NFC Cards.");

  // 6. Seed Realistic Tap Events and Private Feedback
  const sampleFeedbacks = [
    {
      rating: 2,
      name: "Rahul Sharma",
      phone: "+91 98765 43210",
      text: "The almond croissant was stale this morning and coffee was lukewarm. Usually love this place, hope you fix it.",
      resolved: false,
    },
    {
      rating: 3,
      name: "Priya Mehta",
      phone: "+91 98111 22334",
      text: "Service took 25 minutes for two cappuccinos on Sunday. Staff seemed overwhelmed.",
      resolved: true,
    },
    {
      rating: 1,
      name: "David Miller",
      phone: "+91 97234 56789",
      text: "Music was blasting so loudly that we couldn't hear each other speak. Asked twice to turn it down with no response.",
      resolved: false,
    },
    {
      rating: 2,
      name: "Ananya Roy",
      phone: "+91 99887 76655",
      text: "Order was mixed up: requested oat milk due to lactose intolerance but received cow's milk.",
      resolved: true,
    },
  ];

  const now = Date.now();
  const dayMs = 86400000;
  const cards = [card1, card2, card3];

  // 45 Tap Events across last 14 days
  for (let i = 0; i < 45; i++) {
    const card = cards[i % cards.length];
    const daysAgo = Math.floor(Math.random() * 14);
    const eventTime = new Date(now - daysAgo * dayMs - Math.random() * dayMs * 0.8);

    const isFeedback = i < 4;
    const isBounce = i >= 40;

    let outcome: "REDIRECTED" | "FEEDBACK_CAPTURED" | "BOUNCED" = "REDIRECTED";
    let rating: number | null = Math.random() > 0.3 ? 5 : 4;

    if (isFeedback) {
      outcome = "FEEDBACK_CAPTURED";
      rating = sampleFeedbacks[i].rating;
    } else if (isBounce) {
      outcome = "BOUNCED";
      rating = null;
    }

    const deviceOs = i % 3 === 0 ? "IOS" : i % 3 === 1 ? "ANDROID" : "DESKTOP";

    const tapEvent = await prisma.tapEvent.create({
      data: {
        cardId: card.id,
        tenantId: demoTenant.id,
        deviceOs,
        rating,
        outcome,
        country: "IN",
        createdAt: eventTime,
      },
    });

    if (isFeedback) {
      const fb = sampleFeedbacks[i];
      await prisma.privateFeedback.create({
        data: {
          tenantId: demoTenant.id,
          cardId: card.id,
          tapEventId: tapEvent.id,
          rating: fb.rating,
          feedbackText: fb.text,
          phoneNumber: fb.phone,
          customerName: fb.name,
          isResolved: fb.resolved,
          resolvedAt: fb.resolved ? new Date(eventTime.getTime() + 7200000) : null,
          resolvedById: fb.resolved ? ownerUser.id : null,
          createdAt: eventTime,
        },
      });
    }
  }
  console.log("✅ Seeded 45 Tap Events & 4 Private Feedback entries (prevented bad Google reviews).");

  // 7. Seed Audit Logs
  await prisma.auditLog.create({
    data: {
      actorId: superAdmin.id,
      actorEmail: superAdmin.email,
      action: "TENANT_CREATED",
      targetType: "Tenant",
      targetId: demoTenant.id,
      metadata: { name: demoTenant.name, slug: demoTenant.slug },
      ipAddress: "127.0.0.1",
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: superAdmin.id,
      actorEmail: superAdmin.email,
      action: "SUBSCRIPTION_CREATED",
      targetType: "Subscription",
      targetId: demoTenant.id,
      metadata: { plan: "PRO", pricePaid: 499.0 },
      ipAddress: "127.0.0.1",
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: superAdmin.id,
      actorEmail: superAdmin.email,
      action: "CARD_BATCH_GENERATED",
      targetType: "CardBatch",
      targetId: batch1.id,
      metadata: { quantity: 10, prefix: "TAP" },
      ipAddress: "127.0.0.1",
    },
  });

  console.log("🎉 Seed finished successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
