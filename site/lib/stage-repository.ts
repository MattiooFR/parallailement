import {
  withStageDefaults,
  type Stage,
  type StageFeed,
  type StageSourceResult,
  type StageSourceStatus,
} from "./stage-data";

type Environment = Record<string, string | undefined>;

type MissingStageRow = {
  id: string;
  source_id: string;
  missing_success_count: number;
};

type MissingStageUpdate = {
  id: string;
  missing_success_count: number;
  active: boolean;
};

type DatabaseStageRow = {
  id: string;
  source_id: string;
  original_title: string;
  translated_title: string;
  language: Stage["language"];
  organizer: string;
  organizer_country: string;
  organizer_type: NonNullable<Stage["organizerType"]>;
  start_date: string;
  end_date: string;
  location: string;
  department: string;
  region: string;
  destination_country: string;
  latitude: number | null;
  longitude: number | null;
  location_precision: Stage["locationPrecision"] | null;
  level: Stage["level"];
  discipline: Stage["discipline"];
  price: number | null;
  currency: string | null;
  price_note: string | null;
  availability: Stage["availability"];
  capacity: number | null;
  remaining_places: number | null;
  prerequisites: string;
  description: string;
  source_url: string;
  source_label: string;
  source_kind: Stage["sourceKind"];
  first_seen_at: string;
  last_seen_at: string;
  last_verified_at: string;
  missing_success_count: number;
  active: boolean;
};

export function isStageDatabaseConfigured(
  environment: Environment = process.env,
) {
  return Boolean(
    environment.NEXT_PUBLIC_SUPABASE_URL &&
      environment.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      environment.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export function stageToDatabaseRow(
  input: Stage,
  sourceId: string,
  checkedAt: string,
): DatabaseStageRow {
  const stage = withStageDefaults(input);

  return {
    id: stage.id,
    source_id: sourceId,
    original_title: stage.originalTitle,
    translated_title: stage.translatedTitle,
    language: stage.language,
    organizer: stage.organizer,
    organizer_country: stage.organizerCountry,
    organizer_type: stage.organizerType,
    start_date: stage.startDate,
    end_date: stage.endDate,
    location: stage.location,
    department: stage.department,
    region: stage.region,
    destination_country: stage.country,
    latitude: stage.latitude ?? null,
    longitude: stage.longitude ?? null,
    location_precision: stage.locationPrecision ?? null,
    level: stage.level,
    discipline: stage.discipline,
    price: stage.price,
    currency: stage.currency,
    price_note: stage.priceNote ?? null,
    availability: stage.availability,
    capacity: stage.capacity ?? null,
    remaining_places: stage.remainingPlaces ?? null,
    prerequisites: stage.prerequisites,
    description: stage.description,
    source_url: stage.sourceUrl,
    source_label: stage.sourceLabel,
    source_kind: stage.sourceKind,
    first_seen_at: checkedAt,
    last_seen_at: checkedAt,
    last_verified_at: stage.verifiedAt,
    missing_success_count: 0,
    active: true,
  };
}

export function advanceMissingStageRows(
  rows: MissingStageRow[],
  seenIds: Set<string>,
  successfulSourceIds: Set<string>,
): MissingStageUpdate[] {
  return rows.flatMap((row) => {
    if (!successfulSourceIds.has(row.source_id)) return [];
    if (seenIds.has(row.id)) {
      return [{ id: row.id, missing_success_count: 0, active: true }];
    }

    const missingSuccessCount = row.missing_success_count + 1;
    return [
      {
        id: row.id,
        missing_success_count: missingSuccessCount,
        active: missingSuccessCount < 2,
      },
    ];
  });
}

function databaseRowToStage(row: DatabaseStageRow): Stage {
  return {
    id: row.id,
    title: row.original_title,
    originalTitle: row.original_title,
    translatedTitle: row.translated_title,
    language: row.language,
    startDate: row.start_date,
    endDate: row.end_date,
    location: row.location,
    department: row.department,
    region: row.region,
    country: row.destination_country,
    ...(row.latitude !== null ? { latitude: row.latitude } : {}),
    ...(row.longitude !== null ? { longitude: row.longitude } : {}),
    ...(row.location_precision
      ? { locationPrecision: row.location_precision }
      : {}),
    organizer: row.organizer,
    organizerCountry: row.organizer_country,
    organizerType: row.organizer_type,
    level: row.level,
    discipline: row.discipline,
    price: row.price,
    currency: row.currency,
    ...(row.price_note ? { priceNote: row.price_note } : {}),
    availability: row.availability,
    ...(row.capacity !== null ? { capacity: row.capacity } : {}),
    ...(row.remaining_places !== null
      ? { remainingPlaces: row.remaining_places }
      : {}),
    prerequisites: row.prerequisites,
    description: row.description,
    sourceUrl: row.source_url,
    sourceLabel: row.source_label,
    sourceKind: row.source_kind,
    verifiedAt: row.last_verified_at,
    isStale:
      Date.now() - new Date(row.last_verified_at).getTime() > 3 * 60 * 60 * 1000,
  };
}

export async function readActiveStages(): Promise<StageFeed | null> {
  if (!isStageDatabaseConfigured()) return null;

  const { createAdminSupabaseClient } = await import("./supabase/admin");
  const supabase = createAdminSupabaseClient();
  const today = new Date().toISOString().slice(0, 10);
  const [stageResponse, sourceResponse] = await Promise.all([
    supabase
      .from("stages")
      .select("*")
      .eq("active", true)
      .gte("end_date", today)
      .order("start_date", { ascending: true }),
    supabase
      .from("stage_sources")
      .select("id,name,url,source_kind,state,stage_count,last_checked_at")
      .eq("active", true)
      .order("name", { ascending: true }),
  ]);

  if (stageResponse.error) throw stageResponse.error;
  if (sourceResponse.error) throw sourceResponse.error;

  const stageRows = (stageResponse.data ?? []) as DatabaseStageRow[];
  const sources = (sourceResponse.data ?? []).map(
    (row): StageSourceStatus => ({
      id: String(row.id),
      name: String(row.name),
      url: String(row.url),
      kind: row.source_kind as Stage["sourceKind"],
      state: row.state as StageSourceStatus["state"],
      stageCount: Number(row.stage_count),
      checkedAt: String(row.last_checked_at ?? new Date(0).toISOString()),
    }),
  );
  const updatedAt = sources.reduce(
    (latest, source) => (source.checkedAt > latest ? source.checkedAt : latest),
    new Date(0).toISOString(),
  );

  return {
    stages: stageRows.map(databaseRowToStage),
    sources,
    updatedAt,
  };
}

export async function persistStageSync({
  checkedAt,
  results,
}: {
  checkedAt: string;
  results: StageSourceResult[];
}): Promise<void> {
  if (!isStageDatabaseConfigured()) return;

  const { createAdminSupabaseClient } = await import("./supabase/admin");
  const supabase = createAdminSupabaseClient();
  const existingSourcesResponse = await supabase
    .from("stage_sources")
    .select("id,consecutive_failures");
  if (existingSourcesResponse.error) throw existingSourcesResponse.error;
  const previousFailures = new Map(
    (existingSourcesResponse.data ?? []).map((row) => [
      String(row.id),
      Number(row.consecutive_failures ?? 0),
    ]),
  );
  const sourceRows = results.map((result) => {
    const firstStage = result.stages[0];
    return {
      id: result.source.id,
      name: result.source.name,
      url: result.source.url,
      organizer_country: firstStage?.organizerCountry ?? "À confirmer",
      organizer_type: firstStage?.organizerType ?? "federation",
      source_kind: result.source.kind,
      default_language: firstStage?.language ?? null,
      state: result.source.state,
      stage_count: result.source.stageCount,
      consecutive_failures:
        result.source.state === "ok"
          ? 0
          : (previousFailures.get(result.source.id) ?? 0) + 1,
      last_checked_at: checkedAt,
      ...(result.source.state === "ok" ? { last_success_at: checkedAt } : {}),
      updated_at: checkedAt,
    };
  });
  const sourceUpsert = await supabase
    .from("stage_sources")
    .upsert(sourceRows, { onConflict: "id" });
  if (sourceUpsert.error) throw sourceUpsert.error;

  const stageRows = results.flatMap((result) =>
    result.stages.map((stage) =>
      stageToDatabaseRow(stage, result.source.id, checkedAt),
    ),
  );
  for (let index = 0; index < stageRows.length; index += 250) {
    const response = await supabase
      .from("stages")
      .upsert(stageRows.slice(index, index + 250), {
        onConflict: "id",
        ignoreDuplicates: false,
      });
    if (response.error) throw response.error;
  }

  const successfulSourceIds = new Set(
    results
      .filter((result) => result.source.state === "ok")
      .map((result) => result.source.id),
  );
  if (successfulSourceIds.size === 0) return;

  const existingResponse = await supabase
    .from("stages")
    .select("id,source_id,missing_success_count")
    .eq("active", true)
    .in("source_id", Array.from(successfulSourceIds));
  if (existingResponse.error) throw existingResponse.error;

  const updates = advanceMissingStageRows(
    (existingResponse.data ?? []) as MissingStageRow[],
    new Set(stageRows.map((row) => row.id)),
    successfulSourceIds,
  );
  const updateResponses = await Promise.all(
    updates.map((update) =>
      supabase
        .from("stages")
        .update({
          missing_success_count: update.missing_success_count,
          active: update.active,
          updated_at: checkedAt,
        })
        .eq("id", update.id),
    ),
  );
  const failedUpdate = updateResponses.find((response) => response.error);
  if (failedUpdate?.error) throw failedUpdate.error;
}

export async function recordStageSyncRun({
  checkedAt,
  summary,
}: {
  checkedAt: string;
  summary: {
    state: "ok" | "partial" | "failed";
    sourceCount: number;
    successfulSources: number;
    failedSources: number;
    stageCount: number;
  };
}) {
  if (!isStageDatabaseConfigured()) return;
  const { createAdminSupabaseClient } = await import("./supabase/admin");
  const supabase = createAdminSupabaseClient();
  const response = await supabase.from("stage_sync_runs").insert({
    started_at: checkedAt,
    finished_at: new Date().toISOString(),
    state: summary.state,
    source_count: summary.sourceCount,
    successful_sources: summary.successfulSources,
    failed_sources: summary.failedSources,
    stage_count: summary.stageCount,
  });
  if (response.error) throw response.error;
}
