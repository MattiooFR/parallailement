import "server-only";

import type { EventStatus, EventVisibility } from "./access";
import { createAdminSupabaseClient } from "./supabase/admin";

export type EventType = { id: string; name: string; color: string; position: number };
export type Place = {
  id: string;
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
};

export type ClubEvent = {
  id: string;
  type_id: string | null;
  title: string;
  description: string;
  starts_at: string;
  ends_at: string | null;
  all_day: boolean;
  place_id: string | null;
  location_name: string;
  address: string;
  visibility: EventVisibility;
  status: EventStatus;
  registrations_enabled: boolean;
  capacity: number | null;
  registration_deadline: string | null;
  published_at: string | null;
  updated_at: string;
  event_types: { name: string; color: string } | null;
};

export type ClubEventWithCount = ClubEvent & { participant_count: number };

export const EVENT_COLUMNS =
  "id, type_id, title, description, starts_at, ends_at, all_day, place_id, location_name, address, visibility, status, registrations_enabled, capacity, registration_deadline, published_at, updated_at, event_types(name, color)";

function db() {
  return createAdminSupabaseClient();
}

// Un événement reste « à venir » tant qu'il n'est pas terminé.
function upcomingFilter(now = new Date()): string {
  const dayStart = new Date(now.getTime() - 12 * 3_600_000).toISOString();
  return `ends_at.gte.${now.toISOString()},and(ends_at.is.null,starts_at.gte.${dayStart})`;
}

export async function withParticipantCounts(events: ClubEvent[]): Promise<ClubEventWithCount[]> {
  if (events.length === 0) return [];
  const { data, error } = await db()
    .from("event_registrations")
    .select("event_id")
    .in(
      "event_id",
      events.map((event) => event.id),
    );
  if (error) throw error;
  const counts = new Map<string, number>();
  for (const row of data ?? []) counts.set(row.event_id, (counts.get(row.event_id) ?? 0) + 1);
  return events.map((event) => ({ ...event, participant_count: counts.get(event.id) ?? 0 }));
}

export async function listUpcomingEvents(options: {
  includeMembersOnly: boolean;
  includeDrafts?: boolean;
  limit?: number;
}): Promise<ClubEventWithCount[]> {
  let query = db()
    .from("events")
    .select(EVENT_COLUMNS)
    .or(upcomingFilter())
    .in("status", options.includeDrafts ? ["draft", "published", "cancelled"] : ["published", "cancelled"])
    .order("starts_at", { ascending: true })
    .limit(options.limit ?? 200);
  if (!options.includeMembersOnly) query = query.eq("visibility", "public");
  const { data, error } = await query.returns<ClubEvent[]>();
  if (error) throw error;
  return withParticipantCounts(data ?? []);
}

export async function listPastEvents(limit = 50): Promise<ClubEventWithCount[]> {
  const now = new Date().toISOString();
  const { data, error } = await db()
    .from("events")
    .select(EVENT_COLUMNS)
    .lt("starts_at", now)
    .or(`ends_at.lt.${now},ends_at.is.null`)
    .order("starts_at", { ascending: false })
    .limit(limit)
    .returns<ClubEvent[]>();
  if (error) throw error;
  return withParticipantCounts(data ?? []);
}

// Page d'accueil : jamais d'erreur visible, au pire une liste vide.
export async function listPublicEventsSafely(limit = 12): Promise<ClubEventWithCount[]> {
  try {
    return await listUpcomingEvents({ includeMembersOnly: false, limit });
  } catch (error) {
    console.error("Lecture du calendrier impossible", error);
    return [];
  }
}

export async function getEvent(id: string): Promise<ClubEvent | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data, error } = await db()
    .from("events")
    .select(EVENT_COLUMNS)
    .eq("id", id)
    .maybeSingle<ClubEvent>();
  if (error) throw error;
  return data;
}

export type Registrant = {
  user_id: string;
  created_at: string;
  profiles: { full_name: string; email: string; phone: string | null } | null;
};

export async function listRegistrants(eventId: string): Promise<Registrant[]> {
  const { data, error } = await db()
    .from("event_registrations")
    .select("user_id, created_at, profiles(full_name, email, phone)")
    .eq("event_id", eventId)
    .order("created_at", { ascending: true })
    .returns<Registrant[]>();
  if (error) throw error;
  return data ?? [];
}

export async function listRegisteredEventIds(userId: string): Promise<Set<string>> {
  const { data, error } = await db()
    .from("event_registrations")
    .select("event_id")
    .eq("user_id", userId);
  if (error) throw error;
  return new Set((data ?? []).map((row) => row.event_id));
}

export async function listEventTypes(): Promise<EventType[]> {
  const { data, error } = await db()
    .from("event_types")
    .select("id, name, color, position")
    .order("position")
    .order("name")
    .returns<EventType[]>();
  if (error) throw error;
  return data ?? [];
}

export async function listPlaces(): Promise<Place[]> {
  const { data, error } = await db()
    .from("places")
    .select("id, name, address, latitude, longitude")
    .order("name")
    .returns<Place[]>();
  if (error) throw error;
  return data ?? [];
}

export function registrationState(
  event: Pick<ClubEvent, "status" | "registrations_enabled" | "registration_deadline" | "starts_at" | "ends_at" | "capacity">,
  participantCount: number,
  now = new Date(),
): "open" | "full" | "closed" | "cancelled" | "disabled" {
  if (event.status === "cancelled") return "cancelled";
  if (!event.registrations_enabled) return "disabled";
  if (event.registration_deadline && new Date(event.registration_deadline) < now) return "closed";
  if (new Date(event.ends_at ?? event.starts_at) < now) return "closed";
  if (event.capacity !== null && participantCount >= event.capacity) return "full";
  return "open";
}
