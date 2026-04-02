const GRAPH_BASE = "https://graph.microsoft.com/v1.0";

type SendEmailParams = {
  accessToken: string;
  to: string;
  subject: string;
  html: string;
  /**
   * When set, uses /users/{sendAsUserId}/sendMail (app-only token).
   * When omitted, uses /me/sendMail (delegated token from the session).
   */
  sendAsUserId?: string;
};

export async function sendEmail({
  accessToken,
  to,
  subject,
  html,
  sendAsUserId,
}: SendEmailParams): Promise<void> {
  const endpoint = sendAsUserId
    ? `${GRAPH_BASE}/users/${encodeURIComponent(sendAsUserId)}/sendMail`
    : `${GRAPH_BASE}/me/sendMail`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: {
        subject,
        body: {
          contentType: "HTML",
          content: html,
        },
        toRecipients: [
          {
            emailAddress: { address: to },
          },
        ],
      },
      saveToSentItems: true,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      `Graph API sendMail failed: ${response.status} – ${JSON.stringify(error)}`
    );
  }
}
