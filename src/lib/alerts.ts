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
          event: "tapgate.feedback.captured",
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
          from: "alerts@tapgate.io",
          to: alertEmail,
          subject: `⚠️ Urgent: ${payload.rating}★ Review Intercepted for ${payload.tenantName}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
              <h2 style="color: #0d9488;">TapGate Smart Gate Alert</h2>
              <p>A customer just left a <strong>${payload.rating}-star</strong> rating that was safely intercepted before reaching Google.</p>
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px;">
                <p><strong>Customer:</strong> ${payload.customerName || "Anonymous"}</p>
                <p><strong>Phone:</strong> ${payload.phoneNumber || "N/A"}</p>
                <p><strong>Location/Card:</strong> ${payload.cardLabel || "NFC Card"}</p>
                <p><strong>Feedback:</strong></p>
                <blockquote style="font-style: italic; color: #475569;">"${payload.feedbackText || "No comment"}"</blockquote>
              </div>
              <p style="margin-top: 20px;">Log in to your TapGate Dashboard to respond and mark as resolved.</p>
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
