"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { requireAdmin, requireCalendarManager } from "@/lib/auth";
import { getEvent, type ClubEvent } from "@/lib/club-events";
import { describeEventChanges, parseEventForm, type EventFormErrors } from "@/lib/event-form";
import {
  flushOutbox,
  NOTIFICATION_KINDS,
  notifyAccountReviewed,
  notifyEventChanged,
  notifyEventPublished,
  type NotificationKind,
} from "@/lib/notifications";
import { normalizeOffsets } from "@/lib/reminders";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export type EventFormState = { errors?: EventFormErrors; error?: string };
export type SimpleState = { ok?: string; error?: string; secret?: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function db() {
  return createAdminSupabaseClient();
}

function id(form: FormData, name = "id"): string {
  const value = String(form.get(name) ?? "");
  if (!UUID.test(value)) throw new Error("Identifiant invalide");
  return value;
}

function text(form: FormData, name: string, max = 300): string {
  const value = form.get(name);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function sendQueuedEmailsLater() {
  after(() => flushOutbox().then(() => undefined).catch((error) => console.error("Envoi des emails impossible", error)));
}

function revalidateCalendar(eventId?: string) {
  revalidatePath("/");
  revalidatePath("/calendrier.ics");
  revalidatePath("/espace");
  revalidatePath("/admin", "layout");
  if (eventId) revalidatePath(`/evenements/${eventId}`);
}

// ─── Événements ────────────────────────────────────────────────────────────

async function withPlaceDefaults<T extends { place_id: string | null; location_name: string; address: string }>(
  input: T,
): Promise<T> {
  if (!input.place_id) return input;
  const { data } = await db().from("places").select("name, address").eq("id", input.place_id).maybeSingle();
  if (!data) return { ...input, place_id: null };
  return {
    ...input,
    location_name: input.location_name || data.name,
    address: input.address || data.address,
  };
}

export async function createEvent(_: EventFormState, form: FormData): Promise<EventFormState> {
  const profile = await requireCalendarManager();
  const parsed = parseEventForm(form);
  if (!parsed.ok) return { errors: parsed.errors };

  const input = await withPlaceDefaults(parsed.value);
  const published = input.status === "published";
  const { data, error } = await db()
    .from("events")
    .insert({
      ...input,
      created_by: profile.id,
      updated_by: profile.id,
      published_at: published ? new Date().toISOString() : null,
    })
    .select("id")
    .single();
  if (error || !data) return { error: "L’enregistrement a échoué. Réessaie." };

  if (published) {
    const event = await getEvent(data.id);
    if (event) await notifyEventPublished(event);
    sendQueuedEmailsLater();
  }
  revalidateCalendar(data.id);
  redirect(`/admin/evenements/${data.id}?enregistre=${published ? "publie" : "brouillon"}`);
}

export async function updateEvent(_: EventFormState, form: FormData): Promise<EventFormState> {
  const profile = await requireCalendarManager();
  const eventId = id(form);
  const before = await getEvent(eventId);
  if (!before) return { error: "Cet événement n’existe plus." };

  const parsed = parseEventForm(form);
  if (!parsed.ok) return { errors: parsed.errors };
  const input = await withPlaceDefaults(parsed.value);

  // Un événement annulé reste annulé tant qu'on ne le rétablit pas.
  const status = before.status === "cancelled" ? "cancelled" : input.status;
  const firstPublication = status === "published" && !before.published_at;
  const { error } = await db()
    .from("events")
    .update({
      ...input,
      status,
      updated_by: profile.id,
      ...(firstPublication ? { published_at: new Date().toISOString() } : {}),
    })
    .eq("id", eventId);
  if (error) return { error: "L’enregistrement a échoué. Réessaie." };

  const after_ = await getEvent(eventId);
  if (after_) {
    if (firstPublication) {
      await notifyEventPublished(after_);
    } else if (before.status === "published" && status === "published" && form.get("notify") === "on") {
      const fields = describeEventChanges(before, input);
      if (fields.length > 0) await notifyEventChanged(after_, { cancelled: false, fields });
    }
    sendQueuedEmailsLater();
  }
  revalidateCalendar(eventId);
  redirect(`/admin/evenements/${eventId}?enregistre=${status === "draft" ? "brouillon" : "ok"}`);
}

export async function setEventCancelled(form: FormData) {
  const profile = await requireCalendarManager();
  const eventId = id(form);
  const cancel = form.get("cancel") === "1";
  const event = await getEvent(eventId);
  if (!event) redirect("/admin/evenements");

  await db()
    .from("events")
    .update({ status: cancel ? "cancelled" : "published", updated_by: profile.id })
    .eq("id", eventId);
  if (cancel && event.status === "published") {
    await notifyEventChanged({ ...event, status: "cancelled" } as ClubEvent, { cancelled: true, fields: [] });
    sendQueuedEmailsLater();
  }
  revalidateCalendar(eventId);
  redirect(`/admin/evenements/${eventId}?enregistre=${cancel ? "annule" : "retabli"}`);
}

export async function deleteEvent(form: FormData) {
  await requireCalendarManager();
  const eventId = id(form);
  if (form.get("confirm") !== "on") redirect(`/admin/evenements/${eventId}?erreur=confirmation`);
  await db().from("events").delete().eq("id", eventId);
  revalidateCalendar(eventId);
  redirect("/admin/evenements?supprime=1");
}

export async function removeRegistrant(form: FormData) {
  await requireCalendarManager();
  const eventId = id(form, "event_id");
  await db().from("event_registrations").delete().eq("event_id", eventId).eq("user_id", id(form, "user_id"));
  revalidateCalendar(eventId);
  redirect(`/admin/evenements/${eventId}#inscrits`);
}

export async function addRegistrant(form: FormData) {
  await requireCalendarManager();
  const eventId = id(form, "event_id");
  const userId = id(form, "user_id");
  // Ajout à la main (inscription par téléphone) : on ne bloque pas sur les places.
  await db().from("event_registrations").upsert({ event_id: eventId, user_id: userId }, { onConflict: "event_id,user_id" });
  revalidateCalendar(eventId);
  redirect(`/admin/evenements/${eventId}#inscrits`);
}

// ─── Lieux (gestionnaires) et types (admins) ───────────────────────────────

export async function savePlace(_: SimpleState, form: FormData): Promise<SimpleState> {
  await requireCalendarManager();
  const name = text(form, "name", 120);
  if (!name) return { error: "Donne un nom au lieu." };
  const lat = text(form, "latitude", 20);
  const lng = text(form, "longitude", 20);
  const latitude = lat ? Number(lat.replace(",", ".")) : null;
  const longitude = lng ? Number(lng.replace(",", ".")) : null;
  if ((latitude === null) !== (longitude === null) || (latitude !== null && (Number.isNaN(latitude) || Number.isNaN(longitude!)))) {
    return { error: "Indique la latitude et la longitude, ou aucune des deux." };
  }
  const row = { name, address: text(form, "address", 300), latitude, longitude };
  const placeId = String(form.get("id") ?? "");
  const { error } = UUID.test(placeId)
    ? await db().from("places").update(row).eq("id", placeId)
    : await db().from("places").insert(row);
  if (error) return { error: error.code === "23505" ? "Un lieu porte déjà ce nom." : "L’enregistrement a échoué." };
  revalidatePath("/admin/lieux");
  return { ok: "Lieu enregistré." };
}

export async function deletePlace(form: FormData) {
  await requireCalendarManager();
  await db().from("places").delete().eq("id", id(form));
  revalidatePath("/admin/lieux");
}

export async function saveEventType(_: SimpleState, form: FormData): Promise<SimpleState> {
  await requireAdmin();
  const name = text(form, "name", 60);
  const color = text(form, "color", 7);
  if (!name) return { error: "Donne un nom au type." };
  if (!/^#[0-9a-f]{6}$/i.test(color)) return { error: "Choisis une couleur." };
  const position = Number(text(form, "position", 4)) || 0;
  const typeId = String(form.get("id") ?? "");
  const { error } = UUID.test(typeId)
    ? await db().from("event_types").update({ name, color, position }).eq("id", typeId)
    : await db().from("event_types").insert({ name, color, position });
  if (error) return { error: error.code === "23505" ? "Ce type existe déjà." : "L’enregistrement a échoué." };
  revalidatePath("/admin/lieux");
  revalidateCalendar();
  return { ok: "Type enregistré." };
}

export async function deleteEventType(form: FormData) {
  await requireAdmin();
  await db().from("event_types").delete().eq("id", id(form));
  revalidatePath("/admin/lieux");
  revalidateCalendar();
}

// ─── Membres (admins) ──────────────────────────────────────────────────────

async function loadMember(memberId: string) {
  const { data } = await db().from("profiles").select("id, full_name, email, status").eq("id", memberId).maybeSingle();
  return data as { id: string; full_name: string; email: string; status: string } | null;
}

export async function reviewMember(form: FormData) {
  const admin = await requireAdmin();
  const memberId = id(form);
  const decision = String(form.get("decision"));
  const member = await loadMember(memberId);
  if (!member) redirect("/admin/membres");

  const status = ({ approve: "active", reject: "rejected", suspend: "suspended", reactivate: "active" } as const)[
    decision as "approve" | "reject" | "suspend" | "reactivate"
  ];
  if (!status) redirect("/admin/membres");
  if (memberId === admin.id && status !== "active") redirect("/admin/membres?erreur=soi-meme");

  await db()
    .from("profiles")
    .update({ status, reviewed_at: new Date().toISOString(), reviewed_by: admin.id })
    .eq("id", memberId);

  if (member.status === "pending" && (decision === "approve" || decision === "reject")) {
    await notifyAccountReviewed(member, decision === "approve");
    sendQueuedEmailsLater();
  }
  revalidatePath("/admin", "layout");
  redirect(`/admin/membres?vue=${status === "active" ? "membres" : status === "rejected" ? "refuses" : status === "suspended" ? "suspendus" : "attente"}`);
}

export async function updateMemberRights(form: FormData) {
  const admin = await requireAdmin();
  const memberId = id(form);
  const isSelf = memberId === admin.id;
  await db()
    .from("profiles")
    .update({
      can_manage_calendar: form.get("can_manage_calendar") === "on",
      can_view_stages: form.get("can_view_stages") === "on",
      // Un admin ne peut pas se retirer lui-même ses droits : le club resterait sans clés.
      is_admin: isSelf ? true : form.get("is_admin") === "on",
    })
    .eq("id", memberId);
  revalidatePath("/admin", "layout");
  redirect(`/admin/membres?vue=membres&enregistre=${memberId}#m-${memberId}`);
}

export async function resetMemberPassword(_: SimpleState, form: FormData): Promise<SimpleState> {
  await requireAdmin();
  const memberId = id(form);
  // Mot de passe provisoire lisible, à dicter ou envoyer par SMS.
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  const bytes = randomBytes(12);
  const secret = Array.from(bytes, (byte) => alphabet[byte % alphabet.length])
    .join("")
    .replace(/(.{4})(?=.)/g, "$1-");
  const { error } = await db().auth.admin.updateUserById(memberId, { password: secret });
  if (error) return { error: "Le changement a échoué." };
  return { ok: "Mot de passe provisoire créé. Donne-le à la personne : elle pourra le changer dans son espace.", secret };
}

export async function deleteMember(form: FormData) {
  const admin = await requireAdmin();
  const memberId = id(form);
  if (memberId === admin.id) redirect("/admin/membres?erreur=soi-meme");
  if (form.get("confirm") !== "on") redirect(`/admin/membres?vue=tous&erreur=confirmation#m-${memberId}`);
  await db().auth.admin.deleteUser(memberId);
  revalidatePath("/admin", "layout");
  redirect("/admin/membres?supprime=1");
}

// ─── Alertes (admins) ──────────────────────────────────────────────────────

export async function updateNotificationSettings(_: SimpleState, form: FormData): Promise<SimpleState> {
  await requireAdmin();
  const extra = text(form, "extra_recipients", 2000)
    .split(/[\s,;]+/)
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  const invalid = extra.find((email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
  if (invalid) return { error: `Cet email n’est pas valide : ${invalid}` };
  const offsets = normalizeOffsets(form.getAll("offsets_hours"));

  const rows = NOTIFICATION_KINDS.map((kind: NotificationKind) => ({
    kind,
    enabled: form.get(`enabled_${kind}`) === "on",
    config:
      kind === "signup_pending"
        ? { extra_recipients: Array.from(new Set(extra)) }
        : kind === "event_reminder"
          ? { offsets_hours: offsets }
          : {},
    updated_at: new Date().toISOString(),
  }));
  const { error } = await db().from("notification_settings").upsert(rows, { onConflict: "kind" });
  if (error) return { error: "L’enregistrement a échoué." };
  revalidatePath("/admin/alertes");
  return { ok: "Réglages enregistrés." };
}

export async function sendQueuedEmailsNow() {
  await requireAdmin();
  await flushOutbox(100);
  revalidatePath("/admin/alertes");
}

export async function retryFailedEmails() {
  await requireAdmin();
  await db().from("email_outbox").update({ status: "pending", attempts: 0 }).eq("status", "failed");
  revalidatePath("/admin/alertes");
}
