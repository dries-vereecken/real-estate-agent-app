import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAppAccessToken } from "@/lib/graph-token";
import { sendEmail } from "@/lib/email";
import { cancellationAlertEmail } from "@/lib/email-templates";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Fetch the appointment
  const { data: appointment, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !appointment) {
    return htmlResponse(
      "Link Not Found",
      "This cancellation link is invalid or has already been used.",
      404
    );
  }

  if (appointment.status === "cancelled") {
    return htmlResponse(
      "Already Cancelled",
      "This appointment has already been cancelled. No further action is needed.",
      200
    );
  }

  // Mark as cancelled in Supabase
  const { error: updateError } = await supabase
    .from("appointments")
    .update({ status: "cancelled" })
    .eq("id", id);

  if (updateError) {
    console.error("[Cancel] Supabase update failed:", updateError.message);
    return htmlResponse(
      "Something Went Wrong",
      "We could not process your cancellation. Please contact the agent directly.",
      500
    );
  }

  // Notify the agent by email (app-only token — no user session required)
  const agentEmail = process.env.AGENT_EMAIL;
  if (agentEmail) {
    try {
      const accessToken = await getAppAccessToken();
      const formattedDate = new Date(appointment.date).toLocaleString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Brussels",
      });
      const { subject, html } = cancellationAlertEmail({
        contactName: appointment.contact_name,
        contactEmail: appointment.contact_email,
        date: formattedDate,
        address: appointment.address,
      });
      await sendEmail({
        accessToken,
        to: agentEmail,
        subject,
        html,
        sendAsUserId: agentEmail,
      });
    } catch (emailErr) {
      // Log but do not fail — the cancellation itself succeeded
      console.error("[Cancel] Failed to notify agent by email:", emailErr);
    }
  } else {
    console.warn("[Cancel] AGENT_EMAIL is not set — skipping agent notification");
  }

  return htmlResponse(
    "Appointment Cancelled",
    "Your appointment has been successfully cancelled. The agent has been notified.",
    200
  );
}

function htmlResponse(title: string, message: string, status: number) {
  const body = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; background: #f4f4f5; margin: 0; padding: 20px; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .card { background: #fff; border-radius: 12px; max-width: 480px; width: 100%; padding: 48px 40px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,.08); }
    .icon { font-size: 48px; margin-bottom: 16px; }
    h1 { color: #1e3a5f; font-size: 24px; margin: 0 0 12px; }
    p { color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${status === 200 ? "✓" : "✕"}</div>
    <h1>${title}</h1>
    <p>${message}</p>
  </div>
</body>
</html>`;

  return new NextResponse(body, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
