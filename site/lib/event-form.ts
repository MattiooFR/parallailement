import type { EventStatus, EventVisibility } from "./access";
import { parisLocalToDate } from "./paris-time";

export type EventInput = {
  title: string;
  type_id: string | null;
  description: string;
  starts_at: string;
  ends_at: string | null;
  all_day: boolean;
  place_id: string | null;
  location_name: string;
  address: string;
  visibility: EventVisibility;
  status: Exclude<EventStatus, "cancelled">;
  registrations_enabled: boolean;
  capacity: number | null;
  registration_deadline: string | null;
};

export type EventFormErrors = Partial<
  Record<"title" | "start" | "end" | "capacity" | "deadline", string>
>;

export type EventFormResult =
  | { ok: true; value: EventInput }
  | { ok: false; errors: EventFormErrors };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function text(form: FormData, name: string, max = 5000): string {
  const value = form.get(name);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function optionalId(form: FormData, name: string): string | null {
  const value = text(form, name, 64);
  return UUID.test(value) ? value : null;
}

export function parseEventForm(form: FormData): EventFormResult {
  const errors: EventFormErrors = {};
  const title = text(form, "title", 200);
  if (!title) errors.title = "Donne un titre à l’événement.";

  const allDay = form.get("all_day") === "on";
  const startDate = text(form, "start_date", 10);
  const startTime = allDay ? "00:00" : text(form, "start_time", 5) || "09:00";
  const start = parisLocalToDate(startDate, startTime);
  if (!start) errors.start = "Indique une date de début valide.";

  const endDate = text(form, "end_date", 10);
  const endTime = text(form, "end_time", 5);
  let end: Date | null = null;
  if (allDay) {
    if (endDate) end = parisLocalToDate(endDate, "23:59");
    if (endDate && !end) errors.end = "La date de fin n’est pas valide.";
  } else if (endDate || endTime) {
    end = parisLocalToDate(endDate || startDate, endTime || "23:59");
    if (!end) errors.end = "La fin n’est pas valide.";
  }
  if (start && end && end < start) errors.end = "La fin doit venir après le début.";

  const capacityRaw = text(form, "capacity", 6);
  let capacity: number | null = null;
  if (capacityRaw) {
    capacity = Number(capacityRaw);
    if (!Number.isInteger(capacity) || capacity < 1) {
      errors.capacity = "Le nombre de places doit être un nombre entier positif.";
    }
  }

  const deadlineDate = text(form, "deadline_date", 10);
  let deadline: Date | null = null;
  if (deadlineDate) {
    deadline = parisLocalToDate(deadlineDate, text(form, "deadline_time", 5) || "23:59");
    if (!deadline) errors.deadline = "La date limite n’est pas valide.";
  }

  if (Object.keys(errors).length > 0 || !start) return { ok: false, errors };

  return {
    ok: true,
    value: {
      title,
      type_id: optionalId(form, "type_id"),
      description: text(form, "description", 5000),
      starts_at: start.toISOString(),
      ends_at: end ? end.toISOString() : null,
      all_day: allDay,
      place_id: optionalId(form, "place_id"),
      location_name: text(form, "location_name", 200),
      address: text(form, "address", 300),
      visibility: form.get("visibility") === "members" ? "members" : "public",
      status: form.get("intent") === "draft" ? "draft" : "published",
      registrations_enabled: form.get("registrations_enabled") === "on",
      capacity,
      registration_deadline: deadline ? deadline.toISOString() : null,
    },
  };
}

// Ce qui, une fois modifié, justifie de prévenir les inscrits.
export function describeEventChanges(
  before: Pick<EventInput, "starts_at" | "ends_at" | "all_day" | "location_name" | "address">,
  after: Pick<EventInput, "starts_at" | "ends_at" | "all_day" | "location_name" | "address">,
): string[] {
  const changes: string[] = [];
  if (
    new Date(before.starts_at).getTime() !== new Date(after.starts_at).getTime() ||
    (before.ends_at ? new Date(before.ends_at).getTime() : null) !==
      (after.ends_at ? new Date(after.ends_at).getTime() : null) ||
    before.all_day !== after.all_day
  ) {
    changes.push("date ou horaire");
  }
  if (before.location_name !== after.location_name || before.address !== after.address) {
    changes.push("lieu");
  }
  return changes;
}
