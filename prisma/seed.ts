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
  console.log("🌱 Initializing TapGate database...");

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
    await prisma.planConfig.upsert({
      where: { plan: pc.plan },
      update: {
        displayName: pc.displayName,
        description: pc.description,
        price: pc.price,
        currency: pc.currency,
        billingCycle: pc.billingCycle,
        maxCards: pc.maxCards,
        smartGate: pc.smartGate,
        multiGateTemplates: pc.multiGateTemplates,
        customBranding: pc.customBranding,
        webhookAlerts: pc.webhookAlerts,
        qrCodeTier: pc.qrCodeTier,
        analyticsRetDays: pc.analyticsRetDays,
        prioritySupport: pc.prioritySupport,
        isActive: pc.isActive,
        sortOrder: pc.sortOrder,
      },
      create: pc,
    });
  }
  console.log("✅ Seeded Plan Configurations (Basic, Pro, Enterprise).");

  // 3. Seed Super Admin User ONLY (No demo accounts or test records)
  const adminEmail = process.env.SUPER_ADMIN_EMAIL || "admin@tapgate.io";
  const adminPassword = process.env.SUPER_ADMIN_PASSWORD || "Admin@123456";
  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: "SUPER_ADMIN",
      password: adminPasswordHash,
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
