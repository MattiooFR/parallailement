import type { ClubEvent } from "@/lib/club-events";
import { toParisParts } from "@/lib/paris-time";
import type { EventFormDefaults } from "./event-form";

export const blankEvent: EventFormDefaults = {
  title: "",
  type_id: "",
  description: "",
  start_date: "",
  start_time: "09:00",
  end_date: "",
  end_time: "",
  all_day: false,
  place_id: "",
  location_name: "",
  address: "",
  visibility: "public",
  registrations_enabled: true,
  capacity: "",
  deadline_date: "",
  deadline_time: "",
  status: "draft",
};

export function eventToDefaults(event: ClubEvent, options: { copy?: boolean } = {}): EventFormDefaults {
  const start = toParisParts(event.starts_at);
  const end = event.ends_at ? toParisParts(event.ends_at) : null;
  const deadline = event.registration_deadline ? toParisParts(event.registration_deadline) : null;
  return {
    id: options.copy ? undefined : event.id,
    title: event.title,
    type_id: event.type_id ?? "",
    description: event.description,
    // Une copie repart sans date : c'est presque toujours ce qui change.
    start_date: options.copy ? "" : start.date,
    start_time: event.all_day ? "09:00" : start.time,
    end_date: options.copy || !end || end.date === start.date ? "" : end.date,
    end_time: end && !event.all_day ? end.time : "",
    all_day: event.all_day,
    place_id: event.place_id ?? "",
    location_name: event.location_name,
    address: event.address,
    visibility: event.visibility,
    registrations_enabled: event.registrations_enabled,
    capacity: event.capacity === null ? "" : String(event.capacity),
    deadline_date: options.copy || !deadline ? "" : deadline.date,
    deadline_time: options.copy || !deadline ? "" : deadline.time,
    status: options.copy ? "draft" : event.status,
  };
}
