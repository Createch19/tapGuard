import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

export async function seedDemoData(existingPrisma?: PrismaClient): Promise<{ success: boolean; logs: string[] }> {
  const logs: string[] = [];
  const log = (msg: string) => {
    console.log(msg);
    logs.push(msg);
  };

  let prisma = existingPrisma;
  let shouldDisconnect = false;

  if (!prisma) {
    const connectionString =
      process.env.DATABASE_URL ||
      "postgres://postgres:postgres@localhost:51214/template1?sslmode=disable";
    const adapter = new PrismaPg({ connectionString });
    prisma = new PrismaClient({ adapter });
    shouldDisconnect = true;
  }

  try {
    log("🚀 Seeding demo accounts, touchpoint cards & live showcase data...");

    // 1. Seed Alpha Card Batch
    const batchId = "47d9f201-3655-45ff-b4ba-fbec291fe16f";
    await prisma.cardBatch.upsert({
      where: { id: batchId },
      update: {
        name: "Batch-2026-ALPHA",
        quantity: 10,
        prefix: "TAP",
        notes: "NFC Glossy PVC 85.6x54mm cards manufactured for Q1 launch",
      },
      create: {
        id: batchId,
        name: "Batch-2026-ALPHA",
        quantity: 10,
        prefix: "TAP",
        notes: "NFC Glossy PVC 85.6x54mm cards manufactured for Q1 launch",
      },
    });
    log("✅ Demo CardBatch verified: Batch-2026-ALPHA");

    // 2. Seed Demo Tenant 1: The Artisan Bakery & Café (slug: artisan-bakery, card: artisan-counter)
    const artisanTenantId = "568a0cef-7819-467c-b7b0-6b3912265739";
    const artisanBusinessProfile = {
      bio: "Welcome to our official page. Explore our artisan menu, order takeaway, or make direct contactless payments.",
      tagline: "Artisanal Breads, Specialty Coffee & Croissants",
      category: "Bakery & Specialty Café",
      upiId: "sathis",
      upiPayeeName: "The Artisan Bakery & Café",
      enableUpi: true,
      enableVCard: true,
      contactPhone: "+91 98765 43210",
      whatsappNumber: "+91 98765 43210",
      businessHoursText: "Mon - Sat: 8:00 AM - 9:00 PM | Sun: 9:00 AM - 6:00 PM",
      themeStyle: "DARK",
      sections: {
        quickActions: true,
        upi: true,
        catalog: true,
        about: true,
        hours: true,
        social: true,
        map: true,
        gallery: true,
        enquiry: false,
        reviews: false,
      },
      sectionOrder: [
        "quickActions",
        "upi",
        "catalog",
        "about",
        "hours",
        "map",
        "social",
      ],
      catalogCategories: ["Artisan Breads", "Pastries & Cakes", "Specialty Coffee"],
      catalogItems: [
        {
          id: "item-1",
          name: "French Cultured Butter Croissant",
          badge: "Bestseller",
          price: "₹160",
          category: "Pastries & Cakes",
          description: "Multi-layered flaky croissant baked fresh with pure French cultured butter.",
        },
        {
          id: "item-2",
          name: "Natural Sourdough Country Loaf",
          badge: "Chef Choice",
          price: "₹240",
          category: "Artisan Breads",
          description: "Naturally fermented 36-hour sourdough loaf with a crispy caramelized crust.",
        },
        {
          id: "item-3",
          name: "Double Shot Cortado Espresso",
          badge: "Fresh Brew",
          price: "₹190",
          category: "Specialty Coffee",
          description: "Single-origin Arabica medium-dark roast with equal parts warm steamed milk.",
        },
      ],
    };

    const artisanTenant = await prisma.tenant.upsert({
      where: { slug: "artisan-bakery" },
      update: {
        name: "The Artisan Bakery & Café",
        googleReviewUrl: "https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4",
        smartGateEnabled: true,
        greetingTitle: "How was your visit to The Artisan Bakery?",
        greetingSubtitle: "Your feedback helps us bake better bread and craft smoother espresso every day!",
        gateTemplate: "BUSINESS_PROFILE",
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
        businessProfile: artisanBusinessProfile,
        plan: "GROWTH",
        businessType: "Restaurant & Café",
        isActive: true,
        maxCards: 50,
        maxLocations: 3,
        alertEmail: "feedback@artisanbakery.com",
        webhookUrl: "https://webhook.site/demo-tapgate-endpoint",
      },
      create: {
        id: artisanTenantId,
        name: "The Artisan Bakery & Café",
        slug: "artisan-bakery",
        googleReviewUrl: "https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4",
        smartGateEnabled: true,
        greetingTitle: "How was your visit to The Artisan Bakery?",
        greetingSubtitle: "Your feedback helps us bake better bread and craft smoother espresso every day!",
        gateTemplate: "BUSINESS_PROFILE",
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
        businessProfile: artisanBusinessProfile,
        plan: "GROWTH",
        businessType: "Restaurant & Café",
        isActive: true,
        maxCards: 50,
        maxLocations: 3,
        alertEmail: "feedback@artisanbakery.com",
        webhookUrl: "https://webhook.site/demo-tapgate-endpoint",
      },
    });
    log(`✅ Tenant verified: ${artisanTenant.name} (${artisanTenant.slug})`);

    // Artisan Branding
    await prisma.tenantBranding.upsert({
      where: { tenantId: artisanTenant.id },
      update: {
        primaryColor: "#010a0e",
        secondaryColor: "#F0FDFA",
        accentColor: "#14B8A6",
        fontFamily: "Inter, sans-serif",
      },
      create: {
        tenantId: artisanTenant.id,
        primaryColor: "#010a0e",
        secondaryColor: "#F0FDFA",
        accentColor: "#14B8A6",
        fontFamily: "Inter, sans-serif",
      },
    });

    // Artisan Review Keywords
    await prisma.tenantReviewKeyword.upsert({
      where: { tenantId: artisanTenant.id },
      update: {
        isEnabled: true,
        primaryLanguage: "EN",
        enabledLanguages: ["EN", "TANGLISH", "TA", "HI", "TE", "KN"],
        keywords: [
          "freshly baked cakes",
          "soft artisan pastries",
          "delicious custom birthday cake",
          "clean pastry counter",
          "melt in mouth desserts",
        ],
        customSentences: [
          "Loved the quality and quick service! Definitely visiting again.",
          "Semma taste and great hospitality! 5 stars all the way.",
        ],
        tone: "CASUAL",
      },
      create: {
        tenantId: artisanTenant.id,
        isEnabled: true,
        primaryLanguage: "EN",
        enabledLanguages: ["EN", "TANGLISH", "TA", "HI", "TE", "KN"],
        keywords: [
          "freshly baked cakes",
          "soft artisan pastries",
          "delicious custom birthday cake",
          "clean pastry counter",
          "melt in mouth desserts",
        ],
        customSentences: [
          "Loved the quality and quick service! Definitely visiting again.",
          "Semma taste and great hospitality! 5 stars all the way.",
        ],
        tone: "CASUAL",
      },
    });

    // Artisan Subscription
    await prisma.subscription.upsert({
      where: { tenantId: artisanTenant.id },
      update: {
        plan: "GROWTH",
        status: "ACTIVE",
        billingCycle: "MONTHLY",
        pricePaid: 499.0,
      },
      create: {
        tenantId: artisanTenant.id,
        plan: "GROWTH",
        status: "ACTIVE",
        billingCycle: "MONTHLY",
        pricePaid: 499.0,
      },
    });

    // Artisan Cards
    const artisanCards = [
      {
        id: "fbb18c47-1884-4db3-89a7-ff66a78cc4d9",
        shortCode: "ART-01",
        urlSlug: "artisan-counter",
        label: "Front Register Counter Stand",
        status: "ACTIVE" as const,
        overrideGate: false,
      },
      {
        id: "9837bc7e-3c46-4986-93a8-9ddb8860b5fd",
        shortCode: "ART-02",
        urlSlug: "artisan-table-patio",
        label: "Patio Table 4 NFC Puck",
        status: "ACTIVE" as const,
        overrideGate: false,
      },
      {
        id: "5462afbe-38c7-4853-b71e-4a6fcacaaac3",
        shortCode: "ART-03",
        urlSlug: "artisan-takeaway",
        label: "Takeaway Bag Insert Sticker",
        status: "ACTIVE" as const,
        overrideGate: true,
        gateTemplate: "GOOGLE_REVIEW" as const,
        googleReviewUrl: "https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4",
        smartGateEnabled: true,
      },
    ];

    for (const cardData of artisanCards) {
      await prisma.card.upsert({
        where: { urlSlug: cardData.urlSlug },
        update: {
          shortCode: cardData.shortCode,
          tenantId: artisanTenant.id,
          batchId,
          status: cardData.status,
          label: cardData.label,
          overrideGate: cardData.overrideGate,
          gateTemplate: cardData.gateTemplate || null,
          googleReviewUrl: cardData.googleReviewUrl || null,
          smartGateEnabled: cardData.smartGateEnabled ?? null,
        },
        create: {
          id: cardData.id,
          shortCode: cardData.shortCode,
          urlSlug: cardData.urlSlug,
          tenantId: artisanTenant.id,
          batchId,
          status: cardData.status,
          label: cardData.label,
          overrideGate: cardData.overrideGate,
          gateTemplate: cardData.gateTemplate || null,
          googleReviewUrl: cardData.googleReviewUrl || null,
          smartGateEnabled: cardData.smartGateEnabled ?? null,
          activatedAt: new Date(),
        },
      });
      log(`   📍 Touchpoint Card active: /tap/${cardData.urlSlug} (${cardData.shortCode})`);
    }

    // 3. Seed Demo Tenant 2: Genz Sports (slug: genz, card: tap-805-ghost)
    const genzTenantId = "cbaaaee4-bd0c-45e4-b8bd-b612e71d3747";
    const genzTenant = await prisma.tenant.upsert({
      where: { slug: "genz" },
      update: {
        name: "Genz Sports",
        googleReviewUrl: "https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4",
        smartGateEnabled: true,
        greetingTitle: "How was your experience?",
        gateTemplate: "GOOGLE_REVIEW",
        plan: "GROWTH",
        businessType: "Sports & Recreation",
        isActive: true,
        maxCards: 5,
        maxLocations: 1,
      },
      create: {
        id: genzTenantId,
        name: "Genz Sports",
        slug: "genz",
        googleReviewUrl: "https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4",
        smartGateEnabled: true,
        greetingTitle: "How was your experience?",
        gateTemplate: "GOOGLE_REVIEW",
        plan: "GROWTH",
        businessType: "Sports & Recreation",
        isActive: true,
        maxCards: 5,
        maxLocations: 1,
      },
    });
    log(`✅ Tenant verified: ${genzTenant.name} (${genzTenant.slug})`);

    // Genz Branding
    await prisma.tenantBranding.upsert({
      where: { tenantId: genzTenant.id },
      update: {
        primaryColor: "#0D9488",
        secondaryColor: "#F0FDFA",
        accentColor: "#14B8A6",
      },
      create: {
        tenantId: genzTenant.id,
        primaryColor: "#0D9488",
        secondaryColor: "#F0FDFA",
        accentColor: "#14B8A6",
      },
    });

    // Genz Review Keywords
    await prisma.tenantReviewKeyword.upsert({
      where: { tenantId: genzTenant.id },
      update: {
        isEnabled: true,
        primaryLanguage: "EN",
        enabledLanguages: ["EN", "TANGLISH", "TA", "HI", "TE", "KN"],
        keywords: [
          "quick customer service",
          "friendly staff",
          "clean modern ambience",
          "affordable prices",
        ],
        customSentences: [
          "Loved the quality and quick service! Definitely visiting again.",
          "Semma taste and great hospitality! 5 stars all the way.",
        ],
        tone: "CASUAL",
      },
      create: {
        tenantId: genzTenant.id,
        isEnabled: true,
        primaryLanguage: "EN",
        enabledLanguages: ["EN", "TANGLISH", "TA", "HI", "TE", "KN"],
        keywords: [
          "quick customer service",
          "friendly staff",
          "clean modern ambience",
          "affordable prices",
        ],
        customSentences: [
          "Loved the quality and quick service! Definitely visiting again.",
          "Semma taste and great hospitality! 5 stars all the way.",
        ],
        tone: "CASUAL",
      },
    });

    // Genz Subscription
    await prisma.subscription.upsert({
      where: { tenantId: genzTenant.id },
      update: {
        plan: "GROWTH",
        status: "ACTIVE",
        billingCycle: "LIFETIME",
        pricePaid: 999.0,
      },
      create: {
        tenantId: genzTenant.id,
        plan: "GROWTH",
        status: "ACTIVE",
        billingCycle: "LIFETIME",
        pricePaid: 999.0,
      },
    });

    // Genz Card (tap-805-ghost)
    const genzCard = await prisma.card.upsert({
      where: { urlSlug: "tap-805-ghost" },
      update: {
        shortCode: "TAP-805",
        tenantId: genzTenant.id,
        batchId,
        status: "ACTIVE",
        label: "Card TAP-805",
        overrideGate: false,
      },
      create: {
        id: "4abc2e97-ea14-44b6-a006-4ae677a54aae",
        shortCode: "TAP-805",
        urlSlug: "tap-805-ghost",
        tenantId: genzTenant.id,
        batchId,
        status: "ACTIVE",
        label: "Card TAP-805",
        overrideGate: false,
        activatedAt: new Date(),
      },
    });
    log(`   📍 Touchpoint Card active: /tap/${genzCard.urlSlug} (${genzCard.shortCode})`);

    // 4. Seed Demo Users for Login
    const demoPasswordHash = await bcrypt.hash("Admin@123456", 10);
    await prisma.user.upsert({
      where: { email: "owner@artisanbakery.com" },
      update: {
        name: "Elena Rostova",
        role: "OWNER",
        password: demoPasswordHash,
        tenantId: artisanTenant.id,
      },
      create: {
        id: "67a2bee0-baf2-4d2e-93e0-824fb10dda27",
        email: "owner@artisanbakery.com",
        name: "Elena Rostova",
        password: demoPasswordHash,
        role: "OWNER",
        tenantId: artisanTenant.id,
      },
    });

    await prisma.user.upsert({
      where: { email: "owner@genzsports.com" },
      update: {
        name: "Genz Sports Owner",
        role: "OWNER",
        password: demoPasswordHash,
        tenantId: genzTenant.id,
      },
      create: {
        id: "83f51844-2f62-48c1-b75c-f59775b0dfb0",
        email: "owner@genzsports.com",
        name: "Genz Sports Owner",
        password: demoPasswordHash,
        role: "OWNER",
        tenantId: genzTenant.id,
      },
    });
    log("✅ Demo login users verified: owner@artisanbakery.com / owner@genzsports.com (Password: Admin@123456)");

    // 5. Seed Initial Tap Events if empty so charts are lively
    const existingEvents = await prisma.tapEvent.count({
      where: { tenantId: artisanTenant.id },
    });

    if (existingEvents < 10) {
      log("📊 Populating baseline demo analytics & tap events...");
      const now = Date.now();
      const dayMs = 86400000;
      const sampleFeedbacks = [
        {
          name: "Rahul Sharma",
          phone: "+91 98765 43210",
          text: "The almond croissant was stale this morning and coffee was lukewarm. Usually love this place, hope you fix it.",
          rating: 2,
        },
        {
          name: "Priya Mehta",
          phone: "+91 98111 22334",
          text: "Service took 25 minutes for two cappuccinos on Sunday. Staff seemed overwhelmed.",
          rating: 3,
        },
        {
          name: "David Miller",
          phone: "+91 97234 56789",
          text: "Music was blasting so loudly that we couldn't hear each other speak. Asked twice to turn it down with no response.",
          rating: 1,
        },
        {
          name: "Ananya Roy",
          phone: "+91 99887 76655",
          text: "Order was mixed up: requested oat milk due to lactose intolerance but received cow's milk.",
          rating: 2,
        },
      ];

      for (let i = 0; i < 25; i++) {
        const daysAgo = Math.floor(Math.random() * 10);
        const eventTime = new Date(now - daysAgo * dayMs - Math.random() * dayMs * 0.5);
        const card = artisanCards[i % artisanCards.length];
        const isFeedback = i < sampleFeedbacks.length;

        const tap = await prisma.tapEvent.create({
          data: {
            cardId: card.id,
            tenantId: artisanTenant.id,
            deviceOs: i % 2 === 0 ? "IOS" : "ANDROID",
            country: "IN",
            outcome: isFeedback ? "FEEDBACK_CAPTURED" : "REDIRECTED",
            rating: isFeedback ? sampleFeedbacks[i].rating : 5,
            createdAt: eventTime,
          },
        });

        if (isFeedback) {
          const fb = sampleFeedbacks[i];
          await prisma.privateFeedback.create({
            data: {
              tenantId: artisanTenant.id,
              cardId: card.id,
              tapEventId: tap.id,
              rating: fb.rating,
              feedbackText: fb.text,
              phoneNumber: fb.phone,
              customerName: fb.name,
              isResolved: i % 2 === 1,
              createdAt: eventTime,
            },
          });
        }
      }
      log("✅ Populated 25 sample tap events and private feedback entries.");
    }

    log("🎉 Demo data successfully seeded! Both live demo touchpoints (/tap/artisan-counter & /tap/tap-805-ghost) are fully active.");
    return { success: true, logs };
  } catch (error) {
    log(`❌ Error seeding demo data: ${(error as Error).message}`);
    return { success: false, logs };
  } finally {
    if (shouldDisconnect && prisma) {
      await prisma.$disconnect();
    }
  }
}

// Allow direct CLI execution: npx tsx prisma/seed-demo.ts
if (require.main === module || process.argv[1]?.endsWith("seed-demo.ts")) {
  seedDemoData()
    .then((res) => {
      if (!res.success) process.exit(1);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

