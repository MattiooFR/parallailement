import Link from "next/link";
import { isActiveMember, type MemberRights } from "@/lib/access";
import { registrationState, type ClubEventWithCount } from "@/lib/club-events";
import { formatEventWhen, PARIS_TZ } from "@/lib/paris-time";
import { registerForEvent, unregisterFromEvent } from "@/app/_actions/events";
import { SubmitButton } from "./ui";

const dayFormatter = new Intl.DateTimeFormat("fr-FR", { day: "numeric", timeZone: PARIS_TZ });
const monthFormatter = new Intl.DateTimeFormat("fr-FR", { month: "short", timeZone: PARIS_TZ });

export function participantsLabel(event: Pick<ClubEventWithCount, "participant_count" | "capacity">): string {
  const count = event.participant_count;
  if (event.capacity !== null) {
    const left = Math.max(event.capacity - count, 0);
    return left === 0 ? `Complet · ${count} inscrits` : `${count} inscrit${count > 1 ? "s" : ""} · ${left} place${left > 1 ? "s" : ""} libre${left > 1 ? "s" : ""}`;
  }
  if (count === 0) return "Personne d’inscrit pour l’instant";
  return `${count} participant${count > 1 ? "s" : ""}`;
}

export function EventTypeTag({ event }: { event: ClubEventWithCount }) {
  if (!event.event_types) return null;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.14em] text-stone-500">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: event.event_types.color }} aria-hidden="true" />
      {event.event_types.name}
    </span>
  );
}

export function RegistrationButton({
  event,
  registered,
  member,
  retour,
}: {
  event: ClubEventWithCount;
  registered: boolean;
  member: MemberRights | null;
  retour: string;
}) {
  const state = registrationState(event, event.participant_count);
  if (state === "disabled" || state === "cancelled") return null;

  if (!isActiveMember(member)) {
    if (state !== "open") return null;
    return (
      <Link
        href={member ? "/espace" : `/connexion?suite=${encodeURIComponent(`/evenements/${event.id}`)}`}
        className="inline-flex min-h-11 items-center rounded-full border border-stone-400 px-5 text-sm font-medium transition hover:border-stone-900"
      >
        {member ? "Inscription réservée aux membres validés" : "Se connecter pour s’inscrire"}
      </Link>
    );
  }

  if (registered) {
    return (
      <form action={unregisterFromEvent} className="flex flex-wrap items-center gap-3">
        <input type="hidden" name="event_id" value={event.id} />
        <input type="hidden" name="retour" value={retour} />
        <span className="inline-flex min-h-11 items-center gap-2 rounded-full bg-emerald-100 px-4 text-sm font-medium text-emerald-950">
          ✓ J’y vais
        </span>
        {state !== "closed" && (
          <SubmitButton variant="quiet" pendingLabel="…">
            Me désinscrire
          </SubmitButton>
        )}
      </form>
    );
  }

  if (state === "full") return <span className="text-sm font-medium text-stone-500">Complet</span>;
  if (state === "closed") return <span className="text-sm text-stone-500">Inscriptions closes</span>;

  return (
    <form action={registerForEvent}>
      <input type="hidden" name="event_id" value={event.id} />
      <input type="hidden" name="retour" value={retour} />
      <SubmitButton pendingLabel="Inscription…">J’y vais</SubmitButton>
    </form>
  );
}

export function EventList({
  events,
  member,
  registeredIds,
  retour,
  emptyLabel,
}: {
  events: ClubEventWithCount[];
  member: MemberRights | null;
  registeredIds?: Set<string>;
  retour: string;
  emptyLabel: string;
}) {
  if (events.length === 0) {
    return <p className="border-t border-stone-300 pt-8 text-stone-600">{emptyLabel}</p>;
  }

  return (
    <ol className="divide-y divide-stone-300 border-y border-stone-300">
      {events.map((event) => {
        const cancelled = event.status === "cancelled";
        return (
          <li
            key={event.id}
            id={`e-${event.id}`}
            className="grid scroll-mt-24 grid-cols-[3.5rem_minmax(0,1fr)] gap-x-4 gap-y-4 py-6 sm:grid-cols-[4.5rem_minmax(0,1fr)_auto] sm:items-center sm:gap-x-8"
          >
            <time dateTime={event.starts_at} className={`text-center leading-none ${cancelled ? "opacity-40" : ""}`}>
              <span className="block font-serif text-4xl sm:text-5xl">{dayFormatter.format(new Date(event.starts_at))}</span>
              <span className="mt-1 block text-xs uppercase tracking-[0.18em] text-stone-500">
                {monthFormatter.format(new Date(event.starts_at)).replace(".", "")}
              </span>
            </time>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <EventTypeTag event={event} />
                {event.visibility === "members" && (
                  <span className="rounded-full bg-stone-200 px-2 py-0.5 text-xs text-stone-700">Membres</span>
                )}
                {event.status === "draft" && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-900">Brouillon</span>
                )}
                {cancelled && (
                  <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-900">Annulé</span>
                )}
              </div>
              <h3 className={`mt-1.5 font-serif text-2xl leading-tight ${cancelled ? "text-stone-500 line-through decoration-1" : ""}`}>
                <Link href={`/evenements/${event.id}`} className="transition hover:text-emerald-900">
                  {event.title}
                </Link>
              </h3>
              <p className="mt-1 text-sm text-stone-600">
                {formatEventWhen(event)}
                {event.location_name && <> · {event.location_name}</>}
              </p>
              {event.registrations_enabled && !cancelled && (
                <p className="mt-1 text-sm text-stone-500">{participantsLabel(event)}</p>
              )}
            </div>
            <div className="col-start-2 sm:col-start-3">
              <RegistrationButton
                event={event}
                registered={registeredIds?.has(event.id) ?? false}
                member={member}
                retour={retour}
              />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
