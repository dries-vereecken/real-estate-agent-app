const GRAPH_SEND_MAIL_URL = "https://graph.microsoft.com/v1.0/me/sendMail";

type SendEmailParams = {
  accessToken: string;
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({
  accessToken,
  to,
  subject,
  html,
}: SendEmailParams): Promise<void> {
  const response = await fetch(GRAPH_SEND_MAIL_URL, {
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
