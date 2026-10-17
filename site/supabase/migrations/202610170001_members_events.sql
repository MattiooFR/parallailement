-- Comptes membres, droits, événements du club, inscriptions et alertes email.
-- Tout passe par le serveur Next (clé service_role) après vérification de la
-- session : RLS activée partout, aucun accès pour anon / authenticated.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  phone text,
  status text not null default 'pending'
    check (status in ('pending', 'active', 'rejected', 'suspended')),
  is_admin boolean not null default false,
  can_manage_calendar boolean not null default false,
  can_view_stages boolean not null default false,
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_status_idx on public.profiles (status, created_at);

create table if not exists public.event_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  color text not null default '#065f46' check (color ~ '^#[0-9a-fA-F]{6}$'),
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.places (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  address text not null default '',
  latitude double precision,
  longitude double precision,
  created_at timestamptz not null default now(),
  check ((latitude is null and longitude is null) or (latitude between -90 and 90 and longitude between -180 and 180))
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  type_id uuid references public.event_types(id) on delete set null,
  title text not null check (length(title) between 1 and 200),
  description text not null default '',
  starts_at timestamptz not null,
  ends_at timestamptz,
  all_day boolean not null default false,
  place_id uuid references public.places(id) on delete set null,
  location_name text not null default '',
  address text not null default '',
  visibility text not null default 'public' check (visibility in ('public', 'members')),
  status text not null default 'published' check (status in ('draft', 'published', 'cancelled')),
  registrations_enabled boolean not null default true,
  capacity integer check (capacity is null or capacity > 0),
  registration_deadline timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or ends_at >= starts_at)
);

create index if not exists events_listing_idx on public.events (status, visibility, starts_at);

create table if not exists public.event_registrations (
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

create index if not exists event_registrations_user_idx on public.event_registrations (user_id);

-- Réglages des alertes, une ligne par type d'alerte.
create table if not exists public.notification_settings (
  kind text primary key check (kind in (
    'signup_pending', 'account_reviewed', 'event_published', 'event_reminder', 'event_changed'
  )),
  enabled boolean not null default true,
  -- signup_pending : { "extra_recipients": ["bureau@…"] } ; event_reminder : { "offsets_hours": [24] }
  config jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.notification_settings (kind, enabled, config) values
  ('signup_pending', true, '{"extra_recipients": []}'),
  ('account_reviewed', true, '{}'),
  ('event_published', true, '{}'),
  ('event_reminder', true, '{"offsets_hours": [24]}'),
  ('event_changed', true, '{}')
on conflict (kind) do nothing;

-- Préférences de chaque membre (absence de ligne = alerte reçue).
create table if not exists public.notification_preferences (
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null references public.notification_settings(kind) on delete cascade,
  enabled boolean not null,
  primary key (user_id, kind)
);

-- File d'envoi. dedupe_key évite d'envoyer deux fois le même rappel.
create table if not exists public.email_outbox (
  id bigint generated always as identity primary key,
  kind text not null,
  to_email text not null,
  subject text not null,
  body_text text not null,
  dedupe_key text unique,
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed')),
  attempts integer not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create index if not exists email_outbox_pending_idx on public.email_outbox (status, created_at);

insert into public.event_types (name, color, position) values
  ('Vie du club', '#065f46', 0),
  ('Stage Voler Mieux', '#b45309', 1),
  ('Sortie', '#1d4ed8', 2),
  ('Compétition', '#9f1239', 3),
  ('Réunion / AG', '#57534e', 4),
  ('Journée biplace', '#7c3aed', 5)
on conflict (name) do nothing;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
for each row execute function public.touch_updated_at();

drop trigger if exists events_touch on public.events;
create trigger events_touch before update on public.events
for each row execute function public.touch_updated_at();

-- Chaque compte GoTrue reçoit son profil « en attente ».
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone)
  values (
    new.id,
    coalesce(new.email, ''),
    left(coalesce(new.raw_user_meta_data ->> 'full_name', ''), 120),
    nullif(left(coalesce(new.raw_user_meta_data ->> 'phone', ''), 40), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.sync_profile_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email is distinct from old.email then
    update public.profiles set email = coalesce(new.email, '') where id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_changed on auth.users;
create trigger on_auth_user_email_changed
after update of email on auth.users
for each row execute function public.sync_profile_email();

-- Inscription atomique : vérifie places et date limite sous verrou.
create or replace function public.register_for_event(p_event_id uuid, p_user_id uuid)
returns text
language plpgsql
set search_path = public
as $$
declare
  ev public.events%rowtype;
  taken integer;
begin
  select * into ev from public.events where id = p_event_id for update;
  if not found or ev.status <> 'published' then
    return 'unavailable';
  end if;
  if not ev.registrations_enabled then
    return 'closed';
  end if;
  if ev.registration_deadline is not null and ev.registration_deadline < now() then
    return 'closed';
  end if;
  if coalesce(ev.ends_at, ev.starts_at) < now() then
    return 'closed';
  end if;
  if exists (select 1 from public.event_registrations where event_id = p_event_id and user_id = p_user_id) then
    return 'already';
  end if;
  if ev.capacity is not null then
    select count(*) into taken from public.event_registrations where event_id = p_event_id;
    if taken >= ev.capacity then
      return 'full';
    end if;
  end if;
  insert into public.event_registrations (event_id, user_id) values (p_event_id, p_user_id);
  return 'ok';
end;
$$;

alter table public.profiles enable row level security;
alter table public.event_types enable row level security;
alter table public.places enable row level security;
alter table public.events enable row level security;
alter table public.event_registrations enable row level security;
alter table public.notification_settings enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.email_outbox enable row level security;

revoke all on table public.profiles, public.event_types, public.places, public.events,
  public.event_registrations, public.notification_settings, public.notification_preferences,
  public.email_outbox from anon, authenticated;
revoke all on function public.touch_updated_at() from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.sync_profile_email() from public, anon, authenticated;
revoke all on function public.register_for_event(uuid, uuid) from public, anon, authenticated;

grant all on table public.profiles, public.event_types, public.places, public.events,
  public.event_registrations, public.notification_settings, public.notification_preferences,
  public.email_outbox to service_role;
grant usage, select on sequence public.email_outbox_id_seq to service_role;
grant execute on function public.register_for_event(uuid, uuid) to service_role;
