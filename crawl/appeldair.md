# Crawl — appeldair-vol-libre.fr

Rapport exhaustif du site actuel du club Appel d'Air (Targasonne / Cerdagne-Capcir), établi en vue de sa refonte.

---

## 1. Arborescence complète

### 1.1 Sitemap XML
- `wp-sitemap-index.xml`
  - `wp-sitemap-posts-post-1.xml` — 1 seul article : `/bonjour-tout-le-monde/` (article WP par défaut, vestige)
  - `wp-sitemap-posts-page-1.xml` — 12 pages (voir ci-dessous)
  - `wp-sitemap-posts-bwg_gallery-1.xml` — 2 galeries : `/bwg_gallery/accueil-appel-dair/`, `/bwg_gallery/page-photo/`
  - `wp-sitemap-taxonomies-category-1.xml`

### 1.2 Pages (menu + footer)
```
/                                    Accueil
├── /club/                            Club (page unique, navigation par ancres)
│     ├── #asso      Association Appel d'air
│     ├── #projet    Projet associatif
│     ├── #actu      Dernières informations
│     ├── #calendrier Calendrier
│     └── #histoire  Histoire du club
├── /voler/                           Voler (page unique, navigation par ancres)
│     ├── #mauroux       Site Mauroux (principal)
│     ├── #angles        Site Les Angles
│     ├── #deltaplane    Deltaplane
│     ├── #snowkite      Snowkite
│     ├── #navette       Navette club
│     ├── #volrando      Vol rando
│     ├── #securite      Voler en sécurité
│     ├── #apprendre     Apprendre à voler
│     ├── #biplace       Voler en biplace
│     ├── #espaces       Espaces aériens
│     └── #reglementation Règlementation
├── /meteo/                           Météo
├── /evenement/                       Événement
├── /gallery-photo/                   Galerie photo
├── /venir-visiter/                   Venir / Visiter
├── /partenaires/                     Partenaires
├── /contact-licence/                 Contact / Licence
├── /mentions-legales/                Mentions légales
├── /politique-de-confidentialite/    Politique de confidentialité
├── /page-d-exemple/                  Page d'exemple WordPress (vestige)
└── /bonjour-tout-le-monde/           Article "Hello world" WordPress (vestige)
```

Note importante : le sous-menu « Voler » affiche 10-11 entrées mais toutes pointent vers des ancres de la même page `/voler/`. Idem pour `/club/`. Il n'y a donc en réalité que 8 pages de contenu (hors légal et vestiges WP).

### 1.3 Liens externes clés
- `intranet.ffvl.fr/ffvl_licenceonline` — prise de licence
- `federation.ffvl.fr/structure/933` — fiche FFVL du club (n° 28157)
- `balisemeteo.com/balise.php?idBalise=44` — balise Mauroux
- `altiservice.com/webcam/haut-du-roc-de-la-calme` — webcam
- `facebook.com/122372907917962` — Facebook
- `instagram.com/club_de_vol_libre_appel_dair/`
- `volaime.com`, `parapentefontromeu.fr` — écoles partenaires
- `lefat-festival.fr` — Festival de l'Air organisé par le club
- `creation.sitewebconcept.fr` — agence web (crédit footer)

---

## 2. Détail par page

### 2.1 Accueil `/`
- **Rôle** : portail d'entrée, synthèse + renvois rapides.
- **Blocs** :
  1. Hero + citation Léonard de Vinci (« Quand vous aurez goûté au vol… »)
  2. Triptyque disciplines (Parapente / Deltaplane / Snowkite)
  3. Présentation club « Appel d'Air est le club local de vol libre »
  4. Bloc aire d'accueil (Pic des Mauroux / atterrissage)
  5. Bloc sites régionaux (Les Angles, Cambre d'Aze, Canigou)
  6. Grille 6 cartes rapides : sites, navette, météo, balise, rando, webcam
  7. Flux Facebook intégré (actus, dernier post : Mauroux Cup)
  8. Coordonnées club + n° FFVL 28157
- **CTA** : « En savoir plus », « Prendre sa licence », follow FB/Insta.
- **Intégrations** : Cookiebot (4 catégories), Facebook Page Plugin, liens balise météo + webcam.
- **Images** : la plupart rendues comme **placeholders base64 GIF gris** — site visiblement en cours de finalisation visuelle.

### 2.2 `/club/` — Club
Page longue unique, 5 ancres.

**#asso — Association**
- Loi 1901, non lucrative, ~80 adhérents 2024 (barre des 100 franchie en 2025).
- Affiliée FFVL, n° 28157.

**Bureau & comité directeur (14 membres)**
- Président : Erick Vera
- Secrétaire : Olivia Charrier
- Trésorière : Agathe Exiga
- Membres : Geneviève Galy, Fatima Longelin, Gregory Nouhaud, Damien Hamard, Magali Viguier, Lilian Blanquart, Diane Pernot, Didier Exiga, Patrick Vallery, Lucie Bernez, Jean Lafond.
- Bureau gère le courant ; CD se réunit 4-5 fois/an ; AG en janvier à Targasonne (vote rapport, bilan, budget).
- Documents téléchargeables : présentation PPT 2025, projets 2026, PV AG 2025.

**#projet — Projet associatif**
- 6 valeurs : Partage, Engagement, Autonomie, Responsabilité, Liberté, Éco-responsabilité.
- 6 missions : (1) accessibilité (féminin/jeunes/handicap), (2) sécurité & autonomie (formation continue), (3) gestion des sites, (4) ancrage territorial, (5) engagement associatif & environnement, (6) diversification (delta + snowkite).
- PDF projet associatif à télécharger.

**#actu — Dernières informations**
- AG 2026 (11 mars 2026, Targasonne) — bilan 2025 : stages Voler Mieux, actions inclusivité (sourds/malentendants, handicap), journée pliage parachutes, FAT 2025 positif, cap des 100 adhérents.
- Objectif 2026 : créer des commissions pour déléguer.
- Stage filles 2025 (6-9 juin, Mauroux) — 100% féminin, 9 vols.
- Marche et vol encadré (30 sept – 4 oct 2024) — Catalogne, guide HM + moniteur parapente.
- Parapente en fauteuil roulant (5 sept 2024) — projet avec Liberté Conditionnelle, Ride Again ; reportage France 3.
- Rencontre PGHM (30 juillet 2024) — protocoles urgence, CR PDF.

**#calendrier**
- Formulaire de proposition (sorties, voyages, projets).

**#histoire — Du parapente en Cerdagne-Capcir (1980 à aujourd'hui)**
- 1987 : premiers décollages delta/para au Mauroux (Barric, Cartier, Exiga, Ferrière, Lagane, Magenti, Nemary, Rispoli, Vilana).
- 1988 VOLEM → VOL'AIME (Barric, Vilana, Exiga), atelier fabrication parapentes Espousouille.
- 1989 Escapade Aérienne (préz. Alain Ferrière) — gestion sites, compétitions.
- 1990 Ailes Cerdanes (origine militaire), école club.
- 2000 Pep'Air — kite et compétitions.
- **15 janvier 2011** : fusion des 3 clubs → **Appel d'Air**. Président fondateur Jean Viguier, secrétaire G. Galy, trésorier J. Boyer. Succession : D. Hamard puis E. Vera.

### 2.3 `/voler/` — Voler
Page longue unique, 10-11 ancres.

**#mauroux — Pic des Mauroux (2 070 m)**
- Orientation Sud, région très ensoleillée.
- Accès : route Thémis, marche, ou navette club.
- Décollage au sommet, atterrissage sur la route de la centrale Thémis (manches à air).
- Aérologie : thermiques puissants l'été, brise d'après-midi forte dès 13h.
- **Interdiction absolue** de survoler la centrale solaire Thémis (miroirs concentrent le soleil, brûlent la voile en <1 s).
- Zone R118 : interdite sous 1 900 m.
- Rayon d'exclusion 250 m autour de la tour Thémis (42°30'04" N, 1°58'27" E).

**#angles — Les Angles (1 600 – 2 300 m)**
- Atterrissage 1 600 m, chemin des Fontaneille (sortie nord du village).
- 2 décollages : Antenne Déco (2 120 m, via télécabine + 100 m de marche, face Est) ; Roc d'Aude (2 300 m, télécabine + TS, toutes orientations).
- Interdit de décoller sur les pistes de ski l'hiver.
- Thermiques très matinaux, brise de vallée parfois trop forte.

**#deltaplane**
- Décollage Pic des Mauroux (SE → SO).
- Atterro parapente non praticable en delta : aller se poser sur le plateau de Cerdagne côté Llivia (~1 200 m). Attention cultures et chevaux.
- Renvoi vers écoles Vol'aime & Parapente Font-Romeu.

**#snowkite**
- Hiver uniquement.
- 4 spots : Col de Porté Puymorens (très bon, NO/SE), Col de la Perche (1 581 m, vents variés + thermiques tardifs), Plateau de la Calme (au-dessus de Font-Romeu, accès 30 min pied), Puigmal (2 700 m, ski alpinisme 1h30-2h, enneigement requis).

**#navette — Navette club**
- Minibus Master 9 places.
- **Tarifs** : course = **5 €** (payée au chauffeur) ; abonnement annuel = **60 € membres / 80 € non-membres** (illimité sur l'année calendaire).
- Fonctionnement : rotations entre atterro et déco ; le véhicule redescend toujours (pas de stationnement au déco) ; priorité matin aux débutants, aprem inversé.
- Écoles pro proposent aussi des places aux mêmes conditions.

**#volrando — Vol rando**
- 3 itinéraires documentés :
  - Pic des Mauroux : directe 1,2 km / +420 m (30-50 min) ou route (60-80 min).
  - Cambre d'Aze : départ Saint Pierre dels Forcats, ~1h30+, sommet 2 300 m.
  - Les Angles : 30 min à 2h selon déco.
- Tracés Google Earth téléchargeables.
- Respect pistes/lignes/agriculture.

**#securite — Voler en sécurité**
- Thermiques fréquents à midi instable, vigilance décollage/atterrissage.
- Brise d'après-midi dangereuse l'été.
- Effet Venturi à l'est du déco (route de la centrale).
- Interdit Thémis (brûlure voile).
- Ressources : balises, webcams, panneaux info sur sites, PDF règlement site téléchargeable, fréquence radio FFVL.

**#apprendre**
- Club **ne forme pas les débutants**. Accueille pilotes à partir du **brevet vert**.
- 2 écoles FFVL partenaires :
  - **Vol'aime** — 7 rue de Las Devèse, 66120 Égat — 04 68 30 10 10 — volaime.com
  - **Parapente Font-Romeu** — 51 rue de la Solane, 66120 Targasonne — 07 66 66 55 71 — parapentefontromeu.fr
- Stages « Voler Mieux » pour adhérents.

**#biplace**
- Club organise ponctuellement des biplaces lors d'événements / FAT.
- Sinon, même renvoi aux 2 écoles partenaires (vols découverte toute l'année).

**#espaces — Espaces aériens**
- Aérodrome Sainte-Léocadie : interdit sous 1 900 m.
- Zone R118 : plancher 1 900 m.
- Thémis : exclusion 250 m / 300 m sol / plafond 1 950 m.
- Voie B31 : interdite FL115 (~3 400 m).

**#reglementation**
- Reprise des restrictions ci-dessus + renvoi aux panneaux site et PDF.
- Licence FFVL obligatoire (club #28157).

### 2.4 `/meteo/`
- Agrégateur d'outils pour pilotes : **Windy, Meteoblue, Vélivole, Météo Ciel, Spot Air FFVL**, Met Office (cartes isobariques), Sat24, Meteo-Parapente (coupes altitude), balise Mauroux, webcam Roc de la Calme.
- Pas de widget natif apparent — vraisemblablement des liens externes.

### 2.5 `/evenement/`
- **Festival de l'Air (FAT)** : éco-responsable, gratuit, familial. 2ᵉ édition 30-31 août 2024 ; 3ᵉ édition 1-2 septembre 2025, Thémis/Targasonne. Site dédié : lefat-festival.fr.
- Compétition organisée depuis 2018 : 2 pré-mondiaux (2018, 2021), 2 championnats de France (2019), **Coupe du Monde 2023**.
- Mauroux Cup (mentionnée avril).

### 2.6 `/gallery-photo/`
- ~20 galeries listées (BWG Gallery + lightbox).
- Thèmes : sites (Mauroux, Les Angles), disciplines (delta, snowkite), événements (Mauroux Cup), vie du club.
- Pas de vidéos visibles.

### 2.7 `/venir-visiter/`
- Adresse GPS : 42°30'03" N 01°59'08" E, 3 km de Font-Romeu.
- Atterro Mauroux sur route Thémis, manches à air.
- **Activités alternatives par mauvais temps** :
  - Cheval Loisirs Promenades (équitation, à 200 m de l'atterro)
  - Bains thermaux : Dorres (40°C naturels), Llo, Saint Thomas
  - Roc'Line (tyroliennes, Angoustrine)
  - Train Jaune (voie métrique la plus haute d'Europe)
- Pas de section hébergements/restaurants listés ici (en creux).
- Recommandation : consulter balise FFVL avant venue.

### 2.8 `/partenaires/`
Quatre partenaires seulement :
1. Restaurant traiteur « Les Délices des Neiges » (Font-Romeu) — commercial
2. Ligue Occitanie Vol Libre — institutionnel
3. Pôle Espoir de Font-Romeu — institutionnel
4. Communauté de communes Pyrénées Cerdagne — institutionnel
- Logos affichés comme placeholders, pas de liens sortants par partenaire.
- Contact partenariat : **appeldair66@gmail.com**.

### 2.9 `/contact-licence/`
- Formulaire de contact (champs non détaillés publiquement).
- Adresse : Club Appel d'Air, 3 route de l'Andorre, 66120 Targasonne.
- FFVL #28157.
- CTA « Prendre sa licence » → portail FFVL.
- **Aucun tarif d'adhésion ou de licence affiché** (tout se fait sur intranet FFVL).

### 2.10 `/mentions-legales/`
- Éditeur : association Appel d'Air.
- Directeur de publication : **Damien Hamard**.
- Hébergeur : **Planethoster** (Laval, Québec).
- Création site : **SiteWebConcept** (Égat).
- RGPD mentionné, juridiction française.

### 2.11 Pages vestiges (à supprimer dans la refonte)
- `/page-d-exemple/` (Sample Page WP)
- `/bonjour-tout-le-monde/` (Hello World WP, daté 4 mars 2024)

---

## 3. Synthèse

### 3.1 Structure éditoriale
- **Socle WordPress**, thème sur-mesure par SiteWebConcept.
- Architecture « one-pagers longs » : `/club/` et `/voler/` regroupent chacune plusieurs sous-sujets via ancres. Cela simplifie l'arborescence mais alourdit les pages et dilue le SEO (chaque ancre n'a pas d'URL propre).
- Menu principal à 9 entrées + 2 sous-menus riches — dense, un peu ancien.
- Footer sobre : coordonnées, n° FFVL, réseaux, mentions, crédit agence.

### 3.2 Tarifs et adhésion
- **Pas de tarif d'adhésion club affiché** sur le site public (passe intégralement par le portail FFVL via club #28157).
- **Navette** : 5 € la course, 60 €/an membres, 80 €/an non-membres.
- Aucun pricing pour stages internes, baptêmes, biplaces — renvoi aux écoles partenaires.

### 3.3 Trois disciplines
- **Parapente** : discipline dominante, infrastructure autour du Mauroux, navette, atterro officiel, stages Voler Mieux, stages filles, handi-parapente.
- **Deltaplane** : présent mais périphérique — même déco (Mauroux) mais atterro différent (plateau Cerdagne côté Llivia). Traité en section courte.
- **Snowkite** : 100 % hivernal, 4 spots, traitement léger, pas de stages spécifiques listés.
- La **diversification delta + snowkite** est explicitement l'une des 6 missions du projet associatif.

### 3.4 Section Partenaires
- Très pauvre : 4 partenaires, sans logo réel ni lien web. Manifestement à retravailler à la refonte (gros gisement : écoles, hébergeurs, offices du tourisme, équipementiers, marques).

### 3.5 Page « Venir/Visiter »
- Orientation tourisme-plan-B plus que accueil visiteurs vol libre : pas d'hébergements partenaires, pas de restaurants, pas de gares/aéroports, pas de tarifs location-véhicule, pas de cartes interactives. Page à enrichir fortement.

### 3.6 CTA dominants
- « Prendre sa licence » (FFVL)
- « En savoir plus »
- Suivre Facebook / Instagram
- Formulaire contact
- Téléchargements PDF (projet associatif, PV AG, règlements site)

### 3.7 Ton
- **Amical et communautaire** (« le club local », citation Da Vinci, récits de stages) avec une couche **technique sérieuse** (aérologie, espaces aériens, sécurité). Dimension institutionnelle discrète (bureau, AG, projet associatif). Relativement peu marketing.

---

## 4. Fonctionnalités techniques spécifiques
- **CMS** : WordPress (sitemap natif WP, slug `wp-sitemap-*`).
- **Galerie** : plugin **BWG Gallery** (Photo Gallery by 10Web) + lightbox.
- **Formulaires** : plugin WP standard — formulaire contact + formulaire propositions projet/calendrier (« Blank Form #3 » en placeholder, suggérant une config incomplète).
- **Cookies / RGPD** : **Cookiebot** avec 4 catégories (Functional, Preferences, Statistics, Marketing).
- **Réseaux sociaux** : **Facebook Page Plugin** intégré en home (flux d'actus) ; liens Instagram.
- **Cartographie** : pas de Google Maps embarqué constaté ; coordonnées GPS en texte ; tracés Google Earth en téléchargement.
- **Vidéos** : pas d'intégration native, renvoi YouTube (reportage France 3 handi-parapente).
- **Météo / balises / webcams** : uniquement liens sortants (Windy, Meteoblue, balisemeteo.com, altiservice.com, Spot Air FFVL, etc.), pas de widget natif.
- **Hébergement** : Planethoster (Canada).

---

## 5. État du site (production vs en construction)
- Le site est **en production mais visiblement inachevé visuellement** :
  - De nombreuses images apparaissent comme **placeholders base64 GIF gris** (home, partenaires, section aménagements sites, logos sociaux). Signalé à plusieurs reprises lors du crawl.
  - Formulaire « Blank Form #3 » laissé avec son nom technique.
  - Page « Page d'exemple » WP et article « Bonjour tout le monde » toujours en ligne.
  - Page Partenaires quasi vide (4 entrées, pas de logos ni liens).
  - Mentions du projet associatif et documents PDF présents (la partie éditoriale institutionnelle est solide), mais la couche UI/médias est incomplète.
- Contenu éditorial par ailleurs **riche et récent** : actus 2024-2025-2026, AG 2026 annoncée, FAT 2025 référencé, Mauroux Cup avril 2026. Le site est donc maintenu.

---

## 6. Idées à reprendre (ou à dépasser) dans la refonte

**À conserver**
- La citation Da Vinci en hero.
- Le triptyque disciplines (parapente / delta / snowkite).
- La grille de 6 cartes « accès rapide » en home (sites, navette, météo, balise, rando, webcam).
- Le bloc agrégateur d'outils météo (Windy, Meteoblue, Vélivole, Météo Ciel, Spot Air FFVL, Meteo-Parapente).
- Les fiches sites techniques et honnêtes (aérologie, dangers, interdictions Thémis/R118/B31).
- L'historique (1987 → fusion 2011) — atout patrimonial fort.
- Les valeurs et 6 missions du projet associatif (structurant éditorialement).
- Les récits de stages inclusifs (filles, handi-parapente) — différenciant fort.

**À casser / restructurer**
- Éclater les one-pagers `/club/` et `/voler/` en pages/URL propres (meilleure UX + SEO).
- Créer des **fiches site** dédiées (Mauroux, Les Angles, Cambre d'Aze, Canigou, + 4 spots snowkite) avec carte, photos, conditions, webcams, balises, règlement.
- Vraie page **Tarifs / Adhésion** (expliquer licence FFVL, cotisation club, navette, stages).
- Vraie page **Venir / Visiter** avec hébergements partenaires, restaurants, transports (train jaune, TER, Perpignan/Toulouse aéroports), offices du tourisme.
- Refondre **Partenaires** avec catégories (institutionnels, écoles, hébergement, restauration, équipement, tourisme), logos, liens et témoignages.
- **Calendrier** interactif (iCal/Google) plutôt qu'un formulaire.
- **Galerie** : passer à un plugin moderne (FancyBox/Lightgallery, WebP, lazy-loading), ajouter vidéos.
- **Cartes interactives** des sites (Mapbox/Leaflet) avec traces GPX vol-rando.
- **Widgets météo** intégrés (iframes Windy/Meteoblue, webcam embed) plutôt que liens sortants.
- Supprimer les vestiges WP (`/page-d-exemple/`, `/bonjour-tout-le-monde/`).
- Nettoyer les placeholders image et le formulaire « Blank Form #3 ».
- Ajouter un **espace membres** (PV AG, projet associatif, documents internes actuellement exposés publiquement).
- Ajouter **FAQ** (débutant, visiteur, biplace, sécurité).
- **CTA unique et clair** : « Adhérer » + « Réserver la navette » + « Prendre un baptême » (redirection écoles).

**À ajouter idéalement**
- Bloc « État du vol aujourd'hui » (balise temps réel + webcam + point météo).
- Formulaire de **réservation navette** (ou appli mobile légère).
- Page **Sécurité / Urgence** dédiée avec numéros PGHM, fréquences radio, protocole accident.
- Intégration **Strava / XContest / CFD** pour fils de vols récents.
- **Newsletter** + RSS (aujourd'hui les actus passent via Facebook uniquement).
- Schema.org SportsClub / Event / Place pour le SEO local.
