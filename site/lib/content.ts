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

export const photos = {
  site: "/photos/deco-collantigue.jpg",
};

export const salleDePliage = {
  eyebrow: "L'intendance",
  title: "Une salle de pliage,\nau chaud.",
  body: "Quand la météo hésite ou qu'il faut replier au sec, on a de quoi étaler les voiles à l'abri. Celle de la photo, c'est la grande salle de la mairie d'Ilhet — un bel espace qui accueille aussi des expositions (sculptures de marbre, artisans pyrénéens), mis à disposition quand il est libre. Et s'il est déjà pris, on a une salle de repli, plus modeste, mais qui fait très bien le job.",
  photo: "/photos/salle-pliage.jpg",
  alt: "La grande salle de la mairie d'Ilhet : une voile au sol prête à être pliée, parmi des sculptures de marbre exposées.",
};

export const gallery = [
  {
    src: "/photos/vol-orange.jpg",
    alt: "Parapente orange en vol dans la vallée d'Aure, vue dégagée sur la plaine.",
    caption: "En vol dans la vallée, vue dégagée sur la plaine",
  },
  {
    src: "/photos/voile-prairie.jpg",
    alt: "Voile blanche posée au décollage après un vol, panorama de la vallée d'Aure en arrière-plan.",
    caption: "Repos au décollage, après un tour de vallée",
  },
  {
    src: "/photos/duo-noir-blanc.jpg",
    alt: "Vol hivernal à deux au-dessus des sommets enneigés, photo en noir et blanc.",
    caption: "Vol hivernal à deux, au-dessus des sommets",
  },
  {
    src: "/photos/lever-soleil.jpg",
    alt: "Soleil bas d'hiver de fin de journée à l'ouest, au-dessus d'une couche d'inversion très marquée sur la vallée.",
    caption: "Soleil bas d'hiver à l'ouest, sous une couche d'inversion marquée",
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
