# Analyse comparée — sites de clubs de parapente de référence

**Date** : 2026-04-14
**Méthode** : crawl complet des 4 sites (sitemaps XML ou parsing liens, 13-20+ pages par site).
**Rapports détaillés** : voir `crawl/augredelair.md`, `crawl/accousdailes.md`, `crawl/appeldair.md`, `crawl/zeleph.md`.

Sites étudiés :
1. **Augrédelair** — arrière-pays niçois (Gréolières / Col de Bleine) — FFVL 01706
2. **Accous d'Ailes** — vallée d'Aspe (64) — FFVL 12343
3. **Appel d'Air** — Cerdagne-Capcir (66, Targasonne) — FFVL 28157
4. **Z'éléphants Volants** — Chambéry (73, Bauges) — FFVL 03359

---

## 1. Vue d'ensemble par site

### 1.1 Augrédelair (augredelair.fr)
**Stack** : WordPress classique + The Events Calendar
**Périmètre crawlé** : 20 pages statiques, 82 articles de blog (2020-2026), 2 events, sitemap XML complet.

**Positionnement** : **site-outil pour pilotes**, pas vitrine touristique. La home est un dashboard (raccourcis météo / live / webcams / QVOQ).
**Force éditoriale** : archive historique riche (récits PDF 2005-2015, bibliothèque sécurité 2006-2017).
**Ton** : familier, communautaire, signé par Robert Vercellone (président) — titres en CAPITALES, émotion.

**Fonctionnalités spécifiques** :
- **QVOQ** (Qui Vole Où Quand) — app Firebase externe de coordination des projets de vol
- **Live tracking multi-pilotes** via Skylines.aero + trackers FindMeSpot/Capturs
- **Balises météo propriétaires** (Pioupiou/Windbird/WindsMobi/SpotAir) opérées par le club
- **9 webcams** (3 propriétaires Reolink à Cipières/Gréolières/Mons + 5 tierces agrégées)
- **Widget "À vous le micro"** — shoutbox/chat embarqué en home
- **Archives récits PDF** classées par auteur (~50 auteurs, dont Luc Armant — Himalaya 1060 km)
- **Formations subventionnées** — le club prend 50-70 % du coût instructeur (reste 25-50 €/pilote)
- **Résa biplace associatif** via WhatsApp dédié (voile Supair Sora 2 42m²)
- **Fréquences radio** affichées (143.9875 / 154.150)

**3 itinéraires cross documentés** (textuel, sans GPX) : Gréolières/Coursegoules (20 km), Bleine/St-André (70 km), Bleine/Dormillouse (175 km).

**Intégrations tierces** : Meteoblue (3 cartes + widgets), Skylines, Framadate (inscriptions events), WhatsApp (groupes), Facebook (groupe privé), Vimeo.

**Lacunes** : pas de tarifs affichés, pas de carte interactive, pas de GPX, pas de pagination news, `/webcams/` + `/webcams3/` séparées (rustine mobile), photos/vidéos renvoient toutes à des sites externes.

---

### 1.2 Accous d'Ailes (accousdailes.fr)
**Stack** : Web Acappella (CMS ancien, `.html` + `wa_files/wa_images/`), JS léger.
**Périmètre crawlé** : 11 URLs du sitemap officiel + sitemap + PDFs.

**Positionnement** : accueil vallée + gestion du site d'Accous, ouverture touristes (multilingue).
**Force éditoriale** : histoire du club par "Masterpitrou" avec archives photo 1985-2019, section géologie pédagogique.
**Ton** : convivial, premier degré, humour local ("Masterpitrou", "French cancans", "navet'man", "Sky, fun and apero"), tutoiement implicite.

**Fonctionnalités spécifiques** :
- **Multilingue** FR/EN/ES via Google Translate + 2 PDF figés
- **Navette** avec tarifs publics : 5 € course / 35 € carnet 10 / 120 € annuel
- **Fiches techniques décos** : 800/Delta, 300, 500, 1000, Intermédiaire + Issarbe (coord, alt, dénivelé, orientations, PMR, 3 itinéraires montée à pied)
- **Gypaète barbu** : ZSM actives 1er nov → 15 août, interdiction sous 2200 m → **différenciateur environnemental fort**
- **Géologie de la vallée d'Aspe** : route géologique transpyrénéenne (GéolVal, 200 km), rare pour un club parapente
- **Biplace club** : Dudek Orca 4 + 5, charte obligatoire signée
- **Balise radio FFVL** : 143.9875 MHz (voix synthétique toutes les 20 min)
- **Documents** 3 dossiers Google Drive ouverts (bulletins, CR, rapports AG) = transparence

**15 liens météo externes** (pas d'embed) : Pioupiou Accous/Issarbe, Météo-France, Meteoblue, Météociel (3 variantes), Meteoconsult, La Chaîne Météo, UK Met Office, Windy, Meteo-parapente, Keraunos.

**Partenaires écoles** : Ascendance (Accous) + Air Attitude (Accous).

**Lacunes** : aucun tarif d'adhésion club, calendrier vide, blog sans articles (le vrai flux est sur groupe Facebook 1441449832740163), webcam Issarbe sur IP locale HTTP cassée, SEO/accessibilité faibles (CMS figé), pas de fil d'Ariane ni recherche interne.

---

### 1.3 Appel d'Air (appeldair-vol-libre.fr)
**Stack** : WordPress (SiteWebConcept, hébergé Planethoster Québec), Cookiebot, BWG Gallery, Facebook Page Plugin.
**Périmètre crawlé** : 13 pages (seulement 8 de contenu — le menu dense cache 2 "one-pagers longs" `/club/` et `/voler/` navigués par ancres).

**Positionnement** : club **multi-disciplines** (parapente + deltaplane + snowkite) en Cerdagne-Capcir. Site institutionnel + communautaire.
**Force éditoriale** : historique (fusion 2011 de 3 clubs : VOL'AIME, Escapade Aérienne, Ailes Cerdanes + Pep'Air), projet associatif structuré (6 valeurs, 6 missions), actions inclusives récentes (stage filles, handi-parapente en fauteuil, France 3).
**Ton** : amical communautaire + technique sérieuse + institutionnel discret (bureau, AG, projet associatif).

**Fonctionnalités spécifiques** :
- **3 disciplines** explicites (parapente / delta / snowkite) — diversification inscrite au projet asso
- **Navette** : 5 € la course, abonnement annuel **60 € membres / 80 € non-membres** (tarifs affichés)
- **Fiches sites** : Pic des Mauroux (2070m, sud), Les Angles (1600-2300m, 2 décos via télécabine), 4 spots snowkite hivernaux (Porté Puymorens, Col de la Perche, Plateau de la Calme, Puigmal)
- **Espaces aériens contraints** : interdiction Thémis (miroirs centrale solaire brûlent la voile <1s), zone R118 plancher 1900m, exclusion 250m tour Thémis, voie B31 interdite FL115
- **Festival de l'Air (FAT)** gratuit éco-responsable organisé par le club (3e édition 2025)
- **Événements compétitifs** organisés : 2 pré-mondiaux (2018, 2021), 2 championnats de France (2019), **Coupe du Monde 2023**
- **Projet associatif PDF** téléchargeable

**Écoles partenaires** : Vol'aime (Égat) + Parapente Font-Romeu (Targasonne). Le club **ne forme pas** les débutants (pilotes à partir du brevet vert).

**Pauvres** : Partenaires (4 entrées, logos placeholders), Venir/Visiter (orientée plan-B mauvais temps : équitation, bains thermaux, Train Jaune, Roc'Line — zéro hébergement/resto listé), Météo = uniquement liens sortants.

**État du site** : en production mais **visuellement inachevé** — images placeholders base64 GIF gris, formulaire "Blank Form #3", pages vestiges WP (`/page-d-exemple/`, `/bonjour-tout-le-monde/`) toujours en ligne.

---

### 1.4 Z'éléphants Volants (zeleph.com)
**Stack** : WordPress + Yoast SEO. Commentaires activés. Page protégée par mot de passe WP native (`/reserver-un-bi/`).
**Périmètre crawlé** : 20 pages principales + 10-24 articles de blog échantillonnés (blog actif depuis 2015, 8 pages de pagination, ~90+ articles).

**Positionnement** : **club moderne le mieux structuré** de la sélection. Nav 5 axes clairs (Club / Sites / Événements / Écosystème / Blog), sous-menus jusqu'à 3 niveaux.
**Force éditoriale** : blog de récits signés par membres (Thomas, Gaël, Léo, Maxim…), photo-reportages systématiques, archives compét par année.
**Ton** : convivial, second degré, inclusif ("participant.e.s", seniors, femmes), rigoureux sur sécurité/environnement, lexique interne assumé (Z'éléphs, pachydermes, grand-messe).

**Fonctionnalités spécifiques** :
- **Adhésion HelloAsso** (cotisation statutaire **20 €/an** affichée dans le règlement — seul club à afficher)
- **Discord** = plateforme centrale (invite `discord.gg/6zh2vWqyZA` répétée partout) + Framaliste pour mailing
- **Identité visuelle "Z'éléphants"** : mascotte éléphant, merchandising annuel, jeu de mots dans les noms d'événements (Trotte et Vol, Galope et Vol, Full Ba'bar, Fête du club)
- **Page "zones aériennes CTR/TMA"** dédiée — différenciateur Chambéry (proximité aéroport) : CTR sol→1060m interdit sauf dérogation 0-50m, TMA saisonnière mi-déc→mi-avril (saison charters ski), outil **flyXC.app**, Brocolis **fermé** hiver
- **Bulles de quiétude LPO** via fichiers **OpenAIR** quotidiens (sanctions -300 pts en compét)
- **Partenariats formels** : PNR Massif des Bauges + LPO + communes (Verel-Pragondran, Les Déserts, Sonnaz)
- **Services aux membres chiffrés** : formation 15 €/jour (4 j max), qualif biplace 150 € remboursés, budget compét, prêt flotte biplace, Citiz covoit, CERFA frais bénévoles
- **Étude scientifique EF2PA** co-portée par le club (Mathilde Régnier + LPNC USMB + Epsylon Montpellier 3) = club acteur de recherche
- **Page membre protégée** par mot de passe (réserver biplace)
- **Records affichés** par site (Semnoz A/R 1h24, 138 km, 1er retour 12 février)

**Événements (4 récurrents)** :
- **Trotte et Vol** — juillet, 11e édition 2026, Bauges, marche-vol, 60 pax, 90 € pilote + 40 € passager
- **Galope et Vol** — automne, MEVPA, précision d'atterrissage, record 88 pilotes (2024)
- **Full Ba'bar** (CID) — juin, initiation distance, voiles max classe B
- **Fête du club** — 24 août, Verel → Montagny, baptêmes biplaces

**350 adhérents** (chiffre 2023), fondé 11/07/1989.

**Points d'amélioration repérés** : HelloAsso bloque crawlers, auteurs blog peu valorisés, taxonomie URL incohérente (`/nos-evenements/` vs `/competitions/`).

---

## 2. Tableaux comparatifs

### 2.1 Tarifs publics affichés

| Élément | Augrédelair | Accous d'Ailes | Appel d'Air | Z'éléphants |
|---|---|---|---|---|
| Cotisation club | ❌ | ❌ | ❌ | ✅ **20 €/an** |
| Licence FFVL | renvoi intranet | renvoi intranet | renvoi intranet | renvoi intranet |
| Navette — course | — | **5 €** | **5 €** | — |
| Navette — annuel | — | **120 €** | **60 € adh / 80 € non-adh** | — |
| Navette — carnet | — | **35 € (10)** | — | — |
| Biplace club | Gratuit (WhatsApp) | Gratuit sous charte | Ponctuel sur événements | Prêt flotte qualif |
| Formation interne | 25-50 € (subventionné) | — | — | **15 €/j** (4 j max) |
| Qualif biplace | — | — | — | **150 € remboursés** |
| Événement compétitif | — | — | — | **90 € pilote + 40 € pax** (Trotte) |

### 2.2 Stack & intégrations

| Catégorie | Augrédelair | Accous d'Ailes | Appel d'Air | Z'éléphants |
|---|---|---|---|---|
| CMS | WordPress | Web Acappella | WordPress | WordPress + Yoast |
| Météo | Meteoblue embed + liens | 15 liens externes | 8 liens externes | Webcam embed + liens |
| Live tracking | ✅ Skylines + Spot + Capturs | ❌ | ❌ | flyXC.app |
| Balises | Pioupiou/Windbird/WindsMobi/SpotAir **opérés** | 2 balises Pioupiou | balisemeteo.com Mauroux | openwindmap.org (Sire) |
| Webcams | **9** (3 propriétaires Reolink) | 2 (Accous + Issarbe cassée) | 1 (altiservice) | 1 (Vérel) |
| Adhésion | Intranet FFVL | Intranet FFVL | Intranet FFVL | **HelloAsso** |
| Paiement events | Framadate + email + virement | — | FFVL compet | HelloAsso + FFVL |
| Mailing | — | — | — | **Framaliste (Sympa)** |
| Chat / coord | WhatsApp + Shoutbox home | Groupe FB | — | **Discord** (central) |
| Cartes | ❌ | ❌ | ❌ | Coord GPS + liens FFVL |
| Galerie interne | ❌ (liens externes) | Slider basique | BWG Gallery | intégrée au blog |
| Multilingue | ❌ | Google Translate + PDF | ❌ | ❌ |
| Espace membres | ❌ | 3 dossiers Drive ouverts | PDF téléchargeables | **Page password WP** |
| RGPD | ❌ visible | ❌ visible | Cookiebot (4 cat.) | WP standard |

### 2.3 Fonctionnalités différenciantes (à piocher)

| Feature | Site source | Intérêt pour notre projet |
|---|---|---|
| **QVOQ** — déclarer qui vole où quand | Augrédelair | Very high — à internaliser |
| **Shoutbox / chat home** | Augrédelair | Medium — Discord/WhatsApp fait pareil |
| **Balises météo propriétaires** | Augrédelair | High si le club opère du hardware |
| **Formations subventionnées** flow wizard | Augrédelair | High — remplacer Framadate |
| **Récits PDF archivés par auteur** | Augrédelair | High — MDX + search |
| **Fiches décos normalisées** (alt, orient, PMR, montée) | Accous | High — composant réutilisable |
| **Navette avec tarifs publics + annuel** | Accous + Appel d'Air | High — ajouter réservation en ligne |
| **ZSM Gypaète / bulles LPO OpenAIR** | Accous + Z'éléphants | High — différenciateur enviro |
| **Géologie du site** | Accous | Medium — si contenu pertinent |
| **3 disciplines** (parapente/delta/snowkite) | Appel d'Air | Selon pratiques du club |
| **Projet associatif structuré** (valeurs/missions) | Appel d'Air | Medium — pour asso loi 1901 |
| **Festival gratuit annuel** | Appel d'Air | High si ambition rassemblement |
| **Actions inclusives** (femmes/handi/seniors) | Appel d'Air + Z'éléphants | High — différenciant |
| **HelloAsso** adhésion | Z'éléphants | **Critical** — à adopter |
| **Discord** central | Z'éléphants | High — communauté moderne |
| **Page CTR/TMA dédiée + flyXC** | Z'éléphants | High si proximité aéroport |
| **Services membres chiffrés** | Z'éléphants | High — transparence |
| **Blog récits signés par membres** | Z'éléphants | High — moteur éditorial |
| **Événements à noms ludiques** | Z'éléphants | Identité/mémorisation |
| **Mascotte + merch annuel** | Z'éléphants | Identité forte |
| **Étude scientifique co-portée** | Z'éléphants | Legit / différenciant |
| **Page membre protégée** | Z'éléphants | High — réservations/docs sensibles |
| **Records affichés par site** | Z'éléphants | Medium — gamification |

---

## 3. Patterns récurrents — ce qu'on doit avoir

### 3.1 Sections quasi-obligatoires (4/4 ou 3/4 sites)
- **Présentation du club** — histoire, asso loi 1901, FFVL n°, bureau, chiffres
- **Sites de vol** — fiches décos/atterros (coord, alt, orientations, accès)
- **Voler en sécurité** — règles locales, dangers spécifiques, radio
- **Espaces aériens / réglementation** — TMA/CTR/R, interdictions (Thémis, aéroports, nidifications)
- **Météo** — agrégateur multi-outils (Meteoblue, Windy, Meteociel, Meteo-parapente, balises)
- **Webcams / balises temps réel**
- **Galerie photos**
- **Calendrier / événements**
- **Actualités / blog**
- **Contact / adhésion**
- **Mentions légales + RGPD**

### 3.2 Intégrations externes citées par tous
- **FFVL** : licence (intranet.ffvl.fr), CFD, QCM, fiches sites, compétitions
- **Meteoblue + Windy + Météociel + Meteo-parapente** (au moins 3 sur 4)
- **Facebook** (tous — souvent canal live principal)
- **Google Drive** pour les documents (Accous)

### 3.3 Ce qu'aucun site ne fait bien
- Tarifs d'adhésion affichés (seul Z'éléphants publie les 20 €)
- Carte interactive des sites (type Mapbox)
- GPX / KML téléchargeables pour les cross documentés
- Réservation en ligne de la navette
- Réservation en ligne du biplace club
- Espace membre complet (Z'éléphants a juste 1 page password)
- Newsletter native (les 4 dépendent de Facebook + Framaliste)
- SEO local structuré (schema.org SportsClub/Event/Place)

---

## 4. Recommandations pour le futur site Next.js

### 4.1 Architecture (App Router)

```
/                              Home — dashboard pilote (météo live + webcam + balise + prochains events)
/club
  /histoire
  /bureau
  /projet-associatif
  /statuts
  /rapports-ag             (docs accessibles selon droits)
/sites
  /[slug]                      Fiche site structurée (réutilisable)
     /decos
     /atterro
  /carte                       Carte interactive Mapbox/MapLibre
  /vol-rando                   Topos + GPX téléchargeables
/voler
  /securite
  /espaces-aeriens             Schémas TMA/CTR si pertinent
  /apprendre                   Écoles partenaires
  /biplace-club                Réservation en ligne
/meteo                          Dashboard (webcams + balises + embed)
/evenements
  /[slug]                      Page événement (inscription)
  /calendrier
/actualites
  /[slug]                      Articles (MDX)
  /recits                      Récits de vols signés
/adhesion                      Tarifs + CTA HelloAsso + licence FFVL
/contact
/galerie                       Albums par année/événement
/membre                        Espace privé (Supabase Auth)
  /reservations                Biplace + navette
  /documents
```

### 4.2 Stack technique proposée

- **Next.js 16 App Router** + Cache Components (PPR)
- **TypeScript** strict
- **Tailwind + shadcn/ui** pour rapidité UI
- **Supabase** (Postgres + Auth + Storage) — conforme à ta règle SSR
  - Auth pour espace membre
  - Tables : members, sites, decos, events, bookings (biplace/navette), news, galleries
  - RLS activé partout (règle globale)
- **MDX / Contentlayer** pour articles & récits
- **HelloAsso** pour paiements (iframe ou lien direct) — éviter de gérer Stripe si possible
- **MapLibre GL JS** (open source) ou Mapbox pour carte des sites
- **Mux** si vidéos lourdes, sinon `<video>` natif
- **Meteoblue / Windy** via iframes (widgets officiels gratuits)
- **OpenWindMap** (windbird) pour balises si le club en a
- **flyXC.app** en lien externe pour live tracking
- **OpenAIR** files ingérés pour zones de quiétude si pertinent

### 4.3 Features à prioriser (MVP → V2)

**MVP (lancement)**
1. Home dashboard (météo + webcam + prochains events + news)
2. Pages club (histoire, bureau, adhésion tarifs clairs)
3. Fiches sites avec carte interactive
4. Sécurité + espaces aériens
5. Adhésion via HelloAsso
6. Contact + mentions légales + RGPD
7. Actualités MDX (3-5 articles initiaux)

**V2**
8. Espace membre (Supabase Auth)
9. Réservation biplace + navette (calendriers temps réel)
10. Galerie (upload + modération)
11. Récits de vols signés
12. Newsletter (Resend + double opt-in)

**V3 (si le club est équipé)**
13. Balises météo propriétaires (ingestion)
14. Live tracking intégré (Skylines API)
15. QVOQ-like : planificateur collectif de vol
16. GPX/KML téléchargeables pour cross

### 4.4 Écueils à éviter (observés)
- **Images placeholders laissées en prod** (Appel d'Air) → `public/` propre ou Next Image avec vraies assets
- **Pages vestiges** (Hello World WP chez Appel d'Air) → bootstrap propre
- **Formulaire "Blank Form #3"** → labels explicites, validation Zod
- **Google Translate pour multilingue** (Accous) → vraie i18n `next-intl` si nécessaire
- **Webcam sur IP locale HTTP** (Accous) → reverse proxy HTTPS obligatoire
- **Blog vide / calendrier vide** (Accous) → si pas de contenu, ne pas exposer la section
- **Deux pages `/webcams/` et `/webcams3/`** (Augrédelair) → une seule page responsive
- **One-pagers longs avec ancres** (Appel d'Air) → pages dédiées (SEO, partage, perf)
- **URL `.html` + ancres CMS** (Accous) → slugs lisibles
- **Liens sortants partout sans embed** (Accous/Appel d'Air) → intégrer les widgets officiels

### 4.5 Points de différenciation possibles
1. **Tarifs publics clairs** (cotisation + licence + navette + stages) dès la home
2. **Carte interactive** des sites avec trajets cross + GPX dl
3. **Dashboard météo unifié** (un seul écran au lieu de 15 liens)
4. **Réservation biplace / navette en ligne** (premier du panel)
5. **Espace membre complet** (docs AG, réservations, règlements, cotisation payée)
6. **Parcours "première visite"** clair (que faire si je viens pour la première fois ?)
7. **SEO local** (schema.org SportsClub / Event / Place)
8. **Accessibilité sérieuse** (RGAA) — aucun des 4 n'est correct
9. **PWA / responsive** vrai (webcams offline-friendly)
10. **Newsletter native** (pas que Facebook + Framaliste)

---

## 5. Questions ouvertes avant de coder

1. **Combien de décos / atterros** le club gère-t-il ? (conditionne la structure sites)
2. **Plusieurs disciplines** (delta, snowkite, speed riding) ou parapente seul ?
3. **Navette** existante → réservation en ligne ?
4. **Biplace club** → flotte + charte ?
5. **Événements récurrents** à formaliser (fête, marche-vol, compét) ?
6. **Espace membre** requis dès le MVP ou V2 ?
7. **Multilingue** utile (zone touristique internationale) ?
8. **Balises/webcams propriétaires** ou uniquement liens ?
9. **HelloAsso** déjà utilisé par le club ou à mettre en place ?
10. **FFVL n°** + nom du club ?

Ces réponses orientent directement le schéma Supabase et la priorisation MVP.
