export const club = {
  name: "Parallailement",
  tagline: "Club de parapente en vallée d'Aure",
  shortDescription:
    "Un club de vol libre niché au pied des Pyrénées, à Ilhet. Petit, engagé, ouvert à toutes et tous.",
  location: "Ilhet, Hautes-Pyrénées (65)",
  address: "32 impasse de la Mairie, 65410 Ilhet",
  phone: "06 50 93 13 97",
  ffvl: "28194",
  gps: { lat: 42.9637, lng: 0.3826 },
  founded: "2025",
  bureau: [
    { name: "Mel", role: "Bureau" },
    { name: "Erwan", role: "Bureau" },
    { name: "Pierre", role: "Bureau" },
  ],
};

export const site = {
  name: "Site de vol local",
  status: "Pas encore conventionné",
  altitudeDeco: "1 450 m (véhicule) / 1 780 m (rando)",
  decoVehicule: { altitude: "1 450", label: "Cabane de Collantigue" },
  decoRando: { altitude: "1 780", label: "Sommet Pic de Montaut" },
  atterrissage: { altitude: "620", label: "Ilhet, vallée d'Aure" },
  orientations: "à venir",
  note: "Décollage pas encore conventionné — infos à jour partagées avec les membres.",
};

export const nextEvent = {
  title: "Ouverture de saison 2026",
  date: "10 mai 2026",
  place: "Ilhet, vallée d'Aure",
  description:
    "Premier rassemblement de l'année — reconnaissance du site, briefing aérologie locale, vols si la météo le permet.",
};

export const calendar = [
  {
    date: "2026-05-10",
    label: "10 mai 2026",
    title: "Ouverture de saison",
    place: "Déco de Collantigue",
    description:
      "Premier rassemblement de l'année — reconnaissance du site, briefing aérologie locale, vols si la météo le permet.",
  },
  {
    date: "2026-06-14",
    label: "14 juin 2026",
    title: "Stage Voler Mieux",
    place: "Ilhet, vallée d'Aure",
    description:
      "Journée de perfectionnement encadrée, à la demande des membres. Reste à charge partagé entre participants.",
  },
  {
    date: "2026-07-05",
    label: "5 juillet 2026",
    title: "Sortie cross-country",
    place: "Vallée d'Aure",
    description:
      "Journée cross en petit groupe — départ du Pic de Montaut si les conditions sont réunies.",
  },
  {
    date: "2026-09-20",
    label: "20 septembre 2026",
    title: "Assemblée générale",
    place: "Salle des fêtes d'Ilhet",
    description:
      "Bilan de la saison, élection du bureau, projets pour 2027. Ouvert à tous les adhérents.",
  },
];

export const highlights = [
  {
    title: "Stages Voler Mieux",
    body: "On met en place des stages de perfectionnement à la demande des membres, avec un reste à charge partagé entre participants.",
  },
  {
    title: "Compétitions",
    body: "On prépare notre participation à des manches régionales et événements amicaux, à notre rythme.",
  },
];

export const weatherLinks = [
  { label: "Meteoblue", href: "https://www.meteoblue.com/" },
  { label: "Windy", href: "https://www.windy.com/" },
  { label: "Meteo-parapente", href: "https://meteo-parapente.com/" },
  { label: "Balise Pioupiou", href: "https://pioupiou.fr/", note: "bientôt au déco" },
];
