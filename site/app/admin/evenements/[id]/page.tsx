import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCalendarManager } from "@/lib/auth";
import { getEvent, listEventTypes, listPlaces, listRegistrants } from "@/lib/club-events";
import { formatDateTime } from "@/lib/paris-time";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { addRegistrant, deleteEvent, removeRegistrant, setEventCancelled, updateEvent } from "@/app/admin/actions";
import { SubmitButton } from "@/app/_components/ui";
import { EventForm } from "../event-form";
import { eventToDefaults } from "../defaults";

const savedNotices: Record<string, string> = {
  publie: "Événement publié. Il est visible dans le calendrier.",
  brouillon: "Brouillon enregistré. Personne d’autre ne le voit encore.",
  ok: "Modifications enregistrées.",
  annule: "Événement annulé. Les inscrits sont prévenus si les alertes sont actives.",
  retabli: "Événement rétabli.",
};

export default async function EditEventPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ enregistre?: string; erreur?: string }>;
}) {
  const { id } = await params;
  await requireCalendarManager(`/admin/evenements/${id}`);
  const { enregistre, erreur } = await searchParams;
  const event = await getEvent(id);
  if (!event) notFound();

  const [types, places, registrants, members] = await Promise.all([
    listEventTypes(),
    listPlaces(),
    listRegistrants(event.id),
    createAdminSupabaseClient()
      .from("profiles")
      .select("id, full_name, email")
      .eq("status", "active")
      .order("full_name")
      .then(({ data }) => (data ?? []) as Array<{ id: string; full_name: string; email: string }>),
  ]);
  const registeredIds = new Set(registrants.map((row) => row.user_id));
  const addable = members.filter((member) => !registeredIds.has(member.id));

  return (
    <div>
      <Link href="/admin/evenements" className="text-sm text-stone-500 hover:text-stone-900">
        ← Événements
      </Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">{event.title}</h1>
        <div className="flex gap-4 text-sm">
          {event.status !== "draft" && (
            <Link href={`/evenements/${event.id}`} className="text-emerald-900 underline underline-offset-4">
              Voir la page
            </Link>
          )}
          <Link href={`/admin/evenements/nouveau?copie=${event.id}`} className="text-stone-600 underline underline-offset-4">
            Copier
          </Link>
        </div>
      </div>
      {enregistre && savedNotices[enregistre] && (
        <p role="status" className="mt-6 rounded-lg bg-emerald-100 px-4 py-3 text-sm text-emerald-950">
          {savedNotices[enregistre]}
        </p>
      )}
      {event.status === "cancelled" && (
        <p className="mt-6 rounded-lg bg-rose-100 px-4 py-3 text-sm text-rose-950">Cet événement est annulé.</p>
      )}

      <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,1fr)]">
        <EventForm
          action={updateEvent}
          defaults={eventToDefaults(event)}
          types={types}
          places={places}
          hasRegistrants={registrants.length > 0}
        />

        <aside className="space-y-10">
          <section id="inscrits" className="scroll-mt-24">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-serif text-2xl">
                Inscrits <span className="text-stone-500">({registrants.length}{event.capacity ? ` / ${event.capacity}` : ""})</span>
              </h2>
              {registrants.length > 0 && (
                <a href={`/admin/evenements/${event.id}/inscrits.csv`} className="text-sm text-emerald-900 underline underline-offset-4">
                  Export CSV
                </a>
              )}
            </div>
            {registrants.length === 0 ? (
              <p className="mt-3 text-sm text-stone-600">Personne pour l’instant.</p>
            ) : (
              <ul className="mt-3 divide-y divide-stone-200 rounded-xl border border-stone-300 bg-white">
                {registrants.map((row) => (
                  <li key={row.user_id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0 text-sm">
                      <p className="truncate font-medium">{row.profiles?.full_name || "Membre"}</p>
                      <p className="truncate text-stone-500">
                        {row.profiles?.phone ? (
                          <a href={`tel:${row.profiles.phone}`} className="hover:underline">
                            {row.profiles.phone}
                          </a>
                        ) : (
                          row.profiles?.email
                        )}
                      </p>
                    </div>
                    <form action={removeRegistrant}>
                      <input type="hidden" name="event_id" value={event.id} />
                      <input type="hidden" name="user_id" value={row.user_id} />
                      <SubmitButton variant="quiet" pendingLabel="…" className="min-h-9 text-xs">
                        Retirer
                      </SubmitButton>
                    </form>
                  </li>
                ))}
              </ul>
            )}
            {addable.length > 0 && event.status !== "cancelled" && (
              <form action={addRegistrant} className="mt-4 flex gap-2">
                <input type="hidden" name="event_id" value={event.id} />
                <label htmlFor="add_member" className="sr-only">
                  Inscrire un membre
                </label>
                <select id="add_member" name="user_id" required className="min-h-11 min-w-0 flex-1 rounded-lg border border-stone-300 bg-white px-3 text-sm">
                  <option value="">Inscrire un membre…</option>
                  {addable.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.full_name || member.email}
                    </option>
                  ))}
                </select>
                <SubmitButton variant="secondary">Ajouter</SubmitButton>
              </form>
            )}
          </section>

          {event.status !== "draft" && (
            <section className="rounded-2xl border border-stone-300 p-5">
              <h2 className="font-serif text-xl">{event.status === "cancelled" ? "Rétablir" : "Annuler l’événement"}</h2>
              <p className="mt-1 text-sm text-stone-600">
                {event.status === "cancelled"
                  ? "L’événement redevient normal dans le calendrier."
                  : "Il reste affiché comme annulé, et les inscrits reçoivent un email."}
              </p>
              <form action={setEventCancelled} className="mt-4">
                <input type="hidden" name="id" value={event.id} />
                <input type="hidden" name="cancel" value={event.status === "cancelled" ? "0" : "1"} />
                <SubmitButton variant={event.status === "cancelled" ? "secondary" : "danger"}>
                  {event.status === "cancelled" ? "Rétablir l’événement" : "Annuler l’événement"}
                </SubmitButton>
              </form>
            </section>
          )}

          <section className="rounded-2xl border border-rose-900/20 p-5">
            <h2 className="font-serif text-xl">Supprimer</h2>
            <p className="mt-1 text-sm text-stone-600">
              Efface l’événement et ses inscriptions, sans prévenir personne. Pour un événement déjà annoncé, mieux vaut
              l’annuler.
            </p>
            <form action={deleteEvent} className="mt-4 space-y-3">
              <input type="hidden" name="id" value={event.id} />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="confirm" required className="h-5 w-5 accent-rose-900" />
                Oui, supprimer définitivement
              </label>
              {erreur === "confirmation" && <p className="text-sm text-rose-800">Coche la case pour confirmer.</p>}
              <SubmitButton variant="danger">Supprimer</SubmitButton>
            </form>
          </section>

          {event.published_at && (
            <p className="text-xs text-stone-500">Publié le {formatDateTime(event.published_at)}.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
