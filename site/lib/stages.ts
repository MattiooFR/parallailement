import {
  curatedStages,
  isUpcoming,
  normalizeText,
  withStageDefaults,
  type Stage,
} from "@/lib/stage-data";
import { readActiveStages } from "@/lib/stage-repository";
import { fetchStageSources } from "@/lib/stage-sources";

export type {
  Stage,
  StageAvailability,
  StageDiscipline,
  StageFeed,
  StageLevel,
  StageSourceStatus,
} from "@/lib/stage-data";

function stageKey(stage: Stage): string {
  return [
    normalizeText(stage.organizer),
    normalizeText(stage.title),
    stage.startDate,
  ].join("|");
}

function mergeStages(stages: Stage[]): Stage[] {
  const merged = new Map<string, Stage>();
  for (const stage of stages) {
    const key = stageKey(stage);
    const current = merged.get(key);
    if (!current || new Date(stage.verifiedAt) > new Date(current.verifiedAt)) {
      merged.set(key, stage);
    }
  }
  return Array.from(merged.values()).map(withStageDefaults).sort(
    (a, b) =>
      a.startDate.localeCompare(b.startDate) ||
      a.organizer.localeCompare(b.organizer, "fr"),
  );
}

export async function getStagesFeed() {
  try {
    const storedFeed = await readActiveStages();
    if (storedFeed && storedFeed.sources.length > 0) return storedFeed;
  } catch {
    // A temporary database failure must not take the private catalogue down.
  }

  const now = new Date();
  const checkedAt = now.toISOString();
  const today = checkedAt.slice(0, 10);
  const results = await fetchStageSources(checkedAt, today);
  const curated = curatedStages.filter((stage) => isUpcoming(stage, today));
  const stages = mergeStages([
    ...results.flatMap((result) => result.stages),
    ...curated,
  ]);
  const sources = [
    ...results.map((result) => result.source),
    {
      id: "clubs-ligues-curated",
      name: "Clubs et ligues · fiches vérifiées",
      url: "https://parallailement.fr/stages",
      kind: "Fiche club" as const,
      state: "ok" as const,
      stageCount: curated.length,
      checkedAt,
    },
  ].sort((a, b) => a.name.localeCompare(b.name, "fr"));

  return { stages, sources, updatedAt: checkedAt };
}
