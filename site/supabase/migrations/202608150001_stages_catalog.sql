create table if not exists public.stage_sources (
  id text primary key,
  name text not null,
  url text not null,
  organizer_country text not null,
  organizer_type text not null check (organizer_type in ('club', 'school', 'federation')),
  source_kind text not null check (source_kind in ('Calendrier', 'Réservation', 'Fiche club', 'Billetterie')),
  parser text,
  default_language text check (default_language is null or default_language in ('fr', 'en', 'es', 'it', 'de')),
  active boolean not null default true,
  state text not null default 'ok' check (state in ('ok', 'unavailable')),
  stage_count integer not null default 0 check (stage_count >= 0),
  consecutive_failures integer not null default 0 check (consecutive_failures >= 0),
  last_checked_at timestamptz,
  last_success_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.stage_locations (
  fingerprint text primary key,
  display_name text not null,
  country text not null,
  latitude double precision,
  longitude double precision,
  precision text check (precision is null or precision in ('exact', 'city', 'region', 'country')),
  provider text,
  geocoded_at timestamptz,
  retry_after timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((latitude is null and longitude is null) or (latitude between -90 and 90 and longitude between -180 and 180))
);

create table if not exists public.stages (
  id text primary key,
  source_id text not null references public.stage_sources(id) on delete cascade,
  original_title text not null,
  translated_title text not null,
  language text check (language is null or language in ('fr', 'en', 'es', 'it', 'de')),
  organizer text not null,
  organizer_country text not null,
  organizer_type text not null check (organizer_type in ('club', 'school', 'federation')),
  start_date date not null,
  end_date date not null,
  location text not null,
  department text not null,
  region text not null,
  destination_country text not null,
  latitude double precision,
  longitude double precision,
  location_precision text check (location_precision is null or location_precision in ('exact', 'city', 'region', 'country')),
  level text not null,
  discipline text not null,
  price numeric(12, 2),
  currency text,
  price_note text,
  availability text not null check (availability in ('available', 'few', 'full', 'waitlist', 'restricted', 'unknown')),
  capacity integer check (capacity is null or capacity >= 0),
  remaining_places integer check (remaining_places is null or remaining_places >= 0),
  prerequisites text not null,
  description text not null,
  source_url text not null,
  source_label text not null,
  source_kind text not null check (source_kind in ('Calendrier', 'Réservation', 'Fiche club', 'Billetterie')),
  first_seen_at timestamptz not null,
  last_seen_at timestamptz not null,
  last_verified_at timestamptz not null,
  missing_success_count integer not null default 0 check (missing_success_count >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date >= start_date),
  check ((latitude is null and longitude is null) or (latitude between -90 and 90 and longitude between -180 and 180))
);

create table if not exists public.stage_sync_runs (
  id bigint generated always as identity primary key,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  state text not null default 'running' check (state in ('running', 'ok', 'partial', 'failed')),
  source_count integer not null default 0 check (source_count >= 0),
  successful_sources integer not null default 0 check (successful_sources >= 0),
  failed_sources integer not null default 0 check (failed_sources >= 0),
  stage_count integer not null default 0 check (stage_count >= 0),
  error text
);

create index if not exists stages_active_dates_idx
  on public.stages (active, start_date, end_date);
create index if not exists stages_language_idx
  on public.stages (language) where active;
create index if not exists stages_destination_country_idx
  on public.stages (destination_country) where active;
create index if not exists stages_source_idx
  on public.stages (source_id, active);
create index if not exists stages_coordinates_idx
  on public.stages (latitude, longitude) where active and latitude is not null;
create index if not exists stage_sources_active_idx
  on public.stage_sources (active, state);

alter table public.stage_sources enable row level security;
alter table public.stage_locations enable row level security;
alter table public.stages enable row level security;
alter table public.stage_sync_runs enable row level security;

revoke all on table public.stage_sources from anon, authenticated;
revoke all on table public.stage_locations from anon, authenticated;
revoke all on table public.stages from anon, authenticated;
revoke all on table public.stage_sync_runs from anon, authenticated;

grant all on table public.stage_sources to service_role;
grant all on table public.stage_locations to service_role;
grant all on table public.stages to service_role;
grant all on table public.stage_sync_runs to service_role;
grant usage, select on sequence public.stage_sync_runs_id_seq to service_role;
