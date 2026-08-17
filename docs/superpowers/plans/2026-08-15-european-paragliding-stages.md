# European Paragliding Stages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a private, hourly refreshed catalogue of European paragliding stages with French translations, explicit teaching-language data, persistent Supabase storage, and shared List, Calendar, and Map views.

**Architecture:** Source adapters produce one normalized `Stage` contract. An hourly protected server route runs adapters, translation, geocoding, and Supabase persistence while preserving last-known-good data; the existing direct-fetch feed remains the local fallback. A single client-side filter state feeds three focused presentation components.

**Tech Stack:** Next.js 16.2 App Router, React 19, TypeScript 5, Supabase SSR/Postgres, Vitest single-run tests, MapLibre GL, OpenStreetMap raster tiles, Tailwind CSS 4.

**Spec:** `docs/superpowers/specs/2026-08-15-european-paragliding-stages-design.md`

## Global Constraints

- `/stages` stays password protected on the server, unlinked internally, and marked `noindex, nofollow, noarchive, nosnippet`.
- Refresh source data every 3,600 seconds and keep complete stages visible.
- Supported teaching languages are `fr`, `en`, `es`, `it`, `de`, plus `null` for « À confirmer ».
- A language is never inferred from a country or website language.
- Keep original titles as primary copy and show a cached French translation underneath when different.
- Include clubs, professional schools, and federations based in Europe, including their stages outside Europe.
- Exclude competitions, tandem discovery flights, and uncoached club outings.
- All new Supabase tables enable RLS, revoke `anon` and `authenticated`, and are accessed by `service_role` only.
- Use the project Supabase server/client helpers and never use `onAuthStateChange`.
- Run Vitest only with `npx vitest run`.
- Do not use ports 3000 or 3001; use 3100 for local visual checks.
- Verify npm package ownership, downloads, repository, and update recency before installation.

---

### Task 1: Extend the normalized stage contract and pure utilities

**Files:**
- Modify: `site/package.json`
- Modify: `site/lib/stage-data.ts`
- Create: `site/lib/stage-language.ts`
- Create: `site/lib/stage-location.ts`
- Create: `site/lib/__tests__/stage-language.test.ts`
- Create: `site/lib/__tests__/stage-location.test.ts`

**Interfaces:**
- Produces: `StageLanguage`, `StageLocationPrecision`, enriched `Stage`, `languageLabel()`, `translateStageTitle()`, `locationFingerprint()`, `coordinatesForKnownPlace()`.
- Consumes: current `Stage`, `normalizeText()`, and discipline inference in `stage-data.ts`.

- [ ] **Step 1: Verify dependencies before installing**

Run official npm metadata queries for `vitest`, `maplibre-gl`, `@supabase/ssr`, and `@supabase/supabase-js`. Confirm each package points to the recognized organization repository, has recent releases, and has substantial weekly downloads.

- [ ] **Step 2: Install the verified dependencies and add scripts**

Add runtime dependencies `@supabase/ssr`, `@supabase/supabase-js`, and `maplibre-gl`; add `vitest` as a dev dependency. Add scripts:

```json
{
  "typecheck": "tsc --noEmit",
  "test": "vitest run"
}
```

- [ ] **Step 3: Write failing language tests**

Cover exact labels, `null` as « À confirmer », unchanged French titles, and deterministic translations for common vocabulary:

```ts
expect(languageLabel("de")).toBe("Allemand");
expect(languageLabel(null)).toBe("À confirmer");
expect(translateStageTitle("Sicherheitstraining Thermik", "de"))
  .toBe("Stage de sécurité thermique");
expect(translateStageTitle("Curso de iniciación", "es"))
  .toBe("Stage d’initiation");
```

- [ ] **Step 4: Run the language test and verify failure**

Run `npx vitest run lib/__tests__/stage-language.test.ts`. Expected: failure because `stage-language.ts` does not exist.

- [ ] **Step 5: Implement the language contract and glossary translator**

Export:

```ts
export type StageLanguage = "fr" | "en" | "es" | "it" | "de";
export function languageLabel(language: StageLanguage | null): string;
export function translateStageTitle(title: string, language: StageLanguage | null): string;
```

Use ordered phrase replacements for paragliding-specific terms, preserve unknown proper nouns, normalize whitespace, and return the original for `fr` or `null`.

- [ ] **Step 6: Write failing location tests**

Verify fingerprints ignore accents/case and that known flying areas return stable coordinates and precision:

```ts
expect(locationFingerprint("Àger", "Espagne")).toBe("ager|espagne");
expect(coordinatesForKnownPlace("Bassano del Grappa", "Italie")).toMatchObject({
  latitude: 45.766,
  longitude: 11.727,
  precision: "city",
});
```

- [ ] **Step 7: Implement location helpers and enrich `Stage`**

Add to `Stage`:

```ts
originalTitle: string;
translatedTitle: string;
language: StageLanguage | null;
organizerCountry: string;
organizerType: "club" | "school" | "federation";
currency: "EUR" | "CHF" | "GBP" | null;
latitude?: number;
longitude?: number;
locationPrecision?: "exact" | "city" | "region" | "country";
isStale?: boolean;
```

Provide a `withStageDefaults(stage)` normalizer so current French adapters need no repeated boilerplate: original and translated titles default to `title`, language to `fr`, organizer country to `France`, organizer type to `school`, and currency to `EUR` when a price exists.

- [ ] **Step 8: Run focused tests and typecheck**

Run `npx vitest run lib/__tests__/stage-language.test.ts lib/__tests__/stage-location.test.ts`, then `pnpm typecheck`. Expected: all pass.

- [ ] **Step 9: Commit the model slice**

```bash
git add site/package.json site/pnpm-lock.yaml site/lib/stage-data.ts site/lib/stage-language.ts site/lib/stage-location.ts site/lib/__tests__
git commit -m "feat(stages): add international stage model"
```

### Task 2: Add the private Supabase schema and server repositories

**Files:**
- Create: `site/supabase/migrations/202608150001_stages_catalog.sql`
- Create: `site/lib/supabase/server.ts`
- Create: `site/lib/supabase/admin.ts`
- Create: `site/lib/stage-repository.ts`
- Create: `site/lib/__tests__/stage-repository.test.ts`
- Modify: `site/.env.local.example`

**Interfaces:**
- Consumes: enriched `Stage`, `StageSourceStatus`.
- Produces: `isStageDatabaseConfigured()`, `readActiveStages()`, `persistStageSync()`, `beginSyncRun()`, `finishSyncRun()`.

- [ ] **Step 1: Write the migration with restrictive security**

Create `stage_sources`, `stage_locations`, `stages`, and `stage_sync_runs`. Use text IDs for source and stage keys, `timestamptz` for observations, numeric latitude/longitude, JSONB only for adapter configuration and raw diagnostics, checks for language/status/type values, and indexes on active dates, language, country, coordinates, and source.

For every table execute:

```sql
alter table public.<table> enable row level security;
revoke all on table public.<table> from anon, authenticated;
grant all on table public.<table> to service_role;
```

Do not create permissive policies, views, or SECURITY DEFINER functions.

- [ ] **Step 2: Add Supabase SSR and admin clients**

`lib/supabase/server.ts` exports an async `createServerSupabaseClient()` using `createServerClient`, `cookies()`, `NEXT_PUBLIC_SUPABASE_URL`, and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. `lib/supabase/admin.ts` imports `server-only` and exports `createAdminSupabaseClient()` using `SUPABASE_SERVICE_ROLE_KEY` with session persistence disabled.

- [ ] **Step 3: Write failing repository tests with a fake client**

Test that absent environment configuration returns `false`, persisted rows include normalized language/coordinates, and a successful run increments `missing_success_count` only for unseen rows belonging to successful sources.

- [ ] **Step 4: Run repository tests and verify failure**

Run `npx vitest run lib/__tests__/stage-repository.test.ts`. Expected: missing repository exports.

- [ ] **Step 5: Implement repository functions**

Define:

```ts
export function isStageDatabaseConfigured(): boolean;
export async function readActiveStages(): Promise<StageFeed | null>;
export async function persistStageSync(input: {
  checkedAt: string;
  results: StageSourceResult[];
}): Promise<void>;
```

Upsert source status and seen stage rows in batches. On a successful source, increment missing counts for active rows not seen; set `active=false` at count 2. On source failure, do not touch stage visibility. Convert database rows through one `rowToStage()` function.

- [ ] **Step 6: Document environment variables**

Add empty `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `CRON_SECRET` keys to `.env.local.example`, explicitly labeling the service key as server-only.

- [ ] **Step 7: Run tests, typecheck, and inspect migration security**

Run `npx vitest run lib/__tests__/stage-repository.test.ts`, `pnpm typecheck`, and scan the migration to confirm each table has RLS plus revocations.

- [ ] **Step 8: Commit the persistence slice**

```bash
git add site/supabase site/lib/supabase site/lib/stage-repository.ts site/lib/__tests__/stage-repository.test.ts site/.env.local.example
git commit -m "feat(stages): add private Supabase catalogue"
```

### Task 3: Build the international source registry and adapters

**Files:**
- Create: `site/lib/international-stage-sources.ts`
- Create: `site/lib/stage-source-registry.ts`
- Create: `site/lib/stage-parsers/jsonld.ts`
- Create: `site/lib/stage-parsers/ics.ts`
- Create: `site/lib/stage-parsers/shv.ts`
- Create: `site/lib/stage-parsers/federation.ts`
- Create: `site/lib/__tests__/stage-parsers.test.ts`
- Create: `site/lib/__fixtures__/stages/*.html`
- Modify: `site/lib/stage-sources.ts`

**Interfaces:**
- Consumes: `withStageDefaults()`, inference helpers, `translateStageTitle()`, location helpers.
- Produces: `internationalStageSources`, `fetchInternationalStageSources(checkedAt, today)`, parser functions returning `Stage[]`.

- [ ] **Step 1: Research and validate initial official sources**

Confirm live URLs and terms for federation directories/calendars in Switzerland, Germany, the United Kingdom, Belgium, Spain, Italy, and Austria. Record organizer country, type, published teaching language when explicit, parser type, and stable source ID. Prefer federation aggregators and public structured feeds before individual page scrapers.

- [ ] **Step 2: Save minimal sanitized fixtures**

Capture only the small HTML/JSON/ICS fragments needed to exercise dates, titles, language, location, prices, full status, and source links. Do not copy full copyrighted pages.

- [ ] **Step 3: Write failing parser tests**

Include one case for each parser family and explicit rejection cases for competitions, tandem flights, and uncoached outings. Assert that an unspecified teaching language is `null`, even when the page is German or the organizer is Spanish.

- [ ] **Step 4: Run parser tests and verify failure**

Run `npx vitest run lib/__tests__/stage-parsers.test.ts`. Expected: parser modules are missing.

- [ ] **Step 5: Implement reusable JSON-LD and ICS parsers**

Parse `Event`/`EducationEvent` JSON-LD and VEVENT records without injecting external HTML. Normalize dates into `YYYY-MM-DD`, resolve absolute URLs, map explicit availability, and reject out-of-scope event types via a shared `isEligibleStage()` predicate.

- [ ] **Step 6: Implement federation adapters**

Implement SHV detail/list extraction, BHPA qualified-pilot course extraction, and DHV service-event extraction as separate functions with fixture coverage. Add generic federation-directory discovery that yields source records but never treats a school directory entry without a dated offer as a stage.

- [ ] **Step 7: Add the international registry**

Create typed registry entries containing:

```ts
type StageSourceDefinition = {
  id: string;
  name: string;
  organizerCountry: string;
  organizerType: "club" | "school" | "federation";
  url: string;
  parser: "jsonld" | "ics" | "shv" | "bhpa" | "dhv" | "custom";
  language: StageLanguage | null;
  active: boolean;
};
```

Seed official aggregators plus verified schools across all five requested languages. Keep unknown teaching languages as `null`.

- [ ] **Step 8: Integrate international sources with failure isolation**

`fetchInternationalStageSources()` runs adapters with a bounded worker pool, ten-second per-request timeouts, Next fetch cache tags, and one `StageSourceResult` per source. Append these results in `fetchStageSources()` without changing current French adapters.

- [ ] **Step 9: Run parser tests, typecheck, and one live collection diagnostic**

Run `npx vitest run lib/__tests__/stage-parsers.test.ts`, `pnpm typecheck`, then a read-only script that prints counts and statuses but no secrets. Confirm one failed source does not reject the entire collection.

- [ ] **Step 10: Commit the source slice**

```bash
git add site/lib/international-stage-sources.ts site/lib/stage-source-registry.ts site/lib/stage-parsers site/lib/__tests__/stage-parsers.test.ts site/lib/__fixtures__ site/lib/stage-sources.ts
git commit -m "feat(stages): collect European training sources"
```

### Task 4: Add hourly synchronization, cached translation, and geocoding

**Files:**
- Create: `site/lib/stage-sync.ts`
- Create: `site/lib/stage-geocoder.ts`
- Create: `site/app/api/stages/sync/route.ts`
- Create: `site/lib/__tests__/stage-sync.test.ts`
- Create: `site/vercel.json`
- Modify: `site/lib/stages.ts`

**Interfaces:**
- Consumes: source results, repository, language/location utilities.
- Produces: `syncStages()`, protected `GET /api/stages/sync`, Supabase-first `getStagesFeed()`.

- [ ] **Step 1: Write failing synchronization tests**

Test unauthorized cron requests, partial source failure, title translation caching, known-place coordinates, and database fallback. Test that a source outage never removes its previous stages.

- [ ] **Step 2: Run sync tests and verify failure**

Run `npx vitest run lib/__tests__/stage-sync.test.ts`. Expected: missing sync module and route behavior.

- [ ] **Step 3: Implement the geocoder with cache-first behavior**

First use source coordinates, then `stage_locations`, then the static known-place table. Only after those fail, query Nominatim sequentially with a descriptive `User-Agent`, at least one second between requests, and persist the result. Store `null` results for seven days to avoid repeated misses. Never geocode during page rendering.

- [ ] **Step 4: Implement `syncStages()`**

Fetch all results, apply defaults, translations and coordinates, persist when Supabase is configured, and return a diagnostic summary:

```ts
type StageSyncSummary = {
  checkedAt: string;
  sourceCount: number;
  successfulSources: number;
  failedSources: number;
  stageCount: number;
};
```

- [ ] **Step 5: Implement the protected cron route**

Accept only a bearer token exactly matching `CRON_SECRET` using constant-time comparison. Return 503 when the secret or database is not configured, 401 when invalid, and JSON summary on success. Add `export const maxDuration = 300`.

- [ ] **Step 6: Declare the hourly schedule**

Create:

```json
{
  "crons": [{ "path": "/api/stages/sync", "schedule": "0 * * * *" }]
}
```

- [ ] **Step 7: Make feed reads Supabase-first with direct fallback**

`getStagesFeed()` first calls `readActiveStages()`. If no database configuration or a read fails, use the existing direct source collection and curated data. Preserve current one-hour Next fetch caching.

- [ ] **Step 8: Run tests, typecheck, and build**

Run `npx vitest run lib/__tests__/stage-sync.test.ts`, `pnpm typecheck`, and `pnpm build`. Expected: route is dynamic and `/stages` remains dynamic because it reads the auth cookie.

- [ ] **Step 9: Commit the synchronization slice**

```bash
git add site/lib/stage-sync.ts site/lib/stage-geocoder.ts site/app/api/stages/sync/route.ts site/lib/__tests__/stage-sync.test.ts site/lib/stages.ts site/vercel.json
git commit -m "feat(stages): sync catalogue every hour"
```

### Task 5: Split shared filters and implement the calendar view

**Files:**
- Create: `site/app/stages/stage-calendar.tsx`
- Create: `site/app/stages/stage-view-toggle.tsx`
- Create: `site/lib/stage-calendar.ts`
- Create: `site/lib/__tests__/stage-calendar.test.ts`
- Modify: `site/app/stages/stage-list.tsx`

**Interfaces:**
- Consumes: filtered `Stage[]`.
- Produces: `StageCalendar`, `StageViewToggle`, `calendarDaysForMonth()`, `stagesByCalendarDay()`.

- [ ] **Step 1: Write failing calendar tests**

Verify Monday-first six-week grids, leap years, stages spanning month boundaries, and grouping every covered day without timezone drift.

- [ ] **Step 2: Run calendar tests and verify failure**

Run `npx vitest run lib/__tests__/stage-calendar.test.ts`. Expected: calendar helpers are missing.

- [ ] **Step 3: Implement UTC-only calendar helpers**

Export pure helpers using midday UTC dates. Cap stage span iteration at 31 days to reject malformed feeds safely.

- [ ] **Step 4: Implement the view toggle and shared filter state**

Add `view: "list" | "calendar" | "map"` to `StageList`. Keep search and all selectors above the toggle so they feed every view. Add Language and Country selectors. Reset pagination only when returning to list, not when filters change views.

- [ ] **Step 5: Implement desktop calendar**

Render weekday headings, six rows, muted adjacent-month days, stage chips with language and availability treatment, up to three entries per day, and a `+N autres` disclosure. Provide previous/next and « Aujourd’hui » controls.

- [ ] **Step 6: Implement mobile monthly agenda**

Below the `sm` breakpoint, render only days containing filtered stages. Each item shows date, original title, French translation, language, location, and status with a direct official source link.

- [ ] **Step 7: Run tests and typecheck**

Run `npx vitest run lib/__tests__/stage-calendar.test.ts` and `pnpm typecheck`.

- [ ] **Step 8: Commit the calendar slice**

```bash
git add site/app/stages/stage-calendar.tsx site/app/stages/stage-view-toggle.tsx site/app/stages/stage-list.tsx site/lib/stage-calendar.ts site/lib/__tests__/stage-calendar.test.ts
git commit -m "feat(stages): add calendar view"
```

### Task 6: Implement the accessible MapLibre view

**Files:**
- Create: `site/app/stages/stage-map.tsx`
- Create: `site/lib/stage-map.ts`
- Create: `site/lib/__tests__/stage-map.test.ts`
- Modify: `site/app/globals.css`
- Modify: `site/app/stages/stage-list.tsx`

**Interfaces:**
- Consumes: filtered stages with optional coordinates.
- Produces: `StageMap`, `stageLocationFeatures()`, selected-location panel.

- [ ] **Step 1: Write failing map-data tests**

Verify grouping by coordinate fingerprint, counts, approximate-position flags, omission from GeoJSON when coordinates are absent, and retention in `unmappedStages`.

- [ ] **Step 2: Run map tests and verify failure**

Run `npx vitest run lib/__tests__/stage-map.test.ts`. Expected: map helpers are missing.

- [ ] **Step 3: Implement pure GeoJSON preparation**

Return:

```ts
{
  featureCollection: GeoJSON.FeatureCollection<GeoJSON.Point, {
    key: string;
    count: number;
    approximate: boolean;
  }>;
  stagesByKey: Map<string, Stage[]>;
  unmappedStages: Stage[];
}
```

Never place titles or external HTML inside feature properties.

- [ ] **Step 4: Implement MapLibre lifecycle**

Initialize one client-side map, raster OpenStreetMap source with visible attribution, clustered GeoJSON source, count circles and location dots. Update source data without recreating the map. Cluster click zooms; point click updates React selection. Clean up listeners and map on unmount.

- [ ] **Step 5: Implement the text detail panel**

Render selected location and its stages outside the canvas with keyboard-accessible links. On mobile place it below the map. Show a warning count for stages lacking coordinates and keep them available via the List/Calendar views.

- [ ] **Step 6: Add MapLibre CSS and responsive sizing**

Import MapLibre CSS globally, set a 32rem desktop map height and 26rem mobile height, preserve focus outlines, and use the existing stone/emerald/amber visual language.

- [ ] **Step 7: Run tests, typecheck, and build**

Run `npx vitest run lib/__tests__/stage-map.test.ts`, `pnpm typecheck`, and `pnpm build`.

- [ ] **Step 8: Commit the map slice**

```bash
git add site/app/stages/stage-map.tsx site/app/stages/stage-list.tsx site/app/globals.css site/lib/stage-map.ts site/lib/__tests__/stage-map.test.ts
git commit -m "feat(stages): add geographic map view"
```

### Task 7: Complete copy, privacy, documentation, and end-to-end verification

**Files:**
- Modify: `site/app/stages/page.tsx`
- Modify: `site/app/stages/loading.tsx`
- Modify: `site/STAGES.md`
- Modify: `site/next.config.ts`
- Test: all `site/lib/__tests__/*.test.ts`

**Interfaces:**
- Consumes: all prior tasks.
- Produces: verified private feature ready for Supabase configuration and deployment.

- [ ] **Step 1: Update page summaries and transparency copy**

Mention European coverage, teaching languages, translated titles, map precision, and source freshness without claiming guaranteed exhaustiveness. Keep the organizer page as source of truth.

- [ ] **Step 2: Keep loading and locked states private**

Ensure unauthenticated rendering does not call `getStagesFeed()` and the loading screen reveals no stage data. Retain signed twelve-hour cookie behavior and lock action.

- [ ] **Step 3: Update operations documentation**

Document source registry additions, parser fixtures, hourly sync, Supabase migration/application, translation fallback, Nominatim limits, map attribution, environment variables, and direct-fetch fallback.

- [ ] **Step 4: Run the complete automated suite**

Run `npx vitest run`, `pnpm typecheck`, and `pnpm build`. Fix every failure before proceeding.

- [ ] **Step 5: Verify privacy with HTTP requests**

On port 3100, confirm unauthenticated `/stages` contains the password form but no known stage title, returns `X-Robots-Tag`, and the homepage has no `/stages` link. Confirm an invalid password stays locked, a valid password sets an `HttpOnly; SameSite=Strict; Path=/stages` cookie, and locking expires it.

- [ ] **Step 6: Verify all three views in a real browser**

At desktop and mobile widths, verify shared filters, original plus translated titles, calendar month navigation, full-stage badges, map clusters, location panel, unmapped count, keyboard focus, and zero console errors. Use port 3100 only.

- [ ] **Step 7: Verify database security when credentials exist**

Apply the migration to the selected Supabase project, inspect tables and RLS, confirm `anon` and `authenticated` cannot select, invoke one protected sync, and run Supabase security advisories. If credentials are absent, report these as the only deployment-time checks not executable locally.

- [ ] **Step 8: Confirm no internal mesh exists**

Search application code for anchors or Next links whose destination is `/stages`; server redirects, cookie paths, cron paths, docs, and source user-agent strings are allowed, but navigational links are not.

- [ ] **Step 9: Commit the verified feature**

```bash
git add site/app/stages site/app/globals.css site/STAGES.md site/next.config.ts site/lib site/supabase site/vercel.json site/package.json site/pnpm-lock.yaml site/.env.local.example docs/superpowers
git commit -m "feat(stages): add private European training catalogue"
```
