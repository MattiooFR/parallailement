# Brief projet — site Parallailement

> Placeholders `[TODO]` et `[TEMP]` à compléter au fil du projet.

---

## Identité du club

- **Nom** : Parallailement
- **Adresse** : 32 impasse de la Mairie, 65410 Ilhet (Hautes-Pyrénées, vallée d'Aure)
- **Affiliation** : FFVL n° **28194** (parapente)
- **Bureau** : Mel, Erwan, Pierre — `[TODO rôles précis]`
- **Contact public** : tel 06.50.93.13.97 + `[TODO email]`
- **Position GPS local** : 42.9637°N, 0.3826°E

---

## Périmètre activités

### Parapente — discipline principale
- **1 décollage** (local du club)
- **1 atterrissage** — `[TEMP] conventionnement en cours, à finaliser`
- **Vol à ski** envisagé (sans remontée mécanique) — teaser possible sur le site, pas de page dédiée au MVP

### Pas au MVP
- Deltaplane, speed riding, snowkite
- Navette club (pas prévu pour l'instant)

---

## Biplace

- **Biplaceurs fédéraux** dans le club
- Idée : **journées découverte** ponctuelles
- Pas de flotte club / résa en ligne pour l'instant
- → page "Vol découverte" légère qui renvoie à un formulaire de contact

---

## Événements

- **Fête annuelle du club** — reconduite (format à définir)
- **Compétitions** — ponctuelles, pas de programme annuel fixé pour l'instant
- **Stages "Voler Mieux"** — à la demande des membres, planning ouvert
- **Modèle financier** : inscription payante, reste à charge partagé entre participants

---

## Espace membre (privé)

**À prévoir, MVP ou V2 selon priorités.**

Contenu à définir. Pistes :
- Documents AG / règlements / statuts
- Cotisation payée (statut HelloAsso)
- Réservations biplace / événements
- Annuaire interne (référents site, biplaceurs…)
- Liste de diffusion / forum interne
- `[TODO] valider la liste avec le bureau`

---

## Multilingue

- **FR + EN** requis (V1)
- `[TODO] ES à confirmer` selon fréquentation espagnole (Pyrénées)

---

## Météo / hardware

- **Balise Pioupiou** à installer au décollage — à ingérer dès qu'elle est up (`openwindmap.org` ou API directe)
- **Webcam** : idée évoquée, `[TEMP] pas tranchée`
- **Liens externes** à intégrer en attendant :
  - Meteoblue (prévisions)
  - Windy
  - Meteo-parapente
  - Meteociel
  - `[TODO] liste définitive avec préférences du club`

---

## Adhésion / paiement

- **HelloAsso déjà en place** → intégration directe (widget ou lien)
- `[TODO] URL HelloAsso du club`
- `[TODO] tarifs cotisation club à afficher publiquement`
- Licence FFVL → lien vers intranet FFVL

---

## Contenu & design

- **Logo / identité visuelle** : `[TODO]`
- **Ton éditorial** : convivial / communautaire, à l'image de Z'éléphants (premier inspiré)
- **Mise à jour du contenu** : `[TODO]` — MDX en repo (via git) ou CMS léger (Payload / Sanity) ?

---

## Architecture MVP

### Pages prioritaires
1. **Home** — dashboard léger : présentation + météo (balise Pioupiou dès qu'elle est up) + prochains events + news
2. **Le club** — histoire, bureau, FFVL, valeurs
3. **Voler**
   - Site de vol (fiche déco + atterro avec mention `[TEMP]`)
   - Sécurité / règles locales
   - Espaces aériens
4. **Vol découverte** — biplaceurs fédéraux, formulaire de contact
5. **Événements** — liste + fiche détail
6. **Actualités** — blog MDX
7. **Adhésion** — tarifs + CTA HelloAsso + licence FFVL
8. **Contact** — formulaire + adresse + carte
9. **Mentions légales + RGPD**

### V2
- Espace membre (Supabase Auth)
- Multilingue EN (+ ES ?)
- Galerie photos
- Stages "Voler Mieux" — formulaire de proposition + inscription
- Newsletter

### V3
- Dashboard météo enrichi (si webcam installée)
- Récits de vol signés (blog communautaire)
- Carte interactive (si plusieurs sites apparaissent)

---

## Stack technique

- **Next.js 16 App Router** (Vercel)
- **TypeScript** strict
- **Tailwind + shadcn/ui**
- **Supabase** (Postgres + Auth + Storage) avec RLS
- **MDX** pour contenu éditorial
- **next-intl** pour i18n (FR + EN)
- **HelloAsso** pour paiements (externe)
- **MapLibre** ou carte statique Leaflet pour le site de vol

---

## TODO immédiat

- [ ] Récupérer n° FFVL du club + composition officielle du bureau
- [ ] Confirmer URL HelloAsso
- [ ] Décider CMS (MDX vs Payload/Sanity)
- [ ] Logo / charte graphique
- [ ] Bootstrap Next.js + Supabase + déploiement Vercel
