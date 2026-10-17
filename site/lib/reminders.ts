export type ReminderEvent = { id: string; starts_at: string };
export type ReminderRegistration = { event_id: string; user_id: string };

export type DueReminder = {
  event_id: string;
  user_id: string;
  offset_hours: number;
  dedupe_key: string;
};

export function normalizeOffsets(value: unknown): number[] {
  const list = Array.isArray(value) ? value : [];
  const offsets = list
    .map(Number)
    .filter((hours) => Number.isInteger(hours) && hours >= 1 && hours <= 24 * 30);
  return Array.from(new Set(offsets)).sort((a, b) => a - b);
}

// Pour chaque inscrit, le rappel le plus proche du début dont la fenêtre est
// ouverte. La clé de déduplication garantit qu'il ne part qu'une fois : si
// l'événement est créé tard, on n'envoie pas les rappels « 7 jours » et
// « la veille » d'un coup, seulement le plus proche.
export function dueReminders(
  events: ReminderEvent[],
  registrations: ReminderRegistration[],
  offsetsHours: number[],
  now: Date,
): DueReminder[] {
  const offsets = normalizeOffsets(offsetsHours);
  if (offsets.length === 0) return [];
  const due: DueReminder[] = [];

  for (const event of events) {
    const start = new Date(event.starts_at).getTime();
    if (Number.isNaN(start) || start <= now.getTime()) continue;
    const hoursLeft = (start - now.getTime()) / 3_600_000;
    const offset = offsets.find((hours) => hoursLeft <= hours);
    if (offset === undefined) continue;

    for (const registration of registrations) {
      if (registration.event_id !== event.id) continue;
      due.push({
        event_id: event.id,
        user_id: registration.user_id,
        offset_hours: offset,
        dedupe_key: `reminder:${event.id}:${registration.user_id}:${offset}:${event.starts_at}`,
      });
    }
  }
  return due;
}

export function offsetLabel(hours: number): string {
  if (hours % 24 === 0) {
    const days = hours / 24;
    return days === 1 ? "la veille" : `${days} jours avant`;
  }
  return `${hours} h avant`;
}
