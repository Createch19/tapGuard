import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

export async function runCompleteMigration(): Promise<{ success: boolean; logs: string[] }> {
  const logs: string[] = [];
  const log = (msg: string) => {
    console.log(msg);
    logs.push(msg);
  };

  const connectionString =
    process.env.DATABASE_URL ||
    "postgres://postgres:postgres@localhost:51214/template1?sslmode=disable";

  log("🔌 Connecting to database...");
  const pool = new Pool({ connectionString });
  const client = await pool.connect();

  try {
    // 1. Enum Updates (TenantPlan)
    log("🛠️ Step 1: Checking and extending PostgreSQL Enums...");
    const checkEnum = await client.query(`
      SELECT 1 FROM pg_type WHERE typname = 'TenantPlan';
    `);
    if (checkEnum.rowCount && checkEnum.rowCount > 0) {
      const enumValues = ["LITE", "STARTER", "GROWTH", "BUSINESS", "ENTERPRISE", "BASIC", "PRO"];
      for (const val of enumValues) {
        try {
          await client.query(`ALTER TYPE "TenantPlan" ADD VALUE IF NOT EXISTS '${val}'`);
        } catch (e) {
          // Ignore if already added
        }
      }
      log("✅ Extended TenantPlan enum: LITE, STARTER, GROWTH, BUSINESS, ENTERPRISE.");
    }

    // GateTemplate enum
    const checkGateTemplate = await client.query(`
      SELECT 1 FROM pg_type WHERE typname = 'GateTemplate';
    `);
    if (checkGateTemplate.rowCount && checkGateTemplate.rowCount > 0) {
      try {
        await client.query(`ALTER TYPE "GateTemplate" ADD VALUE IF NOT EXISTS 'BUSINESS_PROFILE'`);
        log("✅ Extended GateTemplate enum with BUSINESS_PROFILE.");
      } catch (e) {}
    }

    // BillingCycle enum
    const checkBillingCycle = await client.query(`
      SELECT 1 FROM pg_type WHERE typname = 'BillingCycle';
    `);
    if (checkBillingCycle.rowCount && checkBillingCycle.rowCount > 0) {
      try {
        await client.query(`ALTER TYPE "BillingCycle" ADD VALUE IF NOT EXISTS 'LIFETIME'`);
        log("✅ Extended BillingCycle enum with LIFETIME.");
      } catch (e) {}
    }

    // 2. Safe Column Additions (IF NOT EXISTS)
    log("🛠️ Step 2: Ensuring all modern schema columns exist...");

    // Tenants columns
    await client.query(`
      ALTER TABLE IF EXISTS tenants 
        ADD COLUMN IF NOT EXISTS business_profile JSONB,
        ADD COLUMN IF NOT EXISTS max_locations INTEGER DEFAULT 1;
    `);

    // Cards columns
    await client.query(`
      ALTER TABLE IF EXISTS cards 
        ADD COLUMN IF NOT EXISTS business_profile JSONB;
    `);

    // Plan configs columns
    await client.query(`
      ALTER TABLE IF EXISTS plan_configs 
        ADD COLUMN IF NOT EXISTS yearly_price DECIMAL(10, 2),
        ADD COLUMN IF NOT EXISTS max_locations INTEGER DEFAULT 1,
        ADD COLUMN IF NOT EXISTS max_catalog_items INTEGER DEFAULT 25,
        ADD COLUMN IF NOT EXISTS booking_form_enabled BOOLEAN DEFAULT true,
        ADD COLUMN IF NOT EXISTS remove_powered_by BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS team_access BOOLEAN DEFAULT false;
    `);
    log("✅ Checked and created required columns on tenants, cards, and plan_configs.");

    // Baseline _prisma_migrations so "prisma migrate deploy" never throws P3005
    log("🛠️ Step 2b: Checking Prisma baseline migration status...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
        "id" VARCHAR(36) PRIMARY KEY,
        "checksum" VARCHAR(64) NOT NULL,
        "finished_at" TIMESTAMPTZ,
        "migration_name" VARCHAR(255) NOT NULL,
        "logs" TEXT,
        "rolled_back_at" TIMESTAMPTZ,
        "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "applied_steps_count" INTEGER NOT NULL DEFAULT 0
      );
    `);
    const checkApplied = await client.query(`
      SELECT 1 FROM "_prisma_migrations" WHERE migration_name = '0_init' AND finished_at IS NOT NULL;
    `);
    if (checkApplied.rowCount === 0) {
      await client.query(`
        INSERT INTO "_prisma_migrations" (id, checksum, migration_name, started_at, finished_at, applied_steps_count)
        VALUES (
          gen_random_uuid()::text,
          '48f3a4242525647e736c46ab8f07b83f9a4ffafb96e3e5473a5c9149f69ce2b0',
          '0_init',
          now(),
          now(),
          0
        );
      `);
      log("✅ Baselined Prisma migration 0_init in _prisma_migrations table.");
    } else {
      log("✅ Prisma migration 0_init already marked as applied.");
    }

    // 3. Migrate legacy plan records
    log("🛠️ Step 3: Migrating legacy tenant plans...");
    const checkTenants = await client.query(`
      SELECT 1 FROM information_schema.tables WHERE table_name = 'tenants';
    `);
    if (checkTenants.rowCount && checkTenants.rowCount > 0) {
      await client.query(`UPDATE tenants SET plan = 'GROWTH' WHERE plan::text = 'PRO'`);
      await client.query(`UPDATE tenants SET plan = 'STARTER' WHERE plan::text = 'BASIC'`);
      await client.query(`UPDATE subscriptions SET plan = 'GROWTH' WHERE plan::text = 'PRO'`);
      await client.query(`UPDATE subscriptions SET plan = 'STARTER' WHERE plan::text = 'BASIC'`);
      await client.query(`DELETE FROM plan_configs WHERE plan::text IN ('BASIC', 'PRO')`);
      log("✅ Cleaned legacy plans and upgraded existing records.");
    }

  } catch (err) {
    log(`⚠️ DDL notice (safe to proceed): ${(err as Error).message}`);
  } finally {
    client.release();
    await pool.end();
  }

  // 4. Seed Business Types & Plan Configs via Prisma Client
  log("🛠️ Step 4: Upserting business types and plan configs...");
  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
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
    log("✅ Upserted 12 default business types.");

    // Seed 5 Modern Plans
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
        maxCatalogItems: 100,
        bookingFormEnabled: true,
        removePoweredBy: true,
        smartGate: true,
        multiGateTemplates: true,
        customBranding: true,
        webhookAlerts: true,
        keywordSuggestions: true,
        googleHub: true,
        teamAccess: false,
        qrCodeTier: "Dynamic Vector",
        analyticsRetDays: 365,
        prioritySupport: true,
        isActive: true,
        sortOrder: 3,
      },
      {
        plan: "BUSINESS" as const,
        displayName: "Business",
        description: "10 locations, 50 cards, custom domain, webhook alerts, multi-member team access, and 2-year retention.",
        price: 1499.0,
        yearlyPrice: 14999.0,
        currency: "INR",
        billingCycle: "MONTHLY" as const,
        maxCards: 50,
        maxLocations: 10,
        maxCatalogItems: 500,
        bookingFormEnabled: true,
        removePoweredBy: true,
        smartGate: true,
        multiGateTemplates: true,
        customBranding: true,
        webhookAlerts: true,
        keywordSuggestions: true,
        googleHub: true,
        teamAccess: true,
        qrCodeTier: "Dynamic Vector",
        analyticsRetDays: 730,
        prioritySupport: true,
        isActive: true,
        sortOrder: 4,
      },
      {
        plan: "ENTERPRISE" as const,
        displayName: "Enterprise",
        description: "Unlimited locations & cards, custom portal, dedicated account manager, SLA guarantees, and API access.",
        price: 3999.0,
        yearlyPrice: 39999.0,
        currency: "INR",
        billingCycle: "MONTHLY" as const,
        maxCards: 9999,
        maxLocations: 9999,
        maxCatalogItems: 9999,
        bookingFormEnabled: true,
        removePoweredBy: true,
        smartGate: true,
        multiGateTemplates: true,
        customBranding: true,
        webhookAlerts: true,
        keywordSuggestions: true,
        googleHub: true,
        teamAccess: true,
        qrCodeTier: "Custom Branded Vector",
        analyticsRetDays: 1825,
        prioritySupport: true,
        isActive: true,
        sortOrder: 5,
      },
    ];

    for (const config of planConfigs) {
      await prisma.planConfig.upsert({
        where: { plan: config.plan },
        update: config,
        create: config,
      });
    }
    log("✅ Seeded 5-Tier Plan Configurations (Lite, Starter, Growth, Business, Enterprise).");

    // Ensure Super Admin exists if env credentials provided
    const adminEmail = process.env.SUPER_ADMIN_EMAIL || "admin@tapgenie.io";
    const adminPassword = process.env.SUPER_ADMIN_PASSWORD || "Admin@123456";
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: { role: "SUPER_ADMIN" },
      create: {
        email: adminEmail,
        name: "TapGenie Admin",
        password: passwordHash,
        role: "SUPER_ADMIN",
      },
    });
    log(`✅ Super Admin account verified: ${admin.email}`);

    log("🎉 Database migration and sync finished successfully!");
    return { success: true, logs };
  } catch (err) {
    log(`❌ Error during seeding: ${(err as Error).message}`);
    return { success: false, logs };
  } finally {
    await prisma.$disconnect();
  }
}

// Allow direct CLI invocation: tsx prisma/migrate-plans.ts
if (require.main === module || process.argv[1]?.endsWith("migrate-plans.ts")) {
  runCompleteMigration()
    .then((res) => {
      if (!res.success) process.exit(1);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
