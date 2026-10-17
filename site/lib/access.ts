// Toutes les règles d'accès du site, en un seul endroit. Les pages et les
// actions serveur s'appuient dessus ; la base n'accorde rien aux visiteurs.

export type MemberStatus = "pending" | "active" | "rejected" | "suspended";

export type MemberRights = {
  status: MemberStatus;
  is_admin: boolean;
  can_manage_calendar: boolean;
  can_view_stages: boolean;
};

export type EventVisibility = "public" | "members";
export type EventStatus = "draft" | "published" | "cancelled";

export function isActiveMember(member: MemberRights | null): member is MemberRights {
  return member?.status === "active";
}

export function isAdmin(member: MemberRights | null): boolean {
  return isActiveMember(member) && member.is_admin;
}

export function canManageCalendar(member: MemberRights | null): boolean {
  return isActiveMember(member) && (member.is_admin || member.can_manage_calendar);
}

export function canViewStages(member: MemberRights | null): boolean {
  return isActiveMember(member) && (member.is_admin || member.can_view_stages);
}

export function canOpenAdmin(member: MemberRights | null): boolean {
  return canManageCalendar(member);
}

// Un événement annulé reste visible (pour prévenir ceux qui comptaient venir) ;
// un brouillon n'est visible que des gestionnaires.
export function canSeeEvent(
  member: MemberRights | null,
  event: { visibility: EventVisibility; status: EventStatus },
): boolean {
  if (event.status === "draft") return canManageCalendar(member);
  if (event.visibility === "members") return isActiveMember(member);
  return true;
}

export function canSeeParticipantNames(member: MemberRights | null): boolean {
  return isActiveMember(member);
}

export const memberStatusLabels: Record<MemberStatus, string> = {
  pending: "En attente",
  active: "Membre",
  rejected: "Refusé",
  suspended: "Suspendu",
};

// N'accepte que des chemins internes pour la redirection après connexion.
export function safeNextPath(value: unknown, fallback = "/espace"): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return fallback;
  }
  return value;
}
