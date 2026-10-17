import Link from "next/link";
import { requireCalendarManager } from "@/lib/auth";
import { getEvent, listEventTypes, listPlaces } from "@/lib/club-events";
import { createEvent } from "@/app/admin/actions";
import { EventForm } from "../event-form";
import { blankEvent, eventToDefaults } from "../defaults";

export default async function NewEventPage({ searchParams }: { searchParams: Promise<{ copie?: string; date?: string }> }) {
  await requireCalendarManager("/admin/evenements/nouveau");
  const { copie, date } = await searchParams;
  const [types, places, source] = await Promise.all([
    listEventTypes(),
    listPlaces(),
    copie ? getEvent(copie) : Promise.resolve(null),
  ]);
  const defaults = source ? eventToDefaults(source, { copy: true }) : { ...blankEvent, type_id: types[0]?.id ?? "" };
  if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) defaults.start_date = date;

  return (
    <div className="max-w-3xl">
      <Link href="/admin/evenements" className="text-sm text-stone-500 hover:text-stone-900">
        ← Événements
      </Link>
      <h1 className="mt-4 font-serif text-4xl tracking-tight sm:text-5xl">
        {source ? "Copier un événement" : "Nouvel événement"}
      </h1>
      {source && <p className="mt-2 text-stone-600">Tout est repris de « {source.title} », sauf la date.</p>}
      <div className="mt-8">
        <EventForm action={createEvent} defaults={defaults} types={types} places={places} />
      </div>
    </div>
  );
}
