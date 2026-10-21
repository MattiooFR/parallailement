import { createHash, timingSafeEqual } from "node:crypto";
import {
  curatedStages,
  isUpcoming,
  withStageDefaults,
  type StageSourceResult,
} from "./stage-data";
import { persistStageSync, recordStageSyncRun } from "./stage-repository";

function digest(value: string) {
  return createHash("sha256").update(value).digest();
}

export function verifyCronAuthorization(
  authorization: string | null,
  secret: string | undefined,
) {
  if (!authorization || !secret) return false;
  return timingSafeEqual(digest(authorization), digest(`Bearer ${secret}`));
}

export function summarizeStageSync(results: StageSourceResult[]) {
  const successfulSources = results.filter(
    (result) => result.source.state === "ok",
  ).length;
  const failedSources = results.length - successfulSources;
  return {
    state:
      successfulSources === 0
        ? ("failed" as const)
        : failedSources > 0
          ? ("partial" as const)
          : ("ok" as const),
    sourceCount: results.length,
    successfulSources,
    failedSources,
    stageCount: results.reduce(
      (count, result) => count + result.stages.length,
      0,
    ),
  };
}

function curatedResult(checkedAt: string, today: string): StageSourceResult {
  const stages = curatedStages
    .filter((stage) => isUpcoming(stage, today))
    .map((stage) => withStageDefaults({ ...stage, verifiedAt: checkedAt }));
  return {
    stages,
    source: {
      id: "clubs-ligues-curated",
      name: "Clubs et ligues · fiches vérifiées",
      url: "https://parallailement.fr/stages",
      kind: "Fiche club",
      state: "ok",
      stageCount: stages.length,
      checkedAt,
    },
  };
}

// Une source peut publier un stage incohérent (fin avant début, date illisible) : la base le
// refuse (check end_date >= start_date) et tout le lot échouait. On l'écarte et on le journalise.
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
export function dropIncoherentStages(results: StageSourceResult[]) {
  return results.map((result) => {
    const stages = result.stages.filter((stage) => {
      const ok =
        ISO_DATE.test(stage.startDate) &&
        ISO_DATE.test(stage.endDate) &&
        stage.endDate >= stage.startDate;
      if (!ok) {
        console.warn(
          `[stage-sync] stage ignoré (dates incohérentes) : ${result.source.id}/${stage.id} ${stage.startDate} -> ${stage.endDate}`,
        );
      }
      return ok;
    });
    if (stages.length === result.stages.length) return result;
    return {
      ...result,
      stages,
      source: { ...result.source, stageCount: stages.length },
    };
  });
}

export async function runStageSync(now = new Date()) {
  const checkedAt = now.toISOString();
  const today = checkedAt.slice(0, 10);
  const { fetchStageSources } = await import("./stage-sources");
  const fetchedResults = await fetchStageSources(checkedAt, today);
  const results = dropIncoherentStages([
    ...fetchedResults,
    curatedResult(checkedAt, today),
  ]);
  const summary = summarizeStageSync(results);
  await persistStageSync({ checkedAt, results });
  await recordStageSyncRun({ checkedAt, summary });
  return { checkedAt, results, ...summary };
}
