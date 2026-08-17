import { NextResponse } from "next/server";
import { runStageSync, verifyCronAuthorization } from "@/lib/stage-sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(request: Request) {
  if (
    !verifyCronAuthorization(
      request.headers.get("authorization"),
      process.env.CRON_SECRET,
    )
  ) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const result = await runStageSync();
    return NextResponse.json({
      checkedAt: result.checkedAt,
      state: result.state,
      sourceCount: result.sourceCount,
      successfulSources: result.successfulSources,
      failedSources: result.failedSources,
      stageCount: result.stageCount,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "La synchronisation a échoué",
        detail: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    );
  }
}
