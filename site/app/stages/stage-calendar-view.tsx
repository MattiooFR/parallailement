"use client";

import { useEffect, useMemo, useState } from "react";
import { buildMonthGrid, shiftMonth, stagesOnDate } from "@/lib/stage-calendar";
import type { Stage } from "@/lib/stages";

const monthLabel = new Intl.DateTimeFormat("fr-FR", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const weekdays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function displayTitle(stage: Stage) {
  return stage.translatedTitle || stage.title;
}

export function StageCalendarView({ stages }: { stages: Stage[] }) {
  const firstMonth = stages[0]?.startDate.slice(0, 7) ?? new Date().toISOString().slice(0, 7);
  const [month, setMonth] = useState(firstMonth);
  const grid = useMemo(() => buildMonthGrid(month), [month]);

  useEffect(() => {
    if (!stages.some((stage) => stage.startDate.startsWith(month))) {
      setMonth(firstMonth);
    }
  }, [firstMonth, month, stages]);

  return (
    <div className="border-t border-stone-300 py-8">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setMonth((value) => shiftMonth(value, -1))}
          className="min-h-11 min-w-11 rounded-full border border-stone-400 text-xl transition hover:border-emerald-900 hover:text-emerald-900"
          aria-label="Mois précédent"
        >
          ←
        </button>
        <h2 className="font-serif text-2xl capitalize sm:text-4xl">
          {monthLabel.format(new Date(`${month}-01T12:00:00Z`))}
        </h2>
        <button
          type="button"
          onClick={() => setMonth((value) => shiftMonth(value, 1))}
          className="min-h-11 min-w-11 rounded-full border border-stone-400 text-xl transition hover:border-emerald-900 hover:text-emerald-900"
          aria-label="Mois suivant"
        >
          →
        </button>
      </div>

      <div className="mt-7 overflow-x-auto pb-2">
        <div className="grid min-w-[52rem] grid-cols-7 border-l border-t border-stone-300">
          {weekdays.map((day) => (
            <div
              key={day}
              className="border-b border-r border-stone-300 bg-[#e7e2d7] px-3 py-2 text-xs font-medium uppercase tracking-[0.13em] text-stone-600"
            >
              {day}
            </div>
          ))}
          {grid.map((day) => {
            const dayStages = stagesOnDate(stages, day.date);
            return (
              <div
                key={day.date}
                className={`min-h-36 border-b border-r border-stone-300 p-2 ${day.inMonth ? "bg-[#f7f4ed]" : "bg-stone-200/45 text-stone-400"}`}
              >
                <p className="text-xs font-medium tabular-nums">{Number(day.date.slice(8, 10))}</p>
                <div className="mt-2 space-y-1.5">
                  {dayStages.slice(0, 3).map((stage) => (
                    <a
                      key={stage.id}
                      href={stage.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      title={`${displayTitle(stage)} · ${stage.location}`}
                      className={`block rounded px-2 py-1.5 text-[0.68rem] leading-tight transition hover:brightness-95 ${stage.availability === "full" ? "bg-stone-800 text-stone-50" : "bg-emerald-900 text-emerald-50"}`}
                    >
                      <span className="line-clamp-2">{displayTitle(stage)}</span>
                      <span className="mt-1 block truncate opacity-70">{stage.location}</span>
                    </a>
                  ))}
                  {dayStages.length > 3 && (
                    <p className="px-1 text-[0.68rem] text-stone-500">
                      + {dayStages.length - 3} autre{dayStages.length - 3 > 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
