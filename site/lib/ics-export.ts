import { toParisParts } from "./paris-time";

export type IcsEvent = {
  id: string;
  title: string;
  description: string;
  starts_at: string;
  ends_at: string | null;
  all_day: boolean;
  location_name: string;
  address: string;
  status: string;
  updated_at: string;
  url: string;
};

function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

// Plie les lignes à 75 octets comme le demande la RFC 5545.
function fold(line: string): string {
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= 75) return line;
  const out: string[] = [];
  let current = "";
  let size = 0;
  for (const char of line) {
    const charSize = new TextEncoder().encode(char).length;
    if (size + charSize > (out.length === 0 ? 75 : 74)) {
      out.push(current);
      current = "";
      size = 0;
    }
    current += char;
    size += charSize;
  }
  out.push(current);
  return out.join("\r\n ");
}

function utcStamp(value: string): string {
  return new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function dateStamp(value: Date): string {
  return toParisParts(value).date.replace(/-/g, "");
}

export function buildIcs(events: IcsEvent[], calendarName: string): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Parallailement//Calendrier du club//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(calendarName)}`,
    "X-WR-TIMEZONE:Europe/Paris",
  ];

  for (const event of events) {
    const location = [event.location_name, event.address].filter(Boolean).join(", ");
    lines.push("BEGIN:VEVENT", `UID:${event.id}@parallailement.fr`, `DTSTAMP:${utcStamp(event.updated_at)}`);
    if (event.all_day) {
      const start = new Date(event.starts_at);
      const lastDay = new Date(event.ends_at ?? event.starts_at);
      const endExclusive = new Date(lastDay.getTime() + 24 * 3_600_000);
      lines.push(`DTSTART;VALUE=DATE:${dateStamp(start)}`, `DTEND;VALUE=DATE:${dateStamp(endExclusive)}`);
    } else {
      lines.push(`DTSTART:${utcStamp(event.starts_at)}`);
      if (event.ends_at) lines.push(`DTEND:${utcStamp(event.ends_at)}`);
    }
    lines.push(`SUMMARY:${escapeText(event.title)}`);
    if (event.description) lines.push(`DESCRIPTION:${escapeText(event.description)}`);
    if (location) lines.push(`LOCATION:${escapeText(location)}`);
    lines.push(`URL:${event.url}`);
    lines.push(`STATUS:${event.status === "cancelled" ? "CANCELLED" : "CONFIRMED"}`);
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}
