import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { getUpcomingAppointments } from "@/app/actions/appointments";
import AgendaView from "@/components/AgendaView";

export default async function HomePage() {
  const session = await auth();
  if (!session) redirect("/api/auth/signin");

  const appointments = await getUpcomingAppointments();

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/api/auth/signin" });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#1e3a5f] shadow-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-white text-lg font-bold tracking-tight">
            Appointment Manager
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-blue-200 text-sm hidden sm:block truncate max-w-48">
              {session.user?.name ?? session.user?.email}
            </span>
            <form action={handleSignOut}>
              <button
                type="submit"
                className="text-sm text-white border border-white/30 hover:bg-white/10 px-3 py-1.5 rounded-lg transition"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <AgendaView appointments={appointments} />
      </main>
    </div>
  );
}
