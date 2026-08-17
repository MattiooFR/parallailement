import type { Stage } from "./stage-data";

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function buildMonthGrid(month: string) {
  const first = new Date(`${month}-01T12:00:00Z`);
  if (Number.isNaN(first.getTime())) return [];
  const mondayOffset = (first.getUTCDay() + 6) % 7;
  const start = new Date(first);
  start.setUTCDate(start.getUTCDate() - mondayOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);
    const value = isoDate(date);
    return { date: value, inMonth: value.startsWith(month) };
  });
}

export function stagesOnDate(stages: Stage[], date: string) {
  return stages.filter((stage) => stage.startDate === date);
}

export function shiftMonth(month: string, amount: number) {
  const date = new Date(`${month}-01T12:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + amount);
  return date.toISOString().slice(0, 7);
}
