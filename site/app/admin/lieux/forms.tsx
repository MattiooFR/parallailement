"use client";

import { useActionState } from "react";
import { saveEventType, savePlace, type SimpleState } from "@/app/admin/actions";
import { inputClass, SubmitButton } from "@/app/_components/ui";

function Status({ state }: { state: SimpleState }) {
  if (state.error) return <p role="alert" className="text-sm text-rose-800">{state.error}</p>;
  if (state.ok) return <p role="status" className="text-sm text-emerald-800">{state.ok}</p>;
  return null;
}

export function PlaceForm({
  place,
}: {
  place?: { id: string; name: string; address: string; latitude: number | null; longitude: number | null };
}) {
  const [state, action] = useActionState<SimpleState, FormData>(savePlace, {});
  return (
    <form action={action} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_6rem_6rem_auto] sm:items-center">
      {place && <input type="hidden" name="id" value={place.id} />}
      <input name="name" aria-label="Nom" required defaultValue={place?.name} placeholder="Nom (ex. Déco de Collantigue)" className={inputClass} />
      <input name="address" aria-label="Adresse" defaultValue={place?.address} placeholder="Adresse ou indication" className={inputClass} />
      <input name="latitude" aria-label="Latitude" inputMode="decimal" defaultValue={place?.latitude ?? ""} placeholder="Lat." className={inputClass} />
      <input name="longitude" aria-label="Longitude" inputMode="decimal" defaultValue={place?.longitude ?? ""} placeholder="Long." className={inputClass} />
      <SubmitButton variant={place ? "secondary" : "primary"} pendingLabel="…">
        {place ? "Enregistrer" : "Ajouter"}
      </SubmitButton>
      <div className="sm:col-span-5">
        <Status state={state} />
      </div>
    </form>
  );
}

export function TypeForm({ type }: { type?: { id: string; name: string; color: string; position: number } }) {
  const [state, action] = useActionState<SimpleState, FormData>(saveEventType, {});
  return (
    <form action={action} className="grid grid-cols-[3rem_minmax(0,1fr)_5rem] gap-2 sm:grid-cols-[3rem_minmax(0,1fr)_5rem_auto] sm:items-center">
      {type && <input type="hidden" name="id" value={type.id} />}
      <input name="color" type="color" aria-label="Couleur" defaultValue={type?.color ?? "#065f46"} className="h-11 w-12 cursor-pointer rounded-lg border border-stone-300 bg-white p-1" />
      <input name="name" aria-label="Nom du type" required defaultValue={type?.name} placeholder="Nouveau type" className={inputClass} />
      <input name="position" aria-label="Ordre" type="number" defaultValue={type?.position ?? 0} className={inputClass} />
      <div className="col-span-3 sm:col-span-1">
        <SubmitButton variant={type ? "secondary" : "primary"} pendingLabel="…">
          {type ? "Enregistrer" : "Ajouter"}
        </SubmitButton>
      </div>
      <div className="col-span-3 sm:col-span-4">
        <Status state={state} />
      </div>
    </form>
  );
}
