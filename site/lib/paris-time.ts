// Les heures sont saisies et affichées à l'heure de Paris, et stockées en UTC.

export const PARIS_TZ = "Europe/Paris";

const partsFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: PARIS_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export function toParisParts(value: Date | string): { date: string; time: string } {
  const parts = Object.fromEntries(
    partsFormatter.formatToParts(new Date(value)).map((part) => [part.type, part.value]),
  );
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${parts.hour}:${parts.minute}`,
  };
}

function offsetMinutesAt(instant: number): number {
  const { date, time } = toParisParts(new Date(instant));
  const asUtc = Date.parse(`${date}T${time}:00Z`);
  return Math.round((asUtc - Math.floor(instant / 60000) * 60000) / 60000);
}

// "2026-10-24" + "09:30" (heure de Paris) → Date UTC. Renvoie null si invalide.
export function parisLocalToDate(date: string, time = "00:00"): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return null;
  const naive = Date.parse(`${date}T${time}:00Z`);
  if (Number.isNaN(naive)) return null;
  let instant = naive - offsetMinutesAt(naive) * 60000;
  // Second passage pour les jours de changement d'heure.
  instant = naive - offsetMinutesAt(instant) * 60000;
  const check = toParisParts(new Date(instant));
  if (check.date !== date) return null;
  return new Date(instant);
}

const longDate = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: PARIS_TZ,
});

const shortDate = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  timeZone: PARIS_TZ,
});

const dayMonthYear = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: PARIS_TZ,
});

function hourLabel(value: Date): string {
  const { time } = toParisParts(value);
  const [hours, minutes] = time.split(":");
  return minutes === "00" ? `${Number(hours)} h` : `${Number(hours)} h ${minutes}`;
}

export function formatLongDate(value: Date | string): string {
  return longDate.format(new Date(value));
}

export function formatDateTime(value: Date | string): string {
  const date = new Date(value);
  return `${dayMonthYear.format(date)} à ${hourLabel(date)}`;
}

// « samedi 24 octobre 2026 · 9 h 30 – 17 h » ou « du 3 au 6 septembre 2026 ».
export function formatEventWhen(event: {
  starts_at: string;
  ends_at: string | null;
  all_day: boolean;
}): string {
  const start = new Date(event.starts_at);
  const end = event.ends_at ? new Date(event.ends_at) : null;
  const startDay = toParisParts(start).date;
  const endDay = end ? toParisParts(end).date : startDay;

  if (startDay !== endDay && end) {
    const range = `du ${shortDate.format(start)} au ${dayMonthYear.format(end)}`;
    return event.all_day ? range : `${range} · ${hourLabel(start)}`;
  }

  const day = longDate.format(start);
  if (event.all_day) return day;
  return end && end.getTime() !== start.getTime()
    ? `${day} · ${hourLabel(start)} – ${hourLabel(end)}`
    : `${day} · ${hourLabel(start)}`;
}
