import Link from "next/link";
import { requireCalendarManager } from "@/lib/auth";
import { listPastEvents, listUpcomingEvents, type ClubEventWithCount } from "@/lib/club-events";
import { formatEventWhen } from "@/lib/paris-time";
import { EventTypeTag, participantsLabel } from "@/app/_components/event-list";

function Row({ event }: { event: ClubEventWithCount }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <EventTypeTag event={event} />
          {event.status === "draft" && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-900">Brouillon</span>}
          {event.status === "cancelled" && <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs text-rose-900">Annulé</span>}
          {event.visibility === "members" && <span className="rounded-full bg-stone-200 px-2 py-0.5 text-xs text-stone-700">Membres</span>}
        </div>
        <Link href={`/admin/evenements/${event.id}`} className="mt-1 block font-serif text-xl leading-tight hover:text-emerald-900">
          {event.title}
        </Link>
        <p className="mt-0.5 text-sm text-stone-600 first-letter:uppercase">
          {formatEventWhen(event)}
          {event.location_name && ` · ${event.location_name}`}
        </p>
      </div>
      <div className="flex items-center gap-4 text-sm">
        {event.registrations_enabled && <span className="text-stone-500">{participantsLabel(event)}</span>}
        <Link href={`/admin/evenements/nouveau?copie=${event.id}`} className="text-stone-600 underline-offset-4 hover:underline">
          Copier
        </Link>
        <Link href={`/admin/evenements/${event.id}`} className="font-medium text-emerald-900 underline-offset-4 hover:underline">
          Modifier
        </Link>
      </div>
    </li>
  );
}

export default async function AdminEventsPage({ searchParams }: { searchParams: Promise<{ passes?: string; supprime?: string }> }) {
  await requireCalendarManager("/admin/evenements");
  const { passes, supprime } = await searchParams;
  const past = passes === "1";
  const events = past
    ? await listPastEvents(100)
    : await listUpcomingEvents({ includeMembersOnly: true, includeDrafts: true });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">Événements</h1>
        <Link
          href="/admin/evenements/nouveau"
          className="inline-flex min-h-11 items-center rounded-full bg-emerald-950 px-5 text-sm font-medium text-emerald-50 transition hover:bg-emerald-900"
        >
          + Créer un événement
        </Link>
      </div>
      {supprime && <p role="status" className="mt-6 rounded-lg bg-emerald-100 px-4 py-3 text-sm text-emerald-950">Événement supprimé.</p>}
      <div className="mt-6 flex gap-2 text-sm">
        <Link href="/admin/evenements" className={`rounded-full px-4 py-2 ${past ? "text-stone-600 hover:text-stone-950" : "bg-stone-900 text-white"}`}>
          À venir
        </Link>
        <Link href="/admin/evenements?passes=1" className={`rounded-full px-4 py-2 ${past ? "bg-stone-900 text-white" : "text-stone-600 hover:text-stone-950"}`}>
          Passés
        </Link>
      </div>
      {events.length === 0 ? (
        <p className="mt-8 text-stone-600">
          {past ? "Aucun événement passé." : "Rien de prévu. Crée le premier événement de la saison !"}
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-stone-300 border-y border-stone-300">
          {events.map((event) => (
            <Row key={event.id} event={event} />
          ))}
        </ul>
      )}
    </div>
  );
}
