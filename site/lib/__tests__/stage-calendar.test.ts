import { describe, expect, it } from "vitest";
import { buildMonthGrid, stagesOnDate } from "../stage-calendar";
import type { Stage } from "../stage-data";

const stage = {
  id: "siv",
  title: "Stage SIV",
  startDate: "2026-09-03",
  endDate: "2026-09-06",
} as Stage;

describe("buildMonthGrid", () => {
  it("builds six Monday-first weeks around a month", () => {
    const grid = buildMonthGrid("2026-09");
    expect(grid).toHaveLength(42);
    expect(grid[0]).toEqual({ date: "2026-08-31", inMonth: false });
    expect(grid[1]).toEqual({ date: "2026-09-01", inMonth: true });
    expect(grid.at(-1)).toEqual({ date: "2026-10-11", inMonth: false });
  });
});

describe("stagesOnDate", () => {
  it("keeps a multi-day stage visible on every covered day", () => {
    expect(stagesOnDate([stage], "2026-09-02")).toEqual([]);
    expect(stagesOnDate([stage], "2026-09-03")).toEqual([stage]);
    expect(stagesOnDate([stage], "2026-09-05")).toEqual([stage]);
    expect(stagesOnDate([stage], "2026-09-07")).toEqual([]);
  });
});
