import { requireTenantUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import ReviewInboxClient from "./ReviewInboxClient";

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const { tenantId } = await requireTenantUser();

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      googleConnection: {
        include: {
          locations: {
            include: {
              reviews: {
                orderBy: { reviewCreatedAt: "desc" },
              },
            },
          },
        },
      },
      geminiConfig: true,
    },
  });

  if (!tenant) return null;

  // Gather all reviews across tenant's locations
  const allReviews =
    tenant.googleConnection?.locations?.flatMap((loc) =>
      loc.reviews.map((r) => ({
        id: r.id,
        googleReviewId: r.googleReviewId,
        reviewerName: r.reviewerName,
        reviewerPhotoUrl: r.reviewerPhotoUrl,
        isAnonymous: r.isAnonymous,
        rating: r.rating,
        comment: r.comment,
        replyComment: r.replyComment,
        replyUpdatedAt: r.replyUpdatedAt?.toISOString() || null,
        geminiDraftReply: r.geminiDraftReply,
        reviewCreatedAt: r.reviewCreatedAt.toISOString(),
        locationTitle: loc.title,
      }))
    ) || [];

  // Sort by reviewCreatedAt descending
  allReviews.sort(
    (a, b) =>
      new Date(b.reviewCreatedAt).getTime() -
      new Date(a.reviewCreatedAt).getTime()
  );

  return (
    <ReviewInboxClient
      tenant={{
        id: tenant.id,
        name: tenant.name,
        googleReviewUrl: tenant.googleReviewUrl,
        isConnected: Boolean(
          tenant.googleConnection?.isVerified ||
            tenant.googleConnection?.connectedEmail
        ),
        brandTone: tenant.geminiConfig?.brandTone || "SOFT",
        replyLength: tenant.geminiConfig?.replyLength || "2_SENTENCES",
      }}
      initialReviews={allReviews}
    />
  );
}

