const SWEEGO_API_URL = "https://api.sweego.io/send";

export async function sendSms(
  phoneNumber: string,
  message: string
): Promise<void> {
  const apiKey = process.env.SWEEGO_API_KEY;
  const apiId = process.env.SWEEGO_API_ID;

  if (!apiKey || !apiId) {
    throw new Error("SWEEGO_API_KEY or SWEEGO_API_ID is not set");
  }

  let response: Response;

  try {
    response = await fetch(SWEEGO_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-Key": apiKey,
      },
      body: JSON.stringify({
        channel: "sms",
        provider: "sweego",
        "campaign-type": "transac",
        "campaign-id": apiId,
        recipients: [{ num: phoneNumber, region: "BE" }],
        "message-txt": message,
      }),
    });
  } catch (networkError) {
    console.error("[SMS] Network error contacting Sweego:", networkError);
    throw networkError;
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "(no body)");
    console.error(
      `[SMS] Sweego returned ${response.status} for ${phoneNumber}: ${body}`
    );
    throw new Error(`Sweego SMS failed: ${response.status} – ${body}`);
  }

  console.log(`[SMS] Sent successfully to ${phoneNumber}`);
}
