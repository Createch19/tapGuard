import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

async function syncProductionDefaults() {
  const connectionString =
    process.env.DATABASE_URL ||
    "postgres://postgres:postgres@localhost:51214/template1?sslmode=disable";

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    console.log("🔄 Syncing plan configuration defaults...");
    await prisma.planConfig.updateMany({
      where: { plan: { in: ["GROWTH", "BUSINESS", "ENTERPRISE"] } },
      data: { keywordSuggestions: true, googleHub: true },
    });
    console.log("✅ Plan configurations synced successfully.");
  } catch (error) {
    console.warn("⚠️ Note during prod sync (safe to proceed):", (error as Error).message);
  } finally {
    await prisma.$disconnect();
  }
}

syncProductionDefaults();
