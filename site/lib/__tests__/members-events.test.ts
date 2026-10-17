import { describe, expect, it } from "vitest";
import {
  canManageCalendar,
  canOpenAdmin,
  canSeeEvent,
  canViewStages,
  isAdmin,
  type MemberRights,
} from "../access";
import { describeEventChanges, parseEventForm } from "../event-form";
import { buildIcs } from "../ics-export";
import { formatEventWhen, parisLocalToDate, toParisParts } from "../paris-time";
import { dueReminders, normalizeOffsets } from "../reminders";

const member = (overrides: Partial<MemberRights> = {}): MemberRights => ({
  status: "active",
  is_admin: false,
  can_manage_calendar: false,
  can_view_stages: false,
  ...overrides,
});

describe("access rules", () => {
  it("gives nothing private to pending, rejected or suspended accounts", () => {
    for (const status of ["pending", "rejected", "suspended"] as const) {
      const account = member({ status, is_admin: true, can_manage_calendar: true, can_view_stages: true });
      expect(isAdmin(account)).toBe(false);
      expect(canManageCalendar(account)).toBe(false);
      expect(canViewStages(account)).toBe(false);
      expect(canSeeEvent(account, { visibility: "members", status: "published" })).toBe(false);
    }
  });

  it("lets admins do everything and rights add up", () => {
    expect(canManageCalendar(member({ is_admin: true }))).toBe(true);
    expect(canViewStages(member({ is_admin: true }))).toBe(true);
    expect(canViewStages(member({ can_view_stages: true }))).toBe(true);
    expect(canManageCalendar(member({ can_view_stages: true }))).toBe(false);
    expect(canOpenAdmin(member({ can_manage_calendar: true }))).toBe(true);
    expect(isAdmin(member({ can_manage_calendar: true }))).toBe(false);
  });

  it("hides drafts from members and members-only events from visitors", () => {
    expect(canSeeEvent(null, { visibility: "public", status: "published" })).toBe(true);
    expect(canSeeEvent(null, { visibility: "public", status: "cancelled" })).toBe(true);
    expect(canSeeEvent(null, { visibility: "members", status: "published" })).toBe(false);
    expect(canSeeEvent(member(), { visibility: "members", status: "published" })).toBe(true);
    expect(canSeeEvent(member(), { visibility: "public", status: "draft" })).toBe(false);
    expect(canSeeEvent(member({ can_manage_calendar: true }), { visibility: "public", status: "draft" })).toBe(true);
  });
});

describe("Paris time", () => {
  it("converts summer and winter local times to UTC", () => {
    expect(parisLocalToDate("2026-07-14", "09:30")?.toISOString()).toBe("2026-07-14T07:30:00.000Z");
    expect(parisLocalToDate("2026-12-05", "09:30")?.toISOString()).toBe("2026-12-05T08:30:00.000Z");
  });

  it("handles the day clocks go back", () => {
    expect(parisLocalToDate("2026-10-25", "12:00")?.toISOString()).toBe("2026-10-25T11:00:00.000Z");
    expect(toParisParts("2026-10-25T11:00:00.000Z")).toEqual({ date: "2026-10-25", time: "12:00" });
  });

  it("rejects malformed input", () => {
    expect(parisLocalToDate("2026-02-31", "10:00")).toBeNull();
    expect(parisLocalToDate("", "10:00")).toBeNull();
    expect(parisLocalToDate("2026-02-10", "9h")).toBeNull();
  });

  it("formats single days, time ranges and multi-day events", () => {
    expect(
      formatEventWhen({ starts_at: "2026-10-24T07:30:00.000Z", ends_at: "2026-10-24T15:00:00.000Z", all_day: false }),
    ).toBe("samedi 24 octobre 2026 · 9 h 30 – 17 h");
    expect(
      formatEventWhen({ starts_at: "2026-09-02T22:00:00.000Z", ends_at: "2026-09-06T21:59:00.000Z", all_day: true }),
    ).toBe("du 3 septembre au 6 septembre 2026");
  });
});

function form(values: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

describe("parseEventForm", () => {
  it("builds a timed event in Paris time", () => {
    const result = parseEventForm(
      form({
        title: " Sortie au Montaut ",
        start_date: "2026-10-24",
        start_time: "09:30",
        end_time: "17:00",
        visibility: "members",
        registrations_enabled: "on",
        capacity: "8",
        intent: "publish",
      }),
    );
    expect(result).toMatchObject({
      ok: true,
      value: {
        title: "Sortie au Montaut",
        starts_at: "2026-10-24T07:30:00.000Z",
        ends_at: "2026-10-24T15:00:00.000Z",
        visibility: "members",
        status: "published",
        capacity: 8,
        registrations_enabled: true,
      },
    });
  });

  it("stores all-day events from midnight to the end of the last day", () => {
    const result = parseEventForm(
      form({ title: "Stage", start_date: "2026-09-03", end_date: "2026-09-06", all_day: "on", intent: "draft" }),
    );
    expect(result.ok && result.value).toMatchObject({
      all_day: true,
      starts_at: "2026-09-02T22:00:00.000Z",
      ends_at: "2026-09-06T21:59:00.000Z",
      status: "draft",
    });
  });

  it("reports every invalid field", () => {
    const result = parseEventForm(
      form({ title: "", start_date: "2026-10-24", start_time: "10:00", end_time: "08:00", capacity: "0" }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(Object.keys(result.errors).sort()).toEqual(["capacity", "end", "title"]);
  });

  it("ignores ids that are not uuids", () => {
    const result = parseEventForm(form({ title: "A", start_date: "2026-10-24", type_id: "x' or 1=1" }));
    expect(result.ok && result.value.type_id).toBeNull();
  });
});

describe("describeEventChanges", () => {
  const base = { starts_at: "2026-10-24T07:30:00.000Z", ends_at: null, all_day: false, location_name: "Déco", address: "" };
  it("only flags date and place changes", () => {
    expect(describeEventChanges(base, { ...base })).toEqual([]);
    expect(describeEventChanges(base, { ...base, starts_at: "2026-10-24T08:30:00.000Z", address: "Ilhet" })).toEqual([
      "date ou horaire",
      "lieu",
    ]);
  });
});

describe("dueReminders", () => {
  const events = [{ id: "e1", starts_at: "2026-10-24T07:30:00.000Z" }];
  const registrations = [
    { event_id: "e1", user_id: "u1" },
    { event_id: "e2", user_id: "u2" },
  ];

  it("waits until the reminder window opens", () => {
    expect(dueReminders(events, registrations, [24], new Date("2026-10-23T06:00:00.000Z"))).toEqual([]);
  });

  it("sends the closest open reminder only", () => {
    const due = dueReminders(events, registrations, [168, 24], new Date("2026-10-23T09:00:00.000Z"));
    expect(due).toEqual([
      {
        event_id: "e1",
        user_id: "u1",
        offset_hours: 24,
        dedupe_key: "reminder:e1:u1:24:2026-10-24T07:30:00.000Z",
      },
    ]);
  });

  it("never reminds about past events", () => {
    expect(dueReminders(events, registrations, [24], new Date("2026-10-24T08:00:00.000Z"))).toEqual([]);
  });

  it("cleans offsets typed in the admin", () => {
    expect(normalizeOffsets([24, "168", 24, -1, 2.5, "x"])).toEqual([24, 168]);
  });
});

describe("buildIcs", () => {
  it("exports timed and all-day events", () => {
    const ics = buildIcs(
      [
        {
          id: "a",
          title: "Fête du club, édition 2026",
          description: "Ligne 1\nLigne 2",
          starts_at: "2026-10-24T07:30:00.000Z",
          ends_at: null,
          all_day: false,
          location_name: "Ilhet",
          address: "",
          status: "published",
          updated_at: "2026-10-01T10:00:00.000Z",
          url: "https://parallailement.fr/evenements/a",
        },
        {
          id: "b",
          title: "Stage",
          description: "",
          starts_at: "2026-09-02T22:00:00.000Z",
          ends_at: "2026-09-06T21:59:00.000Z",
          all_day: true,
          location_name: "",
          address: "",
          status: "cancelled",
          updated_at: "2026-10-01T10:00:00.000Z",
          url: "https://parallailement.fr/evenements/b",
        },
      ],
      "Parallailement",
    );
    expect(ics).toContain("DTSTART:20261024T073000Z");
    expect(ics).toContain("SUMMARY:Fête du club\\, édition 2026");
    expect(ics).toContain("DESCRIPTION:Ligne 1\\nLigne 2");
    expect(ics).toContain("DTSTART;VALUE=DATE:20260903");
    expect(ics).toContain("DTEND;VALUE=DATE:20260907");
    expect(ics).toContain("STATUS:CANCELLED");
    expect(ics.split("\r\n").every((line) => new TextEncoder().encode(line).length <= 75)).toBe(true);
  });
});

describe("toCsv", () => {
  it("quotes separators and defuses formulas", async () => {
    const { toCsv } = await import("../csv");
    expect(toCsv([["Nom", "Note"], ["Dupont; Jean", "=1+1"]])).toBe('﻿Nom;Note\r\n"Dupont; Jean";\'=1+1\r\n');
  });
});
