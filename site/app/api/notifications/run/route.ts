import { NextResponse } from "next/server";
import { isMembershipConfigured } from "@/lib/auth";
import { flushOutbox, queueDueReminders } from "@/lib/notifications";
import { verifyCronAuthorization } from "@/lib/stage-sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

// Tâche horaire : met les rappels en file, puis envoie ce qui attend.
export async function GET(request: Request) {
  if (!verifyCronAuthorization(request.headers.get("authorization"), process.env.CRON_SECRET)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  if (!isMembershipConfigured()) return NextResponse.json({ skipped: "base non configurée" });

  try {
    const reminders = await queueDueReminders();
    const delivery = await flushOutbox(200);
    return NextResponse.json({ reminders, ...delivery });
  } catch (error) {
    return NextResponse.json(
      { error: "La tâche a échoué", detail: error instanceof Error ? error.message : "Erreur inconnue" },
      { status: 500 },
    );
  }
}
