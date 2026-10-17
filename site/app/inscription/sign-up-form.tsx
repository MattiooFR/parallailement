"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUp, type AuthFormState } from "@/app/_actions/auth";
import { Field, inputClass, SubmitButton } from "@/app/_components/ui";

export function SignUpForm() {
  const [state, action] = useActionState<AuthFormState, FormData>(signUp, {});
  return (
    <form action={action} className="space-y-5">
      <Field label="Prénom et nom" htmlFor="full_name">
        <input
          id="full_name"
          name="full_name"
          autoComplete="name"
          required
          minLength={2}
          defaultValue={state.values?.full_name}
          className={inputClass}
        />
      </Field>
      <Field label="Email" htmlFor="email">
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.values?.email}
          className={inputClass}
        />
      </Field>
      <Field label="Téléphone" hint="Facultatif. Utile pour les sorties et les covoiturages." htmlFor="phone">
        <input id="phone" name="phone" type="tel" autoComplete="tel" defaultValue={state.values?.phone} className={inputClass} />
      </Field>
      <Field label="Mot de passe" hint="10 caractères minimum." htmlFor="password">
        <input id="password" name="password" type="password" autoComplete="new-password" required minLength={10} className={inputClass} />
      </Field>
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Site web</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      {state.error && (
        <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-900">
          {state.error}
        </p>
      )}
      <SubmitButton pendingLabel="Création du compte…" className="w-full">
        Créer mon compte
      </SubmitButton>
      <p className="text-center text-sm text-stone-600">
        Déjà membre ?{" "}
        <Link href="/connexion" className="font-medium text-emerald-900 underline underline-offset-4">
          Se connecter
        </Link>
      </p>
    </form>
  );
}
