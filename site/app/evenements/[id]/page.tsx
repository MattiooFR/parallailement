import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { canManageCalendar, canSeeEvent, canSeeParticipantNames } from "@/lib/access";
import { getCurrentProfile } from "@/lib/auth";
import { getEvent, listRegistrants, withParticipantCounts } from "@/lib/club-events";
import { formatDateTime, formatEventWhen } from "@/lib/paris-time";
import { EventTypeTag, participantsLabel, RegistrationButton } from "@/app/_components/event-list";
import { MemberBar } from "@/app/_components/member-bar";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ inscription?: string }>;
};

const notices: Record<string, string> = {
  inscrit: "C’est noté, tu es inscrit·e. À bientôt !",
  desinscrit: "Tu es désinscrit·e.",
  complet: "Dommage, c’est complet.",
  ferme: "Les inscriptions sont closes.",
  indisponible: "Cet événement n’est plus disponible.",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const event = await getEvent(id).catch(() => null);
  if (!event || event.visibility !== "public" || event.status === "draft") {
    return { title: "Événement — Parallailement", robots: { index: false } };
  }
  return {
    title: `${event.title} — Parallailement`,
    description: `${formatEventWhen(event)}${event.location_name ? ` · ${event.location_name}` : ""}`,
  };
}

function mapUrl(location: string): string {
  return `https://www.openstreetmap.org/search?query=${encodeURIComponent(location)}`;
}

export default async function EventPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { inscription } = await searchParams;
  const [rawEvent, profile] = await Promise.all([getEvent(id), getCurrentProfile()]);
  if (!rawEvent) notFound();
  if (!canSeeEvent(profile, rawEvent)) {
    if (!profile && rawEvent.status !== "draft") redirect(`/connexion?suite=${encodeURIComponent(`/evenements/${id}`)}`);
    notFound();
  }

  const [event] = await withParticipantCounts([rawEvent]);
  const registrants = canSeeParticipantNames(profile) ? await listRegistrants(event.id) : [];
  const registered = profile ? registrants.some((row) => row.user_id === profile.id) : false;
  const location = [event.location_name, event.address].filter(Boolean).join(", ");
  const cancelled = event.status === "cancelled";

  const schema =
    event.visibility === "public" && event.status !== "draft"
      ? {
          "@context": "https://schema.org",
          "@type": "Event",
          name: event.title,
          startDate: event.starts_at,
          ...(event.ends_at ? { endDate: event.ends_at } : {}),
          eventStatus: cancelled ? "https://schema.org/EventCancelled" : "https://schema.org/EventScheduled",
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          ...(location ? { location: { "@type": "Place", name: event.location_name || location, address: location } } : {}),
          organizer: { "@type": "Organization", name: "Parallailement", url: "https://parallailement.fr" },
          description: event.description || undefined,
        }
      : null;

  return (
    <div className="min-h-screen bg-[#f2efe7] text-stone-900">
      <MemberBar profile={profile} current="evenement" />
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
        />
      )}
      <main className="mx-auto max-w-4xl px-4 pb-24 pt-10 sm:px-8 sm:pt-14">
        <Link href={profile ? "/espace" : "/#calendrier"} className="text-sm text-stone-500 transition hover:text-stone-900">
          ← Calendrier
        </Link>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <EventTypeTag event={event} />
          {event.visibility === "members" && (
            <span className="rounded-full bg-stone-200 px-2 py-0.5 text-xs text-stone-700">Réservé aux membres</span>
          )}
          {event.status === "draft" && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-900">Brouillon, non publié</span>
          )}
        </div>
        <h1 className={`mt-3 font-serif text-5xl leading-[0.95] tracking-tight sm:text-7xl ${cancelled ? "text-stone-500" : ""}`}>
          {event.title}
        </h1>
        {cancelled && (
          <p className="mt-6 rounded-xl bg-rose-100 px-4 py-3 font-medium text-rose-950">Cet événement est annulé.</p>
        )}

        <dl className="mt-10 grid gap-6 border-y border-stone-300 py-6 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-[0.18em] text-stone-500">Quand</dt>
            <dd className="mt-1 font-serif text-xl first-letter:uppercase">{formatEventWhen(event)}</dd>
          </div>
          {location && (
            <div>
              <dt className="text-xs uppercase tracking-[0.18em] text-stone-500">Où</dt>
              <dd className="mt-1 font-serif text-xl">
                {event.location_name || event.address}
                {event.location_name && event.address && (
                  <span className="mt-0.5 block font-sans text-sm text-stone-600">{event.address}</span>
                )}
                <a
                  href={mapUrl(location)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 block font-sans text-sm text-emerald-900 underline underline-offset-4"
                >
                  Voir sur la carte
                </a>
              </dd>
            </div>
          )}
        </dl>

        {inscription && notices[inscription] && (
          <p role="status" className="mt-6 rounded-lg bg-emerald-100 px-4 py-3 text-sm text-emerald-950">
            {notices[inscription]}
          </p>
        )}

        {event.registrations_enabled && !cancelled && (
          <section id={`e-${event.id}`} className="mt-8 flex scroll-mt-24 flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm">
            <div>
              <p className="font-serif text-2xl">{participantsLabel(event)}</p>
              {event.registration_deadline && (
                <p className="mt-0.5 text-sm text-stone-500">
                  Inscriptions jusqu’au {formatDateTime(event.registration_deadline)}
                </p>
              )}
            </div>
            <RegistrationButton event={event} registered={registered} member={profile} retour={`/evenements/${event.id}`} />
          </section>
        )}

        {event.description && (
          <div className="mt-10 max-w-2xl whitespace-pre-line text-lg leading-relaxed text-stone-700">{event.description}</div>
        )}

        {registrants.length > 0 && (
          <section className="mt-12">
            <h2 className="font-serif text-2xl">Qui vient</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {registrants.map((row) => (
                <li key={row.user_id} className="rounded-full bg-white px-3 py-1.5 text-sm shadow-sm">
                  {row.profiles?.full_name || "Membre"}
                </li>
              ))}
            </ul>
          </section>
        )}

        {canManageCalendar(profile) && (
          <p className="mt-12">
            <Link href={`/admin/evenements/${event.id}`} className="text-sm font-medium text-emerald-900 underline underline-offset-4">
              Modifier cet événement
            </Link>
          </p>
        )}
      </main>
    </div>
  );
}
