"use client";

import Link from "next/link";
import { startTransition, useActionState, useState, type FormEvent } from "react";
import type { EventFormState } from "@/app/admin/actions";
import { Field, inputClass, SubmitButton } from "@/app/_components/ui";

export type EventFormDefaults = {
  id?: string;
  title: string;
  type_id: string;
  description: string;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  all_day: boolean;
  place_id: string;
  location_name: string;
  address: string;
  visibility: "public" | "members";
  registrations_enabled: boolean;
  capacity: string;
  deadline_date: string;
  deadline_time: string;
  status: "draft" | "published" | "cancelled";
};

type Option = { id: string; name: string };

export function EventForm({
  action,
  defaults,
  types,
  places,
  hasRegistrants = false,
}: {
  action: (state: EventFormState, form: FormData) => Promise<EventFormState>;
  defaults: EventFormDefaults;
  types: Array<Option & { color: string }>;
  places: Array<Option & { address: string }>;
  hasRegistrants?: boolean;
}) {
  const [state, formAction, isPending] = useActionState<EventFormState, FormData>(action, {});
  const [allDay, setAllDay] = useState(defaults.all_day);
  const [multiDay, setMultiDay] = useState(Boolean(defaults.end_date && defaults.end_date !== defaults.start_date));
  const [placeId, setPlaceId] = useState(defaults.place_id);
  const [locationName, setLocationName] = useState(defaults.location_name);
  const [address, setAddress] = useState(defaults.address);
  const [registrations, setRegistrations] = useState(defaults.registrations_enabled);
  const errors = state.errors ?? {};
  const isNew = !defaults.id;

  function choosePlace(value: string) {
    setPlaceId(value);
    const place = places.find((item) => item.id === value);
    setLocationName(place?.name ?? "");
    setAddress(place?.address ?? "");
  }

  // Soumission manuelle : l'action native de React vide le formulaire, même
  // quand il revient avec des erreurs à corriger.
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const data = new FormData(event.currentTarget, submitter);
    startTransition(() => formAction(data));
  }

  return (
    <form onSubmit={submit} className="space-y-8">
      {defaults.id && <input type="hidden" name="id" value={defaults.id} />}

      <Field label="Titre" error={errors.title} htmlFor="title">
        <input
          id="title"
          name="title"
          required
          maxLength={200}
          defaultValue={defaults.title}
          placeholder="Sortie au Montaut, AG du club…"
          className={`${inputClass} text-lg`}
        />
      </Field>

      {types.length > 0 && (
        <fieldset>
          <legend className="text-sm font-medium text-stone-800">Type</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {types.map((type) => (
              <label key={type.id} className="cursor-pointer">
                <input type="radio" name="type_id" value={type.id} defaultChecked={defaults.type_id === type.id} className="peer sr-only" />
                <span className="inline-flex min-h-10 items-center gap-2 rounded-full border border-stone-300 bg-white px-3.5 text-sm transition peer-checked:border-stone-900 peer-checked:bg-stone-900 peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-emerald-900">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: type.color }} aria-hidden="true" />
                  {type.name}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset className="space-y-4 rounded-2xl border border-stone-300 bg-white/60 p-4 sm:p-5">
        <legend className="px-1 text-sm font-medium text-stone-800">Quand</legend>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <label className="inline-flex min-h-10 items-center gap-2 text-sm">
            <input type="checkbox" name="all_day" checked={allDay} onChange={(event) => setAllDay(event.target.checked)} className="h-5 w-5 accent-emerald-900" />
            Journée entière
          </label>
          <label className="inline-flex min-h-10 items-center gap-2 text-sm">
            <input type="checkbox" checked={multiDay} onChange={(event) => setMultiDay(event.target.checked)} className="h-5 w-5 accent-emerald-900" />
            Sur plusieurs jours
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Field label={multiDay ? "Du" : "Date"} error={errors.start} htmlFor="start_date">
              <input id="start_date" name="start_date" type="date" required defaultValue={defaults.start_date} className={inputClass} />
            </Field>
          </div>
          {!allDay && (
            <Field label="Début" htmlFor="start_time">
              <input id="start_time" name="start_time" type="time" defaultValue={defaults.start_time} className={inputClass} />
            </Field>
          )}
          {multiDay && (
            <div className="col-span-2 sm:col-span-1">
              <Field label="Au" htmlFor="end_date">
                <input id="end_date" name="end_date" type="date" defaultValue={defaults.end_date} className={inputClass} />
              </Field>
            </div>
          )}
          {!allDay && (
            <Field label="Fin" hint={multiDay ? undefined : "Facultatif"} error={errors.end} htmlFor="end_time">
              <input id="end_time" name="end_time" type="time" defaultValue={defaults.end_time} className={inputClass} />
            </Field>
          )}
        </div>
        {allDay && errors.end && <p className="text-sm text-rose-800">{errors.end}</p>}
      </fieldset>

      <fieldset className="space-y-4 rounded-2xl border border-stone-300 bg-white/60 p-4 sm:p-5">
        <legend className="px-1 text-sm font-medium text-stone-800">Où</legend>
        {places.length > 0 && (
          <Field label="Lieu habituel" htmlFor="place_id">
            <select id="place_id" name="place_id" value={placeId} onChange={(event) => choosePlace(event.target.value)} className={inputClass}>
              <option value="">Autre lieu…</option>
              {places.map((place) => (
                <option key={place.id} value={place.id}>
                  {place.name}
                </option>
              ))}
            </select>
          </Field>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Nom du lieu" htmlFor="location_name">
            <input
              id="location_name"
              name="location_name"
              value={locationName}
              onChange={(event) => setLocationName(event.target.value)}
              placeholder="Décollage de Collantigue"
              className={inputClass}
            />
          </Field>
          <Field label="Adresse" htmlFor="address">
            <input
              id="address"
              name="address"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="65410 Ilhet"
              className={inputClass}
            />
          </Field>
        </div>
        <p className="text-xs text-stone-500">
          Un lieu qui revient souvent ?{" "}
          <Link href="/admin/lieux" className="underline underline-offset-2">
            Enregistre-le
          </Link>{" "}
          pour ne plus le retaper.
        </p>
      </fieldset>

      <Field label="Description" hint="Programme, matériel, niveau, covoiturage… Facultatif." htmlFor="description">
        <textarea id="description" name="description" rows={5} defaultValue={defaults.description} className={`${inputClass} min-h-32`} />
      </Field>

      <fieldset>
        <legend className="text-sm font-medium text-stone-800">Qui peut le voir</legend>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:max-w-md">
          {(
            [
              ["public", "Tout le monde", "Sur la page d’accueil"],
              ["members", "Les membres", "Connectés et validés"],
            ] as const
          ).map(([value, label, hint]) => (
            <label key={value} className="cursor-pointer">
              <input type="radio" name="visibility" value={value} defaultChecked={defaults.visibility === value} className="peer sr-only" />
              <span className="block rounded-xl border border-stone-300 bg-white px-3 py-2.5 transition peer-checked:border-emerald-900 peer-checked:ring-2 peer-checked:ring-emerald-900/20 peer-focus-visible:outline-2 peer-focus-visible:outline-emerald-900">
                <span className="block text-sm font-medium">{label}</span>
                <span className="block text-xs text-stone-500">{hint}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-4 rounded-2xl border border-stone-300 bg-white/60 p-4 sm:p-5">
        <legend className="px-1 text-sm font-medium text-stone-800">Inscriptions</legend>
        <label className="inline-flex min-h-10 items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="registrations_enabled"
            checked={registrations}
            onChange={(event) => setRegistrations(event.target.checked)}
            className="h-5 w-5 accent-emerald-900"
          />
          Les membres peuvent s’inscrire (« J’y vais »)
        </label>
        {registrations && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Field label="Places max" hint="Vide = sans limite" error={errors.capacity} htmlFor="capacity">
              <input id="capacity" name="capacity" type="number" inputMode="numeric" min={1} defaultValue={defaults.capacity} className={inputClass} />
            </Field>
            <div className="col-span-2 sm:col-span-2">
              <Field label="Inscriptions jusqu’au" hint="Facultatif" error={errors.deadline} htmlFor="deadline_date">
                <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-2">
                  <input id="deadline_date" name="deadline_date" type="date" defaultValue={defaults.deadline_date} className={inputClass} />
                  <input aria-label="Heure limite" name="deadline_time" type="time" defaultValue={defaults.deadline_time} className={inputClass} />
                </div>
              </Field>
            </div>
          </div>
        )}
      </fieldset>

      {state.error && (
        <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-900">
          {state.error}
        </p>
      )}
      {Object.keys(errors).length > 0 && (
        <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-900">
          Il reste des champs à corriger plus haut.
        </p>
      )}

      <div className="sticky bottom-0 -mx-4 border-t border-stone-300 bg-[#f2efe7]/95 px-4 py-4 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
        {!isNew && defaults.status === "published" && hasRegistrants && (
          <label className="mb-3 flex items-center gap-2 text-sm text-stone-700">
            <input type="checkbox" name="notify" defaultChecked className="h-5 w-5 accent-emerald-900" />
            Prévenir les inscrits par email si la date ou le lieu change
          </label>
        )}
        <div className="flex flex-wrap gap-3">
          {defaults.status === "cancelled" ? (
            <SubmitButton pending={isPending} name="intent" value="publish" pendingLabel="Enregistrement…">
              Enregistrer
            </SubmitButton>
          ) : (
            <>
              <SubmitButton pending={isPending} name="intent" value="publish" pendingLabel="Publication…">
                {isNew || defaults.status === "draft" ? "Publier" : "Enregistrer"}
              </SubmitButton>
              {(isNew || defaults.status === "draft") && (
                <SubmitButton pending={isPending} name="intent" value="draft" variant="secondary" pendingLabel="Enregistrement…">
                  Garder en brouillon
                </SubmitButton>
              )}
            </>
          )}
        </div>
      </div>
    </form>
  );
}
