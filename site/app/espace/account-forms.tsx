"use client";

import { useActionState } from "react";
import { Field, inputClass, SubmitButton } from "@/app/_components/ui";
import { changePassword, updatePreferences, updateProfile, type FormState } from "./actions";

function Status({ state }: { state: FormState }) {
  if (state.error) return <p role="alert" className="text-sm text-rose-800">{state.error}</p>;
  if (state.ok) return <p role="status" className="text-sm text-emerald-800">{state.ok}</p>;
  return null;
}

export function ProfileForm({ fullName, phone, email }: { fullName: string; phone: string | null; email: string }) {
  const [state, action] = useActionState<FormState, FormData>(updateProfile, {});
  return (
    <form action={action} className="space-y-4">
      <Field label="Prénom et nom" htmlFor="full_name">
        <input id="full_name" name="full_name" defaultValue={fullName} required minLength={2} className={inputClass} />
      </Field>
      <Field label="Téléphone" htmlFor="phone">
        <input id="phone" name="phone" type="tel" defaultValue={phone ?? ""} className={inputClass} />
      </Field>
      <Field label="Email" hint="Pour le changer, demande à un admin." htmlFor="email">
        <input id="email" value={email} readOnly className={`${inputClass} bg-stone-100 text-stone-500`} />
      </Field>
      <div className="flex flex-wrap items-center gap-4">
        <SubmitButton variant="secondary">Enregistrer</SubmitButton>
        <Status state={state} />
      </div>
    </form>
  );
}

export function PasswordForm() {
  const [state, action] = useActionState<FormState, FormData>(changePassword, {});
  return (
    <form action={action} className="space-y-4">
      <Field label="Nouveau mot de passe" hint="10 caractères minimum." htmlFor="password">
        <input id="password" name="password" type="password" autoComplete="new-password" minLength={10} required className={inputClass} />
      </Field>
      <Field label="Encore une fois" htmlFor="confirmation">
        <input id="confirmation" name="confirmation" type="password" autoComplete="new-password" minLength={10} required className={inputClass} />
      </Field>
      <div className="flex flex-wrap items-center gap-4">
        <SubmitButton variant="secondary">Changer le mot de passe</SubmitButton>
        <Status state={state} />
      </div>
    </form>
  );
}

export function PreferencesForm({
  options,
}: {
  options: Array<{ kind: string; title: string; checked: boolean; disabledByClub: boolean }>;
}) {
  const [state, action] = useActionState<FormState, FormData>(updatePreferences, {});
  return (
    <form action={action} className="space-y-4">
      <ul className="divide-y divide-stone-200 rounded-xl border border-stone-300 bg-white">
        {options.map((option) => (
          <li key={option.kind}>
            <label className="flex min-h-12 cursor-pointer items-center justify-between gap-4 px-4 py-3">
              <span>
                <span className="block text-sm font-medium">{option.title}</span>
                {option.disabledByClub && (
                  <span className="block text-xs text-stone-500">Coupée pour tout le club en ce moment.</span>
                )}
              </span>
              <input type="checkbox" name={option.kind} defaultChecked={option.checked} className="h-5 w-5 accent-emerald-900" />
            </label>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center gap-4">
        <SubmitButton variant="secondary">Enregistrer mes alertes</SubmitButton>
        <Status state={state} />
      </div>
    </form>
  );
}
