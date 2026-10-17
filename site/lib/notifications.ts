import "server-only";

import type { ClubEvent } from "./club-events";
import {
  accountReviewedEmail,
  eventChangedEmail,
  eventPublishedEmail,
  eventReminderEmail,
  signupPendingEmail,
  type EmailContent,
} from "./email-templates";
import { dueReminders, normalizeOffsets } from "./reminders";
import { createAdminSupabaseClient } from "./supabase/admin";

export type NotificationKind =
  | "signup_pending"
  | "account_reviewed"
  | "event_published"
  | "event_reminder"
  | "event_changed";

export type NotificationSetting = {
  kind: NotificationKind;
  enabled: boolean;
  config: { extra_recipients?: string[]; offsets_hours?: number[] };
};

export const notificationLabels: Record<NotificationKind, { title: string; audience: string; memberCanMute: boolean }> = {
  signup_pending: { title: "Nouvelle inscription à valider", audience: "Les admins", memberCanMute: true },
  account_reviewed: { title: "Compte validé ou refusé", audience: "La personne concernée", memberCanMute: false },
  event_published: { title: "Nouvel événement publié", audience: "Tous les membres", memberCanMute: true },
  event_reminder: { title: "Rappel avant un événement", audience: "Les inscrits", memberCanMute: true },
  event_changed: { title: "Événement modifié ou annulé", audience: "Les inscrits", memberCanMute: true },
};

export const NOTIFICATION_KINDS = Object.keys(notificationLabels) as NotificationKind[];

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://parallailement.fr").replace(/\/$/, "");
}

export function isEmailDeliveryConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

function db() {
  return createAdminSupabaseClient();
}

export async function getNotificationSettings(): Promise<Map<NotificationKind, NotificationSetting>> {
  const { data, error } = await db()
    .from("notification_settings")
    .select("kind, enabled, config")
    .returns<NotificationSetting[]>();
  if (error) throw error;
  return new Map((data ?? []).map((setting) => [setting.kind, setting]));
}

async function mutedUserIds(kind: NotificationKind): Promise<Set<string>> {
  const { data, error } = await db()
    .from("notification_preferences")
    .select("user_id")
    .eq("kind", kind)
    .eq("enabled", false);
  if (error) throw error;
  return new Set((data ?? []).map((row) => row.user_id));
}

type Recipient = { id: string; email: string };

async function enqueue(
  kind: NotificationKind,
  messages: Array<{ to: string; content: EmailContent; dedupeKey?: string }>,
) {
  const rows = messages
    .filter((message) => message.to.includes("@"))
    .map((message) => ({
      kind,
      to_email: message.to,
      subject: message.content.subject,
      body_text: message.content.text,
      dedupe_key: message.dedupeKey ?? null,
    }));
  if (rows.length === 0) return;
  const { error } = await db()
    .from("email_outbox")
    .upsert(rows, { onConflict: "dedupe_key", ignoreDuplicates: true });
  if (error) throw error;
}

async function activeMembers(filter?: { admins?: boolean }): Promise<Recipient[]> {
  let query = db().from("profiles").select("id, email").eq("status", "active");
  if (filter?.admins) query = query.eq("is_admin", true);
  const { data, error } = await query.returns<Recipient[]>();
  if (error) throw error;
  return data ?? [];
}

async function registrantsOf(eventId: string): Promise<Recipient[]> {
  const { data, error } = await db()
    .from("event_registrations")
    .select("profiles(id, email, status)")
    .eq("event_id", eventId)
    .returns<Array<{ profiles: (Recipient & { status: string }) | null }>>();
  if (error) throw error;
  return (data ?? [])
    .map((row) => row.profiles)
    .filter((profile): profile is Recipient & { status: string } => profile?.status === "active");
}

async function settingFor(kind: NotificationKind): Promise<NotificationSetting | null> {
  const setting = (await getNotificationSettings()).get(kind);
  return setting?.enabled ? setting : null;
}

// Les alertes ne doivent jamais faire échouer l'action qui les déclenche.
async function safely(label: string, task: () => Promise<void>) {
  try {
    await task();
  } catch (error) {
    console.error(`Alerte « ${label} » non mise en file`, error);
  }
}

export function notifySignupPending(member: { id: string; full_name: string; email: string }) {
  return safely("signup_pending", async () => {
    const setting = await settingFor("signup_pending");
    if (!setting) return;
    const muted = await mutedUserIds("signup_pending");
    const admins = (await activeMembers({ admins: true })).filter((admin) => !muted.has(admin.id));
    const extra = (setting.config.extra_recipients ?? []).filter((email) => typeof email === "string");
    const recipients = Array.from(new Set([...admins.map((admin) => admin.email), ...extra]));
    const content = signupPendingEmail(member, siteUrl());
    await enqueue(
      "signup_pending",
      recipients.map((to) => ({ to, content, dedupeKey: `signup:${member.id}:${to}` })),
    );
  });
}

export function notifyAccountReviewed(member: { id: string; full_name: string; email: string }, approved: boolean) {
  return safely("account_reviewed", async () => {
    if (!(await settingFor("account_reviewed"))) return;
    await enqueue("account_reviewed", [
      {
        to: member.email,
        content: accountReviewedEmail(member, approved, siteUrl()),
        dedupeKey: `reviewed:${member.id}:${approved ? "ok" : "no"}:${new Date().toISOString().slice(0, 13)}`,
      },
    ]);
  });
}

export function notifyEventPublished(event: ClubEvent) {
  return safely("event_published", async () => {
    if (!(await settingFor("event_published"))) return;
    const muted = await mutedUserIds("event_published");
    const content = eventPublishedEmail(event, siteUrl());
    const members = (await activeMembers()).filter((member) => !muted.has(member.id));
    await enqueue(
      "event_published",
      members.map((member) => ({ to: member.email, content, dedupeKey: `published:${event.id}:${member.id}` })),
    );
  });
}

export function notifyEventChanged(event: ClubEvent, change: { cancelled: boolean; fields: string[] }) {
  return safely("event_changed", async () => {
    if (!(await settingFor("event_changed"))) return;
    const muted = await mutedUserIds("event_changed");
    const content = eventChangedEmail(event, change, siteUrl());
    const stamp = change.cancelled ? "cancelled" : event.updated_at;
    const registrants = (await registrantsOf(event.id)).filter((member) => !muted.has(member.id));
    await enqueue(
      "event_changed",
      registrants.map((member) => ({ to: member.email, content, dedupeKey: `changed:${event.id}:${member.id}:${stamp}` })),
    );
  });
}

export async function queueDueReminders(now = new Date()): Promise<number> {
  const setting = await settingFor("event_reminder");
  if (!setting) return 0;
  const offsets = normalizeOffsets(setting.config.offsets_hours);
  if (offsets.length === 0) return 0;

  const horizon = new Date(now.getTime() + offsets[offsets.length - 1] * 3_600_000).toISOString();
  const { data: events, error } = await db()
    .from("events")
    .select("id, title, starts_at, ends_at, all_day, location_name, address")
    .eq("status", "published")
    .gt("starts_at", now.toISOString())
    .lte("starts_at", horizon)
    .returns<Array<Pick<ClubEvent, "id" | "title" | "starts_at" | "ends_at" | "all_day" | "location_name" | "address">>>();
  if (error) throw error;
  if (!events?.length) return 0;

  const { data: registrations, error: registrationError } = await db()
    .from("event_registrations")
    .select("event_id, user_id, profiles(email, status)")
    .in(
      "event_id",
      events.map((event) => event.id),
    )
    .returns<Array<{ event_id: string; user_id: string; profiles: { email: string; status: string } | null }>>();
  if (registrationError) throw registrationError;

  const muted = await mutedUserIds("event_reminder");
  const active = (registrations ?? []).filter(
    (row) => row.profiles?.status === "active" && !muted.has(row.user_id),
  );
  const emails = new Map(active.map((row) => [row.user_id, row.profiles!.email]));
  const byId = new Map(events.map((event) => [event.id, event]));
  const due = dueReminders(events, active, offsets, now);

  await enqueue(
    "event_reminder",
    due.map((reminder) => ({
      to: emails.get(reminder.user_id) ?? "",
      content: eventReminderEmail(byId.get(reminder.event_id)!, reminder.offset_hours, siteUrl()),
      dedupeKey: reminder.dedupe_key,
    })),
  );
  return due.length;
}

// Envoie la file par l'API Resend. Sans clé, les emails attendent.
export async function flushOutbox(limit = 50): Promise<{ sent: number; failed: number; skipped: boolean }> {
  if (!isEmailDeliveryConfigured()) return { sent: 0, failed: 0, skipped: true };
  const { data, error } = await db()
    .from("email_outbox")
    .select("id, to_email, subject, body_text, attempts")
    .eq("status", "pending")
    .lt("attempts", 5)
    .order("created_at")
    .limit(limit);
  if (error) throw error;

  let sent = 0;
  let failed = 0;
  for (const message of data ?? []) {
    let failure: string | null = null;
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM,
          to: [message.to_email],
          subject: message.subject,
          text: message.body_text,
          ...(process.env.EMAIL_REPLY_TO ? { reply_to: process.env.EMAIL_REPLY_TO } : {}),
        }),
      });
      if (!response.ok) failure = `HTTP ${response.status} ${(await response.text()).slice(0, 300)}`;
    } catch (sendError) {
      failure = sendError instanceof Error ? sendError.message : "Erreur inconnue";
    }

    const attempts = message.attempts + 1;
    await db()
      .from("email_outbox")
      .update(
        failure
          ? { attempts, last_error: failure, status: attempts >= 5 ? "failed" : "pending" }
          : { attempts, status: "sent", sent_at: new Date().toISOString(), last_error: null },
      )
      .eq("id", message.id);
    if (failure) failed += 1;
    else sent += 1;
  }
  return { sent, failed, skipped: false };
}
