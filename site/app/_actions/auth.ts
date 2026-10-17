"use server";

import { redirect } from "next/navigation";
import { after } from "next/server";
import { safeNextPath } from "@/lib/access";
import { isMembershipConfigured } from "@/lib/auth";
import { flushOutbox, notifySignupPending } from "@/lib/notifications";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type AuthFormState = { error?: string; values?: Record<string, string> };

function field(form: FormData, name: string, max = 200): string {
  const value = form.get(name);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function signUp(_: AuthFormState, form: FormData): Promise<AuthFormState> {
  const values = {
    full_name: field(form, "full_name", 120),
    email: field(form, "email", 200).toLowerCase(),
    phone: field(form, "phone", 40),
  };
  // Champ piège invisible : un humain ne le remplit jamais.
  if (field(form, "website")) return { error: "Inscription refusée.", values };
  if (!isMembershipConfigured()) return { error: "Les inscriptions ne sont pas encore ouvertes.", values };

  const password = typeof form.get("password") === "string" ? (form.get("password") as string) : "";
  if (values.full_name.length < 2) return { error: "Indique ton prénom et ton nom.", values };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) return { error: "Cet email n’a pas l’air valide.", values };
  if (password.length < 10) return { error: "Choisis un mot de passe d’au moins 10 caractères.", values };

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email: values.email,
    password,
    options: { data: { full_name: values.full_name, phone: values.phone } },
  });

  if (error || !data.user) {
    const message = error?.message.toLowerCase() ?? "";
    if (message.includes("already") || error?.code === "user_already_exists") {
      return { error: "Un compte existe déjà avec cet email. Connecte-toi.", values };
    }
    if (error?.code === "weak_password") return { error: "Ce mot de passe est trop simple.", values };
    console.error("Inscription impossible", error);
    return { error: "L’inscription n’a pas abouti. Réessaie dans un instant.", values };
  }

  const user = data.user;
  after(async () => {
    await notifySignupPending({ id: user.id, full_name: values.full_name, email: values.email });
    await flushOutbox().catch((flushError) => console.error("Envoi des emails impossible", flushError));
  });
  redirect("/espace?bienvenue=1");
}

export async function signIn(_: AuthFormState, form: FormData): Promise<AuthFormState> {
  const email = field(form, "email", 200).toLowerCase();
  const password = typeof form.get("password") === "string" ? (form.get("password") as string) : "";
  if (!isMembershipConfigured()) return { error: "L’espace membres n’est pas encore ouvert.", values: { email } };

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return {
      error:
        error.code === "invalid_credentials"
          ? "Email ou mot de passe incorrect."
          : "La connexion n’a pas abouti. Réessaie dans un instant.",
      values: { email },
    };
  }
  redirect(safeNextPath(form.get("suite")));
}

export async function signOut() {
  if (isMembershipConfigured()) {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}
