import {
  STAGES_REVALIDATE_SECONDS,
  type Stage,
  type StageSourceResult,
} from "./stage-data";
import { parseIcsStages } from "./stage-parsers/ics";
import { parseJsonLdStages } from "./stage-parsers/jsonld";
import { parseLooseStageHtml } from "./stage-parsers/shared";
import { parseShvOfferPayload, parseShvTrainingHtml } from "./stage-parsers/shv";
import {
  parseBhpaCourses,
  parseDatedLinkCalendar,
  parseHeadingMonthSchedule,
  parseItalianDatedArticle,
  parseProAeroCourse,
  parseSpanishEventTable,
  parseWooCommerceCourseCards,
} from "./stage-parsers/specialized";
import {
  internationalStageSources,
  type StageSourceDefinition,
} from "./stage-source-registry";

const REQUEST_HEADERS = {
  Accept: "text/html,application/xhtml+xml,application/json,text/calendar",
  "User-Agent":
    "Mozilla/5.0 (compatible; ParallailementStages/1.0; +https://parallailement.fr/stages)",
};

export type InternationalSourceFetcher = (
  source: StageSourceDefinition,
) => Promise<string>;

const shvEndpoint =
  "https://www.shv-fsvl.ch/index.php?L=3&tx_mxnshvtravel_shvtravelajax%5Blanguage%5D=3&type=5050&tx_mxnshvtravel_shvtravelajax%5Bcontroller%5D=Ajax&tx_mxnshvtravel_shvtravelajax%5Baction%5D=getEducation";

async function defaultSourceFetcher(source: StageSourceDefinition) {
  const isShvFeed = source.parser === "shv";
  const response = await fetch(isShvFeed ? shvEndpoint : source.url, {
    method: isShvFeed ? "POST" : "GET",
    headers: {
      ...REQUEST_HEADERS,
      ...(isShvFeed
        ? { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" }
        : {}),
    },
    ...(isShvFeed
      ? {
          body: new URLSearchParams({
            "tx_mxnshvtravel_ajax[coursescategory_filter]": "0",
            "tx_mxnshvtravel_ajax[coursescountry_filter]": "0",
            "tx_mxnshvtravel_ajax[coursesdatefrom_filter]": "",
            "tx_mxnshvtravel_ajax[coursesdateto_filter]": "",
          }),
        }
      : {}),
    next: {
      revalidate: STAGES_REVALIDATE_SECONDS,
      tags: ["stages", `stages-${source.id}`],
    },
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) {
    throw new Error(`${source.url} returned ${response.status}`);
  }
  return response.text();
}

function uniqueStages(stages: Stage[]) {
  return Array.from(new Map(stages.map((stage) => [stage.id, stage])).values());
}

export function parseInternationalSource(
  payload: string,
  source: StageSourceDefinition,
  checkedAt: string,
  today: string,
) {
  switch (source.parser) {
    case "shv": {
      const jsonStages = parseShvOfferPayload(payload, source, checkedAt, today);
      return jsonStages.length > 0
        ? jsonStages
        : parseShvTrainingHtml(payload, source, checkedAt, today);
    }
    case "ics":
      return parseIcsStages(payload, source, checkedAt, today);
    case "bhpa":
      return parseBhpaCourses(payload, source, checkedAt, today);
    case "pro-aero":
      return parseProAeroCourse(payload, source, checkedAt, today);
    case "jsonld":
      return uniqueStages([
        ...parseJsonLdStages(payload, source, checkedAt, today),
        ...parseLooseStageHtml(payload, source, checkedAt, today),
        ...parseDatedLinkCalendar(payload, source, checkedAt, today),
        ...(source.id === "entrenuvols-siv"
          ? parseSpanishEventTable(payload, source, checkedAt, today)
          : []),
      ]);
    case "loose":
      return uniqueStages([
        ...parseLooseStageHtml(payload, source, checkedAt, today),
        ...parseDatedLinkCalendar(payload, source, checkedAt, today),
        ...parseHeadingMonthSchedule(payload, source, checkedAt, today),
        ...parseWooCommerceCourseCards(payload, source, checkedAt, today),
        ...(source.id === "manta-paragliding-course"
          ? parseItalianDatedArticle(payload, source, checkedAt, today)
          : []),
      ]);
  }
}

async function mapWithConcurrency<T, R>(
  values: T[],
  concurrency: number,
  worker: (value: T) => Promise<R>,
) {
  const results = new Array<R>(values.length);
  let nextIndex = 0;
  async function runWorker() {
    while (nextIndex < values.length) {
      const index = nextIndex++;
      results[index] = await worker(values[index]);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, values.length) }, runWorker),
  );
  return results;
}

export async function fetchInternationalStageSources(
  checkedAt: string,
  today: string,
  options: {
    sources?: StageSourceDefinition[];
    fetcher?: InternationalSourceFetcher;
  } = {},
): Promise<StageSourceResult[]> {
  const sources = (options.sources ?? internationalStageSources).filter(
    (source) => source.active,
  );
  const fetcher = options.fetcher ?? defaultSourceFetcher;

  return mapWithConcurrency(sources, 4, async (source) => {
    try {
      const payload = await fetcher(source);
      const stages = parseInternationalSource(
        payload,
        source,
        checkedAt,
        today,
      );
      return {
        stages,
        source: {
          id: source.id,
          name: source.name,
          url: source.url,
          kind: "Calendrier" as const,
          state: "ok" as const,
          stageCount: stages.length,
          checkedAt,
        },
      };
    } catch {
      return {
        stages: [],
        source: {
          id: source.id,
          name: source.name,
          url: source.url,
          kind: "Calendrier" as const,
          state: "unavailable" as const,
          stageCount: 0,
          checkedAt,
        },
      };
    }
  });
}
