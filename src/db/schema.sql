-- All Star Dashboard - Postgres schema (Neon)
-- Apply with: psql "$DATABASE_URL" -f src/db/schema.sql

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Users (currently just for the single shared-password gate; ready for SSO).
-- ---------------------------------------------------------------------------
create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  display_name text,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- COMPETITORS
-- ---------------------------------------------------------------------------
create table if not exists competitors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  website text,
  notes text,
  -- free-form social handles, e.g. { "instagram": "@foo", "facebook": "bar" }
  social jsonb not null default '{}'::jsonb,
  -- list of { url, selector, label } for the scraper to hit
  scrape_targets jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Each run of the scraper (or manual entry) stores a snapshot.
-- snapshot_type: 'price' | 'product' | 'promo' | 'social' | 'note'
create table if not exists competitor_snapshots (
  id uuid primary key default gen_random_uuid(),
  competitor_id uuid not null references competitors(id) on delete cascade,
  snapshot_type text not null,
  source_url text,
  title text,
  -- flexible payload: { price_cents, currency, product, text, image_url, ... }
  data jsonb not null default '{}'::jsonb,
  captured_at timestamptz not null default now()
);

create index if not exists idx_competitor_snapshots_competitor
  on competitor_snapshots (competitor_id, captured_at desc);
create index if not exists idx_competitor_snapshots_type
  on competitor_snapshots (snapshot_type, captured_at desc);

-- ---------------------------------------------------------------------------
-- LEADS (potential new clients to call)
-- ---------------------------------------------------------------------------
-- source: 'google_places' | 'schools_scrape' | 'manual' | 'printavo_quote'
-- status: 'new' | 'queued' | 'called' | 'won' | 'lost' | 'do_not_call'
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  source_ref text,              -- e.g. Google place_id, scrape URL
  name text not null,
  category text,                -- 'school', 'league', 'gym', 'team', 'business'
  address text,
  city text,
  state text,
  postal_code text,
  phone text,
  email text,
  website text,
  lat double precision,
  lng double precision,
  rating real,
  user_ratings_total int,
  raw jsonb not null default '{}'::jsonb,
  status text not null default 'new',
  last_called_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source, source_ref)
);

create index if not exists idx_leads_status on leads (status);
create index if not exists idx_leads_city on leads (city);

-- Weekly call queue - which leads to focus on this week.
create table if not exists weekly_call_queue (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  week_start date not null,      -- Monday of the target week
  priority int not null default 0,
  called boolean not null default false,
  outcome text,                  -- 'answered' | 'voicemail' | 'no_answer' | 'interested' | 'not_interested'
  notes text,
  created_at timestamptz not null default now(),
  unique (lead_id, week_start)
);

create index if not exists idx_weekly_queue_week on weekly_call_queue (week_start, priority desc);

-- ---------------------------------------------------------------------------
-- PRINTAVO ORDERS (mirror of last year's Printavo order history)
-- ---------------------------------------------------------------------------
create table if not exists printavo_orders (
  id uuid primary key default gen_random_uuid(),
  printavo_id text unique not null,
  visual_id text,                -- the human-friendly number in Printavo
  job_name text,
  customer_id text,
  customer_name text,
  customer_email text,
  customer_phone text,
  order_total_cents bigint not null default 0,
  due_date date,
  created_date date,
  status text,
  tags jsonb not null default '[]'::jsonb,
  is_event boolean not null default false,
  event_keyword text,
  raw jsonb not null default '{}'::jsonb,
  synced_at timestamptz not null default now()
);

create index if not exists idx_printavo_orders_due_date on printavo_orders (due_date);
create index if not exists idx_printavo_orders_customer on printavo_orders (customer_id);
create index if not exists idx_printavo_orders_event on printavo_orders (is_event) where is_event = true;

-- Reorder call queue - surfaces orders from last year whose due date is 21-45
-- days away this year (shifted by 365 days).
create table if not exists reorder_calls (
  id uuid primary key default gen_random_uuid(),
  printavo_order_id uuid not null references printavo_orders(id) on delete cascade,
  -- projected_call_date = last year due_date + 365 - 30 (we call 30 days before event).
  projected_event_date date not null,
  projected_call_date date not null,
  reason text not null,          -- 'high_value' | 'recurring' | 'event_keyword' (comma-separated)
  called boolean not null default false,
  outcome text,                  -- 'reorder' | 'maybe' | 'declined' | 'voicemail' | 'no_answer'
  notes text,
  created_at timestamptz not null default now(),
  unique (printavo_order_id, projected_event_date)
);

create index if not exists idx_reorder_calls_date on reorder_calls (projected_call_date, called);
