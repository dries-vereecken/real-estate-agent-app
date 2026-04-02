export type AppointmentDetails = {
  contactName: string;
  contactEmail: string;
  date: string;         // pre-formatted, e.g. "Thursday 10 April 2026 at 14:00"
  address: string;
  cancellationUrl?: string;
  agentEmail?: string;
};

// ─── Confirmation (to contact) ────────────────────────────────────────────────

export function confirmationEmail(details: AppointmentDetails): {
  subject: string;
  html: string;
} {
  const { contactName, date, address, cancellationUrl } = details;

  return {
    subject: `Appointment Confirmed – ${date}`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">

        <!-- Header -->
        <tr><td style="background:#1e3a5f;padding:32px 40px;">
          <p style="margin:0;color:#ffffff;font-size:22px;font-weight:bold;">Appointment Confirmed</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:40px;">
          <p style="margin:0 0 16px;color:#374151;font-size:16px;">Dear ${contactName},</p>
          <p style="margin:0 0 24px;color:#374151;font-size:16px;line-height:1.6;">
            Your appointment has been confirmed. Here are the details:
          </p>

          <!-- Detail block -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;margin-bottom:24px;">
            <tr>
              <td style="padding:16px 20px;border-bottom:1px solid #e5e7eb;">
                <p style="margin:0;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;">Date &amp; Time</p>
                <p style="margin:4px 0 0;font-size:16px;color:#111827;font-weight:600;">${date}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 20px;">
                <p style="margin:0;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;">Location</p>
                <p style="margin:4px 0 0;font-size:16px;color:#111827;font-weight:600;">${address}</p>
              </td>
            </tr>
          </table>

          <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6;">
            You will also receive a calendar invitation shortly. If you need to cancel, please use the link below:
          </p>

          <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
            <tr><td style="background:#dc2626;border-radius:6px;padding:12px 24px;">
              <a href="${cancellationUrl}" style="color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">
                Cancel My Appointment
              </a>
            </td></tr>
          </table>

          <p style="margin:0;color:#374151;font-size:15px;">We look forward to seeing you.<br /><br />Kind regards,</p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;">
          <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
            This email was sent on behalf of your real estate agent.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  };
}

// ─── Update (to contact) ──────────────────────────────────────────────────────

export function updateEmail(details: AppointmentDetails): {
  subject: string;
  html: string;
} {
  const { contactName, date, address, cancellationUrl } = details;

  return {
    subject: `Appointment Updated – ${date}`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">

        <!-- Header -->
        <tr><td style="background:#1e3a5f;padding:32px 40px;">
          <p style="margin:0;color:#ffffff;font-size:22px;font-weight:bold;">Appointment Updated</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:40px;">
          <p style="margin:0 0 16px;color:#374151;font-size:16px;">Dear ${contactName},</p>
          <p style="margin:0 0 24px;color:#374151;font-size:16px;line-height:1.6;">
            Your appointment has been updated. Please see the revised details below:
          </p>

          <!-- Detail block -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;margin-bottom:24px;">
            <tr>
              <td style="padding:16px 20px;border-bottom:1px solid #e5e7eb;">
                <p style="margin:0;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;">New Date &amp; Time</p>
                <p style="margin:4px 0 0;font-size:16px;color:#111827;font-weight:600;">${date}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 20px;">
                <p style="margin:0;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;">New Location</p>
                <p style="margin:4px 0 0;font-size:16px;color:#111827;font-weight:600;">${address}</p>
              </td>
            </tr>
          </table>

          <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6;">
            An updated calendar invitation has been sent to your email. If you need to cancel, use the link below:
          </p>

          <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
            <tr><td style="background:#dc2626;border-radius:6px;padding:12px 24px;">
              <a href="${cancellationUrl}" style="color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">
                Cancel My Appointment
              </a>
            </td></tr>
          </table>

          <p style="margin:0;color:#374151;font-size:15px;">Kind regards,</p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;">
          <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
            This email was sent on behalf of your real estate agent.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  };
}

// ─── Cancellation Alert (to agent) ───────────────────────────────────────────

export function cancellationAlertEmail(details: AppointmentDetails): {
  subject: string;
  html: string;
} {
  const { contactName, contactEmail, date, address } = details;

  return {
    subject: `Slot Now Available – Cancelled by ${contactName}`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">

        <!-- Header -->
        <tr><td style="background:#92400e;padding:32px 40px;">
          <p style="margin:0;color:#ffffff;font-size:22px;font-weight:bold;">Appointment Cancelled</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:40px;">
          <p style="margin:0 0 24px;color:#374151;font-size:16px;line-height:1.6;">
            A contact has cancelled their appointment. The slot is now available.
          </p>

          <!-- Detail block -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef3c7;border:1px solid #fcd34d;border-radius:6px;margin-bottom:32px;">
            <tr>
              <td style="padding:16px 20px;border-bottom:1px solid #fcd34d;">
                <p style="margin:0;font-size:12px;color:#92400e;text-transform:uppercase;letter-spacing:.05em;">Contact</p>
                <p style="margin:4px 0 0;font-size:16px;color:#111827;font-weight:600;">${contactName}</p>
                <p style="margin:2px 0 0;font-size:14px;color:#374151;">${contactEmail}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 20px;border-bottom:1px solid #fcd34d;">
                <p style="margin:0;font-size:12px;color:#92400e;text-transform:uppercase;letter-spacing:.05em;">Was Scheduled For</p>
                <p style="margin:4px 0 0;font-size:16px;color:#111827;font-weight:600;">${date}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 20px;">
                <p style="margin:0;font-size:12px;color:#92400e;text-transform:uppercase;letter-spacing:.05em;">Location</p>
                <p style="margin:4px 0 0;font-size:16px;color:#111827;font-weight:600;">${address}</p>
              </td>
            </tr>
          </table>

          <p style="margin:0;color:#374151;font-size:15px;">The calendar event has been removed automatically.</p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;">
          <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
            Automated notification from Real Estate Appointment Manager.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  };
}
