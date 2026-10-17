import Link from "next/link";
import { memberStatusLabels, type MemberStatus } from "@/lib/access";
import { PROFILE_COLUMNS, requireAdmin, type Profile } from "@/lib/auth";
import { formatDateTime } from "@/lib/paris-time";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { deleteMember, reviewMember, updateMemberRights } from "@/app/admin/actions";
import { SubmitButton } from "@/app/_components/ui";
import { ResetPasswordButton } from "./reset-password";

const views: Array<{ key: string; label: string; status: MemberStatus | null }> = [
  { key: "attente", label: "À valider", status: "pending" },
  { key: "membres", label: "Membres", status: "active" },
  { key: "suspendus", label: "Suspendus", status: "suspended" },
  { key: "refuses", label: "Refusés", status: "rejected" },
  { key: "tous", label: "Tous", status: null },
];

function Decision({ id, decision, label, variant }: { id: string; decision: string; label: string; variant?: "primary" | "secondary" | "danger" }) {
  return (
    <form action={reviewMember}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="decision" value={decision} />
      <SubmitButton variant={variant ?? "secondary"} pendingLabel="…">
        {label}
      </SubmitButton>
    </form>
  );
}

function rightsSummary(member: Profile): string {
  const rights = [
    member.is_admin && "admin",
    !member.is_admin && member.can_manage_calendar && "gère le calendrier",
    !member.is_admin && member.can_view_stages && "voit les stages",
  ].filter(Boolean);
  return rights.length ? rights.join(" · ") : "membre";
}

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ vue?: string; erreur?: string; enregistre?: string; supprime?: string; q?: string }>;
}) {
  const me = await requireAdmin("/admin/membres");
  const { vue, erreur, enregistre, supprime, q } = await searchParams;
  const db = createAdminSupabaseClient();

  const { data: all } = await db.from("profiles").select(PROFILE_COLUMNS).order("created_at", { ascending: false });
  const members = (all ?? []) as Profile[];
  const counts = new Map<string, number>();
  for (const member of members) counts.set(member.status, (counts.get(member.status) ?? 0) + 1);

  const defaultView = (counts.get("pending") ?? 0) > 0 ? "attente" : "membres";
  const view = views.find((item) => item.key === (vue ?? defaultView)) ?? views[0];
  const search = (q ?? "").trim().toLowerCase();
  const shown = members
    .filter((member) => !view.status || member.status === view.status)
    .filter((member) => !search || `${member.full_name} ${member.email}`.toLowerCase().includes(search))
    .sort((a, b) => (view.status === "active" ? a.full_name.localeCompare(b.full_name, "fr") : 0));

  return (
    <div>
      <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">Membres</h1>
      {erreur === "soi-meme" && (
        <p role="alert" className="mt-6 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-900">
          Tu ne peux pas faire ça sur ton propre compte.
        </p>
      )}
      {erreur === "confirmation" && (
        <p role="alert" className="mt-6 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-900">
          Coche la case pour confirmer la suppression.
        </p>
      )}
      {supprime && <p role="status" className="mt-6 rounded-lg bg-emerald-100 px-4 py-3 text-sm text-emerald-950">Compte supprimé.</p>}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <nav className="flex flex-wrap gap-2 text-sm" aria-label="Filtrer les comptes">
          {views.map((item) => {
            const count = item.status ? counts.get(item.status) ?? 0 : members.length;
            return (
              <Link
                key={item.key}
                href={`/admin/membres?vue=${item.key}`}
                aria-current={item.key === view.key ? "page" : undefined}
                className={`rounded-full px-4 py-2 ${item.key === view.key ? "bg-stone-900 text-white" : "text-stone-600 hover:text-stone-950"}`}
              >
                {item.label} <span className="opacity-60">{count}</span>
              </Link>
            );
          })}
        </nav>
        <form className="flex gap-2">
          <input type="hidden" name="vue" value={view.key} />
          <label htmlFor="q" className="sr-only">Rechercher</label>
          <input
            id="q"
            name="q"
            defaultValue={q}
            placeholder="Rechercher un nom…"
            className="min-h-10 rounded-full border border-stone-300 bg-white px-4 text-sm"
          />
        </form>
      </div>

      {shown.length === 0 ? (
        <p className="mt-8 text-stone-600">{view.key === "attente" ? "Aucun compte à valider. Tout est à jour." : "Personne ici."}</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {shown.map((member) => {
            const self = member.id === me.id;
            return (
              <li key={member.id} id={`m-${member.id}`} className="scroll-mt-24 rounded-2xl bg-white p-4 shadow-sm sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-serif text-xl leading-tight">
                      {member.full_name || "Sans nom"} {self && <span className="text-sm text-stone-500">(toi)</span>}
                    </p>
                    <p className="mt-0.5 text-sm text-stone-600">
                      <a href={`mailto:${member.email}`} className="hover:underline">{member.email}</a>
                      {member.phone && (
                        <>
                          {" · "}
                          <a href={`tel:${member.phone}`} className="hover:underline">{member.phone}</a>
                        </>
                      )}
                    </p>
                    <p className="mt-1 text-xs text-stone-500">
                      {memberStatusLabels[member.status]}
                      {member.status === "active" && ` · ${rightsSummary(member)}`} · inscrit le {formatDateTime(member.created_at)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {member.status === "pending" && (
                      <>
                        <Decision id={member.id} decision="approve" label="Valider" variant="primary" />
                        <Decision id={member.id} decision="reject" label="Refuser" variant="danger" />
                      </>
                    )}
                    {(member.status === "rejected" || member.status === "suspended") && (
                      <Decision id={member.id} decision="reactivate" label="Valider le compte" />
                    )}
                  </div>
                </div>

                {member.status === "active" && (
                  <details className="group mt-4 border-t border-stone-200 pt-3" open={enregistre === member.id}>
                    <summary className="cursor-pointer list-none text-sm font-medium text-emerald-900 marker:content-none">
                      <span className="group-open:hidden">Gérer les droits →</span>
                      <span className="hidden group-open:inline">Masquer</span>
                    </summary>
                    <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto]">
                      <form action={updateMemberRights} className="space-y-3">
                        <input type="hidden" name="id" value={member.id} />
                        {(
                          [
                            ["can_manage_calendar", "Gère le calendrier", "Crée, modifie et annule les événements, voit les inscrits.", member.can_manage_calendar],
                            ["can_view_stages", "Voit les stages", "Accès à l’annuaire des stages en Europe.", member.can_view_stages],
                            ["is_admin", "Admin", "Tout : membres, droits, alertes, types d’événements.", member.is_admin],
                          ] as const
                        ).map(([name, label, hint, checked]) => (
                          <label key={name} className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              name={name}
                              defaultChecked={checked}
                              disabled={self && name === "is_admin"}
                              className="mt-0.5 h-5 w-5 accent-emerald-900"
                            />
                            <span>
                              <span className="block text-sm font-medium">{label}</span>
                              <span className="block text-xs text-stone-500">
                                {self && name === "is_admin" ? "Tu ne peux pas te retirer ce droit toi-même." : hint}
                              </span>
                            </span>
                          </label>
                        ))}
                        <div className="flex items-center gap-3">
                          <SubmitButton>Enregistrer les droits</SubmitButton>
                          {enregistre === member.id && <span className="text-sm text-emerald-800">Enregistré.</span>}
                        </div>
                      </form>
                      <div className="space-y-3">
                        <ResetPasswordButton memberId={member.id} />
                        {!self && <Decision id={member.id} decision="suspend" label="Suspendre le compte" variant="danger" />}
                      </div>
                    </div>
                  </details>
                )}

                {!self && member.status !== "active" && member.status !== "pending" && (
                  <form action={deleteMember} className="mt-4 flex flex-wrap items-center gap-3 border-t border-stone-200 pt-3">
                    <input type="hidden" name="id" value={member.id} />
                    <label className="flex items-center gap-2 text-sm text-stone-600">
                      <input type="checkbox" name="confirm" required className="h-4 w-4 accent-rose-900" />
                      Supprimer définitivement ce compte
                    </label>
                    <SubmitButton variant="danger" pendingLabel="…">Supprimer</SubmitButton>
                  </form>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
