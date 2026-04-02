-- Real Estate Appointment Manager
-- Run this in the Supabase dashboard: SQL Editor > New Query

create table if not exists appointments (
  id              uuid primary key default gen_random_uuid(),
  date            timestamptz not null,
  address         text        not null,
  contact_name    text        not null,
  contact_email   text        not null,
  contact_phone   text        not null,
  status          text        not null default 'scheduled'
                              check (status in ('scheduled', 'cancelled')),
  graph_event_id  text,
  created_at      timestamptz not null default now()
);

-- Index for the daily reminder cron job (queries by status + date range)
create index if not exists appointments_status_date_idx
  on appointments (status, date);
