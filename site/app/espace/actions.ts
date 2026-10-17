"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth";
import { NOTIFICATION_KINDS, notificationLabels } from "@/lib/notifications";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type FormState = { ok?: string; error?: string };

function field(form: FormData, name: string, max: number): string {
  const value = form.get(name);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function updateProfile(_: FormState, form: FormData): Promise<FormState> {
  const profile = await requireProfile();
  const fullName = field(form, "full_name", 120);
  if (fullName.length < 2) return { error: "Indique ton prénom et ton nom." };
  const { error } = await createAdminSupabaseClient()
    .from("profiles")
    .update({ full_name: fullName, phone: field(form, "phone", 40) || null })
    .eq("id", profile.id);
  if (error) return { error: "L’enregistrement a échoué. Réessaie." };
  revalidatePath("/espace");
  return { ok: "C’est enregistré." };
}

export async function changePassword(_: FormState, form: FormData): Promise<FormState> {
  await requireProfile();
  const password = typeof form.get("password") === "string" ? (form.get("password") as string) : "";
  if (password.length < 10) return { error: "10 caractères minimum." };
  if (password !== form.get("confirmation")) return { error: "Les deux mots de passe ne sont pas identiques." };
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { error: error.code === "same_password" ? "C’est déjà ton mot de passe actuel." : "Le changement a échoué." };
  }
  return { ok: "Mot de passe changé." };
}

export async function updatePreferences(_: FormState, form: FormData): Promise<FormState> {
  const profile = await requireProfile();
  const rows = NOTIFICATION_KINDS.filter((kind) => notificationLabels[kind].memberCanMute).map((kind) => ({
    user_id: profile.id,
    kind,
    enabled: form.get(kind) === "on",
  }));
  const { error } = await createAdminSupabaseClient()
    .from("notification_preferences")
    .upsert(rows, { onConflict: "user_id,kind" });
  if (error) return { error: "L’enregistrement a échoué. Réessaie." };
  revalidatePath("/espace");
  return { ok: "Tes alertes sont à jour." };
}
