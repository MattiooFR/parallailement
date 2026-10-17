import { isAdmin } from "@/lib/access";
import { requireCalendarManager } from "@/lib/auth";
import { listEventTypes, listPlaces } from "@/lib/club-events";
import { deleteEventType, deletePlace } from "@/app/admin/actions";
import { SubmitButton } from "@/app/_components/ui";
import { PlaceForm, TypeForm } from "./forms";

export default async function PlacesPage() {
  const profile = await requireCalendarManager("/admin/lieux");
  const admin = isAdmin(profile);
  const [places, types] = await Promise.all([listPlaces(), admin ? listEventTypes() : Promise.resolve([])]);

  return (
    <div className="space-y-16">
      <section>
        <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">Lieux habituels</h1>
        <p className="mt-2 max-w-2xl text-stone-600">
          Enregistre les lieux qui reviennent : il suffira de les choisir dans une liste en créant un événement. Les
          coordonnées GPS sont facultatives.
        </p>
        <div className="mt-6 space-y-3">
          {places.map((place) => (
            <div key={place.id} className="rounded-xl bg-white p-3 shadow-sm">
              <PlaceForm place={place} />
              <form action={deletePlace} className="mt-1 text-right">
                <input type="hidden" name="id" value={place.id} />
                <SubmitButton variant="quiet" pendingLabel="…" className="min-h-8 text-xs">Supprimer ce lieu</SubmitButton>
              </form>
            </div>
          ))}
          <div className="rounded-xl border border-dashed border-stone-400 p-3">
            <PlaceForm />
          </div>
        </div>
      </section>

      {admin && (
        <section>
          <h2 className="font-serif text-4xl tracking-tight">Types d’événements</h2>
          <p className="mt-2 max-w-2xl text-stone-600">
            Chaque type a sa couleur dans le calendrier. Le chiffre règle l’ordre d’affichage. Supprimer un type ne
            supprime pas ses événements : ils restent, sans type.
          </p>
          <div className="mt-6 space-y-3">
            {types.map((type) => (
              <div key={type.id} className="rounded-xl bg-white p-3 shadow-sm">
                <TypeForm type={type} />
                <form action={deleteEventType} className="mt-1 text-right">
                  <input type="hidden" name="id" value={type.id} />
                  <SubmitButton variant="quiet" pendingLabel="…" className="min-h-8 text-xs">Supprimer ce type</SubmitButton>
                </form>
              </div>
            ))}
            <div className="rounded-xl border border-dashed border-stone-400 p-3">
              <TypeForm />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
