"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppointmentModal from "@/components/AppointmentModal";
import type { Appointment } from "@/app/actions/appointments";

export default function AgendaView({
  appointments,
}: {
  appointments: Appointment[];
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Appointment | null>(null);
  const router = useRouter();

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(appt: Appointment) {
    setEditing(appt);
    setModalOpen(true);
  }

  function handleSuccess() {
    router.refresh();
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Upcoming Appointments
          <span className="ml-2 text-sm font-normal text-gray-400">
            ({appointments.length})
          </span>
        </h2>
        <button
          onClick={openCreate}
          className="bg-[#1e3a5f] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#162d4a] transition shadow-sm"
        >
          + New Appointment
        </button>
      </div>

      {/* Empty state */}
      {appointments.length === 0 ? (
        <div className="text-center py-24 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
          <p className="text-lg font-medium">No upcoming appointments</p>
          <p className="text-sm mt-1">
            Click &ldquo;New Appointment&rdquo; to schedule one.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((appt) => (
            <AppointmentCard
              key={appt.id}
              appointment={appt}
              onClick={() => openEdit(appt)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <AppointmentModal
          appointment={editing}
          onClose={() => setModalOpen(false)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}

function AppointmentCard({
  appointment,
  onClick,
}: {
  appointment: Appointment;
  onClick: () => void;
}) {
  const date = new Date(appointment.date);
  const day = date.toLocaleDateString("en-GB", {
    day: "numeric",
    timeZone: "Europe/Brussels",
  });
  const month = date.toLocaleDateString("en-GB", {
    month: "short",
    timeZone: "Europe/Brussels",
  });
  const weekday = date.toLocaleDateString("en-GB", {
    weekday: "short",
    timeZone: "Europe/Brussels",
  });
  const time = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Brussels",
  });

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white border border-gray-200 rounded-xl px-5 py-4 hover:border-[#1e3a5f]/50 hover:shadow-md transition-all group"
    >
      <div className="flex items-center gap-5">
        {/* Date block */}
        <div className="flex-shrink-0 w-16 text-center bg-[#1e3a5f]/5 rounded-xl py-2.5 px-1">
          <p className="text-[10px] font-semibold text-[#1e3a5f]/60 uppercase tracking-widest">
            {weekday}
          </p>
          <p className="text-2xl font-bold text-[#1e3a5f] leading-tight">
            {day}
          </p>
          <p className="text-[10px] font-medium text-[#1e3a5f]/60 uppercase tracking-widest">
            {month}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{time}</p>
        </div>

        {/* Divider */}
        <div className="w-px h-12 bg-gray-200 flex-shrink-0" />

        {/* Details */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">
            {appointment.contact_name}
          </p>
          <p className="text-sm text-gray-500 truncate mt-0.5">
            {appointment.address}
          </p>
          <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-400">
            <span className="truncate">{appointment.contact_email}</span>
            <span className="flex-shrink-0">·</span>
            <span className="flex-shrink-0">{appointment.contact_phone}</span>
          </div>
        </div>

        {/* Edit hint */}
        <span className="text-xs text-[#1e3a5f] font-medium flex-shrink-0 opacity-0 group-hover:opacity-100 transition pr-1">
          Edit →
        </span>
      </div>
    </button>
  );
}
