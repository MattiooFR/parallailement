# Crawl zeleph.com — Les Z'éléphants Volants

Rapport détaillé pour refonte du site du club de parapente de Chambéry.
Source : https://www.zeleph.com/ (sitemap Yoast, crawl avril 2026).

---

## 1. Arborescence complète

```
/
├── /le-club/                                    # Tout savoir et adhérer (page parent)
│   ├── /le-club/reglement/                      # Règlement + membres du comité
│   └── /le-club/services-aux-membres/
│       └── /le-club/services-aux-membres/reserver-un-bi/   # PROTÉGÉ PAR MOT DE PASSE
│
├── /nos-sites/                                  # Sites de vol (parent)
│   ├── /nos-sites/les-zones-aeriennes-ctr-tma/
│   ├── /nos-sites/verel-pragondran/             # Déco principal
│   ├── /nos-sites/le-sire/                      # Sire Nord + Sud
│   ├── /nos-sites/les-atteros-du-club/          # Montagny, Brocolis, St Offenge
│   └── /nos-sites/les-pentes-ecoles/            # Grand Pré, Montagny, Chuteurs, Sire
│
├── /nos-evenements/                             # Hub événements
│   ├── /nos-evenements/trotte-et-vol/
│   │   └── /nos-evenements/trotte-et-vol/reglement/
│   ├── /nos-evenements/galope-et-vol/
│   ├── /nos-evenements/la-full-babar/
│   └── /nos-evenements/la-fete-du-club/
│
├── /competitions/trotte-et-vol/                 # Archives (category-sitemap)
├── /competitions/galope-et-vol/
├── /competitions/full-babar/
│
├── /les-pros-du-coin/                           # Vol libre chambérien
├── /etude-preliminaire-des-facteurs-psychologiques-pour-prevenir-les-accidents-en-parapente/
│
├── /blog/                                       # 8 pages de pagination
│   └── ~90+ articles (voir section 4)
│
├── /contact/
└── /politique-de-confidentialite/
```

Pages indexées (page-sitemap) : **20**.
Articles blog (post-sitemap direct) : **19 visibles dans le sitemap principal** + nombreux articles non listés mais accessibles via pagination `/blog/page/N/` (au moins 8 pages, ~90+ articles historiques).

Dernière modif home : **2026-04-11**. Site actif et maintenu.

---

## 2. Détail par page

### 2.1 Home `/`
- **Titre** : Les Z'éléphants Volants - Club de parapente de Chambéry
- **Hero** : "Save the date" Trotte et Vol 11-12 juillet (édition 2026)
- **Blocs** :
  - Présentation club (3 décos Verel + Sire, 2 atterros, Bauges)
  - CTA "Nouveau dans le coin" → orientation novices
  - Flux news récents (3 dernières : Vêtements 2026, AG 2026, X-Couze)
  - Footer : Rejoindre / Trotte et Vol / Contact / Règlement / Privacy
- **Liens externes** : Discord, Facebook, Instagram, météos (savoie73, MeteoBlue, Meteociel, meteo-parapente.com), webcam Vérel, Framalistes.

### 2.2 `/le-club/` — Tout savoir et adhérer
- Fondé **11 juillet 1989**, affilié FFVL n°**03359** en continu.
- **350 adhérents** (chiffre 2023).
- Activités : vol site, distance, rando-vol, ski-vol, voyages, compétitions.
- Missions : relations communes (Verel-Pragondran, Les Déserts, Sonnaz), PNR du massif des Bauges, LPO.
- Services mis en avant : Discord, Framaliste mailing, prêt biplaces, sessions pliage secours.
- CTA adhésion HelloAsso (URL : `/adhesion-2026-hors-ffvl`).

### 2.3 `/le-club/reglement/`
- **11 articles** structurés en 3 titres (Membres / Bureau / Dispositions générales).
- **Cotisation club : 20 €/an** (membre actif licencié FFVL ou ordinaire).
- **Bureau directeur** :
  - Vice-présidents : Gilbert Benoit, Vincent Mansart
  - Secrétaire : Christian Reffet (adjoint Raphaël Merlin)
  - Trésorier : Paul Bara (adjoint Franck Largeault)
- **Comité directeur** (9-18 membres) : Yanis Achir, Clément Campeotto, Thomas Cazenave, Elise Geoffray, Gérald Delorme, Emmanuel Guillet, Thomas Popoff, Fabien Premorel, Benoit Spoerry, Joël Riss, Mathilde Regnier.
- Référents sécurité : Pascal Monet + Georges Bacque (externe).
- Invités : David Abrial, Jonathan Roux.

### 2.4 `/le-club/services-aux-membres/`
Aides financières et services (pilotes licenciés FFVL) :
- **Formation** : 15 €/jour, 4 jours max/an.
- **Qualif biplace** : 150 € remboursés après examen (2 ans d'ancienneté + implication club requise).
- **Budget compétitions** réparti annuellement sur justificatifs.
- **Prêt flotte biplace** (pilotes qualifiés avec assurance passager).
- **Citiz covoiturage** (tarifs réduits via abonnement club).
- **CERFA frais bénévoles** (licence, assurance passager, entretien aile perso, kilométrage bénévolat → déduction fiscale).

### 2.5 `/le-club/services-aux-membres/reserver-un-bi/`
**Contenu protégé par mot de passe** (réservé aux membres). Seul le mécanisme de protection est visible.

### 2.6 `/nos-sites/`
Hub parent listant les 4 sous-pages. Mentionne les **3 décos + 2 atterros** gérés face ouest des Bauges (Verel-Pragondran, Sonnaz).

### 2.7 `/nos-sites/les-zones-aeriennes-ctr-tma/`
- **CTR** : sol → 1060m, géré par tour Chambéry, vol INTERDIT sauf dérogation "approche très basse altitude" (0-50m/sol) pour atterrissages Montagny et Brocolis.
- **TMA** : saisonnière **mi-décembre → mi-avril**, classe D, plancher 910m ou 300m/sol (le plus haut). Volable <900m dans la vallée ou <300m/sol depuis le Sire.
- **Bulles de quiétude LPO** : fichiers OpenAIR quotidiens, zones protégées rapaces.
- Outils cités : **flyXC.app** (carte interactive), protocole DGAC officiel.

### 2.8 `/nos-sites/verel-pragondran/`
- **Alt 905m**, **W/NW**, coord 45°37'36"N 5°56'47"E
- Sortie parfois intense après-midi, propice XC + acro.
- Pas pour débutants (rouleaux au déco en thermique).
- **Accès voiture** (10 min + marche) ou **pied** (1h10 depuis Montagny, +620m).
- Maîtriser oreilles/360 avant d'y aller.
- Interdit par vent sud, pose plateau interdite.
- **Records affichés** : Semnoz A/R en 1h24 (2020), 138 km (2021), 1er retour Semnoz dès le 12 février.
- Nids rapaces protégés (aigles royaux, faucons pèlerins) — 250m de distance recommandés.

### 2.9 `/nos-sites/le-sire/`
- **Déco Sud** : 45°37'50"N 5°57'58"E, orient. S/SW, tous niveaux, vue 3D.
  - Ressources : windbird-1740 (openwindmap.org), fiche FFVL site 651.
- **Déco Nord** : 1465m, 45°38'03"N 5°57'44"E, orient. NW/N, brise après-midi.
  - Instructions décollage précises (terrain de boules, sapins à franchir).
- Accès motorisé Aix/Revard ou Saint-Jean d'Arvey/La Féclaz, puis **obligation de monter à pied** depuis parking Sire (amendes ONF).
- Accès pied Montagny : +1200m, 2h30-3h.
- Sous TMA Chambéry → vigilance.

### 2.10 `/nos-sites/les-atteros-du-club/`
- **Montagny** (principal) : 275m, 45.609903 N 5.931547 E, orient. N-S, parking auto/vélo + sèche-voile. Dans CTR (tolérance 50m/sol atterrissage). Brises fortes après-midi. Piège vent sud.
- **Brocolis** : 275m, 45°37'03"N 05°55'41"E, fermé **mi-déc → mi-avril** (saison TMA).
- **Saint Offenge** : atterro secours officiel, 45°43'57"N 06°00'46"E, lignes électriques ouest, restrictions printemps (pâtures).

### 2.11 `/nos-sites/les-pentes-ecoles/`
- **Le Grand Pré** (Chambéry centre) : conventionné, brises après-midi.
- **Montagny** : zone gonflage + petites variations ; affaler si avion.
- **Zone Chuteurs** (aéroport) : tolérée, affaler quand parachutistes arrivent.
- **Sire** : au sud Chalet du Sire, l'hiver priorité aux luges/skis.

### 2.12 `/nos-evenements/`
Hub listant les 4 événements phares + activités récurrentes :
- Semaines "premiers thermiques" / "derniers thermiques"
- Semaines rando-vol multi-massifs
- Soirées pliage, débrief, prépa compét

### 2.13 `/nos-evenements/trotte-et-vol/`
- **11e édition 11-12 juillet 2026** dans les Bauges.
- Marche-et-vol, 60 participants max, solo ou biplace.
- **90 €/pilote** + 40 € passager biplace. Annulation avant 1er juillet : retenue 10 €.
- Balises à valider à pied ou en vol, 100 pts/balise.
- Inscription via **FFVL Compétition** : parapente.ffvl.fr/compet/4797.
- 30+ partenaires affichés.

### 2.14 `/nos-evenements/trotte-et-vol/reglement/`
- Barème : 100 pts/balise, 300 pts balise AXX validée à pied, 300 pts balise "but" Aillons avant 19h sam/16h dim (sinon 100 pts, -200 si non atteinte).
- Équipement obligatoire : aile EN926-1, secours homologué, casque EN966, harnais homologué, tél + radio chargés.
- Règle : aile pliée immédiatement après atterro (non pliée = signal détresse).
- -300 pts ou DSQ si espace aérien ou bulle quiétude active violé.
- Prix : **tirage au sort** pour TOUS les participants + souvenirs.

### 2.15 `/nos-evenements/galope-et-vol/`
- Marche-&-vol + précision d'atterrissage, Sire + Verel, **automne** (dernière édition octobre).
- Créée 2019, fait partie du **Challenge MEVPA** (2021, Annecy → Grenoble).
- 3 épreuves : montée chronométrée / vol non chrono / précision.
- Bonus âge + poids du sac → très inclusif.
- Règlement hébergé sur : **challengemarcheetvol.fr/reglement/**.
- Inscription HelloAsso.
- Record 2024 : **88 pilotes**.

### 2.16 `/nos-evenements/la-full-babar/`
- "CID" = Challenge d'Initiation à la Distance.
- Voiles max classe B, priorité aux BP, BPC tolérés.
- Format "baby" compétition distance sur sites Chambéry.
- 2024 : 8-9 juin, 25 pilotes.
- Inscription via FFVL.

### 2.17 `/nos-evenements/la-fete-du-club/`
- **24 août** annuel.
- Décollage Verel-Pragondran → atterro Montagny.
- Baptêmes biplaces tous âges, ambiance bière + repas.
- Réservation conseillée.

### 2.18 `/les-pros-du-coin/`
- **EPIC** (chamberyparapente.fr) : école Chambéry, avantages membres club.
- **Plein Ciel Parapente** (pleincielparapente.fr) : biplaces "Vivez le Ciel en Grand!".
- Autres logos partenaires affichés (non détaillés dans le HTML extrait).

### 2.19 `/etude-preliminaire-des-facteurs-psychologiques-pour-prevenir-les-accidents-en-parapente/`
- **EF2PA**. Recherche scientifique co-portée par le club.
- Équipe : Mathilde Régnier (doctorante, pilote débutante, membre club) + Pr Martine Bouvard (LPNC USMB) + Sophie Bayard (Epsylon Montpellier 3).
- Étude en ligne, anonyme, fév→juin 2025, clôturée.
- PDF "Notice d'information" téléchargeable.

### 2.20 `/contact/`
- Maison des Associations, 67 rue Saint François de Sales, 73000 Chambéry.
- Président Gilbert BENOIT, president@zeleph.com, 07 81 81 95 95.
- Secrétaire : secretaire@zeleph.com.
- Formulaire de contact, Discord, Facebook, Instagram.

### 2.21 `/politique-de-confidentialite/`
Politique WordPress standard. Mentionne **Gravatar**, cookies de commentaires et connexion, EXIF GPS warning, conservation indéfinie commentaires, service anti-spam automatique.

---

## 3. Articles de blog (échantillon détaillé)

Blog actif depuis 2015 (rétro-catalogue complet). Catégories : **Vie du club / Compétitions / Récits de vols et d'aventures / Événements / Trotte et vol / Galope et vol / Full Ba'bar**.

| # | Titre | Date | Catégorie | Contenu clé |
|---|-------|------|-----------|-------------|
| 1 | Les vêtements du club 2026 sont là | 20 fév 2026 | Vie du club | Merchandising "éléphant" |
| 2 | AG du club 2026 | 12 jan 2026 | Vie du club | "Grand-messe biennale" |
| 3 | Un Zéleph à la X-Couze | 10 mar 2025 | Compétitions / Récits | Course marche-&-vol Auvergne, 1er weekend de mars |
| 4 | Pot d'accueil et ouverture saison 2025 | 18 fév 2025 | Vie du club | Stade Mager, accueil nouveaux |
| 5 | Les Z'éléphs à Bisanne 2024 — par Gaël | 28 jan 2025 | Compétitions | Narratif participant |
| 6 | AG du club 2024 | 29 déc 2024 | Vie du club | Élection nouveau bureau |
| 7 | Soirée club | 20 déc 2024 | Vie du club | Rencontre avec Ascendant (fabricant français de sellettes, fly-ascendant.com), équipe Coralie/Hugo/Titouan |
| 8 | Une Galope et Vol d'anthologie | 8 déc 2024 | Compétitions / Galope | **Record 88 pilotes** manche MEVPA |
| 9 | Un biplace de rêve à la Dent de Crolles | 19 août 2024 | Récits | - |
| 10 | Biplaces seniors département | 29 juin 2024 | Événements | Partenariat direction "personnes âgées" Savoie, 8 seniors |
| 11 | La Full Ba'bar — CID | 15 juin 2024 | Compétitions | 25 pilotes |
| 12 | Léo a marché sur la Fly Chablais 2024 | 9 juin 2024 | Compétitions | Léo Béard champion local |
| 13 | Histoire d'un vol-bivouac (pas) dans le Vercors | 12 mai 2024 | Récits | Aventure Daniel/2×Thomas/Vince/Hubert/David ; Aiguebelette → Chartreuse ; bivouac chapelle Saint-Laurent-du-Pont ; Charmant Som en auto-stop |
| 14 | Les 20 topos de marche-et-vol facile autour de Chambéry | 19 oct 2023 | Vie du club | Guide pour nouveaux |
| 15 | Léo encore premier de la Verti'Cham | 13 oct 2023 | Compétitions | 100 pilotes, 5 ascensions, Chamonix, devance Andy Symonds sur 1 manche |
| 16 | La soirée "Acro chez vous" de Carole — tumbling | 21 sep 2023 | Vie du club | Initiation acro |
| 17 | Récit de Léo — Mont Blanc Air Tour | 16 sep 2023 | Compétitions | Marche-&-vol Mont-Blanc |
| 18 | Fête du club 2023 sous un beau soleil | 9 sep 2023 | Événements | ~50 passagers baptisés à Verel |
| 19 | Retour sur la Trotte et Vol 2023 | 27 juil 2023 | Compétitions | 9e édition, 60 participants (3 biplaces), Clément Ferrec RD, Léa Michaud cuisine, prix "meilleurs marcheurs" et "meilleures photos WhatsApp" |
| 20 | La Trotte vue par Thomas De Fleurian | 19 juil 2023 | Récits | Témoignage participant |
| 21 | Pyrénées Air Tour 2023 — les Z'éléphants au pays des ours | 9 juil 2023 | Compétitions | Thomas Popoff raconte 3 jours, 30 km + 3000m D+, 7e/8e sur 33 |
| 22 | Championnats de France — par Maxim | 3 juil 2023 | Compétitions | Insider |
| 23 | Des centaines de biplaces aux mondiaux | 2 juin 2023 | Événements | **396 biplaces**, 42 pilotes bénévoles, 18+ clubs, Chamoux-sur-Gelon |
| 24 | Championnat du monde parapente 2023 | 24 mai 2023 | Événements | Ouverture 20 mai Chamoux |

**Archives compétitions** : pages dédiées `/competitions/trotte-et-vol/`, `/competitions/galope-et-vol/`, `/competitions/full-babar/` qui agrègent les posts par année (2015, 2017, 2019, 2020, 2021, 2022, 2023).

Ton éditorial : chaleureux, premier/deuxième degré, vocabulaire interne ("pachydermes", "Z'éléphs", "grand-messe"), ouvert aux témoignages participants, photo-reportages systématiques.

---

## 4. Synthèse transverse

### 4.1 Structure éditoriale
- **5 axes de navigation** : Club / Sites / Événements / Vol libre chambérien / Blog + Contact.
- Logique claire : pilotes nouveaux → comprendre le club → connaître les sites → participer aux événements → lire le blog pour la culture.
- Site WordPress + Yoast SEO. Sitemap segmenté pages/posts/categories.
- Sous-menus riches (jusqu'à 3 niveaux : Événements > Trotte et Vol > Règlement).

### 4.2 Tarifs et adhésion HelloAsso
- **Cotisation statutaire : 20 €** (club seul, hors licence FFVL). Inscrite au règlement.
- Adhésion externalisée sur **HelloAsso** (page dédiée 2026 hors FFVL, non crawlable directement — 403 sur l'API publique).
- Plusieurs campagnes coexistent probablement (hors FFVL, avec FFVL, donations).
- **Trotte et Vol** : 90 € pilote + 40 € passager biplace (HelloAsso ou FFVL compet).
- **Galope et Vol** : inscription HelloAsso.
- **Biplace 150 €** + **formation 15 €/j** (remboursements internes).

### 4.3 Discord : plateforme centrale
- Invite unique : **discord.gg/6zh2vWqyZA** répétée sur toutes les pages.
- Désigné comme **"primary coordination platform"** (infos, covoit, météo, spots du jour, sorties impromptues).
- Complété par **Framaliste** (framalistes.org/sympa/info/zeleph) pour les annonces mail.
- Stack communautaire : Discord (temps réel) + Framaliste (annonces) + Facebook + Instagram (externe).

### 4.4 Identité visuelle "Z'éléphants"
- Mascotte : **éléphant volant** (logo circulaire).
- Lexique interne cultivé : *Z'éléphs*, *pachydermes*, *"belles aventures"*, *"grand-messe"* (pour l'AG).
- Merchandising assumé (collection vêtements annuelle).
- Ton chaleureux, auto-dérision, festif.

### 4.5 Événements à noms ludiques
- **Trotte et Vol** (juillet, 11e édition, Bauges, compétition amicale marche-vol 60 pax)
- **Galope et Vol** (automne, MEVPA, record 88 pilotes, Sire/Verel)
- **Full Ba'bar** (juin, CID initiation distance, max classe B)
- **Fête du club** (24 août, Verel, baptêmes biplaces)
- Références enfantines (Babar) et allure bon enfant.

### 4.6 Sensibilité environnementale
- Partenariats formels : **PNR Massif des Bauges** + **LPO** (Ligue Protection des Oiseaux).
- "Bulles de quiétude" rapaces (aigle royal, faucon pèlerin) : fichiers **OpenAIR** quotidiens, sanction compét -300 pts/DSQ si franchies.
- Distance 250m nids.
- Relation formalisée avec communes hôtes (Verel-Pragondran, Les Déserts, Sonnaz).
- Interdiction montée voiture au Sire (ONF).

### 4.7 Règles aériennes (aéroport Chambéry)
- Proximité **CTR/TMA** = enjeu structurant. Une page dédiée.
- CTR sol→1060m INTERDIT sauf approche 0-50m Montagny/Brocolis.
- TMA saisonnière mi-déc→mi-avril (saison charters ski).
- Protocole DGAC officiel.
- Brocolis **fermé** hiver.
- flyXC.app pour visualiser en temps réel.

### 4.8 Ton général
Convivial, second degré, inclusif (tous niveaux, seniors, biplaces, femmes avec "participant.e.s"), rigoureux sur la sécurité et l'environnement, fortement communautaire, valorisation des récits personnels de membres (articles signés Thomas, Gaël, Léo, Maxim, etc.).

---

## 5. Fonctionnalités techniques spécifiques

- **WordPress** + Yoast SEO (sitemap).
- **Page protégée par mot de passe** natif WP (`/reserver-un-bi/`) pour contenu membres.
- **Embeds externes** présumés :
  - HelloAsso (widget inscription)
  - YouTube/Vimeo (vidéos compét)
  - Google Maps ou OpenStreetMap (coordonnées GPS sites de vol)
  - Webcam Vérel (iframe)
- **Téléchargement PDF** (classements Trotte, notice EF2PA).
- **Fichiers OpenAIR** dynamiques pour zones protégées.
- **flyXC.app** intégré/référencé pour espaces aériens.
- Pas de compte membre natif visible (HelloAsso gère les adhésions hors du site).
- Commentaires WordPress activés (Gravatar, anti-spam).
- Mailing list Framaliste (Sympa).
- Webcam météo en iframe.

---

## 6. Idées à reprendre pour la refonte

### Structure
1. **Nav 5 axes** Club / Sites / Événements / Écosystème local / Blog + Contact — éprouvée et lisible.
2. **Page "zones aériennes"** dédiée : le différenciateur de ce club (proximité aéroport) mérite une page cartographiée interactive.
3. **Fiches sites structurées** : alt, coord GPS, orientation, accès voiture + pied avec D+/temps, conditions, interdits, records, webcam intégrée. Template reproductible.
4. **Archives d'événements par année** (URL `/competitions/<event>/`) séparées de la page d'inscription courante → SEO + patrimoine club.
5. **Hub "Services aux membres"** avec chiffrage clair (15 €/j, 150 €, etc.).

### Contenu
6. **Blog récits de membres** comme moteur éditorial : signatures personnelles, photo-reportages, ton personnel. Catégories croisées (Récits + Compét).
7. **Mascotte assumée** (Z'éléphant) + vocabulaire interne + merch annuel → sentiment d'appartenance fort.
8. **Événements à nom ludique** (jeu de mots) = mémorisables.
9. **Page "pros du coin"** = ouverture sur l'écosystème local (partenaires école, biplace pro).
10. **Étude scientifique EF2PA** mise en avant = le club comme **acteur de recherche**, pas que consommateur de vol.

### Sécurité / environnement
11. Règles aériennes expliquées pédagogiquement (CTR vs TMA, exception saisonnière).
12. **Bulles de quiétude** intégrées via OpenAIR quotidien → à reprendre absolument.
13. Sanctions en compétition pour violations environnement (-300 pts) = pédagogie par les règles.
14. **Mention explicite PNR + LPO** dans la page de présentation du club.

### Technique
15. **Section membre protégée** (page password ou login) pour infos sensibles (codes, lieux de prêt biplace, etc.).
16. **Discord en CTA global** (pas juste footer) — cœur communautaire.
17. **HelloAsso** pour tous les paiements (adhésion, compét, dons) — externaliser l'admin.
18. **Framaliste** (ou alt) pour newsletter transactionnelle — indépendance vs GAFAM.
19. **Coordonnées GPS** + liens FFVL site + openwindmap (windbird) par déco = référentiel technique riche.
20. **Webcam + multi-météos embarquées** sur la home = utilité quotidienne pour les pilotes.

### Points d'amélioration possibles
- HelloAsso bloque les crawlers (403) → prévoir fallback/backup tarifs sur le site principal pour SEO.
- Auteurs de blog rarement affichés (beaucoup d'articles "Not listed") → valoriser les signatures.
- Page `/les-pros-du-coin/` semble light (2 partenaires détaillés sur plus de logos affichés) → enrichir.
- Accès prêt biplace (page protégée) = friction ; envisager un portail membre unifié.
- Sous-pages "Éditions précédentes" utilisent une taxonomie `/competitions/` différente du parent `/nos-evenements/` → cohérence URL à revoir.
