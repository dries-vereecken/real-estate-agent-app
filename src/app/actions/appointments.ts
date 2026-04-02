"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { sendEmail } from "@/lib/email";
import { confirmationEmail, updateEmail } from "@/lib/email-templates";

export type Appointment = {
  id: string;
  date: string;
  address: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  status: string;
  graph_event_id: string | null;
  created_at: string;
};

export type AppointmentInsert = {
  date: string;
  address: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
};

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Brussels",
  });
}

export async function getUpcomingAppointments(): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("status", "scheduled")
    .gte("date", new Date().toISOString())
    .order("date", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createAppointment(data: AppointmentInsert): Promise<void> {
  const session = await auth();

  const { data: inserted, error } = await supabase
    .from("appointments")
    .insert({ ...data, status: "scheduled" })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const cancellationUrl = `${appUrl}/cancel/${inserted.id}`;
  const { subject, html } = confirmationEmail({
    contactName: data.contact_name,
    contactEmail: data.contact_email,
    date: formatDate(data.date),
    address: data.address,
    cancellationUrl,
  });

  if (session?.accessToken) {
    try {
      await sendEmail({ accessToken: session.accessToken, to: data.contact_email, subject, html });
    } catch (err) {
      console.error("[Email] Failed to send confirmation:", err);
    }
  }

  revalidatePath("/");
}

export async function updateAppointment(
  id: string,
  data: Partial<AppointmentInsert>
): Promise<void> {
  const session = await auth();

  const { data: updated, error } = await supabase
    .from("appointments")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const cancellationUrl = `${appUrl}/cancel/${id}`;
  const { subject, html } = updateEmail({
    contactName: updated.contact_name,
    contactEmail: updated.contact_email,
    date: formatDate(updated.date),
    address: updated.address,
    cancellationUrl,
  });

  if (session?.accessToken) {
    try {
      await sendEmail({ accessToken: session.accessToken, to: updated.contact_email, subject, html });
    } catch (err) {
      console.error("[Email] Failed to send update:", err);
    }
  }

  revalidatePath("/");
}
