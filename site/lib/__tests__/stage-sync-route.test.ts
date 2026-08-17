import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/stage-repository", () => ({
  isStageDatabaseConfigured: () => false,
}));

vi.mock("@/lib/stage-sync", () => ({
  verifyCronAuthorization: () => true,
  runStageSync: async () => ({
    checkedAt: "2026-08-17T10:00:00.000Z",
    state: "ok" as const,
    sourceCount: 43,
    successfulSources: 42,
    failedSources: 1,
    stageCount: 358,
    results: [],
  }),
}));

describe("GET /api/stages/sync", () => {
  it("refreshes the direct source cache when Supabase is not configured", async () => {
    const { GET } = await import("../../app/api/stages/sync/route");
    const response = await GET(
      new Request("https://parallailement.fr/api/stages/sync", {
        headers: { authorization: "Bearer test-secret" },
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      checkedAt: "2026-08-17T10:00:00.000Z",
      state: "ok",
      sourceCount: 43,
      successfulSources: 42,
      failedSources: 1,
      stageCount: 358,
    });
  });
});
