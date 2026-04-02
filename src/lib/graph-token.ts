/**
 * Obtains a Microsoft Graph access token using the client credentials
 * (app-only) grant flow. Used by server-side routes that run without
 * an active user session (cron job, cancellation link handler).
 *
 * Azure AD requirements:
 *   - MICROSOFT_TENANT_ID must be the real tenant GUID (not "common")
 *   - App registration must have Mail.Send *application* permission granted
 */
export async function getAppAccessToken(): Promise<string> {
  const tenantId = process.env.MICROSOFT_TENANT_ID;
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error(
      "Missing MICROSOFT_TENANT_ID, MICROSOFT_CLIENT_ID, or MICROSOFT_CLIENT_SECRET"
    );
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
    scope: "https://graph.microsoft.com/.default",
  });

  const res = await fetch(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      `App token request failed (${res.status}): ${JSON.stringify(err)}`
    );
  }

  const data = await res.json();
  return data.access_token as string;
}
