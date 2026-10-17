import { canManageCalendar } from "@/lib/access";
import { getCurrentProfile } from "@/lib/auth";
import { getEvent, listRegistrants } from "@/lib/club-events";
import { toCsv } from "@/lib/csv";
import { formatDateTime, toParisParts } from "@/lib/paris-time";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const profile = await getCurrentProfile();
  if (!canManageCalendar(profile)) return new Response("Accès refusé", { status: 403 });

  const { id } = await params;
  const event = await getEvent(id);
  if (!event) return new Response("Introuvable", { status: 404 });

  const registrants = await listRegistrants(event.id);
  const csv = toCsv([
    ["Nom", "Email", "Téléphone", "Inscrit le"],
    ...registrants.map((row) => [
      row.profiles?.full_name ?? "",
      row.profiles?.email ?? "",
      row.profiles?.phone ?? "",
      formatDateTime(row.created_at),
    ]),
  ]);
  const slug = event.title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="inscrits-${toParisParts(event.starts_at).date}-${slug || "evenement"}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
