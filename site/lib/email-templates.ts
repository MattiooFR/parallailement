import { formatEventWhen } from "./paris-time";
import { offsetLabel } from "./reminders";

export type EmailContent = { subject: string; text: string };

type EventSummary = {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string | null;
  all_day: boolean;
  location_name: string;
  address: string;
};

const signature = "\n\n—\nParallailement, club de parapente à Ilhet\n";

function eventLines(event: EventSummary, siteUrl: string): string {
  const where = [event.location_name, event.address].filter(Boolean).join(", ");
  return [
    `📅 ${formatEventWhen(event)}`,
    where ? `📍 ${where}` : null,
    "",
    `Tous les détails : ${siteUrl}/evenements/${event.id}`,
  ]
    .filter((line) => line !== null)
    .join("\n");
}

export function signupPendingEmail(
  member: { full_name: string; email: string },
  siteUrl: string,
): EmailContent {
  return {
    subject: `Nouvelle inscription à valider : ${member.full_name || member.email}`,
    text:
      `${member.full_name || "Quelqu’un"} (${member.email}) vient de créer un compte.\n\n` +
      `Valide ou refuse son inscription ici :\n${siteUrl}/admin/membres` +
      signature,
  };
}

export function accountReviewedEmail(
  member: { full_name: string },
  approved: boolean,
  siteUrl: string,
): EmailContent {
  const hello = member.full_name ? `Bonjour ${member.full_name},` : "Bonjour,";
  return approved
    ? {
        subject: "Ton compte Parallailement est validé",
        text:
          `${hello}\n\nBonne nouvelle : ton compte est validé.\n\n` +
          `Tu peux voir les événements du club et t’y inscrire :\n${siteUrl}/espace` +
          signature,
      }
    : {
        subject: "Ton inscription à Parallailement",
        text:
          `${hello}\n\nNous n’avons pas pu valider ton compte.\n` +
          `Si c’est une erreur, appelle-nous au 06 50 93 13 97.` +
          signature,
      };
}

export function eventPublishedEmail(event: EventSummary, siteUrl: string): EmailContent {
  return {
    subject: `Nouvel événement : ${event.title}`,
    text:
      `Un nouvel événement est au calendrier du club.\n\n${event.title}\n` +
      eventLines(event, siteUrl) +
      `\n\nTu viens ? Inscris-toi en un clic sur la page.` +
      signature +
      `Pour ne plus recevoir ces emails : ${siteUrl}/espace`,
  };
}

export function eventReminderEmail(
  event: EventSummary,
  offsetHours: number,
  siteUrl: string,
): EmailContent {
  const when = offsetHours <= 24 ? "C’est bientôt" : `Rappel (${offsetLabel(offsetHours)})`;
  return {
    subject: `${when} : ${event.title}`,
    text:
      `Tu es inscrit·e à cet événement.\n\n${event.title}\n` +
      eventLines(event, siteUrl) +
      `\n\nTu ne peux plus venir ? Désinscris-toi sur la page pour libérer ta place.` +
      signature,
  };
}

export function eventChangedEmail(
  event: EventSummary,
  change: { cancelled: boolean; fields: string[] },
  siteUrl: string,
): EmailContent {
  if (change.cancelled) {
    return {
      subject: `Annulé : ${event.title}`,
      text:
        `L’événement « ${event.title} » est annulé.\n\n` +
        `Il était prévu ${formatEventWhen(event)}.` +
        signature,
    };
  }
  return {
    subject: `Changement : ${event.title}`,
    text:
      `L’événement « ${event.title} » a changé (${change.fields.join(" et ")}).\n\n` +
      `Voici les nouvelles infos :\n` +
      eventLines(event, siteUrl) +
      signature,
  };
}
