"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export type AppointmentInsert = {
  date: string;           // ISO 8601 string, e.g. "2026-04-10T14:00:00+02:00"
  address: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
};

export async function createAppointment(data: AppointmentInsert) {
  const { error } = await supabase.from("appointments").insert({
    ...data,
    status: "scheduled",
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
}
