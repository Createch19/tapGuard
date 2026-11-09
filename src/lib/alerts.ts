interface FeedbackAlertPayload {
  tenantName: string;
  cardLabel?: string | null;
  rating: number;
  customerName?: string | null;
  phoneNumber?: string | null;
  feedbackText?: string | null;
  createdAt: Date;
}

export async function dispatchFeedbackAlerts(
  webhookUrl: string | null | undefined,
  alertEmail: string | null | undefined,
  payload: FeedbackAlertPayload
) {
  // 1. Dispatch Webhook
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "tapgenie.feedback.captured",
          timestamp: new Date().toISOString(),
          data: {
            tenant: payload.tenantName,
            card: payload.cardLabel || "NFC Card",
            rating: payload.rating,
            customerName: payload.customerName || "Anonymous",
            phone: payload.phoneNumber || "Not provided",
            comments: payload.feedbackText,
            submittedAt: payload.createdAt.toISOString(),
          },
        }),
      });
      console.log(`[Alert] Webhook dispatched to ${webhookUrl}`);
    } catch (err) {
      console.error(`[Alert] Webhook delivery failed to ${webhookUrl}:`, err);
    }
  }

  // 2. Alert Email (Resend or Console Fallback)
  if (alertEmail) {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(resendApiKey);
        await resend.emails.send({
          from: "alerts@tapgenie.io",
          to: alertEmail,
          subject: `⚠️ Urgent: ${payload.rating}★ Review Intercepted for ${payload.tenantName}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
              <h2 style="color: #0d9488;">TapGenie Smart Gate Alert</h2>
              <p>A customer just left a <strong>${payload.rating}-star</strong> rating that was safely intercepted before reaching Google.</p>
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px;">
                <p><strong>Customer:</strong> ${payload.customerName || "Anonymous"}</p>
                <p><strong>Phone:</strong> ${payload.phoneNumber || "N/A"}</p>
                <p><strong>Location/Card:</strong> ${payload.cardLabel || "NFC Card"}</p>
                <p><strong>Feedback:</strong></p>
                <blockquote style="font-style: italic; color: #475569;">"${payload.feedbackText || "No comment"}"</blockquote>
              </div>
              <p style="margin-top: 20px;">Log in to your TapGenie Dashboard to respond and mark as resolved.</p>
            </div>
          `,
        });
        console.log(`[Alert] Email notification sent to ${alertEmail}`);
      } catch (err) {
        console.error(`[Alert] Failed to send email via Resend to ${alertEmail}:`, err);
      }
    } else {
      console.log(`[Alert Simulation] Negative feedback intercepted for ${payload.tenantName}: ${payload.rating}★ from ${payload.customerName || "Customer"} - "${payload.feedbackText}" (Alert email to ${alertEmail})`);
    }
  }
}

export interface GoogleReviewAlertPayload {
  tenantName: string;
  locationTitle?: string | null;
  reviewerName: string;
  reviewerPhotoUrl?: string | null;
  rating: number;
  comment?: string | null;
  reviewCreatedAt: Date;
  googleReviewId: string;
  alertEmail?: string | null;
  webhookUrl?: string | null;
  filterPreference?: string | null; // "ALL" | "CRITICAL" | "OFF"
  webhookEnabled?: boolean;
}

/**
 * Dispatches an email (via Resend) and optional webhook alert when a new Google review arrives.
 * Respects the tenant's rating filter preference ("ALL", "CRITICAL" <= 3 stars, or "OFF").
 */
export async function dispatchGoogleReviewAlert(payload: GoogleReviewAlertPayload) {
  const {
    tenantName,
    locationTitle,
    reviewerName,
    rating,
    comment,
    reviewCreatedAt,
    googleReviewId,
    alertEmail,
    webhookUrl,
    filterPreference = "ALL",
    webhookEnabled = true,
  } = payload;

  // 1. Check Filter Preferences
  if (filterPreference === "OFF") {
    console.log(`[Google Review Alert] Skipped alert for ${googleReviewId} - tenant alerts disabled.`);
    return { skipped: true, reason: "OFF" };
  }

  if (filterPreference === "CRITICAL" && rating > 3) {
    console.log(`[Google Review Alert] Skipped alert for ${googleReviewId} (${rating}★) - CRITICAL only filter active.`);
    return { skipped: true, reason: "RATING_ABOVE_THRESHOLD" };
  }

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000").replace(/\/$/, "");
  const inboxUrl = `${appUrl}/dashboard/reviews`;
  const starDisplay = "★".repeat(Math.max(1, Math.min(5, rating))) + "☆".repeat(Math.max(0, 5 - rating));

  // 2. Dispatch Webhook
  if (webhookUrl && webhookEnabled) {
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "google.review.received",
          timestamp: new Date().toISOString(),
          data: {
            tenant: tenantName,
            location: locationTitle || "Default Location",
            reviewer: reviewerName,
            rating,
            stars: starDisplay,
            comment: comment || "",
            reviewDate: reviewCreatedAt.toISOString(),
            googleReviewId,
            inboxUrl,
          },
        }),
      });
      console.log(`[Google Review Alert] Webhook delivered to ${webhookUrl}`);
    } catch (err) {
      console.error(`[Google Review Alert] Webhook delivery failed to ${webhookUrl}:`, err);
    }
  }

  // 3. Dispatch Email Notification
  if (alertEmail) {
    const resendApiKey = process.env.RESEND_API_KEY;
    const isCritical = rating <= 3;
    const badgeBg = isCritical ? "#fef2f2" : "#f0fdf4";
    const badgeColor = isCritical ? "#dc2626" : "#16a34a";
    const badgeBorder = isCritical ? "#fecaca" : "#bbf7d0";
    const subjectPrefix = isCritical ? "🚨 Critical Review" : "⭐ New Review";

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subjectPrefix}: ${rating}★ from ${reviewerName}</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px 12px; color: #1e293b;">
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
            <tr>
              <td style="padding: 24px 28px; background: linear-gradient(135deg, #0f766e 0%, #0d9488 100%);">
                <table width="100%" border="0" cellpadding="0" cellspacing="0">
                  <tr>
                    <td>
                      <span style="display: inline-block; font-size: 11px; font-weight: 800; letter-spacing: 0.1em; color: #ccfbf1; text-transform: uppercase;">TapGenie Review Alert</span>
                      <h1 style="margin: 4px 0 0 0; font-size: 22px; font-weight: 800; color: #ffffff;">New Google Review</h1>
                      <p style="margin: 2px 0 0 0; font-size: 13px; color: #99f6e4;">${tenantName} • ${locationTitle || "Google Listing"}</p>
                    </td>
                    <td align="right" valign="top">
                      <div style="background-color: rgba(255, 255, 255, 0.2); color: #ffffff; padding: 6px 14px; border-radius: 9999px; font-size: 13px; font-weight: 700; white-space: nowrap;">
                        ${rating} / 5 Stars
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding: 28px;">
                <div style="background-color: ${badgeBg}; border: 1px solid ${badgeBorder}; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                  <table width="100%" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                      <td>
                        <div style="font-size: 20px; color: #f59e0b; letter-spacing: 3px; line-height: 1; margin-bottom: 8px;">
                          ${starDisplay}
                        </div>
                        <div style="font-size: 14px; font-weight: 700; color: #0f172a;">
                          ${reviewerName}
                        </div>
                      </td>
                      <td align="right" valign="top">
                        <span style="font-size: 11px; color: #64748b;">
                          ${reviewCreatedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </td>
                    </tr>
                  </table>

                  <div style="margin-top: 14px; padding-top: 14px; border-top: 1px dashed ${badgeBorder};">
                    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #334155; font-style: ${comment ? 'normal' : 'italic'};">
                      ${comment ? `"${comment}"` : "Customer gave a star rating without written feedback."}
                    </p>
                  </div>
                </div>

                <div style="text-align: center; margin: 28px 0 12px 0;">
                  <a href="${inboxUrl}" style="display: inline-block; background-color: #0d9488; color: #ffffff; padding: 14px 32px; border-radius: 12px; font-size: 14px; font-weight: 700; text-decoration: none; box-shadow: 0 4px 12px rgba(13, 148, 136, 0.25);">
                    Open Review Inbox & Reply with AI &rarr;
                  </a>
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding: 16px 28px 24px 28px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center;">
                <p style="margin: 0; font-size: 11px; color: #94a3b8; line-height: 1.5;">
                  You received this notification because review alerts are configured for <strong>${tenantName}</strong>.<br>
                  To change your rating alert filter or recipient email, visit your TapGenie Settings.
                </p>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    if (resendApiKey) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(resendApiKey);
        await resend.emails.send({
          from: "alerts@tapgenie.io",
          to: alertEmail,
          subject: `${subjectPrefix}: ${rating}★ from ${reviewerName} - ${tenantName}`,
          html,
        });
        console.log(`[Google Review Alert] Sent email to ${alertEmail} for ${googleReviewId}`);
      } catch (err) {
        console.error(`[Google Review Alert] Resend failed to send to ${alertEmail}:`, err);
      }
    } else {
      console.log(`[Google Review Alert Simulation] Dispatched to ${alertEmail}: ${rating}★ from ${reviewerName} - "${comment || "(No text)"}"`);
    }
  }

  return { success: true };
}
