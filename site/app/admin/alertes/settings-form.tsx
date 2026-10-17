"use client";

import { useActionState } from "react";
import { updateNotificationSettings, type SimpleState } from "@/app/admin/actions";
import { inputClass, SubmitButton } from "@/app/_components/ui";

type Setting = { kind: string; title: string; audience: string; enabled: boolean };

const reminderChoices = [
  { hours: 168, label: "1 semaine avant" },
  { hours: 72, label: "3 jours avant" },
  { hours: 24, label: "La veille" },
  { hours: 3, label: "3 h avant" },
];

export function NotificationSettingsForm({
  settings,
  extraRecipients,
  offsets,
}: {
  settings: Setting[];
  extraRecipients: string[];
  offsets: number[];
}) {
  const [state, action] = useActionState<SimpleState, FormData>(updateNotificationSettings, {});
  return (
    <form action={action} className="space-y-6">
      <ul className="divide-y divide-stone-200 rounded-2xl border border-stone-300 bg-white">
        {settings.map((setting) => (
          <li key={setting.kind} className="p-4 sm:p-5">
            <label className="flex cursor-pointer items-start justify-between gap-4">
              <span>
                <span className="block font-medium">{setting.title}</span>
                <span className="block text-sm text-stone-500">Pour : {setting.audience}</span>
              </span>
              <input type="checkbox" name={`enabled_${setting.kind}`} defaultChecked={setting.enabled} className="mt-1 h-5 w-5 accent-emerald-900" />
            </label>

            {setting.kind === "signup_pending" && (
              <div className="mt-4">
                <label htmlFor="extra_recipients" className="block text-sm font-medium text-stone-800">
                  Autres adresses à prévenir
                </label>
                <p className="text-xs text-stone-500">En plus des admins, par exemple l’adresse du bureau. Une par ligne.</p>
                <textarea
                  id="extra_recipients"
                  name="extra_recipients"
                  rows={2}
                  defaultValue={extraRecipients.join("\n")}
                  className={`${inputClass} mt-1.5`}
                />
              </div>
            )}

            {setting.kind === "event_reminder" && (
              <fieldset className="mt-4">
                <legend className="text-sm font-medium text-stone-800">Quand envoyer le rappel</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {reminderChoices.map((choice) => (
                    <label key={choice.hours} className="cursor-pointer">
                      <input type="checkbox" name="offsets_hours" value={choice.hours} defaultChecked={offsets.includes(choice.hours)} className="peer sr-only" />
                      <span className="inline-flex min-h-10 items-center rounded-full border border-stone-300 px-3.5 text-sm transition peer-checked:border-stone-900 peer-checked:bg-stone-900 peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-emerald-900">
                        {choice.label}
                      </span>
                    </label>
                  ))}
                </div>
                <p className="mt-2 text-xs text-stone-500">
                  Si plusieurs rappels tombent en même temps (événement créé tard), seul le plus proche part.
                </p>
              </fieldset>
            )}
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center gap-4">
        <SubmitButton>Enregistrer les réglages</SubmitButton>
        {state.error && <p role="alert" className="text-sm text-rose-800">{state.error}</p>}
        {state.ok && <p role="status" className="text-sm text-emerald-800">{state.ok}</p>}
      </div>
    </form>
  );
}
