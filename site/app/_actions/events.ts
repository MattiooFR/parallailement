"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { canSeeEvent, isActiveMember, safeNextPath } from "@/lib/access";
import { getCurrentProfile } from "@/lib/auth";
import { getEvent } from "@/lib/club-events";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

const messages: Record<string, string> = {
  ok: "inscrit",
  already: "inscrit",
  full: "complet",
  closed: "ferme",
  unavailable: "indisponible",
};

function backTo(form: FormData, fallback: string): string {
  return safeNextPath(form.get("retour"), fallback).split(/[?#]/)[0];
}

export async function registerForEvent(form: FormData) {
  const eventId = String(form.get("event_id") ?? "");
  const profile = await getCurrentProfile();
  if (!profile) redirect(`/connexion?suite=${encodeURIComponent(`/evenements/${eventId}`)}`);
  if (!isActiveMember(profile)) redirect("/espace");

  const event = await getEvent(eventId);
  if (!event || !canSeeEvent(profile, event)) redirect("/espace");

  const { data, error } = await createAdminSupabaseClient().rpc("register_for_event", {
    p_event_id: event.id,
    p_user_id: profile.id,
  });
  if (error) throw error;

  revalidatePath("/");
  revalidatePath(`/evenements/${event.id}`);
  const back = backTo(form, `/evenements/${event.id}`);
  redirect(`${back}?inscription=${messages[String(data)] ?? "indisponible"}#e-${event.id}`);
}

export async function unregisterFromEvent(form: FormData) {
  const eventId = String(form.get("event_id") ?? "");
  const profile = await getCurrentProfile();
  if (!profile) redirect("/connexion");

  const event = await getEvent(eventId);
  if (!event) redirect("/espace");

  const { error } = await createAdminSupabaseClient()
    .from("event_registrations")
    .delete()
    .eq("event_id", event.id)
    .eq("user_id", profile.id);
  if (error) throw error;

  revalidatePath("/");
  revalidatePath(`/evenements/${event.id}`);
  const back = backTo(form, `/evenements/${event.id}`);
  redirect(`${back}?inscription=desinscrit#e-${event.id}`);
}
