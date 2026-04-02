import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAppAccessToken } from "@/lib/graph-token";
import { sendEmail } from "@/lib/email";
import { reminderEmail } from "@/lib/email-templates";
import { sendSms } from "@/lib/sms";

export async function GET(req: NextRequest) {
  // ── Security: verify the Vercel cron secret ──────────────────────────────
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Build the "tomorrow" date window (midnight → midnight, Brussels time) ─
  const now = new Date();
  const tomorrowStart = new Date(now);
  tomorrowStart.setDate(now.getDate() + 1);
  tomorrowStart.setHours(0, 0, 0, 0);

  const tomorrowEnd = new Date(tomorrowStart);
  tomorrowEnd.setDate(tomorrowStart.getDate() + 1);

  // ── Query Supabase ────────────────────────────────────────────────────────
  const { data: appointments, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("status", "scheduled")
    .gte("date", tomorrowStart.toISOString())
    .lt("date", tomorrowEnd.toISOString());

  if (error) {
    console.error("[Cron] Supabase query failed:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!appointments || appointments.length === 0) {
    return NextResponse.json({ sent: 0, message: "No appointments tomorrow" });
  }

  // ── Get app-only Graph token once for all email sends ─────────────────────
  const agentEmail = process.env.AGENT_EMAIL;
  let accessToken: string | null = null;

  if (agentEmail) {
    try {
      accessToken = await getAppAccessToken();
    } catch (tokenErr) {
      console.error("[Cron] Failed to obtain Graph token:", tokenErr);
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const results: { id: string; email: string; sms: string }[] = [];

  // ── Process each appointment ──────────────────────────────────────────────
  for (const appt of appointments) {
    const formattedDate = new Date(appt.date).toLocaleString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Brussels",
    });

    const cancellationUrl = `${appUrl}/cancel/${appt.id}`;
    const result = { id: appt.id, email: "skipped", sms: "skipped" };

    // Email reminder
    if (accessToken && agentEmail) {
      try {
        const { subject, html } = reminderEmail({
          contactName: appt.contact_name,
          contactEmail: appt.contact_email,
          date: formattedDate,
          address: appt.address,
          cancellationUrl,
        });
        await sendEmail({
          accessToken,
          to: appt.contact_email,
          subject,
          html,
          sendAsUserId: agentEmail,
        });
        result.email = "sent";
      } catch (emailErr) {
        console.error(`[Cron] Email failed for ${appt.id}:`, emailErr);
        result.email = "failed";
      }
    }

    // SMS reminder
    try {
      const smsMessage =
        `Reminder: Your appointment is tomorrow, ${formattedDate}, ` +
        `at ${appt.address}. ` +
        `To cancel: ${cancellationUrl}`;
      await sendSms(appt.contact_phone, smsMessage);
      result.sms = "sent";
    } catch (smsErr) {
      console.error(`[Cron] SMS failed for ${appt.id}:`, smsErr);
      result.sms = "failed";
    }

    results.push(result);
  }

  console.log("[Cron] Reminders processed:", results);
  return NextResponse.json({ sent: results.length, results });
}
