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
  console.log("🌱 Initializing TapGenie database...");

  // 1. Seed Default Business Types (Idempotent upsert)
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
    await prisma.businessType.upsert({
      where: { slug: bt.slug },
      update: { name: bt.name, icon: bt.icon, isDefault: bt.isDefault },
      create: bt,
    });
  }
  console.log("✅ Seeded default business types directory.");

  // 2. Seed System Plan Configurations (Idempotent upsert)
  const planConfigs = [
    {
      plan: "LITE" as const,
      displayName: "Lite Lifetime",
      description: "1 NFC card with digital business profile microsite & UPI payments. Pay once, use forever.",
      price: 499.0,
      yearlyPrice: null,
      currency: "INR",
      billingCycle: "LIFETIME" as const,
      maxCards: 1,
      maxLocations: 1,
      maxCatalogItems: 10,
      bookingFormEnabled: false,
      removePoweredBy: false,
      smartGate: false,
      multiGateTemplates: false,
      customBranding: true,
      webhookAlerts: false,
      keywordSuggestions: false,
      googleHub: false,
      teamAccess: false,
      qrCodeTier: "Basic",
      analyticsRetDays: 30,
      prioritySupport: false,
      isActive: true,
      sortOrder: 1,
    },
    {
      plan: "STARTER" as const,
      displayName: "Starter",
      description: "3 NFC cards, full microsite studio, all 5 card modes, UPI payments, and review protection.",
      price: 299.0,
      yearlyPrice: 2999.0,
      currency: "INR",
      billingCycle: "MONTHLY" as const,
      maxCards: 3,
      maxLocations: 1,
      maxCatalogItems: 25,
      bookingFormEnabled: false,
      removePoweredBy: false,
      smartGate: true,
      multiGateTemplates: true,
      customBranding: true,
      webhookAlerts: false,
      keywordSuggestions: false,
      googleHub: true,
      teamAccess: false,
      qrCodeTier: "Branded",
      analyticsRetDays: 90,
      prioritySupport: false,
      isActive: true,
      sortOrder: 2,
    },
    {
      plan: "GROWTH" as const,
      displayName: "Growth",
      description: "3 locations, 15 cards, unlimited catalog, WhatsApp bookings, white-label, and AI review prompts.",
      price: 699.0,
      yearlyPrice: 6999.0,
      currency: "INR",
      billingCycle: "MONTHLY" as const,
      maxCards: 15,
      maxLocations: 3,
      maxCatalogItems: -1,
      bookingFormEnabled: true,
      removePoweredBy: true,
      smartGate: true,
      multiGateTemplates: true,
      customBranding: true,
      webhookAlerts: true,
      keywordSuggestions: true,
      googleHub: true,
      teamAccess: false,
      qrCodeTier: "Branded",
      analyticsRetDays: 365,
      prioritySupport: false,
      isActive: true,
      sortOrder: 3,
    },
    {
      plan: "BUSINESS" as const,
      displayName: "Business",
      description: "5 locations fleet with 50 cards, multi-user team roles, and priority support for brand chains.",
      price: 1499.0,
      yearlyPrice: 14999.0,
      currency: "INR",
      billingCycle: "MONTHLY" as const,
      maxCards: 50,
      maxLocations: 5,
      maxCatalogItems: -1,
      bookingFormEnabled: true,
      removePoweredBy: true,
      smartGate: true,
      multiGateTemplates: true,
      customBranding: true,
      webhookAlerts: true,
      keywordSuggestions: true,
      googleHub: true,
      teamAccess: true,
      qrCodeTier: "White-label",
      analyticsRetDays: 365,
      prioritySupport: true,
      isActive: true,
      sortOrder: 4,
    },
    {
      plan: "ENTERPRISE" as const,
      displayName: "Enterprise",
      description: "Unlimited locations, custom white-label branding, dedicated SLA, and volume pricing for enterprise chains.",
      price: 0.0,
      yearlyPrice: 0.0,
      currency: "INR",
      billingCycle: "CUSTOM" as const,
      maxCards: 9999,
      maxLocations: 999,
      maxCatalogItems: -1,
      bookingFormEnabled: true,
      removePoweredBy: true,
      smartGate: true,
      multiGateTemplates: true,
      customBranding: true,
      webhookAlerts: true,
      keywordSuggestions: true,
      googleHub: true,
      teamAccess: true,
      qrCodeTier: "White-label",
      analyticsRetDays: 3650,
      prioritySupport: true,
      isActive: true,
      sortOrder: 5,
    },
  ];

  for (const pc of planConfigs) {
    await prisma.planConfig.upsert({
      where: { plan: pc.plan },
      update: {
        displayName: pc.displayName,
        description: pc.description,
        price: pc.price,
        yearlyPrice: pc.yearlyPrice,
        currency: pc.currency,
        billingCycle: pc.billingCycle,
        maxCards: pc.maxCards,
        maxLocations: pc.maxLocations,
        maxCatalogItems: pc.maxCatalogItems,
        bookingFormEnabled: pc.bookingFormEnabled,
        removePoweredBy: pc.removePoweredBy,
        smartGate: pc.smartGate,
        multiGateTemplates: pc.multiGateTemplates,
        customBranding: pc.customBranding,
        webhookAlerts: pc.webhookAlerts,
        keywordSuggestions: pc.keywordSuggestions,
        googleHub: pc.googleHub,
        teamAccess: pc.teamAccess,
        qrCodeTier: pc.qrCodeTier,
        analyticsRetDays: pc.analyticsRetDays,
        prioritySupport: pc.prioritySupport,
        isActive: pc.isActive,
        sortOrder: pc.sortOrder,
      },
      create: pc,
    });
  }
  console.log("✅ Seeded Plan Configurations (Lite, Starter, Growth, Business, Enterprise).");

  // 3. Seed Super Admin User ONLY (No demo accounts or test records)
  const adminEmail = process.env.SUPER_ADMIN_EMAIL || "admin@tapgenie.io";
  const adminPassword = process.env.SUPER_ADMIN_PASSWORD || "Admin@123456";
  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: "SUPER_ADMIN",
    },
    create: {
      name: "Platform Super Admin",
      email: adminEmail,
      password: adminPasswordHash,
      role: "SUPER_ADMIN",
    },
  });

  console.log(`✅ Seeded Super Admin ID: ${superAdmin.id} (${superAdmin.email})`);
  console.log("🎉 Database initialized successfully for production! No demo accounts or test data.");
}

main()
  .catch((e) => {
    console.error("❌ Seed initialization failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
