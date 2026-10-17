"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn, type AuthFormState } from "@/app/_actions/auth";
import { Field, inputClass, SubmitButton } from "@/app/_components/ui";

export function SignInForm({ next }: { next: string }) {
  const [state, action] = useActionState<AuthFormState, FormData>(signIn, {});
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="suite" value={next} />
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
      <Field label="Mot de passe" htmlFor="password">
        <input id="password" name="password" type="password" autoComplete="current-password" required className={inputClass} />
      </Field>
      {state.error && (
        <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-900">
          {state.error}
        </p>
      )}
      <SubmitButton pendingLabel="Connexion…" className="w-full">
        Se connecter
      </SubmitButton>
      <p className="text-center text-sm text-stone-600">
        Pas encore de compte ?{" "}
        <Link href="/inscription" className="font-medium text-emerald-900 underline underline-offset-4">
          Créer un compte
        </Link>
      </p>
      <p className="text-center text-xs leading-relaxed text-stone-500">
        Mot de passe oublié ? Demande à un admin du club : il peut t’en donner un provisoire.
      </p>
    </form>
  );
}
