const ICAL_URL =
  "https://calendar.google.com/calendar/ical/parallailement%40gmail.com/public/basic.ics";

const REVALIDATE_SECONDS = 3600;

export type CalendarEvent = {
  uid: string;
  start: Date;
  end: Date | null;
  allDay: boolean;
  title: string;
  location: string | null;
  description: string | null;
};

function unfoldLines(raw: string): string[] {
  const lines = raw.split(/\r?\n/);
  const out: string[] = [];
  for (const line of lines) {
    if ((line.startsWith(" ") || line.startsWith("\t")) && out.length) {
      out[out.length - 1] += line.slice(1);
    } else {
      out.push(line);
    }
  }
  return out;
}

function unescapeIcs(value: string): string {
  return value
    .replace(/\\n/gi, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\");
}

function parseDate(value: string, params: Record<string, string>): {
  date: Date;
  allDay: boolean;
} {
  if (params.VALUE === "DATE" || /^\d{8}$/.test(value)) {
    const y = +value.slice(0, 4);
    const m = +value.slice(4, 6) - 1;
    const d = +value.slice(6, 8);
    return { date: new Date(Date.UTC(y, m, d)), allDay: true };
  }
  const m = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)$/);
  if (!m) return { date: new Date(NaN), allDay: false };
  const [, Y, Mo, D, H, Mi, S] = m;
  return {
    date: new Date(Date.UTC(+Y, +Mo - 1, +D, +H, +Mi, +S)),
    allDay: false,
  };
}

function parseLine(
  line: string
): { name: string; params: Record<string, string>; value: string } | null {
  const colon = line.indexOf(":");
  if (colon === -1) return null;
  const head = line.slice(0, colon);
  const value = line.slice(colon + 1);
  const parts = head.split(";");
  const name = parts[0].toUpperCase();
  const params: Record<string, string> = {};
  for (const p of parts.slice(1)) {
    const eq = p.indexOf("=");
    if (eq === -1) continue;
    params[p.slice(0, eq).toUpperCase()] = p.slice(eq + 1);
  }
  return { name, params, value };
}

export async function fetchCalendarEvents(): Promise<CalendarEvent[]> {
  let text: string;
  try {
    const res = await fetch(ICAL_URL, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) {
      console.error("ICS fetch failed", res.status);
      return [];
    }
    text = await res.text();
  } catch (err) {
    console.error("ICS fetch error", err);
    return [];
  }

  const lines = unfoldLines(text);
  const events: CalendarEvent[] = [];
  let cur: Partial<CalendarEvent> | null = null;

  for (const raw of lines) {
    if (raw === "BEGIN:VEVENT") {
      cur = {};
      continue;
    }
    if (raw === "END:VEVENT") {
      if (cur && cur.start && cur.title) {
        events.push({
          uid: cur.uid ?? "",
          start: cur.start,
          end: cur.end ?? null,
          allDay: cur.allDay ?? false,
          title: cur.title,
          location: cur.location ?? null,
          description: cur.description ?? null,
        });
      }
      cur = null;
      continue;
    }
    if (!cur) continue;
    const parsed = parseLine(raw);
    if (!parsed) continue;
    const { name, params, value } = parsed;
    switch (name) {
      case "UID":
        cur.uid = value;
        break;
      case "DTSTART": {
        const { date, allDay } = parseDate(value, params);
        cur.start = date;
        cur.allDay = allDay;
        break;
      }
      case "DTEND": {
        const { date } = parseDate(value, params);
        cur.end = date;
        break;
      }
      case "SUMMARY":
        cur.title = unescapeIcs(value);
        break;
      case "LOCATION":
        cur.location = unescapeIcs(value);
        break;
      case "DESCRIPTION":
        cur.description = unescapeIcs(value);
        break;
    }
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  return events
    .filter((e) => e.start >= todayStart)
    .sort((a, b) => a.start.getTime() - b.start.getTime());
}

const PARIS_TZ = "Europe/Paris";

export function formatEventDate(event: CalendarEvent): {
  iso: string;
  label: string;
} {
  const iso = event.start.toISOString().slice(0, 10);
  const dateLabel = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: PARIS_TZ,
  }).format(event.start);

  if (event.allDay) {
    return { iso, label: dateLabel };
  }

  const time = new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: PARIS_TZ,
  }).format(event.start);

  return { iso, label: `${dateLabel} · ${time}` };
}
