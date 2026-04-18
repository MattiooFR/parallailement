export type CalendarEvent = {
  date: string;
  label: string;
  title: string;
  place: string;
  description: string;
};

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Europe/Paris",
});

const dateTimeFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Paris",
});

function unfold(ics: string): string[] {
  const raw = ics.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  for (const line of raw) {
    if (line.startsWith(" ") || line.startsWith("\t")) {
      out[out.length - 1] += line.slice(1);
    } else {
      out.push(line);
    }
  }
  return out;
}

function unescape(v: string): string {
  return v
    .replace(/\\n/gi, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\");
}

function parseDtStart(
  value: string,
  params: Record<string, string>,
): { date: Date; isAllDay: boolean } | null {
  const isAllDay = params.VALUE === "DATE" || /^\d{8}$/.test(value);

  if (isAllDay) {
    const m = /^(\d{4})(\d{2})(\d{2})$/.exec(value);
    if (!m) return null;
    const d = new Date(`${m[1]}-${m[2]}-${m[3]}T00:00:00`);
    return Number.isNaN(d.getTime()) ? null : { date: d, isAllDay: true };
  }

  const m = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)$/.exec(value);
  if (!m) return null;
  const d = new Date(
    `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}${m[7] || ""}`,
  );
  return Number.isNaN(d.getTime()) ? null : { date: d, isAllDay: false };
}

type RawField = { value: string; params: Record<string, string> };

function parseEvents(ics: string): CalendarEvent[] {
  const lines = unfold(ics);
  const events: CalendarEvent[] = [];
  let current: Record<string, RawField> | null = null;

  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      current = {};
      continue;
    }
    if (line === "END:VEVENT") {
      if (current && current.STATUS?.value !== "CANCELLED") {
        const dtstart = current.DTSTART;
        if (dtstart) {
          const parsed = parseDtStart(dtstart.value, dtstart.params);
          if (parsed) {
            events.push({
              date: parsed.date.toISOString(),
              label: parsed.isAllDay
                ? dateFormatter.format(parsed.date)
                : dateTimeFormatter.format(parsed.date),
              title:
                unescape(current.SUMMARY?.value ?? "").trim() || "Événement",
              place: unescape(current.LOCATION?.value ?? "").trim(),
              description: unescape(current.DESCRIPTION?.value ?? "").trim(),
            });
          }
        }
      }
      current = null;
      continue;
    }
    if (!current) continue;

    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const left = line.slice(0, colon);
    const value = line.slice(colon + 1);
    const parts = left.split(";");
    const key = parts[0];
    const params: Record<string, string> = {};
    for (const p of parts.slice(1)) {
      const eq = p.indexOf("=");
      if (eq !== -1) params[p.slice(0, eq)] = p.slice(eq + 1);
    }
    current[key] = { value, params };
  }

  return events;
}

export async function fetchGoogleCalendarEvents(): Promise<
  CalendarEvent[] | null
> {
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  if (!calendarId) return null;

  const url = `https://calendar.google.com/calendar/ical/${encodeURIComponent(
    calendarId,
  )}/public/basic.ics`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 3600, tags: ["calendar"] },
    });
    if (!res.ok) return null;
    const ics = await res.text();
    const now = Date.now();
    const events = parseEvents(ics)
      .filter((e) => new Date(e.date).getTime() >= now)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 20);
    return events;
  } catch {
    return null;
  }
}
