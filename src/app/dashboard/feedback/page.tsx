import { requireTenantUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import FeedbackClient from "./FeedbackClient";

export const dynamic = "force-dynamic";

export default async function FeedbackPage() {
  const { tenantId } = await requireTenantUser();

  const feedbacks = await prisma.privateFeedback.findMany({
    where: { tenantId },
    include: {
      card: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const formatted = feedbacks.map((fb) => ({
    id: fb.id,
    rating: fb.rating,
    customerName: fb.customerName,
    phoneNumber: fb.phoneNumber,
    feedbackText: fb.feedbackText,
    isResolved: fb.isResolved,
    resolvedAt: fb.resolvedAt?.toISOString() || null,
    createdAt: fb.createdAt.toISOString(),
    cardLabel: fb.card.label,
    cardCode: fb.card.shortCode,
  }));

  return <FeedbackClient feedbacks={formatted} />;
}
