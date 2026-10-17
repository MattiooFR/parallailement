import Link from "next/link";
import { isAdmin } from "@/lib/access";
import { requireCalendarManager } from "@/lib/auth";
import { listUpcomingEvents } from "@/lib/club-events";
import { isEmailDeliveryConfigured } from "@/lib/notifications";
import { formatEventWhen } from "@/lib/paris-time";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { participantsLabel } from "@/app/_components/event-list";

export default async function AdminHome() {
  const profile = await requireCalendarManager();
  const admin = isAdmin(profile);
  const db = createAdminSupabaseClient();

  const [events, pending, members, outbox] = await Promise.all([
    listUpcomingEvents({ includeMembersOnly: true, includeDrafts: true, limit: 50 }),
    admin
      ? db.from("profiles").select("id, full_name, email, created_at", { count: "exact" }).eq("status", "pending").order("created_at").limit(5)
      : Promise.resolve({ data: [], count: 0 }),
    admin
      ? db.from("profiles").select("id", { count: "exact", head: true }).eq("status", "active")
      : Promise.resolve({ count: null }),
    admin
      ? db.from("email_outbox").select("id", { count: "exact", head: true }).eq("status", "pending")
      : Promise.resolve({ count: null }),
  ]);

  const drafts = events.filter((event) => event.status === "draft");
  const next = events.filter((event) => event.status !== "draft").slice(0, 5);
  const pendingList = (pending.data ?? []) as Array<{ id: string; full_name: string; email: string }>;

  const stats = [
    { label: "Événements à venir", value: events.length - drafts.length, href: "/admin/evenements" },
    { label: "Brouillons", value: drafts.length, href: "/admin/evenements" },
    ...(admin
      ? [
          { label: "Membres validés", value: members.count ?? 0, href: "/admin/membres?vue=membres" },
          { label: "Comptes à valider", value: pending.count ?? 0, href: "/admin/membres" },
        ]
      : []),
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">Tableau de bord</h1>
        <Link
          href="/admin/evenements/nouveau"
          className="inline-flex min-h-11 items-center rounded-full bg-emerald-950 px-5 text-sm font-medium text-emerald-50 transition hover:bg-emerald-900"
        >
          + Créer un événement
        </Link>
      </div>

      <dl className="mt-8 grid grid-cols-2 bg-amber-300 sm:grid-cols-4">
        {stats.map((stat, index) => (
          <Link
            key={stat.label}
            href={stat.href}
            className={`px-5 py-5 transition hover:bg-amber-200 ${index > 0 ? "border-stone-900/15 sm:border-l" : ""} ${index > 1 ? "border-t sm:border-t-0" : ""} ${index % 2 === 1 ? "border-l" : ""}`}
          >
            <dd className="font-serif text-4xl">{stat.value}</dd>
            <dt className="mt-1 text-xs uppercase tracking-[0.14em]">{stat.label}</dt>
          </Link>
        ))}
      </dl>

      {admin && !isEmailDeliveryConfigured() && (
        <p className="mt-6 rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-700">
          L’envoi d’emails n’est pas encore branché.{" "}
          {outbox.count ? `${outbox.count} email${outbox.count > 1 ? "s" : ""} attend${outbox.count > 1 ? "ent" : ""} dans la file. ` : ""}
          <Link href="/admin/alertes" className="font-medium text-emerald-900 underline underline-offset-4">
            Voir les alertes
          </Link>
        </p>
      )}

      <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section>
          <h2 className="font-serif text-2xl">Prochaines dates</h2>
          {next.length === 0 ? (
            <p className="mt-4 text-stone-600">Aucun événement publié à venir.</p>
          ) : (
            <ul className="mt-4 divide-y divide-stone-300 border-y border-stone-300">
              {next.map((event) => (
                <li key={event.id}>
                  <Link href={`/admin/evenements/${event.id}`} className="block py-4 transition hover:bg-white/60">
                    <span className="block font-medium">
                      {event.title}
                      {event.status === "cancelled" && <span className="ml-2 text-xs text-rose-800">annulé</span>}
                    </span>
                    <span className="mt-0.5 block text-sm text-stone-600 first-letter:uppercase">{formatEventWhen(event)}</span>
                    {event.registrations_enabled && (
                      <span className="mt-0.5 block text-sm text-stone-500">{participantsLabel(event)}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {drafts.length > 0 && (
            <>
              <h3 className="mt-8 text-sm font-medium uppercase tracking-[0.14em] text-stone-500">Brouillons</h3>
              <ul className="mt-2 space-y-1">
                {drafts.map((event) => (
                  <li key={event.id}>
                    <Link href={`/admin/evenements/${event.id}`} className="text-emerald-900 underline-offset-4 hover:underline">
                      {event.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        {admin && (
          <section>
            <h2 className="font-serif text-2xl">À valider</h2>
            {pendingList.length === 0 ? (
              <p className="mt-4 text-stone-600">Aucun compte en attente.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {pendingList.map((member) => (
                  <li key={member.id} className="rounded-xl bg-white px-4 py-3 shadow-sm">
                    <span className="block font-medium">{member.full_name || "Sans nom"}</span>
                    <span className="block text-sm text-stone-500">{member.email}</span>
                  </li>
                ))}
              </ul>
            )}
            {pendingList.length > 0 && (
              <Link href="/admin/membres" className="mt-4 inline-block text-sm font-medium text-emerald-900 underline underline-offset-4">
                Valider les inscriptions →
              </Link>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
