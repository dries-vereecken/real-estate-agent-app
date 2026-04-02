# Project Specification: Real Estate Agent Appointment Manager



## 1. Overview

This is a single-tenant, serverless application built for exactly one real estate agent. It functions as an appointment manager and agenda. The application will be deployed to Vercel and installed locally on the agent's laptop as a Progressive Web App (PWA) to provide a desktop shortcut and a native app-like experience.



It handles appointment scheduling, agenda viewing, and automated communications (Calendar Invites & Emails via Microsoft Graph API, and SMS via Sweego).



## 2. Tech Stack

* **Framework:** Next.js (App Router)

* **Language:** TypeScript

* **Styling:** Tailwind CSS

* **Desktop App Integration:** `next-pwa` (generates `manifest.json` for desktop installation)

* **Database:** Supabase (PostgreSQL)

* **Hosting & Cron Jobs:** Vercel

* **Authentication & API Access:** Auth.js (NextAuth) using Microsoft Entra ID (Requires `Mail.Send` and `Calendars.ReadWrite` scopes)

* **Email & Calendar Engine:** Microsoft Graph API (Agent's existing Outlook account)

* **SMS Engine:** Sweego REST API







## 3. Database Schema

We need a single Supabase table named `appointments` with the following columns:

* `id`: UUID (Primary Key)

* `date`: Timestamptz (Date and time of the appointment)

* `address`: Text

* `contact_name`: Text

* `contact_email`: Text

* `contact_phone`: Text

* `status`: Text (e.g., 'scheduled', 'cancelled')

* `graph_event_id`: Text (Stores the Microsoft Graph Event ID so we can update/cancel the calendar invite later)

* `created_at`: Timestamptz (Default: now())



## 4. User Interface & Features (Agent Facing)

* **Desktop Shortcut:** The app must be installable as a PWA so it launches from a desktop shortcut in a standalone window.

* **Agenda View:** A dashboard displaying all upcoming appointments fetched from Supabase.

* **Submission Form:** An interface to submit new appointments requiring: Date/Time, Address, Contact Name, Contact Email, Contact Phone Number.

* **Edit Interface:** Clicking an appointment on the agenda allows the agent to update the location, date, or cancel the appointment manually.



## 5. Automated Communication Workflows



### A. On Appointment Creation

* Insert record into Supabase.

* Use the Microsoft Graph API (`/me/events` endpoint) to create a calendar event on the agent's calendar.

* Add the contact's email to the `attendees` array in the Graph API payload so Microsoft automatically sends them a formal calendar invite (.ics).

* Include the unique Cancellation Link (e.g., `https://[your-domain]/cancel/[id]`) in the `body` (description) of the calendar event.

* Save the returned Microsoft Graph Event ID into the `graph_event_id` column in Supabase.



### B. On Appointment Update

* Update the record in Supabase.

* Use the Microsoft Graph API (PATCH `/me/events/{graph_event_id}`) to update the date, time, or location on the agent's calendar. This will automatically send an updated calendar invite to the contact.



### C. Automated Reminders (1-Day Ahead)

* Driven by a **Vercel Cron Job** hitting a secure API route daily at 11:00 AM.

* Query Supabase for appointments where `status` is 'scheduled' and `date` is exactly tomorrow.

* Trigger **Email Reminder** to the contact via Microsoft Graph API (must include the Cancellation Link).

* Trigger **SMS Reminder** to the contact via the Sweego REST API.



### D. Contact-Initiated Cancellation

* When a contact clicks the cancellation link from their email/calendar invite.

* Update the appointment `status` in Supabase to 'cancelled'.

* Use the Microsoft Graph API to cancel/remove the event from the agent's calendar (which alerts the contact that the event is cancelled).

* Trigger **Email Alert** to the Real Estate Agent notifying them that the slot has opened up.



## 6. Environment Variables Expected

The system will rely on `.env.local` for the following secrets:

# === SUPABASE (CLIENT-SIDE) ===
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""

# === MICROSOFT IDENTITY (SERVER-SIDE) ===
# Configured for: http://localhost:3000/api/auth/callback/microsoft-entra-id
# Scopes: openid, profile, email, offline_access, Mail.Send, Calendars.ReadWrite
MICROSOFT_TENANT_ID=""
MICROSOFT_CLIENT_ID=""
MICROSOFT_CLIENT_SECRET=""

# === SMS PROVIDER (SWEEGO) ===
SWEEGO_API_ID=""
SWEEGO_API_KEY=""