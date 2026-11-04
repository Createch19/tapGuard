import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

async function main() {
  const connectionString =
    process.env.DATABASE_URL ||
    "postgres://postgres:postgres@localhost:51214/template1?sslmode=disable";

  const pool = new Pool({ connectionString });
  const client = await pool.connect();

  try {
    // Check if TenantPlan enum exists
    const checkEnum = await client.query(`
      SELECT 1 FROM pg_type WHERE typname = 'TenantPlan';
    `);
    if (checkEnum.rowCount && checkEnum.rowCount > 0) {
      console.log("🛠️ Adding new enum values to TenantPlan in Postgres...");
      await client.query(`ALTER TYPE "TenantPlan" ADD VALUE IF NOT EXISTS 'LITE'`);
      await client.query(`ALTER TYPE "TenantPlan" ADD VALUE IF NOT EXISTS 'STARTER'`);
      await client.query(`ALTER TYPE "TenantPlan" ADD VALUE IF NOT EXISTS 'GROWTH'`);
      await client.query(`ALTER TYPE "TenantPlan" ADD VALUE IF NOT EXISTS 'BUSINESS'`);
      console.log("✅ Added enum values: LITE, STARTER, GROWTH, BUSINESS.");
    }

    // Check if tenants table exists
    const checkTable = await client.query(`
      SELECT 1 FROM information_schema.tables WHERE table_name = 'tenants';
    `);
    if (checkTable.rowCount && checkTable.rowCount > 0) {
      console.log("🔄 Updating existing tenants and subscriptions to new plans...");
      await client.query(`UPDATE tenants SET plan = 'GROWTH' WHERE plan = 'PRO'`);
      await client.query(`UPDATE tenants SET plan = 'STARTER' WHERE plan = 'BASIC'`);
      await client.query(`UPDATE subscriptions SET plan = 'GROWTH' WHERE plan = 'PRO'`);
      await client.query(`UPDATE subscriptions SET plan = 'STARTER' WHERE plan = 'BASIC'`);
      await client.query(`DELETE FROM plan_configs`);
      console.log("✅ Cleaned old plan configs and updated existing records.");
    }
  } catch (err) {
    console.warn("Notice during migration (safe to proceed):", (err as Error).message);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

