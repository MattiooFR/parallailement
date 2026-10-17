import type { Metadata } from "next";
import Link from "next/link";
import { canOpenAdmin, canViewStages, isActiveMember, isAdmin } from "@/lib/access";
import { requireProfile } from "@/lib/auth";
import { listRegisteredEventIds, listUpcomingEvents } from "@/lib/club-events";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getNotificationSettings, NOTIFICATION_KINDS, notificationLabels } from "@/lib/notifications";
import { EventList } from "@/app/_components/event-list";
import { MemberBar } from "@/app/_components/member-bar";
import { PasswordForm, PreferencesForm, ProfileForm } from "./account-forms";

export const metadata: Metadata = {
  title: "Mon espace — Parallailement",
  robots: { index: false, follow: false },
};

const registrationNotices: Record<string, string> = {
  inscrit: "C’est noté, tu es inscrit·e.",
  desinscrit: "Tu es désinscrit·e.",
  complet: "Dommage, c’est complet.",
  ferme: "Les inscriptions sont closes pour cet événement.",
  indisponible: "Cet événement n’est plus disponible.",
};

export default async function MemberSpacePage({
  searchParams,
}: {
  searchParams: Promise<{ bienvenue?: string; inscription?: string }>;
}) {
  const profile = await requireProfile("/espace");
  const { bienvenue, inscription } = await searchParams;
  const active = isActiveMember(profile);
  const firstName = profile.full_name.split(" ")[0] || "toi";

  const [events, registeredIds, settings, preferences] = active
    ? await Promise.all([
        listUpcomingEvents({ includeMembersOnly: true }),
        listRegisteredEventIds(profile.id),
        getNotificationSettings(),
        createAdminSupabaseClient()
          .from("notification_preferences")
          .select("kind, enabled")
          .eq("user_id", profile.id)
          .then(({ data }) => new Map((data ?? []).map((row) => [row.kind as string, row.enabled as boolean]))),
      ])
    : [[], new Set<string>(), new Map(), new Map<string, boolean>()];

  const myEvents = events.filter((event) => registeredIds.has(event.id));
  const otherEvents = events.filter((event) => !registeredIds.has(event.id));
  const preferenceOptions = NOTIFICATION_KINDS.filter(
    (kind) => notificationLabels[kind].memberCanMute && (kind !== "signup_pending" || isAdmin(profile)),
  ).map((kind) => ({
    kind,
    title: notificationLabels[kind].title,
    checked: preferences.get(kind) ?? true,
    disabledByClub: settings.get(kind)?.enabled === false,
  }));

  return (
    <div className="min-h-screen bg-[#f2efe7] text-stone-900">
      <MemberBar profile={profile} current="espace" />
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-8 sm:pt-14">
        <p className="text-xs uppercase tracking-[0.22em] text-stone-500">Mon espace</p>
        <h1 className="mt-3 font-serif text-5xl leading-none tracking-tight sm:text-6xl">
          Salut {firstName}<span className="text-amber-600">.</span>
        </h1>

        {profile.status === "pending" && (
          <section className="mt-8 max-w-2xl rounded-2xl border border-amber-300 bg-amber-50 p-6">
            <h2 className="font-serif text-2xl">
              {bienvenue ? "Ton compte est créé." : "Ton compte attend sa validation."}
            </h2>
            <p className="mt-2 leading-relaxed text-stone-700">
              Un membre du bureau va le valider à la main. Ensuite, tu verras ici le calendrier du club et tu pourras
              t’inscrire aux sorties.
            </p>
          </section>
        )}
        {(profile.status === "rejected" || profile.status === "suspended") && (
          <section className="mt-8 max-w-2xl rounded-2xl border border-stone-300 bg-white p-6">
            <h2 className="font-serif text-2xl">
              {profile.status === "rejected" ? "Ton inscription n’a pas été validée." : "Ton compte est suspendu."}
            </h2>
            <p className="mt-2 leading-relaxed text-stone-700">
              Si c’est une erreur, appelle le club au 06 50 93 13 97.
            </p>
          </section>
        )}

        {active && (
          <>
            <nav className="mt-8 flex flex-wrap gap-3" aria-label="Raccourcis">
              {canViewStages(profile) && (
                <Link href="/stages" className="rounded-full bg-emerald-950 px-5 py-2.5 text-sm font-medium text-emerald-50 transition hover:bg-emerald-900">
                  Trouver un stage
                </Link>
              )}
              {canOpenAdmin(profile) && (
                <Link href="/admin/evenements/nouveau" className="rounded-full border border-stone-400 px-5 py-2.5 text-sm font-medium transition hover:border-stone-900">
                  + Créer un événement
                </Link>
              )}
              <a href="/calendrier.ics" className="rounded-full border border-stone-400 px-5 py-2.5 text-sm font-medium transition hover:border-stone-900">
                Ajouter le calendrier à mon agenda
              </a>
            </nav>

            {inscription && registrationNotices[inscription] && (
              <p role="status" className="mt-6 rounded-lg bg-emerald-100 px-4 py-3 text-sm text-emerald-950">
                {registrationNotices[inscription]}
              </p>
            )}

            {myEvents.length > 0 && (
              <section className="mt-12">
                <h2 className="font-serif text-3xl">J’y vais</h2>
                <div className="mt-5">
                  <EventList events={myEvents} member={profile} registeredIds={registeredIds} retour="/espace" emptyLabel="" />
                </div>
              </section>
            )}

            {(myEvents.length === 0 || otherEvents.length > 0) && (
            <section className="mt-12">
              <h2 className="font-serif text-3xl">{myEvents.length > 0 ? "Les autres dates" : "Calendrier du club"}</h2>
              <p className="mt-1 text-sm text-stone-600">Les événements publics et ceux réservés aux membres.</p>
              <div className="mt-5">
                <EventList
                  events={otherEvents}
                  member={profile}
                  registeredIds={registeredIds}
                  retour="/espace"
                  emptyLabel="Rien de prévu pour l’instant. Reviens bientôt."
                />
              </div>
            </section>
            )}
          </>
        )}

        <section className="mt-16 grid gap-10 border-t border-stone-300 pt-10 lg:grid-cols-3">
          <div>
            <h2 className="font-serif text-2xl">Mes infos</h2>
            <div className="mt-5">
              <ProfileForm fullName={profile.full_name} phone={profile.phone} email={profile.email} />
            </div>
          </div>
          {active && (
            <div>
              <h2 className="font-serif text-2xl">Mes alertes email</h2>
              <p className="mt-1 text-sm text-stone-600">Coche ce que tu veux recevoir.</p>
              <div className="mt-5">
                <PreferencesForm options={preferenceOptions} />
              </div>
            </div>
          )}
          <div>
            <h2 className="font-serif text-2xl">Mot de passe</h2>
            <div className="mt-5">
              <PasswordForm />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
