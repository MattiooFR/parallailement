import { requireAdmin } from "@/lib/auth";
import {
  getNotificationSettings,
  isEmailDeliveryConfigured,
  NOTIFICATION_KINDS,
  notificationLabels,
} from "@/lib/notifications";
import { formatDateTime } from "@/lib/paris-time";
import { normalizeOffsets } from "@/lib/reminders";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { retryFailedEmails, sendQueuedEmailsNow } from "@/app/admin/actions";
import { SubmitButton } from "@/app/_components/ui";
import { NotificationSettingsForm } from "./settings-form";

const statusLabels: Record<string, string> = { pending: "En attente", sent: "Envoyé", failed: "Échec" };

export default async function AlertsPage() {
  await requireAdmin("/admin/alertes");
  const db = createAdminSupabaseClient();
  const [settings, outbox, pendingCount, failedCount] = await Promise.all([
    getNotificationSettings(),
    db
      .from("email_outbox")
      .select("id, kind, to_email, subject, status, created_at, sent_at, last_error")
      .order("created_at", { ascending: false })
      .limit(40)
      .then(({ data }) => data ?? []),
    db.from("email_outbox").select("id", { count: "exact", head: true }).eq("status", "pending").then(({ count }) => count ?? 0),
    db.from("email_outbox").select("id", { count: "exact", head: true }).eq("status", "failed").then(({ count }) => count ?? 0),
  ]);
  const configured = isEmailDeliveryConfigured();

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <section>
        <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">Alertes email</h1>
        <p className="mt-2 text-stone-600">
          Active ou coupe chaque alerte pour tout le club. Chaque membre peut aussi couper les siennes dans son espace.
        </p>
        <div className="mt-6">
          <NotificationSettingsForm
            settings={NOTIFICATION_KINDS.map((kind) => ({
              kind,
              title: notificationLabels[kind].title,
              audience: notificationLabels[kind].audience,
              enabled: settings.get(kind)?.enabled ?? true,
            }))}
            extraRecipients={settings.get("signup_pending")?.config.extra_recipients ?? []}
            offsets={normalizeOffsets(settings.get("event_reminder")?.config.offsets_hours ?? [24])}
          />
        </div>
      </section>

      <section>
        <h2 className="font-serif text-3xl">File d’envoi</h2>
        {configured ? (
          <p className="mt-2 text-sm text-stone-600">
            Les emails partent tout de suite, et une tâche repasse toutes les heures pour les rappels et les échecs.
          </p>
        ) : (
          <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm leading-relaxed text-stone-800">
            <p className="font-medium">L’envoi n’est pas encore branché.</p>
            <p className="mt-1">
              Les emails sont préparés et attendent ici. Ils partiront dès que les variables <code>SMARTLETTER_API_KEY</code> et{" "}
              <code>EMAIL_FROM</code> seront ajoutées sur Vercel.
            </p>
          </div>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          <span>
            {pendingCount} en attente · {failedCount} en échec
          </span>
          {configured && pendingCount > 0 && (
            <form action={sendQueuedEmailsNow}>
              <SubmitButton variant="secondary" pendingLabel="Envoi…">Envoyer maintenant</SubmitButton>
            </form>
          )}
          {configured && failedCount > 0 && (
            <form action={retryFailedEmails}>
              <SubmitButton variant="quiet">Réessayer les échecs</SubmitButton>
            </form>
          )}
        </div>
        {outbox.length === 0 ? (
          <p className="mt-6 text-sm text-stone-500">Aucun email pour l’instant.</p>
        ) : (
          <ul className="mt-6 divide-y divide-stone-200 rounded-2xl border border-stone-300 bg-white text-sm">
            {outbox.map((message) => (
              <li key={message.id} className="px-4 py-3">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="min-w-0 truncate font-medium">{message.subject}</p>
                  <span
                    className={`shrink-0 text-xs ${message.status === "sent" ? "text-emerald-800" : message.status === "failed" ? "text-rose-800" : "text-amber-800"}`}
                  >
                    {statusLabels[message.status] ?? message.status}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-stone-500">
                  {message.to_email} · {formatDateTime(message.sent_at ?? message.created_at)}
                </p>
                {message.last_error && <p className="mt-1 truncate text-xs text-rose-800">{message.last_error}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
