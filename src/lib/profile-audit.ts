import { prisma } from "@/lib/prisma";

export interface AuditCheckItem {
  id: string;
  title: string;
  category: "PROFILE" | "CONTENT" | "ENGAGEMENT";
  status: "PASS" | "WARN" | "FAIL";
  score: number;
  maxScore: number;
  details: string;
  fixAction?: string;
}

export interface ProfileAuditResult {
  locationId: string;
  tenantId: string;
  locationTitle: string;
  overallScore: number;
  previousScore: number | null;
  scoreDelta: number | null;
  checks: AuditCheckItem[];
  fixSuggestions: Array<{ id: string; title: string; fixAction: string; priority: "HIGH" | "MEDIUM" | "LOW" }>;
  auditedAt: string;
}

/**
 * Computes completeness audit score for a Google Business Profile location.
 * Analyzes categories, description, hours, special hours, contact info,
 * services, attributes, photos, Google posts recency, and review reply rate.
 */
export async function computeProfileAuditScore(locationId: string, tenantId: string): Promise<ProfileAuditResult> {
  const location = await prisma.googleLocation.findUnique({
    where: { id: locationId },
    include: {
      mediaItems: {
        select: { id: true, createdAt: true, sourceUrl: true },
        orderBy: { createdAt: "desc" },
      },
      posts: {
        select: { id: true, publishedAt: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      },
      reviews: {
        select: { id: true, rating: true, replyComment: true, reviewCreatedAt: true },
      },
    },
  });

  if (!location) {
    throw new Error(`Location ${locationId} not found`);
  }

  const checks: AuditCheckItem[] = [];

  // 1. Primary Category (10 pts)
  const hasPrimaryCat = Boolean(location.primaryCategory && location.primaryCategory.trim());
  checks.push({
    id: "primary_category",
    title: "Primary Category",
    category: "PROFILE",
    status: hasPrimaryCat ? "PASS" : "FAIL",
    score: hasPrimaryCat ? 10 : 0,
    maxScore: 10,
    details: hasPrimaryCat ? `Set to "${location.primaryCategory}"` : "Missing primary category",
    fixAction: hasPrimaryCat ? undefined : "Set a primary category that best matches your core service.",
  });

  // 2. Secondary Categories (5 pts)
  const secCats = Array.isArray(location.secondaryCategories) ? (location.secondaryCategories as any[]) : [];
  const hasSecCats = secCats.length > 0;
  checks.push({
    id: "secondary_categories",
    title: "Secondary Categories",
    category: "PROFILE",
    status: hasSecCats ? "PASS" : "WARN",
    score: hasSecCats ? 5 : 0,
    maxScore: 5,
    details: hasSecCats ? `${secCats.length} additional category(ies) configured` : "No secondary categories added",
    fixAction: hasSecCats ? undefined : "Add 2-3 secondary categories to capture related search queries on Google Maps.",
  });

  // 3. Business Description (10 pts)
  const desc = location.description?.trim() || "";
  let descScore = 0;
  let descStatus: "PASS" | "WARN" | "FAIL" = "FAIL";
  if (desc.length >= 150) {
    descScore = 10;
    descStatus = "PASS";
  } else if (desc.length >= 40) {
    descScore = 5;
    descStatus = "WARN";
  }
  checks.push({
    id: "description",
    title: "Business Description",
    category: "PROFILE",
    status: descStatus,
    score: descScore,
    maxScore: 10,
    details: desc.length > 0 ? `${desc.length} characters written` : "No description provided",
    fixAction: descStatus === "PASS" ? undefined : "Write an informative business description (at least 150 characters) detailing your offerings, amenities, and location.",
  });

  // 4. Regular Operating Hours (10 pts)
  const regularHours: any = location.regularHoursJson;
  let hoursDaysCount = 0;
  if (regularHours && typeof regularHours === "object") {
    // Check if format is { monday: { open, close }, ... } or Google periods array
    if (regularHours.periods && Array.isArray(regularHours.periods)) {
      hoursDaysCount = regularHours.periods.length;
    } else {
      hoursDaysCount = Object.keys(regularHours).filter((k) => {
        const val = regularHours[k];
        return val && (val.isOpen || val.open || val.periods);
      }).length;
    }
  }
  let hoursScore = 0;
  let hoursStatus: "PASS" | "WARN" | "FAIL" = "FAIL";
  if (hoursDaysCount >= 6) {
    hoursScore = 10;
    hoursStatus = "PASS";
  } else if (hoursDaysCount > 0) {
    hoursScore = 5;
    hoursStatus = "WARN";
  }
  checks.push({
    id: "regular_hours",
    title: "Regular Operating Hours",
    category: "PROFILE",
    status: hoursStatus,
    score: hoursScore,
    maxScore: 10,
    details: hoursDaysCount > 0 ? `${hoursDaysCount} active days scheduled` : "No regular hours specified",
    fixAction: hoursStatus === "PASS" ? undefined : "Set operating hours for each day of the week so visitors know when you are open.",
  });

  // 5. Special / Holiday Hours (5 pts)
  const specialHours: any = location.specialHoursJson;
  const hasSpecialHours = Boolean(
    specialHours &&
    ((Array.isArray(specialHours) && specialHours.length > 0) ||
      (Array.isArray(specialHours.specialHourPeriods) && specialHours.specialHourPeriods.length > 0))
  );
  checks.push({
    id: "special_hours",
    title: "Special & Festival Hours",
    category: "PROFILE",
    status: hasSpecialHours ? "PASS" : "WARN",
    score: hasSpecialHours ? 5 : 0,
    maxScore: 5,
    details: hasSpecialHours ? "Festival/holiday schedules configured" : "No holiday hours specified",
    fixAction: hasSpecialHours ? undefined : "Add special festival and public holiday hours in the Profile Editor to inform customers during holidays.",
  });

  // 6. Primary Phone (8 pts)
  const hasPhone = Boolean(location.primaryPhone && location.primaryPhone.trim());
  checks.push({
    id: "phone",
    title: "Primary Phone Number",
    category: "PROFILE",
    status: hasPhone ? "PASS" : "FAIL",
    score: hasPhone ? 8 : 0,
    maxScore: 8,
    details: hasPhone ? location.primaryPhone! : "Missing contact phone",
    fixAction: hasPhone ? undefined : "Add a customer service or business phone number for incoming calls and inquiries.",
  });

  // 7. Website / Landing URL (8 pts)
  const hasWebsite = Boolean(location.websiteUri && location.websiteUri.trim());
  checks.push({
    id: "website",
    title: "Website / Booking URL",
    category: "PROFILE",
    status: hasWebsite ? "PASS" : "FAIL",
    score: hasWebsite ? 8 : 0,
    maxScore: 8,
    details: hasWebsite ? location.websiteUri! : "No website link attached",
    fixAction: hasWebsite ? undefined : "Add your official website URL or online booking link to drive Google traffic directly to your venue.",
  });

  // 8. Services Listed (5 pts)
  const serviceItems = Array.isArray(location.serviceItemsJson) ? (location.serviceItemsJson as any[]) : [];
  const hasServices = serviceItems.length > 0;
  checks.push({
    id: "services",
    title: "Services Catalog",
    category: "PROFILE",
    status: hasServices ? "PASS" : "WARN",
    score: hasServices ? 5 : 0,
    maxScore: 5,
    details: hasServices ? `${serviceItems.length} service item(s) listed` : "No individual services cataloged",
    fixAction: hasServices ? undefined : "List specific services offered (e.g., Turf rental, Coaching sessions, Tournament hosting) in your profile.",
  });

  // 9. Attributes (5 pts)
  const attributes: any = location.attributesJson;
  const hasAttrs = Boolean(
    attributes &&
    ((Array.isArray(attributes) && attributes.length > 0) ||
      (typeof attributes === "object" && Object.keys(attributes).length > 0))
  );
  checks.push({
    id: "attributes",
    title: "Amenities & Attributes",
    category: "PROFILE",
    status: hasAttrs ? "PASS" : "WARN",
    score: hasAttrs ? 5 : 0,
    maxScore: 5,
    details: hasAttrs ? "Business attributes active" : "No amenities/attributes checked",
    fixAction: hasAttrs ? undefined : "Add business attributes (e.g. Free parking, Restrooms, Air conditioning, Card payments accepted).",
  });

  // 10. Photo Count (12 pts)
  const photoCount = location.mediaItems.length;
  let photoScore = 0;
  let photoStatus: "PASS" | "WARN" | "FAIL" = "FAIL";
  if (photoCount >= 10) {
    photoScore = 12;
    photoStatus = "PASS";
  } else if (photoCount >= 5) {
    photoScore = 8;
    photoStatus = "PASS";
  } else if (photoCount >= 1) {
    photoScore = 4;
    photoStatus = "WARN";
  }
  checks.push({
    id: "photo_count",
    title: "Photos Count",
    category: "CONTENT",
    status: photoStatus,
    score: photoScore,
    maxScore: 12,
    details: `${photoCount} photo(s) on Google listing`,
    fixAction: photoCount >= 5 ? undefined : "Upload at least 5 to 10 photos of your storefront, facilities, staff, and events.",
  });

  // 11. Photo Recency (7 pts)
  const now = new Date();
  const latestPhoto = location.mediaItems[0];
  let photoRecencyScore = 0;
  let photoRecencyStatus: "PASS" | "WARN" | "FAIL" = "FAIL";
  let photoDaysAgo: number | null = null;
  if (latestPhoto) {
    photoDaysAgo = Math.floor((now.getTime() - new Date(latestPhoto.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    if (photoDaysAgo <= 30) {
      photoRecencyScore = 7;
      photoRecencyStatus = "PASS";
    } else if (photoDaysAgo <= 90) {
      photoRecencyScore = 4;
      photoRecencyStatus = "WARN";
    }
  }
  checks.push({
    id: "photo_recency",
    title: "Photo Freshness",
    category: "CONTENT",
    status: photoRecencyStatus,
    score: photoRecencyScore,
    maxScore: 7,
    details: photoDaysAgo !== null ? `Most recent photo was uploaded ${photoDaysAgo} days ago` : "No photos uploaded yet",
    fixAction: photoRecencyStatus === "PASS" ? undefined : "Upload new photos every 30 days to signal to Google algorithms that your business is active.",
  });

  // 12. Google Post Recency (8 pts)
  const latestPost = location.posts[0];
  let postScore = 0;
  let postStatus: "PASS" | "WARN" | "FAIL" = "FAIL";
  let postDaysAgo: number | null = null;
  if (latestPost) {
    const postDate = latestPost.publishedAt || latestPost.createdAt;
    postDaysAgo = Math.floor((now.getTime() - new Date(postDate).getTime()) / (1000 * 60 * 60 * 24));
    if (postDaysAgo <= 7) {
      postScore = 8;
      postStatus = "PASS";
    } else if (postDaysAgo <= 30) {
      postScore = 5;
      postStatus = "WARN";
    } else if (postDaysAgo <= 90) {
      postScore = 2;
      postStatus = "WARN";
    }
  }
  checks.push({
    id: "post_recency",
    title: "Google Post Recency",
    category: "CONTENT",
    status: postStatus,
    score: postScore,
    maxScore: 8,
    details: postDaysAgo !== null ? `Latest Google Post published ${postDaysAgo} days ago` : "No Google posts created yet",
    fixAction: postStatus === "PASS" ? undefined : "Publish weekly Google Updates or Offers in Google Command Center to improve Maps visibility.",
  });

  // 13. Review Reply Rate (7 pts)
  const totalReviews = location.reviews.length;
  const repliedReviews = location.reviews.filter((r) => r.replyComment && r.replyComment.trim()).length;
  const replyRate = totalReviews > 0 ? Math.round((repliedReviews / totalReviews) * 100) : 100;
  let replyScore = 0;
  let replyStatus: "PASS" | "WARN" | "FAIL" = "FAIL";
  if (totalReviews === 0 || replyRate >= 80) {
    replyScore = 7;
    replyStatus = "PASS";
  } else if (replyRate >= 50) {
    replyScore = 4;
    replyStatus = "WARN";
  }
  checks.push({
    id: "review_reply_rate",
    title: "Review Reply Rate",
    category: "ENGAGEMENT",
    status: replyStatus,
    score: replyScore,
    maxScore: 7,
    details: totalReviews > 0 ? `${replyRate}% replied (${repliedReviews} of ${totalReviews} reviews)` : "No customer reviews yet",
    fixAction: replyStatus === "PASS" ? undefined : `Reply to unanswered reviews in your Reviews Inbox (aim for at least 80% response rate).`,
  });

  // Overall Score Sum
  const overallScore = checks.reduce((sum, c) => sum + c.score, 0);

  // Compile Fix Suggestions sorted by priority
  const fixSuggestions = checks
    .filter((c) => c.status !== "PASS" && c.fixAction)
    .map((c) => ({
      id: c.id,
      title: c.title,
      fixAction: c.fixAction!,
      priority: (c.status === "FAIL" ? "HIGH" : "MEDIUM") as "HIGH" | "MEDIUM" | "LOW",
    }))
    .sort((a, b) => (a.priority === "HIGH" ? -1 : 1));

  // Retrieve previous score to compute delta
  const previousRecord = await prisma.profileAuditScore.findFirst({
    where: { locationId },
    orderBy: { auditedAt: "desc" },
  });

  const previousScore = previousRecord ? previousRecord.overallScore : null;
  const scoreDelta = previousScore !== null ? overallScore - previousScore : null;

  // Persist this audit run
  await prisma.profileAuditScore.create({
    data: {
      locationId,
      tenantId,
      overallScore,
      checksJson: checks as any,
      fixSuggestions: fixSuggestions as any,
      previousScore,
      scoreDelta,
      auditedAt: new Date(),
    },
  });

  return {
    locationId,
    tenantId,
    locationTitle: location.title,
    overallScore,
    previousScore,
    scoreDelta,
    checks,
    fixSuggestions,
    auditedAt: new Date().toISOString(),
  };
}

/**
 * Retrieves the latest audit score record and history for a location.
 */
export async function getLatestProfileAuditScore(locationId: string) {
  const latest = await prisma.profileAuditScore.findFirst({
    where: { locationId },
    orderBy: { auditedAt: "desc" },
  });

  const history = await prisma.profileAuditScore.findMany({
    where: { locationId },
    orderBy: { auditedAt: "desc" },
    take: 5,
    select: {
      id: true,
      overallScore: true,
      scoreDelta: true,
      auditedAt: true,
    },
  });

  return { latest, history };
}
