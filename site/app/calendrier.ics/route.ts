import { listPublicEventsSafely } from "@/lib/club-events";
import { buildIcs } from "@/lib/ics-export";
import { siteUrl } from "@/lib/notifications";

export const revalidate = 900;

// Abonnement public : seulement les événements publics (publiés ou annulés).
export async function GET() {
  const events = await listPublicEventsSafely(200);
  const base = siteUrl();
  const ics = buildIcs(
    events.map((event) => ({ ...event, url: `${base}/evenements/${event.id}` })),
    "Parallailement — club de parapente",
  );
  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="parallailement.ics"',
    },
  });
}
