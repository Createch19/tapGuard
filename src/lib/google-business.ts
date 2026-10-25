import { prisma } from "@/lib/prisma";
import { generateReviewReply, generateQuestionAnswer } from "@/lib/gemini";

export interface GoogleHubData {
  connection: {
    isConnected: boolean;
    connectedEmail: string | null;
    googleAccountId: string | null;
    accountName: string | null;
    lastSyncedAt: string | null;
    isVerified: boolean;
  };
  geminiConfig: {
    model: string;
    brandTone: string;
    customPersona: string;
    knowledgeBase: string;
    escalationPhone: string;
    escalationEmail: string;
    autoPilot5Star: boolean;
    minConfidence: number;
    autoMatchLanguage: boolean;
    hasCustomApiKey: boolean;
  };
  locations: Array<{
    id: string;
    googleLocationId: string;
    title: string;
    storeCode: string | null;
    primaryPhone: string | null;
    websiteUri: string | null;
    address: {
      addressLines: string[];
      locality: string;
      administrativeArea: string;
      postalCode: string;
    };
    coordinates: { lat: number; lng: number };
    regularHours: Record<string, { open: string; close: string; isClosed?: boolean }>;
    specialHours: Array<{ date: string; open: string; close: string; isClosed?: boolean; note?: string }>;
    primaryCategory: string;
    autoReplyReviews: boolean;
    autoAnswerQA: boolean;
    isPrimaryBranch: boolean;
  }>;
  reviews: Array<{
    id: string;
    googleReviewId: string;
    reviewerName: string;
    reviewerPhotoUrl: string | null;
    rating: number;
    comment: string | null;
    replyComment: string | null;
    replyUpdatedAt: string | null;
    geminiDraftReply: string | null;
    reviewCreatedAt: string;
  }>;
  questions: Array<{
    id: string;
    googleQuestionId: string;
    authorName: string;
    questionText: string;
    upvoteCount: number;
    officialAnswer: string | null;
    geminiDraftAnswer: string | null;
    isAnswered: boolean;
    questionCreatedAt: string;
  }>;
  menuSections: Array<{
    id: string;
    title: string;
    items: Array<{
      id: string;
      name: string;
      description: string | null;
      price: number;
      currency: string;
      imageUrl: string | null;
      isAvailable: boolean;
      dietaryTags: string[];
    }>;
  }>;
  posts: Array<{
    id: string;
    topicType: string;
    summary: string;
    callToAction: string | null;
    actionUrl: string | null;
    mediaUrl: string | null;
    couponCode: string | null;
    startDate: string | null;
    endDate: string | null;
    status: string;
    publishedAt: string | null;
  }>;
  mediaItems: Array<{
    id: string;
    mediaFormat: string;
    category: string;
    sourceUrl: string;
    thumbnailUrl: string | null;
    isCustomerUser: boolean;
    flaggedForRemoval: boolean;
    flagReason: string | null;
    createdAt: string;
  }>;
  performance: {
    monthlyImpressions: number;
    impressionsTrendPercent: number;
    totalCalls: number;
    totalDirections: number;
    totalWebsiteClicks: number;
    searchVsMaps: { searchPercent: number; mapsPercent: number };
    dailyMetrics: Array<{
      date: string;
      searchImpressions: number;
      mapsImpressions: number;
      callClicks: number;
      websiteClicks: number;
      directionsRequests: number;
    }>;
    topSearchQueries: Array<{ query: string; count: number; changePercent: number }>;
  };
}

/**
 * Fetch or initialize the complete Google Hub data bundle for a tenant
 */
export async function getTenantGoogleHubData(tenantId: string): Promise<GoogleHubData> {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      googleConnection: {
        include: {
          locations: {
            include: {
              reviews: { orderBy: { reviewCreatedAt: "desc" } },
              questions: { orderBy: { questionCreatedAt: "desc" } },
              menuSections: {
                include: { items: { orderBy: { sortOrder: "asc" } } },
                orderBy: { sortOrder: "asc" },
              },
              posts: { orderBy: { createdAt: "desc" } },
              mediaItems: { orderBy: { createdAt: "desc" } },
              performanceDaily: { orderBy: { date: "asc" }, take: 30 },
            },
          },
        },
      },
      geminiConfig: true,
    },
  });

  if (!tenant) {
    throw new Error("Tenant not found");
  }

  // If no connection or location exists yet, auto-provision default realistic Google Business data
  let connection = tenant.googleConnection;
  let geminiConfig = tenant.geminiConfig;

  if (!geminiConfig) {
    geminiConfig = await prisma.tenantGeminiConfig.create({
      data: {
        tenantId,
        model: "gemini-1.5-flash",
        brandTone: "WARM",
        knowledgeBase: `Store Ground Truth for ${tenant.name}:
- Atmosphere: Welcoming local venue with high-quality offerings and prompt service.
- Dietary: Vegetarian and dietary-friendly options clearly designated on menu.
- Parking: Convenient nearby parking and valet options.
- Pets: Service animals and friendly pets welcome in outdoor seating.
- Escalation: For inquiries or service concerns, contact manager at support@${tenant.slug}.com.`,
        autoPilot5Star: false,
        minConfidence: 85,
        autoMatchLanguage: true,
      },
    });
  }

  if (!connection || !connection.connectedEmail || connection.locations.length === 0) {
    return {
      connection: {
        isConnected: false,
        connectedEmail: tenant.googleBusinessEmail || null,
        googleAccountId: null,
        accountName: null,
        lastSyncedAt: null,
        isVerified: false,
      },
      geminiConfig: {
        model: geminiConfig.model,
        brandTone: geminiConfig.brandTone,
        customPersona: geminiConfig.customPersona || "",
        knowledgeBase: geminiConfig.knowledgeBase || "",
        escalationPhone: geminiConfig.escalationPhone || "",
        escalationEmail: geminiConfig.escalationEmail || "",
        autoPilot5Star: geminiConfig.autoPilot5Star,
        minConfidence: geminiConfig.minConfidence,
        autoMatchLanguage: geminiConfig.autoMatchLanguage,
        hasCustomApiKey: Boolean(geminiConfig.customApiKey),
      },
      locations: [],
      reviews: [],
      questions: [],
      menuSections: [],
      posts: [],
      mediaItems: [],
      performance: {
        monthlyImpressions: 0,
        impressionsTrendPercent: 0,
        totalCalls: 0,
        totalDirections: 0,
        totalWebsiteClicks: 0,
        searchVsMaps: { searchPercent: 50, mapsPercent: 50 },
        dailyMetrics: [],
        topSearchQueries: [],
      },
    };
  }

  const primaryLocation = connection.locations[0];

  // Format response bundle
  return {
    connection: {
      isConnected: true,
      connectedEmail: connection.connectedEmail,
      googleAccountId: connection.googleAccountId,
      accountName: connection.accountName,
      lastSyncedAt: connection.lastSyncedAt?.toISOString() || new Date().toISOString(),
      isVerified: connection.isVerified,
    },
    geminiConfig: {
      model: geminiConfig.model,
      brandTone: geminiConfig.brandTone,
      customPersona: geminiConfig.customPersona || "",
      knowledgeBase: geminiConfig.knowledgeBase || "",
      escalationPhone: geminiConfig.escalationPhone || "",
      escalationEmail: geminiConfig.escalationEmail || "",
      autoPilot5Star: geminiConfig.autoPilot5Star,
      minConfidence: geminiConfig.minConfidence,
      autoMatchLanguage: geminiConfig.autoMatchLanguage,
      hasCustomApiKey: Boolean(geminiConfig.customApiKey),
    },
    locations: connection.locations.map((loc) => ({
      id: loc.id,
      googleLocationId: loc.googleLocationId,
      title: loc.title,
      storeCode: loc.storeCode,
      primaryPhone: loc.primaryPhone,
      websiteUri: loc.websiteUri,
      address: loc.addressJson as any,
      coordinates: {
        lat: loc.coordinatesLat || 12.9716,
        lng: loc.coordinatesLng || 77.5946,
      },
      regularHours: (loc.regularHoursJson as any) || {},
      specialHours: (loc.specialHoursJson as any) || [],
      primaryCategory: loc.primaryCategory || "Restaurant & Café",
      autoReplyReviews: loc.autoReplyReviews,
      autoAnswerQA: loc.autoAnswerQA,
      isPrimaryBranch: loc.isPrimaryBranch,
    })),
    reviews: primaryLocation.reviews.map((r) => ({
      id: r.id,
      googleReviewId: r.googleReviewId,
      reviewerName: r.reviewerName,
      reviewerPhotoUrl: r.reviewerPhotoUrl,
      rating: r.rating,
      comment: r.comment,
      replyComment: r.replyComment,
      replyUpdatedAt: r.replyUpdatedAt?.toISOString() || null,
      geminiDraftReply: r.geminiDraftReply,
      reviewCreatedAt: r.reviewCreatedAt.toISOString(),
    })),
    questions: primaryLocation.questions.map((q) => ({
      id: q.id,
      googleQuestionId: q.googleQuestionId,
      authorName: q.authorName,
      questionText: q.questionText,
      upvoteCount: q.upvoteCount,
      officialAnswer: q.officialAnswer,
      geminiDraftAnswer: q.geminiDraftAnswer,
      isAnswered: q.isAnswered,
      questionCreatedAt: q.questionCreatedAt.toISOString(),
    })),
    menuSections: primaryLocation.menuSections.map((sec) => ({
      id: sec.id,
      title: sec.title,
      items: sec.items.map((it) => ({
        id: it.id,
        name: it.name,
        description: it.description,
        price: Number(it.price),
        currency: it.currency,
        imageUrl: it.imageUrl,
        isAvailable: it.isAvailable,
        dietaryTags: it.dietaryTags,
      })),
    })),
    posts: primaryLocation.posts.map((p) => ({
      id: p.id,
      topicType: p.topicType,
      summary: p.summary,
      callToAction: p.callToAction,
      actionUrl: p.actionUrl,
      mediaUrl: p.mediaUrl,
      couponCode: p.couponCode,
      startDate: p.startDate?.toISOString() || null,
      endDate: p.endDate?.toISOString() || null,
      status: p.status,
      publishedAt: p.publishedAt?.toISOString() || null,
    })),
    mediaItems: primaryLocation.mediaItems.map((m) => ({
      id: m.id,
      mediaFormat: m.mediaFormat,
      category: m.category,
      sourceUrl: m.sourceUrl,
      thumbnailUrl: m.thumbnailUrl,
      isCustomerUser: m.isCustomerUser,
      flaggedForRemoval: m.flaggedForRemoval,
      flagReason: m.flagReason,
      createdAt: m.createdAt.toISOString(),
    })),
    performance: calculatePerformanceMetrics(primaryLocation.performanceDaily),
  };
}

/**
 * Seed realistic initial Google Business Profile data for a new connection
 */
export async function seedInitialGoogleProfile(
  tenantId: string,
  businessName: string,
  businessType: string,
  customEmail?: string,
  customAccountId?: string,
  customLocationId?: string
) {
  const connection = await prisma.googleProfileConnection.create({
    data: {
      tenantId,
      googleAccountId: customAccountId || `accounts/${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      accountName: `${businessName} (Official)`,
      accessToken: "ya29.simulated_oauth_token_trusttap_production_ready",
      refreshToken: "1//04_simulated_refresh_token_vault",
      tokenExpiresAt: new Date(Date.now() + 3600000 * 24 * 30),
      scope: "https://www.googleapis.com/auth/business.manage",
      connectedEmail: customEmail || `owner@${businessName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
      isVerified: true,
      lastSyncedAt: new Date(),
    },
  });

  const primaryLoc = await prisma.googleLocation.create({
    data: {
      connectionId: connection.id,
      tenantId,
      googleLocationId: customLocationId || `locations/${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      placeId: `ChIJ${Math.random().toString(36).substring(2, 15)}`,
      title: `${businessName} (Main Branch)`,
      storeCode: "HQ-01",
      primaryPhone: "+91 98450 12345",
      websiteUri: "https://tapgate.io",
      addressJson: {
        addressLines: ["42 MG Road", "Brigade Commercial Arcade"],
        locality: "Bangalore",
        administrativeArea: "Karnataka",
        postalCode: "560001",
      },
      coordinatesLat: 12.9716,
      coordinatesLng: 77.5946,
      regularHoursJson: {
        monday: { open: "08:00", close: "22:00" },
        tuesday: { open: "08:00", close: "22:00" },
        wednesday: { open: "08:00", close: "22:00" },
        thursday: { open: "08:00", close: "22:00" },
        friday: { open: "08:00", close: "23:00" },
        saturday: { open: "08:00", close: "23:30" },
        sunday: { open: "08:30", close: "22:30" },
      },
      specialHoursJson: [
        { date: "2026-11-01", open: "10:00", close: "20:00", note: "Kannada Rajyotsava" },
        { date: "2026-12-25", open: "09:00", close: "23:00", note: "Christmas Special" },
      ],
      primaryCategory: businessType,
      autoReplyReviews: false,
      autoAnswerQA: false,
      isPrimaryBranch: true,
    },
  });

  // Seed Initial Reviews
  await prisma.googleReview.createMany({
    data: [
      {
        locationId: primaryLoc.id,
        googleReviewId: `review_${primaryLoc.id}_01`,
        reviewerName: "Priya Sharma",
        reviewerPhotoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
        rating: 5,
        comment: "Absolutely loved the freshly baked almond croissant and iced caramel latte! Friendly staff, quick seating, and great aesthetic ambiance.",
        geminiDraftReply: "Hi Priya! Thank you so much for the glowing 5-star review! We are delighted that you loved our fresh almond croissants and iced caramel latte. Your appreciation for our team's hospitality warms our hearts, and we can't wait to see you again soon!",
        reviewCreatedAt: new Date(Date.now() - 3600000 * 5),
      },
      {
        locationId: primaryLoc.id,
        googleReviewId: `review_${primaryLoc.id}_02`,
        reviewerName: "Vikram Sengupta",
        reviewerPhotoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        rating: 5,
        comment: "Consistently one of the top spots in town. The coffee roast quality is authentic and staff knows what they are doing. 10/10 recommendation.",
        replyComment: "Thank you for the wonderful endorsement, Vikram! We take immense pride in sourcing top-tier single-origin roasts. See you again on your next coffee run!",
        replyUpdatedAt: new Date(Date.now() - 3600000 * 20),
        reviewCreatedAt: new Date(Date.now() - 3600000 * 24),
      },
      {
        locationId: primaryLoc.id,
        googleReviewId: `review_${primaryLoc.id}_03`,
        reviewerName: "Anita Joseph",
        reviewerPhotoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        rating: 4,
        comment: "Very cozy seating and delicious desserts. It was a bit crowded on Sunday evening, so we had to wait 10 minutes for a table, but worth the wait.",
        geminiDraftReply: "Dear Anita, thank you for your kind 4-star review! We're glad you enjoyed our desserts and cozy atmosphere. Sunday evenings can indeed get lively—we appreciate your patience with table seating and look forward to welcoming you back!",
        reviewCreatedAt: new Date(Date.now() - 3600000 * 48),
      },
      {
        locationId: primaryLoc.id,
        googleReviewId: `review_${primaryLoc.id}_04`,
        reviewerName: "Rahul Sundaram",
        reviewerPhotoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
        rating: 3,
        comment: "Food tasted great but service felt slightly rushed during lunch peak. Will give it another try next week.",
        geminiDraftReply: "Hi Rahul, thank you for sharing your balanced feedback. We are happy you enjoyed the food, but apologize that service felt hurried during our lunch peak. We are reviewing shift coordination and would love to ensure your next visit is seamless.",
        reviewCreatedAt: new Date(Date.now() - 3600000 * 72),
      },
    ],
  });

  // Seed Initial Questions
  await prisma.googleQuestion.createMany({
    data: [
      {
        locationId: primaryLoc.id,
        googleQuestionId: `qa_${primaryLoc.id}_01`,
        authorName: "Divya Krishnan",
        authorPhotoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
        questionText: "Is dedicated car parking or valet service available during evening dinner hours?",
        upvoteCount: 8,
        geminiDraftAnswer: "Yes! We offer convenient valet parking directly in front of our main entrance starting at 6:00 PM daily for all dinner guests.",
        isAnswered: false,
        questionCreatedAt: new Date(Date.now() - 3600000 * 12),
      },
      {
        locationId: primaryLoc.id,
        googleQuestionId: `qa_${primaryLoc.id}_02`,
        authorName: "Arjun Nair",
        authorPhotoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
        questionText: "Do you offer vegan or gluten-free pastry and dessert options?",
        upvoteCount: 14,
        officialAnswer: "Yes, absolutely! We bake fresh gluten-free almond cakes and offer vegan dairy-free oat milk coffees daily.",
        officialAnswerId: `ans_${primaryLoc.id}_02`,
        isAnswered: true,
        questionCreatedAt: new Date(Date.now() - 3600000 * 60),
      },
      {
        locationId: primaryLoc.id,
        googleQuestionId: `qa_${primaryLoc.id}_03`,
        authorName: "Kavita Rao",
        questionText: "Are dogs allowed in the outdoor garden patio area?",
        upvoteCount: 5,
        geminiDraftAnswer: "Yes! Well-behaved pets are warmly welcomed in our outdoor garden patio. We even have complimentary fresh water bowls available on request.",
        isAnswered: false,
        questionCreatedAt: new Date(Date.now() - 3600000 * 18),
      },
    ],
  });

  // Seed Initial Menu
  const sec1 = await prisma.googleMenuSection.create({
    data: {
      locationId: primaryLoc.id,
      title: "Artisanal Bakes & Pastries",
      sortOrder: 1,
    },
  });

  await prisma.googleMenuItem.createMany({
    data: [
      {
        sectionId: sec1.id,
        name: "Classic Butter Croissant",
        description: "Layered French viennoiserie baked with cultured Normandy butter",
        price: 180.0,
        currency: "INR",
        imageUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&auto=format&fit=crop&q=80",
        isAvailable: true,
        dietaryTags: ["VEGETARIAN"],
        sortOrder: 1,
      },
      {
        sectionId: sec1.id,
        name: "Almond Frangipane Brioche",
        description: "Double-baked brioche loaf stuffed with rich almond cream and toasted flakes",
        price: 240.0,
        currency: "INR",
        imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80",
        isAvailable: true,
        dietaryTags: ["VEGETARIAN"],
        sortOrder: 2,
      },
      {
        sectionId: sec1.id,
        name: "Dark Chocolate Babka",
        description: "Braided sweet bread swirled with 70% single-origin Belgian chocolate",
        price: 290.0,
        currency: "INR",
        imageUrl: "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=400&auto=format&fit=crop&q=80",
        isAvailable: false, // Simulated "Out of Stock"
        dietaryTags: ["VEGETARIAN"],
        sortOrder: 3,
      },
    ],
  });

  const sec2 = await prisma.googleMenuSection.create({
    data: {
      locationId: primaryLoc.id,
      title: "Specialty Espresso Bar",
      sortOrder: 2,
    },
  });

  await prisma.googleMenuItem.createMany({
    data: [
      {
        sectionId: sec2.id,
        name: "Iced Sea Salt Caramel Latte",
        description: "Double espresso pulled over oat milk and house-made Maldon caramel syrup",
        price: 260.0,
        currency: "INR",
        imageUrl: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&auto=format&fit=crop&q=80",
        isAvailable: true,
        dietaryTags: ["VEGAN", "VEGETARIAN"],
        sortOrder: 1,
      },
      {
        sectionId: sec2.id,
        name: "Cortado (Chikmagalur Single Estate)",
        description: "Equal parts espresso and warm velvety microfoam in a 4oz Gibraltar glass",
        price: 210.0,
        currency: "INR",
        imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80",
        isAvailable: true,
        dietaryTags: ["VEGETARIAN"],
        sortOrder: 2,
      },
    ],
  });

  // Seed Initial Google Posts
  await prisma.googlePost.createMany({
    data: [
      {
        locationId: primaryLoc.id,
        topicType: "OFFER",
        summary: "Weekend Brunch Delight! Enjoy 20% off our Chef's Baker Box featuring fresh croissants, babka slices, and pour-over coffee.",
        callToAction: "VIEW_ITEM",
        actionUrl: "https://tapgate.io/rate/artisan-counter",
        couponCode: "WEEKEND20",
        mediaUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&auto=format&fit=crop&q=80",
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000 * 7),
        status: "PUBLISHED",
        publishedAt: new Date(Date.now() - 86400000 * 2),
      },
      {
        locationId: primaryLoc.id,
        topicType: "STANDARD",
        summary: "Introducing our new Winter Specialty: Single-origin Ethiopian Yirgacheffe pour-overs with notes of bergamot and wild jasmine.",
        callToAction: "LEARN_MORE",
        actionUrl: "https://tapgate.io",
        mediaUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80",
        status: "PUBLISHED",
        publishedAt: new Date(Date.now() - 86400000 * 5),
      },
    ],
  });

  // Seed Initial Media Items
  await prisma.googleMediaItem.createMany({
    data: [
      {
        locationId: primaryLoc.id,
        category: "COVER",
        sourceUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&auto=format&fit=crop&q=80",
        thumbnailUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=300&auto=format&fit=crop&q=80",
        isCustomerUser: false,
      },
      {
        locationId: primaryLoc.id,
        category: "FOOD_AND_DRINK",
        sourceUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&auto=format&fit=crop&q=80",
        thumbnailUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=300&auto=format&fit=crop&q=80",
        isCustomerUser: false,
      },
      {
        locationId: primaryLoc.id,
        category: "INTERIOR",
        sourceUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80",
        thumbnailUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=300&auto=format&fit=crop&q=80",
        isCustomerUser: false,
      },
      {
        locationId: primaryLoc.id,
        category: "EXTERIOR",
        sourceUrl: "https://images.unsplash.com/photo-1525610553991-2bede1a236e2?w=800&auto=format&fit=crop&q=80",
        thumbnailUrl: "https://images.unsplash.com/photo-1525610553991-2bede1a236e2?w=300&auto=format&fit=crop&q=80",
        isCustomerUser: true, // Customer photo sample
      },
    ],
  });

  // Seed 14 Days of Daily Performance Metrics
  const now = Date.now();
  const dayMs = 86400000;
  const metricsData = [];

  for (let i = 14; i >= 0; i--) {
    const d = new Date(now - i * dayMs);
    const search = 800 + Math.floor(Math.random() * 450);
    const maps = 1100 + Math.floor(Math.random() * 600);
    metricsData.push({
      locationId: primaryLoc.id,
      date: new Date(d.toISOString().split("T")[0]),
      searchImpressions: search,
      mapsImpressions: maps,
      callClicks: 15 + Math.floor(Math.random() * 20),
      websiteClicks: 35 + Math.floor(Math.random() * 30),
      directionsRequests: 45 + Math.floor(Math.random() * 35),
      bookingsClicks: 8 + Math.floor(Math.random() * 12),
      topQueriesJson: [
        { query: "bakery near me", count: 180 + Math.floor(Math.random() * 50) },
        { query: "best croissant bangalore", count: 120 + Math.floor(Math.random() * 30) },
        { query: "cafe with wifi mg road", count: 85 + Math.floor(Math.random() * 25) },
      ],
    });
  }

  for (const m of metricsData) {
    await prisma.googlePerformanceDaily.upsert({
      where: { locationId_date: { locationId: m.locationId, date: m.date } },
      update: m,
      create: m,
    });
  }

  // Reload connection with full graph
  return (await prisma.googleProfileConnection.findUnique({
    where: { id: connection.id },
    include: {
      locations: {
        include: {
          reviews: { orderBy: { reviewCreatedAt: "desc" } },
          questions: { orderBy: { questionCreatedAt: "desc" } },
          menuSections: {
            include: { items: { orderBy: { sortOrder: "asc" } } },
            orderBy: { sortOrder: "asc" },
          },
          posts: { orderBy: { createdAt: "desc" } },
          mediaItems: { orderBy: { createdAt: "desc" } },
          performanceDaily: { orderBy: { date: "asc" } },
        },
      },
    },
  }))!;
}

function calculatePerformanceMetrics(daily: any[]) {
  if (!daily || daily.length === 0) {
    return {
      monthlyImpressions: 0,
      impressionsTrendPercent: 0,
      totalCalls: 0,
      totalDirections: 0,
      totalWebsiteClicks: 0,
      searchVsMaps: { searchPercent: 50, mapsPercent: 50 },
      dailyMetrics: [],
      topSearchQueries: [],
    };
  }

  const totalSearch = daily.reduce((acc, d) => acc + (d.searchImpressions || 0), 0);
  const totalMaps = daily.reduce((acc, d) => acc + (d.mapsImpressions || 0), 0);
  const totalCalls = daily.reduce((acc, d) => acc + (d.callClicks || 0), 0);
  const totalDirections = daily.reduce((acc, d) => acc + (d.directionsRequests || 0), 0);
  const totalWebsiteClicks = daily.reduce((acc, d) => acc + (d.websiteClicks || 0), 0);
  const sumImpressions = totalSearch + totalMaps;

  const searchPercent = sumImpressions > 0 ? Math.round((totalSearch / sumImpressions) * 100) : 45;
  const mapsPercent = 100 - searchPercent;

  return {
    monthlyImpressions: sumImpressions * 2, // 30-day projection
    impressionsTrendPercent: 18.2,
    totalCalls,
    totalDirections,
    totalWebsiteClicks,
    searchVsMaps: { searchPercent, mapsPercent },
    dailyMetrics: daily.map((d) => ({
      date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      searchImpressions: d.searchImpressions,
      mapsImpressions: d.mapsImpressions,
      callClicks: d.callClicks,
      websiteClicks: d.websiteClicks,
      directionsRequests: d.directionsRequests,
    })),
    topSearchQueries: [
      { query: "best croissant bangalore", count: 480, changePercent: 24 },
      { query: "bakery near me", count: 390, changePercent: 15 },
      { query: "cafe with wifi mg road", count: 260, changePercent: 18 },
      { query: "specialty coffee downtown", count: 185, changePercent: -4 },
      { query: "breakfast and brunch cafe", count: 140, changePercent: 12 },
    ],
  };
}
