import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import {
  canManageCalendar,
  isActiveMember,
  isAdmin,
  type MemberRights,
  type MemberStatus,
} from "./access";
import { createAdminSupabaseClient } from "./supabase/admin";
import { createServerSupabaseClient } from "./supabase/server";

export type Profile = MemberRights & {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  status: MemberStatus;
  reviewed_at: string | null;
  created_at: string;
};

export const PROFILE_COLUMNS =
  "id, email, full_name, phone, status, is_admin, can_manage_calendar, can_view_stages, reviewed_at, created_at";

export function isMembershipConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

// La session est vérifiée auprès de GoTrue (getUser), jamais lue telle quelle
// dans le cookie ; le profil et ses droits viennent de la base.
export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  if (!isMembershipConfigured()) return null;
  const supabase = await createServerSupabaseClient();
  let { data, error } = await supabase.auth.getUser();
  // Un raté réseau ne doit pas déconnecter : on retente une fois.
  if (error?.status === 0 || error?.name === "AuthRetryableFetchError") {
    ({ data, error } = await supabase.auth.getUser());
  }
  if (error || !data.user) return null;

  const { data: profile } = await createAdminSupabaseClient()
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", data.user.id)
    .maybeSingle<Profile>();
  return profile ?? null;
});

export async function requireProfile(next = "/espace"): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect(`/connexion?suite=${encodeURIComponent(next)}`);
  return profile;
}

export async function requireActiveMember(next = "/espace"): Promise<Profile> {
  const profile = await requireProfile(next);
  if (!isActiveMember(profile)) redirect("/espace");
  return profile;
}

export async function requireCalendarManager(next = "/admin"): Promise<Profile> {
  const profile = await requireProfile(next);
  if (!canManageCalendar(profile)) redirect("/espace");
  return profile;
}

export async function requireAdmin(next = "/admin"): Promise<Profile> {
  const profile = await requireProfile(next);
  if (!isAdmin(profile)) redirect(canManageCalendar(profile) ? "/admin" : "/espace");
  return profile;
}
