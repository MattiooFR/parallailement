# Crawl exhaustif — augredelair.fr

Site actuel du club de parapente **Augrédelair** (arrière-pays niçois, Gréolières / Col de Bleine). Plateforme WordPress classique, style très "brut" (peu de design, beaucoup d'info pilote). Crawl réalisé via sitemap XML + WebFetch.

---

## 1. Arborescence complète

### Pages principales (wp-sitemap-posts-page)
- `/` — Home (Bienvenue)
- `/a-propos/` — À propos du club (+ ancre `#nousrejoindre`)
- `/materiel/` — Matériel du club (biplace associatif)
- `/les-sites-de-vol/` — Les sites de vol
- `/les-vols-de-distance/` — Vols de distance (cross)
- `/livetrack/` — Live tracking
- `/cfd/` — Coupe Fédérale de Distance
- `/se-loger/` — Hébergements
- `/vents/` — Cartes des vents
- `/balises/` — Balises météo
- `/webcams/` — Webcams (version complète)
- `/webcams3/` — Webcams (version compacte "small")
- `/news/` — News / blog
- `/recits/` — Récits de vol (archive PDF par auteur)
- `/photos-videos/` — Photos & vidéos (liens externes)
- `/voler-avec-les-pros-de-la-region/` — Annuaire pros
- `/des-news-de-nos-pros/` — News pros
- `/securite/` — Sécurité (documents PDF)
- `/contact/` — Formulaire de contact
- `/privacy-policy/` — Politique de confidentialité
- `/notam/` — NOTAM (quasi vide)

### Custom post type — Events (The Events Calendar)
- `/event/mieux-exploiter-les-thermiques-avec-antoine/`
- `/event/journees-voler-mieux-avec-cedric/`

### Catégories de blog (11)
`uncategorized`, `competitions`, `bureau`, `news-club`, `communication`, `interview`, `materiel`, `formation`, `sortie-club`, `video`, `soiree-club`

### Articles (blog) — 82 posts de 2020 à 2026
Auteur quasi-unique : **Robert Vercellone** (président). Fréquence ~1 post toutes les 2-6 semaines. Typologie :
- News club / événements internes (barbecues, AG, pliage secours, feux d'artifice)
- Résultats de compétition (CFD, PWCA, Coupe du Monde Gourdon, Superfinale Brésil/Colombie, Montegrappa, Europe)
- Nouvelles matérielles (balises, webcams — "Je m'appelle Reolink", "Nouvelle webcam Le Lachens")
- Formations / journées techniques (pliage secours, SIV, tyrolienne secours Signes)
- Annonces d'événements inter-clubs (Col de Bleine, Kilomètre vertical du Cheiron)
- Interviews ("An interview with Lukkyluke")
- Communiqués FFVL

### Domaines externes référencés
- `qvoq-72cdc.web.app` — QVOQ "Qui Vole Où Quand" (app Firebase tierce, communautaire)
- `skylines.aero` — live tracking principal
- `findmespot.com`, `capturs.com` — trackers individuels
- `meteoblue.com` — météo principale (widgets embarqués)
- `parapente.ffvl.fr` — CFD, licence
- `facebook.com/groups/129836201042548` — groupe communautaire privé
- WhatsApp (groupes : biplace, marche ou vol, compétitions)

---

## 2. Détail page par page

### 2.1 Home `/`
**Rôle** : vitrine + hub rapide d'accès aux outils météo/vol.

**Structure observée** :
1. Header avec logo + menu principal (6 entrées : Bienvenue / Le Club / Voler / Météo / News / Communauté / Contact).
2. Hero : titre "CLUB DE PARAPENTE AUGRÉDELAIR" + photo de montagne + visuel cliquable "Qui vole où quand".
3. Court paragraphe de présentation (arrière-pays niçois, terrain de jeu exceptionnel).
4. Bloc **Prochains événements** (intégration The Events Calendar — 2 events affichés).
5. Bloc **Dernières news** : 4 dernières cartes (image + titre + date).
6. Bloc **4 raccourcis** en tuiles : Météo / Live Track / CFD / QVOQ.
7. Widget **webcam snapshot** + lien vers galerie complète.
8. Widget **Meteoblue** (prévisions 7 jours Gréolières).
9. Widget **"À VOUS LE MICRO"** — chat / shoutbox embarqué (affiche "CHARGEMENT…" — vraisemblablement iframe tiers type Minichat/Shoutbox).
10. Footer : copyright, crédit photos "Benoit Morel - Markus King", lien WhatsApp, ancre "Aller en haut".

**CTA implicites** : "voir QVOQ", accéder météo, accéder live track.

---

### 2.2 À propos `/a-propos/`
**Rôle** : présentation du club + onboarding nouveau membre.

**Sections** :
- **Nos activités** (6 blocs thématiques) :
  - *Vols sur site* (Gréo/Bleyne, RDV 10h à l'atterro)
  - *Vol montagne / rando* (automne-printemps, raquettes, ski)
  - *Le Cross* (15-20 pilotes, organisé via forum + QVOQ)
  - *Le Biplace associatif* (résa via Loïc Diaz)
  - *La Compétition* (régional/national)
  - *Sorties club* (multi-jours, mailing list)
  - Autres : forum, base de récits, pliage secours groupé, soirées info, "Marche ou Vol"
- **Nous rejoindre** (ancre `#nousrejoindre`) : lien vers intranet FFVL, **n° de club 01706**
- **Référents** (liste de 8 emails nommés par spécialité) :
  - Site : Marco, Bob
  - Montagne : Christian Feuvre, Thierry Guillard, Pierre Lauzière, Cédric De Bruyn
  - Biplace : Loïc Diaz
  - Compétition : Benoit Morel
- **Fréquences radio région** : 143.9875 (secours + balises), 154.150 (communications)
- **Partenaires formation** (écoles) : Ailements (Gréo), Voyageurs du Ciel (Gréo), Ascendance 06 (Gourdon), Imagin'air (Colmiane, Roquebrune)

**Pas de montant de cotisation affiché** (passe par licence FFVL intranet).

---

### 2.3 Matériel `/materiel/`
**Rôle** : fiche du biplace associatif.

**Contenu** :
- Liste détaillée d'un kit biplace unique : voile **Supair Sora 2 42m² (2023)**, sellette pilote Advance Bipro 3 L (2020), sellette passager Kortel K-flex (2020), secours Nervure X Dream Fly XTW220 (2020), barreau Advance, casque Lazer blanc, sac BGD.
- Réservation : **WhatsApp** (lien vers le groupe biplace).
- Pas de tarifs, pas de calendrier de résa en ligne, pas de formulaire.
- Publié par "Alain ADMIN" (04/04/2024).

---

### 2.4 Sites de vol `/les-sites-de-vol/`
**Rôle** : fiches techniques de décollages + atterro.

**Fiches (structure répétée)** : nom, lat/long, altitude, vents favorables, vents défavorables, conditions idéales, espace aérien (TMA Nice > 2100m partout ici), pratique (parapente / deltaplane).

**Sites détaillés** :
- **Massif du Cheiron** : Le 300 (990m), Le 600 (1445m), Le 700 (1504m), Le 1000 Jérusalem (1722m) + atterro Gréo Grand Champ (799m).
- **Col de Bleine / Thorenc** (1501m) + atterro Bleine (1134m) — **actuellement indisponible** (retrait autorisation propriétaire).
- Restrictions spécifiques : interdiction de poser près des troupeaux de bisons/vaches à Bleine ; ne pas survoler.

**Média embarqué** : vidéo "Flying Cheiron by Brian Steele", cartes des vents FFVL (graphiques).

---

### 2.5 Vols de distance `/les-vols-de-distance/`
**Rôle** : topo cross pour les locaux.

**3 itinéraires détaillés** (pas de GPX, descriptions textuelles longues + waypoints) :
1. **Gréolières / Coursegoules** — A/R 20 km, débutant-intermédiaire.
2. **Col de Bleine / Saint-André-les-Alpes** — A/R 70 km, intermédiaire, mars-octobre, partir avant 10h30.
3. **Col de Bleine / Morgon (Dormillouse)** — A/R 175 km, avancé, plafond 3000m+, ~7h de vol.

Waypoints texte : Carrière, Cheiron, Jérusalem, Coursegoules, Viériou, Pic-de-l'Aigle, Teillon, Lac de Castillon, Grand Cordeil, Cheval Blanc, Fort de Dormillouse, etc. Attention TMA, venturi de Lattes.

Pas de carte interactive ni de fichiers téléchargeables.

---

### 2.6 CFD `/cfd/`
**Rôle** : redirection vers classement FFVL.

Page minimaliste : titre "COUPE FÉDÉRALE DE DISTANCE / VOLS ET CLASSEMENT" + lien sortant direct vers `parapente.ffvl.fr/node/1576/2020?filtreclub=87`. Image portrait de **Honorin Hamard** (pilote vedette du club). Aucun tableau embarqué.

---

### 2.7 Live track `/livetrack/`
**Rôle** : suivi GPS des pilotes en vol.

- Plateforme principale : **Skylines.aero** (carte avec plusieurs IDs pilotes dans l'URL).
- Trackers individuels : FindMeSpot + Capturs.
- 8 pilotes avec page perso : Ben O, Fred D, JPT, Mélanie, Pasc, Philippe P, Pierrot F, Tom.
- PDF tutoriel **Tutorial-Skylines.pdf** (2017).
- Appel à contribution : "J'aimerais être tracké aussi".

---

### 2.8 Se loger `/se-loger/`
**Rôle** : pointeurs touristiques (pas d'annuaire propre).

5 villages présentés avec lien vers leur site OT/mairie : **Gréolières, Thorenc/Andon, Le Mas, Saint Auban, Gourdon**. Aucun contact direct, aucun prix, aucune carte.

---

### 2.9 Cartes des vents `/vents/`
**Rôle** : dashboard météo.

3 cartes Meteoblue embarquées :
- Vent 850 hPa (~1500m)
- Vent 700 hPa (~3000m)
- Courants convectifs (updraft)

Plus un widget Meteoblue interactif paramétrable sur la zone Nice/Sud (7.42°E, 44.081°N). Fournisseur unique : **Meteoblue**.

---

### 2.10 Balises `/balises/`
**Rôle** : index balises météo.

3 systèmes cités : **WindsMobi, PiouPiou, SpotAir**. Zone : Gréolières & alentours. Page surtout rédactionnelle, pas de widget live embarqué visible (les live data sont accessibles via articles news — "La balise du Cheiron est de retour", "Balise de Bleine", "Le pioupiou Windbird nouveau est arrivé"). Le club semble opérer ses propres balises Pioupiou/Windbird.

---

### 2.11 Webcams `/webcams/`
**Rôle** : dashboard webcams.

**Tableau de 9 webcams** :
| Nom | Lieu | Fréq. | Source |
|---|---|---|---|
| Cheiron vu de Cipières | Cipières | 10 min | Augrédelair |
| Gréolières les neiges vue Sud | Gréolières | 30 min | Augrédelair |
| Greolieres les neiges Huskies | Gréolières | 15 min | Augrédelair (360°) |
| Caussols vue Nord | Caussols | Live | caussols.com |
| Calern vue Ouest | Calern | 60 s | OCA Observatoire |
| Gourdon vue Ouest | Gourdon | Live | wacan.com |
| Roquebrune-Cap-Martin vue Est | Roquebrune-Cap-Martin | Live | nanfutsu.com |
| Mons | Mons | 10 min | Augrédelair |
| Lachens | Lachens | 10 min | lachens.com |

Le club héberge ses propres caméras (Reolink sur Cipières, etc.).

### 2.12 Webcams3 `/webcams3/`
Version compacte ("small") pour mobile — 10 vignettes, même liste avec avertissement "certaines webcams peuvent afficher des images obsolètes".

---

### 2.13 News `/news/`
**Rôle** : blog.

Liste cards (image + titre + date + auteur + catégorie). Pas de filtre par catégorie visible sur la page, pas de moteur de recherche, pas de pagination apparente depuis la landing (mais sitemap montre 82 articles). Sidebar : **D'AUTRES NEWS** + **PROCHAINS ÉVÈNEMENTS** (widget The Events Calendar).

Tonalité éditoriale : courte, affective, très club ("Bravo les champions !", "Une belle fête", "Oyez oyez", "C'est plié !"). Usage libéral de majuscules et ponctuation enthousiaste.

---

### 2.14 Récits `/recits/`
**Rôle** : archives littéraires de vols cross.

Organisation : **par ordre alphabétique des auteurs**. Chaque récit est un **PDF téléchargeable**. Auteurs cités : Luc Armant (19 récits, Himalaya 1060km sur 21j), Victor Berchet (7, 2005-2006), Valérie Donius, Gilles Jacqueline, Pascal Salvi (8), Mathis Ruhl (13, 2012-2015). Contenu historique, très "littérature de vol".

---

### 2.15 Photos / Vidéos `/photos-videos/`
**Rôle** : annuaire de liens externes.

3 contributeurs listés alphabétiquement avec liens externes :
- Benoit Morel → `benoit.morel78.free.fr`
- Philippe Pognonec → `vimeo.com/user16526145`
- Mathis Ruhl → `mathisruhl.com/freegliding.html`

**Aucune galerie sur site** — renvoi extérieur uniquement.

---

### 2.16 Sécurité `/securite/`
**Rôle** : bibliothèque PDF pédagogique.

Documents classés par thème :
- **Pilotage** : techniques sécurité (2009), thermique par Guido (2006), turbulence/incidents (2006)
- **Météo** : tutoriel compte MeteoBlue (2012), stratégie "bon site au bon moment" (2011)
- **Espace aérien** : traversée propre (2017), tuto live tracking Android Skylines (2015), pliage secours (2010)
- **Cross** : Gourdon → Saint-Jeannet (avec fichiers .cup/.wpt/.kml en 2017), thermiques et transitions (2006), Sud Alpes (2006), article Aérial sur cocon gonflable (2006)

Documents anciens (2006-2017). Pas de fréquences radio ici, pas d'URL FFVL directe.

---

### 2.17 Contact `/contact/`
**Rôle** : formulaire.

Formulaire WordPress classique : **Nom (requis), Email (requis), Objet, Message**. Pas de téléphone, pas d'adresse physique, pas de carte. Container map référencé mais sans config. Lien Facebook du groupe. Phrase ton décalé : *"Nous sommes probablement quelque part dans les airs ou ailleurs."*

---

### 2.18 Pros de la région `/voler-avec-les-pros-de-la-region/`
**Rôle** : annuaire pros locaux.

2 fiches seulement :
- **Atraversciel** — Jeff Chapuis (06 62 52 44 82) & Antoine Dubois-Mercé (06 71 88 39 66), `atraversciel.com`
- **Les Voyageurs du Ciel** — Cédric Bouzin, `contact@voyageursduciel.com`, +33 4 83 93 98 25, `voyageursduciel.com`

---

### 2.19 Events (The Events Calendar)
Structure événement standard : titre, dates (start/end), lieu, description, prix, organisateur, inscription.

**Exemple 1 — Exploiter les thermiques (Antoine)** :
- 2 WE (28-29 mars / 18-19 avril), Gréolières
- Coût : 120 € / pilote → **subventionné 70 € par le club = 50 €**
- Max 6 pilotes/session
- Pré-inscription **Framadate** puis mail à `presidence@augredelair.fr`
- Prérequis : BPI préparant BP

**Exemple 2 — Journées "Voler mieux" avec Cédric** :
- Avril-mai 2026, 8h-17h
- Coût : 35 € subventionné → **25 € pilote**
- 6-10 participants
- Pré-inscription **Framadate (beta)** puis mail présidence
- Prérequis : adhérent, mini BPI, matériel perso

---

### 2.20 Articles news (patterns observés sur 82 posts)
- Longueur très courte (souvent 3-5 lignes)
- Ton affectif / familier
- Signés Robert Vercellone (président)
- Titres en CAPITALES fréquents
- Remercient souvent nommément les contributeurs ("Merci à Alain pour la webcam", "Bravo Luc", "Bravo Antoine")
- Typologie : installation matériel (balises/webcams), compétitions/résultats, convivialité (BBQ, AG, pliage), événements tiers relayés

---

## 3. Synthèse — patterns

### Structure éditoriale
- **5 piliers de navigation** : Le Club / Voler / Météo / News / Communauté (+ Contact transverse).
- **Philosophie** : site-outil pour pilotes locaux, pas site vitrine tourisme. Priorité aux raccourcis opérationnels (météo, webcams, live, QVOQ).
- **Homepage** = dashboard (news + events + raccourcis + météo live).
- Pages institutionnelles (À propos, Matériel, Sites) très textuelles, pauvres en mise en forme.
- Corpus éditorial riche mais ancien (récits 2005-2015, docs sécurité 2006-2017).

### Tarifs / adhésion
- Cotisation : **via FFVL intranet uniquement**, club n° 01706. Pas de montant affiché.
- Formations subventionnées : le club prend en charge ~50-70 % du coût instructeur (reste à charge pilote : 25-50 €).
- Matériel biplace : **gratuit**, résa WhatsApp.

### Intégrations tierces
| Service | Usage |
|---|---|
| Meteoblue | Cartes des vents (3 cartes + widget), météo homepage |
| Skylines.aero | Live tracking principal |
| FindMeSpot + Capturs | Trackers individuels |
| FFVL (parapente.ffvl.fr) | CFD + licence |
| QVOQ (`qvoq-72cdc.web.app`) | App Firebase communautaire "Qui vole où quand" |
| Facebook Group | Communauté fermée (groupe privé) |
| WhatsApp | Coordination biplace / compétitions / marche ou vol |
| Framadate | Sondages d'inscription événements |
| The Events Calendar (WP plugin) | Events |
| Webcam feeds tiers | caussols.com, wacan.com, nanfutsu.com, lachens.com, OCA Calern |
| Vimeo / sites perso | Galeries photo/vidéo externes |
| Shoutbox / Minichat (?) | Widget "À vous le micro" homepage |

### CTA / conversions
- "Prendre ma licence en ligne" (intranet FFVL)
- "Je veux être tracké aussi" (PDF tuto)
- Inscriptions Framadate aux formations
- Rejoindre groupes WhatsApp (biplace, events)

### Ton
- Familier, communautaire, entre pilotes.
- Français, avec anglicismes pilote ("Live Track", "cross", "spot").
- Usage des majuscules (headlines criardes).
- Photos d'action + paysages (crédits Morel / King systématiques).

---

## 4. Fonctionnalités techniques spécifiques

- **QVOQ** (Qui Vole Où Quand) — app Firebase externe de coordination : déclarer un projet de vol → rallier d'autres pilotes → covoiturage. Intégration = lien sortant dominant.
- **Live tracking multi-pilotes** (Skylines) avec bootstrap PDF pour rejoindre.
- **Balises météo propriétaires** du club (Pioupiou, Windbird, WindsMobi, SpotAir) — hardware déployé et maintenu par le club (news régulières sur les pannes/retours).
- **Webcams propriétaires** (Reolink entre autres) installées à Cipières, Gréolières, Mons + agrégation de 5 webcams tierces régionales.
- **Réservation biplace associatif** via groupe WhatsApp dédié.
- **Récits de vol en PDF** — archive historique riche, classée alphabétiquement par auteur.
- **Bibliothèque sécurité PDF** — docs pédagogiques + fichiers de waypoints .cup/.wpt/.kml.
- **Formations club subventionnées** avec flow : Framadate → email → paiement.
- **Shoutbox "À vous le micro"** homepage (chat public embarqué).
- **Widget Events Calendar** avec prochain événement sur homepage.
- **Radio frequencies** dédiées affichées dans "À propos".
- **Numéro de club FFVL** (01706) utilisé comme pivot d'inscription.

---

## 5. Particularités / idées à reprendre

### À garder / moderniser
1. **Dashboard pilote au-dessus du marketing** : l'utilisateur principal est un pilote qui vérifie météo/webcams/vent avant de rouler. Garder cette hiérarchie.
2. **Intégration QVOQ** : outil de coordination social unique, à garder — et potentiellement internaliser / remplacer par une feature native Next.js + Supabase (planning collectif de vol).
3. **Fiches de sites structurées** (coordonnées, altitude, vents favorables/défavorables, TMA, restrictions) : format tabulaire réutilisable en composant.
4. **Annuaire pros** très léger — à enrichir en annuaire filtrable (école, tandem, SIV, cross-coaching).
5. **Archive récits PDF** : transformer en CMS propre (MDX) avec recherche par auteur/distance/site/date.
6. **Gestion événements** type formations subventionnées avec wizard d'inscription natif (remplacer Framadate + email + virement par un formulaire unifié + Stripe).
7. **Résa biplace** : passer du WhatsApp à un calendrier de réservation natif (créneaux, pilote tandem habilité, passager).
8. **Balises + webcams** : garder l'aspect "équipement déployé par le club", hub live unifié avec timestamps clairs (évite le problème "images obsolètes").

### Lacunes à corriger
- Pas de carte interactive des sites (à ajouter : Mapbox/MapLibre).
- Pas de GPX / KML downloadable pour les cross décrits.
- Webcams 2 pages (webcams vs webcams3) — unifier en un composant responsive.
- Pas de pagination/filtres sur news.
- Pas de recherche globale.
- Contact : pas d'infos directes, pas de carte, pas de fréquences radio.
- Photos/vidéos : pas de galerie interne — à intégrer (Mux/Cloudinary pour vidéos).
- Sécurité : docs datés 2006-2017 — à rafraîchir.
- Accessibilité / mobile : design WP vieillissant, non responsive optimisé (d'où la page `/webcams3/` ad hoc).
- Cotisation : rendre l'adhésion lisible directement sur le site (prix indicatif FFVL + cotisation club).

### Éléments de marque à préserver
- Nom "Augrédelair" / "Au Gré de l'Air" — jeu de mots.
- Crédits systématiques **Benoit Morel / Markus King** (photographes du club).
- Personnages récurrents : Honorin Hamard (pilote pro emblématique), Luc Armant (recordman Himalaya), Antoine Boisselier (films/docu).
- Ton famille / convivialité (barbecue, AG, pliage → moment convivial systématique).
- Le n° de club FFVL **01706** comme identifiant stable.

### Inventaire quantitatif
- **20 pages** statiques
- **82 articles de blog** (2020-2026)
- **2 events** actifs
- **11 catégories** de blog
- **9 webcams** intégrées
- **3 itinéraires cross** décrits
- **9 décollages/atterros** fichés
- **~50 auteurs** de récits (PDF)
- **4 écoles partenaires** + **2 fiches pros**
- **8 référents** bénévoles listés
