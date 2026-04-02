"use client";

import { useEffect, useState, useTransition } from "react";
import { createAppointment, updateAppointment } from "@/app/actions/appointments";
import type { Appointment } from "@/app/actions/appointments";

type Props = {
  appointment: Appointment | null;
  onClose: () => void;
  onSuccess: () => void;
};

export default function AppointmentModal({ appointment, onClose, onSuccess }: Props) {
  const isEditing = !!appointment;
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Convert stored ISO string → datetime-local value (YYYY-MM-DDTHH:MM)
  const defaultDate = appointment
    ? new Date(new Date(appointment.date).getTime() - new Date(appointment.date).getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16)
    : "";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const data = {
      date: new Date(fd.get("date") as string).toISOString(),
      address: fd.get("address") as string,
      contact_name: fd.get("contact_name") as string,
      contact_email: fd.get("contact_email") as string,
      contact_phone: fd.get("contact_phone") as string,
    };

    startTransition(async () => {
      try {
        if (isEditing) {
          await updateAppointment(appointment.id, data);
        } else {
          await createAppointment(data);
        }
        onSuccess();
        onClose();
      } catch (err) {
        setError((err as Error).message);
      }
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? "Edit Appointment" : "New Appointment"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Date & Time */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Date &amp; Time
            </label>
            <input
              id="date"
              type="datetime-local"
              name="date"
              required
              defaultValue={defaultDate}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f] transition"
            />
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              id="address"
              type="text"
              name="address"
              required
              defaultValue={appointment?.address ?? ""}
              placeholder="Markt 1, 2000 Antwerpen"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f] transition"
            />
          </div>

          {/* Contact Name */}
          <div>
            <label htmlFor="contact_name" className="block text-sm font-medium text-gray-700 mb-1">
              Contact Name
            </label>
            <input
              id="contact_name"
              type="text"
              name="contact_name"
              required
              defaultValue={appointment?.contact_name ?? ""}
              placeholder="Jan Janssen"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f] transition"
            />
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="contact_email"
                type="email"
                name="contact_email"
                required
                defaultValue={appointment?.contact_email ?? ""}
                placeholder="jan@example.be"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f] transition"
              />
            </div>
            <div>
              <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                id="contact_phone"
                type="tel"
                name="contact_phone"
                required
                defaultValue={appointment?.contact_phone ?? ""}
                placeholder="+32 471 12 34 56"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f] transition"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="text-sm px-4 py-2 text-gray-600 hover:text-gray-900 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="text-sm px-5 py-2 bg-[#1e3a5f] text-white rounded-lg font-medium hover:bg-[#162d4a] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending
                ? "Saving…"
                : isEditing
                ? "Save Changes"
                : "Create Appointment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
