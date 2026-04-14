# Crawl exhaustif — accousdailes.fr

Site : https://www.accousdailes.fr/
Club : **Accous d'Ailes** — Club de parapente en vallée d'Aspe (Pyrénées-Atlantiques, 64)
N° club FFVL : **12343**
Adresse : Association Accous d'Ailes, Maison Larré, 64490 ACCOUS
Contact : 05 59 34 57 89 / 06 27 31 71 74 / Tél navette 07 44 56 17 40
Technologie constatée : site monopage + pages statiques `.html` (CMS type Web Acappella — préfixes `wa_files/`, `wa_images/`, `wa_p_albums/`), JS léger. Webdesign : Laurent Pironneau.

---

## 1. Arborescence complète

### Sitemap officiel (`/sitemap.xml` — 11 URLs)

- `/index.html`
- `/vols-randos-parapente-aspe.html`
- `/voler-site-accous.html`
- `/galerie-photo-parapente.html`
- `/decos-alentours.html`
- `/acces-site-vol-libre.html`
- `/vie-du-club.html`
- `/calendrier.html`
- `/geologie-vallee-aspe.html`
- `/deco-issarbe.html`
- `/blog-vie-du-club.html`

### Menu principal (8 entrées) et sous-menus

```
Accueil  (index)
Club
  ├─ Infos en direct           blog-vie-du-club.html
  ├─ Vie du club               vie-du-club.html#top
  ├─ L'association             vie-du-club.html#ju9vsmkt1dqr787m68
  ├─ Calendrier                calendrier.html
  ├─ Le CA et son bureau       vie-du-club.html#ju9w7vx11dqr7sm58g
  ├─ Les bulletins             Google Drive (dossier)
  ├─ Les CR de réunions        Google Drive (dossier)
  ├─ Les rapports d'AG         Google Drive (dossier)
  ├─ Histoire du club          vie-du-club.html#jv2bcmp51dtd2v0u80
  └─ Clubs voisins             vie-du-club.html#jub3xcaw1dujytb0g0
Voler
  ├─ Site d'Accous             voler-site-accous.html
  ├─ Gypaète barbu             voler-site-accous.html#l1uoul5u...
  ├─ Site d'Issarbe            deco-issarbe.html
  ├─ Navette                   voler-site-accous.html#jubds88z...
  ├─ Apprendre à voler         voler-site-accous.html#jue0544c...
  ├─ Voler en sécurité         voler-site-accous.html#jucgpvtf...
  ├─ Biplace du club           voler-site-accous.html#jue1s4dt...
  ├─ Décos alentours           decos-alentours.html
  ├─ Vols randos               vols-randos-parapente-aspe.html
  ├─ QCM                       https://qcm.ffvl.fr/#/qcm
  └─ Règlementation            wa_files/pyrenees(1).pdf
Météo         (ancre home #jwrxqzb21dsduf5jpc)
Galerie       galerie-photo-parapente.html
Accès
  ├─ Venir à Accous            acces-site-vol-libre.html
  ├─ Venir à Issarbe           acces-site-vol-libre.html#kmnab2pk...
  ├─ Venir à l'Association     wa_p_albums/.../gal_fr.html  (album photos)
  ├─ Activités/découvertes     acces-site-vol-libre.html#jubmepm2...
  └─ Géologie du site          geologie-vallee-aspe.html
Contact       (ancre home #jwrxqzfc1dsduizocg + formulaire)
```

### Multilinguisme
- Passerelle **Google Translate** (pas de vraie traduction) :
  - EN : `https://www-accousdailes-fr.translate.goog/?_x_tr_sl=fr&_x_tr_tl=en...`
  - ES : `https://www-accousdailes-fr.translate.goog/?_x_tr_sl=fr&_x_tr_tl=es...`
- Deux PDF d'infos traduits :
  - `wa_files/infos en anglais(1).pdf`
  - `wa_files/infos en espagnol.pdf`

---

## 2. Détail par page

### 2.1 Home `index.html`
- **Titre** : « Club de parapente Accous d'ailes en vallée d'Aspe (64) »
- **Baseline** : « Club de parapente en vallée d'Aspe »
- **Structure** (hero + slider + 8–10 blocs empilés) :
  1. Hero : logo + baseline + 6 photos en slider.
  2. Barre de raccourcis icônes : Live Accous / Infos en direct / Facebook / Calendrier / Navette / Webcam / Balise / Météo.
  3. **Bloc Météo** (ancre) : deux colonnes Accous / Issarbe avec 15 liens externes (liste au §4).
  4. Trois blocs cartes CTA « Voir » : Aire d'accueil (café, RDV navette, skate-park, aire de jeux) — Accès au déco — Dormir et manger.
  5. Nouveauté : **Carte & topo vol randos** (V. Cheron & B. Viscaro) — lien Google Sites.
  6. Panneau d'info + PDF anglais/espagnol.
  7. Section **Voler à Issarbe** (R. Larrandaburu & H. Farge).
  8. **Contact** : nom, adresse, club 12343, bouton « Prendre la licence FFVL », formulaire avec bouton « Envoyer ».
  9. « Sky, fun and apero avec Accous d'ailes » + lien Facebook LIVE.
- **Pas de tarifs d'adhésion club affichés** — renvoi vers la billeterie FFVL (`intranet.ffvl.fr/ffvl_licenceonline`). Le site ne connaît que le tarif navette (cf. 2.3).

### 2.2 `vie-du-club.html` — Vie du club
Sections avec ancres :
1. **Le blog** — lien vers `blog-vie-du-club.html`.
2. **L'association Accous d'Ailes** — mot du président : « Un grand merci pour l'engagement de chacun au sein de l'Association ! ». CTA « Vous rendre à l'association » + « Nous écrire ».
3. **Le CA** (composition complète) :
   - Présidente : Pauline Toutan
   - Vice-présidents : Fabrice Larroze, Damien Legros, Bernard Viscaro
   - Secrétaire : Jean-Marc Carel — adjointe : Christelle Resling
   - Trésorier : Alexandre Cliquenois — adjoint : Bernard Humeau
   - Membres : Antonio Araujo, Barbara Baudrier, Fanny Carrassoumet, Daniel Delotter, Hervé Farge, Marina Manotte, Jean-Jacques Pelut
   - Documents : « Coordonnées du CA », « Organigramme » (Drive).
4. **Les docs** — 3 dossiers Google Drive : Bulletins / Rapports d'AG / CR de CA.
5. **L'histoire du club** — sous-titre « Le parapente de la préhistoire à aujourd'hui », récit signé **Laurent Soleil (« Masterpitrou »)**, découpé 1984–1987, 1987–1991, 1992–1999, 2000+. Anecdote tarif historique : « 15 francs le vol, voile et navette comprises » (années 1987). Archives photo Google Photos par année 1985 → 2019+. Doc Word « Présidents successifs depuis 1987 ». Sous-section « Le coin des (French) cancans » (gag photos).
6. **Clubs voisins** (noms listés sans tarifs).

### 2.3 `voler-site-accous.html` — LA page la plus dense du site
Sections (beaucoup d'ancres) : Navette, 800/Delta, Intermédiaire, 300, 500, 1000, Atterro FFVL, Balise, Nouveau panneau, Gypaète, Monter à pied, Écoles, Biplace, Sécurité, Partage atterro, Verrou, « Voler mieux voler vieux ».

**Déco principal 800 / Delta** : 1226 m, dénivelé 750 m (+300 m optionnels), accès bitume + piste, 15 min parking→déco, secteurs favorables N–O–NO, défavorables E–SE–S–SO, PMR OK. Idéal : brise sans vent météo.

**Atterro FFVL** : 42.9776 / -0.6012, altitude 459 m, parapente + delta, PMR OK. Deux parcelles en location ; champ nord privé délimité piquets blancs et rubalise.

**Autres décos** : Intermédiaire (repli vent sud), 300 (sentier depuis l'intermédiaire), 500 (pentu, atterro Aoulet, conditions fortes), 1000 (petit rab en rando).

**Montée à pied — 3 itinéraires** : route 2h–2h30 / contournement Poey 2h / route + raccourci 1h15–1h30.

**Navette** (tarifs affichés — seuls tarifs € concrets du site)
| Formule | Prix |
|---|---|
| 1 montée | **5 €** |
| Carnet de 10 montées | **35 €** |
| Carte annuelle (adhérents, date à date) | **120 €** |
- Tél navette : 07 44 56 17 40 (numéro asso).
- Fonctionnement : planning pré-établi + météo, autogestion hors « navet'man ».

**Balise** : sommet du Layens, fréquence FFVL 143,9875 MHz, voix féminine toutes les 20 min, direction/vitesse/température ; aussi consultable via `balisemeteo.com/balise.php?idBalise=138`.

**Gypaète barbu** :
> « Pour que la cohabitation entre la pratique du vol libre et la préservation du Gypaète barbu reste possible, merci de ne pas pénétrer dans les Zones de Sensibilité Majeures lorsqu'elles sont actives ».
- ZSM active = fermé au vol libre en-dessous de 2200 m
- Période : 1er novembre → 15 août
- Maj sur le panneau du chalet.

**Écoles (partenaires)**
- **Ascendance** — Rue de la Poste, 64490 Accous — 05 59 34 52 07 / 06 08 46 69 81 — info@ascendance.fr — ascendance.fr
- **Air Attitude** — Voie communale Arrechau, 64490 Accous — 05 59 34 50 06 / 06 82 45 04 73 — infos@air-attitude.com — air-attitude.com
- Vidéo pédago : « C'est pas sorcier » (Vimeo 20064152).

**Biplace club** : Dudek Orca 4 (2019) + Orca 5 (2022). Conditions : adhérent, charte signée, qualif biplace + RCA, emprunt au local Accous d'Ailes (pas au chalet), priorité aux occasionnels. Chartes téléchargeables :
- `wa_files/charte biplace accousdailes 2020.pdf`
- `wa_files/chartre biplace accousdailes 2019.docx`

**Sécurité** :
- Règle : « REGARDEZ AVANT DE TOURNER ! » — pas de priorité entre PUL.
- Partage atterro : parapentes à droite (Pouey), deltas à gauche (vallée).
- **Verrou de Sarrance** (nord, vers Bedous) : point de blocage météo, risque manches à air horizontales, accumulation nuageuse.
- Article « Voler mieux, voler vieux » — **Paul Pujol, CTS FFVL** — dangers de la proximité sol, vigilance déco/attero, check matériel, état affectif.

### 2.4 `deco-issarbe.html` — Issarbe
- Altitude déco 1410 m, atterro 490 m (dénivelé 920 m).
- Accès : Oloron → 36 km / 45 min, parking balisé (ne pas gêner les locaux), 2 min jusqu'au déco.
- Secteurs favorables N / NE / E ; défavorables W / SW / S / SE. Sud dangereux.
- Site **thermique** (pas pente), thermiques vers 11h, après-midi plus fort, posé toujours calme.
- Activité hiver possible (pistes damées), peu recommandé débutants.
- Attero = propriété agricole sous convention FFVL ; « un petit mot gentil fait toujours plaisir ».
- Balise météo Issarbe : `balisemeteo.com/balise.php?idBalise=183`.
- Webcam Issarbe : `http://air.microscopie.fr/webcam/192.168.1.15.tmp` (adresse IP locale suspecte).

### 2.5 `decos-alentours.html`
Sites listés (textes descriptifs sans tableau structuré) :
- **Issarbe** (aérologie douce, futures commodités bar/resto/dortoir prévues).
- **Plateau d'Ourdinse** + **Le 1000** (mentionnés).
- **La Marère** — déco 2200 m, « thermiques énormes », engagé, accès par Aoulet + rando jusqu'à Col d'Iseye. Bonne condition physique requise.
- **Crête de Souturou** — avant Escot, 900 m route, N soaring. Attention chiens de protection de troupeaux l'été.
- **Le Layens** — point haut 1557/1625 m, +1200 m de gain potentiel. Accès rando depuis Accous ou transport Col de Houratate (1100 m). Conditions faibles matinales idéales ; éviter N fort.

### 2.6 `vols-randos-parapente-aspe.html`
- Baseline : « À la découverte des perles de la vallée ».
- **Pas de liste détaillée** sur la page (volume de routes dilué).
- Ressources pointées :
  - Topo en ligne Google Sites : `sites.google.com/view/vols-rando-pyrenees/accueil` (projet V. Cheron / B. Viscaro)
  - Fichier Excel `spots vol rando pyrenees topo_(1).xlsx`
- Photos, liens webcam/météo/Facebook.

### 2.7 `calendrier.html`
- Titre « Calendrier des manifestations ».
- Contient les sections « Dates à retenir » et « Agenda en ligne » **vides** au moment du crawl — pas d'iframe Google Calendar détecté.
- CTA « Proposez vos événements ! » — 05 59 34 57 89 / 06 27 31 71 74.
- Pas de formulaire d'inscription.

### 2.8 `blog-vie-du-club.html`
- Nom trompeur : ce **n'est pas un vrai blog** (pas d'articles datés, pas d'auteur, pas de pagination, pas de commentaires).
- C'est une page de hub/raccourcis : liens rapides vers Facebook du club, webcam, balise, navette, etc.
- Le vrai flux d'actus est sur **Facebook groupe privé** `facebook.com/groups/1441449832740163/`.

### 2.9 `acces-site-vol-libre.html`
- Venir à Accous : 3 modes (navette / véhicule / rando).
- Aire d'accueil au pied du Poey : café, RDV navette, skate-park, aire de jeux.
- Manger / dormir cités : Poulou pizzas, Le Permayou (resto + hébergement), gîtes L'Arrayade, La Bergerie, appartements communaux, campings, Airbnb.
- Activités vallée : rando, pêche, équitation, VTT, dégustation fromage, écomusée, festival du fromage.
- Rappel gypaète : ne pas survoler la nidification en repro.
- Iframes Google Maps attendues (pas de tarifs).

### 2.10 `geologie-vallee-aspe.html`
- Focus **faille du cirque d'Accous au Col d'Iseye**, collision plaques Europe / Ibérie, visible depuis le trajet Arapoup → Permayou → Iseye → Bergon.
- Promotion de la **Route Géologique Transpyrénéenne** : 200 km, 25 sites bilingues, Bélair → Riglos, association **GéolVal** (FR) + partenaires ES. Lien : `rgtp.geolval.fr/home_f.php`.
- Parc National des Pyrénées : `pyrenees-parcnational.fr/fr`.
- Auteur cité : **Pierre Gruneisen** (secrétaire GéolVal).

### 2.11 `galerie-photo-parapente.html`
- Slider/carousel simple (`‹ › ×`), ~30–35 images en direct.
- Pas d'albums ni catégories ni année, pas de vidéos intégrées.
- Crédits : Jérémy Lacoste, Bernard Viscaro, Bernard Humeau, Laurent Pironneau.
- Galeries externes Google Photos :
  - `https://photos.app.goo.gl/EgMFGTYVWcmbFo8N6`
  - `https://photos.google.com/share/AF1QipOYuOJggvzdqvLd37JfUaQMW1CyBeeE5Vm3SAmkDT7S-oDv7mgc711e3f7xahC-pg?key=…`

---

## 3. Tarifs / adhésion — synthèse

| Élément | Info |
|---|---|
| Cotisation club (Accous d'Ailes) | **Non publiée sur le site** |
| Licence FFVL | Renvoi externe `intranet.ffvl.fr/ffvl_licenceonline#fin` (pas de tarif affiché) |
| Navette — 1 montée | 5 € |
| Navette — Carnet 10 | 35 € |
| Navette — Carte annuelle | 120 € (adhérents, date à date) |
| Biplace club | Gratuit mais conditionné (adhérent + qualif + charte) |
| Tarif historique anecdotique | « 15 F le vol » (1987) |

Zéro info tarifaire structurée dans le header / footer / page dédiée : c'est un **manque important** pour la refonte.

---

## 4. Intégrations météo (15 ressources externes, toutes dans le bloc Météo de la home)

| Outil | URL |
|---|---|
| Balise Piou-Piou Accous (Layens) | balisemeteo.com/balise.php?idBalise=138 |
| Balise Piou-Piou Issarbe | balisemeteo.com/balise.php?idBalise=183 |
| Météo-France Accous | meteofrance.com/previsions-meteo-france/accous/64490 |
| Meteoblue (semaine) | meteoblue.com/fr/meteo/prevision/semaine/accous_france_3038723 |
| Meteoblue (météogramme) | meteoblue.com/fr/meteo/prevision/meteogramfive/accous_france_3038723 |
| Météociel (3h) | meteociel.fr/previsions/23437/accous.htm |
| Météociel haute altitude | meteociel.fr/previsions-haute-altitude/23437/accous.htm |
| Météociel modèles | meteociel.com/modeles/index.php |
| Meteociel emagramme | meteociel.com/modeles/sondage2.php?… |
| Meteoconsult | meteoconsult.fr/meteo-france/ville/previsions-meteo-accous-10575-0.php |
| La chaîne Météo | lachainemeteo.com/meteo-france/ville-797463/previsions-meteo-accous-aujourdhui |
| UK Met Office (isobares) | metoffice.gov.uk/weather/maps-and-charts/surface-pressure/ |
| Windy | windy.com/42.982/-0.570/wind |
| Meteo-parapente | meteo-parapente.com/#/Pyrénées-Atlantiques/Accous – delta-parapente/… |
| Keraunos satellite | keraunos.org/temps-reel/…/image-satellite-visible-france-… |

Aucune intégration embarquée/iframe notable : **tout est lien sortant**, sans aperçu dans la page.

---

## 5. Autres intégrations et fonctionnalités spécifiques

- **Webcams**
  - Accous : `air-attitude.com/lesite/la-webcam-accous/` (hébergée par l'école)
  - Issarbe : `http://air.microscopie.fr/webcam/192.168.1.15.tmp` (URL fragile, en HTTP, IP locale)
- **Balise radio FFVL** : 143,9875 MHz (voix synthétique toutes les 20 min).
- **QCM formation FFVL** : `qcm.ffvl.fr/#/qcm` (lien externe, pas d'intégration).
- **Topo vols randos** : Google Sites externe + Excel téléchargeable.
- **Docs club** : 3 dossiers **Google Drive ouverts** (bulletins, CR, AG) + docs CA (organigramme, coordonnées).
- **Formulaire contact** simple (Envoyer) sur la home.
- **Réseaux sociaux** : Groupe **Facebook** (1441449832740163) = principal canal « live ».
- **Multilingue** : Google Translate + 2 PDF (EN/ES).
- **Section Gypaète barbu** : vrai différenciateur environnemental.
- **Section Géologie** : rare pour un club parapente, liée à un itinéraire pédagogique GéolVal.

---

## 6. Documents téléchargeables

PDF / DOCX / XLSX hébergés sur `wa_files/` :
- `pyrenees(1).pdf` — réglementation
- `infos en anglais(1).pdf` — fiche touriste EN
- `infos en espagnol.pdf` — fiche touriste ES
- `charte biplace accousdailes 2020.pdf`
- `chartre biplace accousdailes 2019.docx`
- `spots vol rando pyrenees topo_(1).xlsx`

Google Drive (dossiers partagés) :
- Bulletins — `drive.google.com/open?id=1EPJyNVAUUPB81R5v5Z9aAEiI6raZg2ez`
- CR de réunions CA — `drive.google.com/open?id=1_3q5XkZG02hhmW2nvIfXQ9vA5BZripMR`
- Rapports d'AG — `drive.google.com/open?id=154KkXniFMBpVdQ4lgTNqzLr-Ng0W_7Jn`

---

## 7. Patterns éditoriaux et ton

- **Ton** : convivial, premier degré, humour local (« Masterpitrou », « French cancans », « navet'man », « Sky, fun and apero »), chaleureux, « tu » implicite. Mélange prose personnelle / fiche technique.
- **Structure type des pages « Voler »** : bloc hero image — sous-sections en ancres longues avec sommaire latéral — photos inline — liens PDF ou externes à la fin.
- **Récurrent** : chaque page embarque la barre de raccourcis (live, news, FB, calendrier, navette, webcam, balise, météo) → pattern « barre d'outils » utile à réimplémenter.
- **Pas de hiérarchie claire H1/H2/H3** (CMS Web Acappella → rendu DIV positionnés), mauvais pour SEO / accessibilité.
- **Pas de fil d'Ariane, pas de plan du site user-facing, pas de recherche interne.**
- **Ancres d'identifiants CMS** (`#wa-anchor-jubds88z1duk1fcutc`) non mémorisables, URL à refondre.

---

## 8. Défauts constatés (à corriger dans la refonte)

1. Aucun **tarif d'adhésion club** visible : obstacle à l'inscription.
2. **Calendrier vide**, pas d'agenda vivant → à remplacer par un vrai Google Calendar embed ou un CMS événements.
3. **Blog sans articles** : rebrander en « Actualités » connecté au flux Facebook ou créer un vrai fil d'actu.
4. **Webcam Issarbe sur IP locale HTTP** (cassée/instable).
5. Tout le « multilingue » repose sur **Google Translate** : qualité médiocre. 2 PDF figés EN/ES.
6. **Tarifs navette non centralisés** dans un tableau ailleurs que dans un paragraphe.
7. **Aucun SEO structuré** : pas de H1 clair, URLs avec `.html`, ancres illisibles.
8. **Pas de section sécurité dédiée** (elle est enfouie dans `voler-site-accous.html`).
9. **Galerie basique**, pas d'albums par année/événement.
10. **Données du CA** non exploitables (pas de vcard, pas de mail public clair).
11. **RGPD** : pas de bandeau cookies vu, pas de mentions légales liées proprement.
12. **Accessibilité** : couleurs/contrastes et typographie figés par le CMS d'époque.

---

## 9. Idées à reprendre / garder

- **Section Gypaète barbu** : fort différenciateur environnemental, à valoriser (carte interactive des ZSM avec dates d'activité).
- **Section Géologie** : originale, pédagogique, à garder et enrichir (parcours géologique + vues 3D).
- **Multi-décos avec fiches techniques** (800/300/500/1000/Intermédiaire) : très utile — à standardiser en fiche structurée (altitude, dénivelé, orientations, PMR, Google Maps, météo associée, photo du déco, vidéo drone).
- **Navette avec tarifs transparents** : à promouvoir en page dédiée avec créneaux + réservation en ligne.
- **Hub météo** : à transformer en **dashboard** (Windy embed + balises FFVL en temps réel + meteoblue meteogram + webcam + balise radio).
- **Sécurité / Verrou de Sarrance / partage atterro** : mérite une page dédiée avec infographies.
- **Histoire du club par « Masterpitrou »** + archives photo par année : contenu éditorial à préserver.
- **Biplace club** : workflow à dématérialiser (réservation en ligne + signature charte numérique).
- **Écoles partenaires** : page partenaires claire.
- **Vol rando** : remplacer le Google Sites + Excel par une vraie carte interactive avec traces GPX.
- **QCM FFVL** : embed dans une page formation + quizz maison.
- **Facebook live** : réintégrer via flux (Meta Graph API ou widget) pour casser la dépendance.

---

## 10. Liens sortants notables (à garder en tête)

- FFVL licence : `intranet.ffvl.fr/ffvl_licenceonline#fin`
- FFVL QCM : `qcm.ffvl.fr/#/qcm`
- Parc National des Pyrénées : `pyrenees-parcnational.fr/fr`
- GéolVal Route Transpyrénéenne : `rgtp.geolval.fr/home_f.php`
- Topo vol rando Pyrénées : `sites.google.com/view/vols-rando-pyrenees/accueil`
- Vimeo C'est pas sorcier : `vimeo.com/20064152`
- Webdesign actuel : `laurentpironneau.com`

---

## 11. Inventaire des pages analysées

| # | URL | Statut |
|---|---|---|
| 1 | `/index.html` | OK |
| 2 | `/vie-du-club.html` | OK |
| 3 | `/voler-site-accous.html` | OK |
| 4 | `/deco-issarbe.html` | OK |
| 5 | `/decos-alentours.html` | OK |
| 6 | `/vols-randos-parapente-aspe.html` | OK |
| 7 | `/calendrier.html` | OK (contenu vide) |
| 8 | `/blog-vie-du-club.html` | OK (hub, pas un blog) |
| 9 | `/acces-site-vol-libre.html` | OK |
| 10 | `/geologie-vallee-aspe.html` | OK |
| 11 | `/galerie-photo-parapente.html` | OK |
| 12 | `/sitemap.xml` | OK (11 URLs) |
| 13 | `wa_files/infos en anglais(1).pdf` | Fetch binaire OK mais contenu non extrait (PDF compressé Pages) |
| 14 | `intranet.ffvl.fr/ffvl_licenceonline` | 403 (authentifié) |

Aucune page du sitemap n'est restée inaccessible. Les 2 échecs (FFVL licence + PDF encodé) sont hors périmètre site.
