# Annuaire européen des stages de parapente

Date : 15 août 2026

## Objectif

Faire de `/stages` un annuaire privé de travail qui rassemble le plus grand nombre possible de stages de parapente publiés par des clubs, écoles et fédérations européennes. Les stages peuvent se dérouler en Europe ou ailleurs. La page doit rester sans maillage interne, protégée par mot de passe et exclue des moteurs de recherche jusqu’à son ouverture publique.

Les utilisateurs doivent pouvoir trouver une formation par date, lieu, niveau, pratique, disponibilité et langue d’enseignement. Les stages complets restent visibles. L’information officielle de l’organisateur demeure la source de vérité.

## Périmètre éditorial

Sont inclus :

- formations initiales et de progression ;
- stages thermiques, cross, pilotage et SIV ;
- marche et vol, voyages et coaching encadrés ;
- qualifications et formations fédérales ;
- organisateurs associatifs, professionnels et fédéraux basés en Europe ;
- stages de ces organisateurs qui se déroulent hors d’Europe.

Sont exclus :

- compétitions ;
- baptêmes et vols biplaces commerciaux ;
- sorties libres sans enseignement ;
- événements sans date future vérifiable.

Les langues prises en charge sont le français, l’anglais, l’espagnol, l’italien et l’allemand. La langue désigne la langue réelle de l’encadrement, pas celle du site web. Une langue non publiée est enregistrée comme « À confirmer » et n’est jamais déduite automatiquement du pays.

## Architecture retenue

### Stockage Supabase

Supabase devient la mémoire persistante du catalogue. Les tables internes stockent :

- les sources et leur configuration ;
- les stages normalisés ;
- les lieux géocodés et la précision des coordonnées ;
- les exécutions de synchronisation et erreurs par source.

Toutes les tables activent RLS. Aucun accès n’est accordé aux rôles `anon` ou `authenticated`. Les écritures de collecte et les lectures de la page privée utilisent uniquement un client serveur `service_role`, créé dans un module `server-only`. Les utilitaires Supabase SSR client/serveur restent la convention du projet ; aucun abonnement `onAuthStateChange` n’est utilisé.

Le site conserve un mode de repli local : tant que les variables Supabase ne sont pas configurées, les collecteurs existants continuent d’alimenter la page directement. Cette compatibilité permet de développer et vérifier l’interface sans rendre la page publique ni bloquer le site.

### Collecte horaire

Une route serveur protégée par `CRON_SECRET` lance la synchronisation toutes les heures. Le déclenchement est déclaré pour Vercel Cron. La route :

1. charge le registre des sources actives ;
2. exécute les adaptateurs avec une concurrence limitée ;
3. normalise et déduplique les résultats ;
4. traduit les titres vers le français ;
5. géocode uniquement les nouveaux lieux, puis réutilise le cache ;
6. enregistre les stages et la santé des sources ;
7. marque comme absents les stages non revus lors d’une collecte réussie.

Un stage n’est masqué qu’après deux collectes réussies de sa source sans réapparition. Une source en panne conserve donc ses dernières données, marquées comme anciennes, sans effacer le catalogue.

Les adaptateurs sont isolés : une erreur ne bloque jamais les autres. Les types visés sont JSON/API, ICS, JSON-LD, plateformes de réservation, annuaires fédéraux et pages HTML propres aux organisateurs.

### Couverture des sources

Le registre initial reprend toutes les sources françaises existantes et ajoute les principaux points d’entrée européens :

- annuaires et calendriers fédéraux suisses, allemands et britanniques ;
- fédérations, ligues et écoles identifiées en Belgique, Espagne, Italie, Autriche et autres pays européens ;
- écoles proposant des stages dans les cinq langues prises en charge ;
- calendriers publics exposés par ICS, JSON-LD ou pages de réservation.

La promesse éditoriale est « couverture la plus large possible », jamais « exhaustivité garantie ». L’interface publie le nombre de sources actives, leur dernière vérification et les sources momentanément indisponibles.

## Modèle de données d’un stage

Un stage normalisé contient au minimum :

- identifiant stable par source ;
- titre original et titre français ;
- langue d’enseignement confirmée ou inconnue ;
- organisateur, type de structure et pays d’origine ;
- dates de début et de fin ;
- discipline et niveau normalisés ;
- lieu, pays de destination, latitude, longitude et précision ;
- tarif, devise et note tarifaire ;
- disponibilité, capacité et places restantes si publiées ;
- prérequis et description ;
- URL et type de source ;
- dates de première apparition, dernière apparition et dernière vérification ;
- état actif, ancien ou retiré.

La déduplication utilise d’abord l’identifiant externe, puis une empreinte composée de l’organisateur, du titre normalisé et de la date de début.

## Traduction

Le titre original reste le titre principal afin de ne jamais déformer l’offre. La traduction française apparaît en dessous lorsqu’elle diffère. Une couche de traduction déterministe couvre le vocabulaire courant du parapente ; un fournisseur de traduction externe optionnel peut compléter les titres lorsque sa clé serveur est configurée. Les traductions sont enregistrées et ne sont pas recalculées à chaque visite.

Les niveaux, disciplines, statuts et libellés d’interface sont toujours normalisés en français.

## Géocodage et carte

Les coordonnées publiées par la source sont prioritaires. Sinon, le collecteur cherche un lieu dans le cache, puis utilise un géocodeur avec limitation de débit et identification explicite du site. La précision est enregistrée : site exact, ville, région ou pays.

La carte utilise MapLibre et un fond OpenStreetMap avec attribution visible. Les points proches sont regroupés. Un clic sur un groupe zoome ; un clic sur un lieu affiche les stages qui s’y déroulent, avec dates, langue et disponibilité. Les positions approximatives sont signalées. Les stages sans coordonnées restent accessibles dans les vues Liste et Calendrier et sont comptés sous la carte.

## Interface

Les mêmes filtres pilotent les trois vues :

- recherche libre ;
- langue ;
- pays de destination ;
- niveau ;
- type de stage ;
- disponibilité.

### Vue Liste

La liste éditoriale existante reste la vue par défaut. Elle affiche le titre original, la traduction française, la langue, les dates, le lieu, l’organisateur, le prix, la disponibilité, la source et la fraîcheur.

### Vue Calendrier

Sur ordinateur, le calendrier présente un mois en grille, avec navigation précédente/suivante et stages placés sur chaque jour couvert. Les journées trop chargées affichent les premières entrées puis un compteur. Sur mobile, la grille devient un agenda mensuel par jour afin de conserver des cibles tactiles et des titres lisibles.

### Vue Carte

La carte occupe une grande surface et conserve un panneau de détails accessible au clavier. Sur mobile, le panneau apparaît sous la carte. La carte ne remplace jamais la liste textuelle, ce qui préserve l’accessibilité et l’accès aux stages mal géocodés.

Le changement de vue ne réinitialise pas les filtres. Les trois vues montrent les stages complets et les données anciennes avec un libellé explicite.

## Accès privé et indexation

La page vérifie le mot de passe côté serveur avant de charger ou sérialiser les stages. La session est un cookie signé, `HttpOnly`, `SameSite=Strict`, limité à `/stages` et valable douze heures. Modifier `STAGES_PASSWORD` invalide toutes les sessions.

Aucun lien interne ne pointe vers `/stages`. La page et ses réponses envoient `noindex`, `nofollow`, `noarchive` et `nosnippet`.

## Résilience et sécurité

- délais réseau et concurrence limités ;
- erreurs isolées par source ;
- validation stricte des données avant écriture ;
- aucune clé secrète envoyée au navigateur ;
- route cron protégée et méthode non autorisée refusée ;
- HTML externe traité comme texte, jamais injecté dans l’interface ;
- liens externes ouverts avec `noopener`/`noreferrer` ;
- RLS et révocation des rôles publics sur toutes les tables ;
- audit des advisories Supabase après la migration.

## Vérification

La livraison est validée par :

- tests unitaires des dates, filtres, déduplication, langue et géocodage ;
- tests des erreurs et pannes partielles de source ;
- typecheck et build de production ;
- contrôle de la page verrouillée sans cookie ;
- contrôle d’un mauvais puis d’un bon mot de passe ;
- vérification visuelle Liste, Calendrier et Carte sur ordinateur et mobile ;
- contrôle de l’absence de liens internes et des directives anti-indexation ;
- contrôle RLS et advisories lorsque la migration peut être appliquée au projet Supabase.

## Déploiement

Les variables nécessaires sont :

- `STAGES_PASSWORD` ;
- `CRON_SECRET` ;
- `NEXT_PUBLIC_SUPABASE_URL` ;
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ;
- `SUPABASE_SERVICE_ROLE_KEY` ;
- éventuellement une clé de traduction serveur.

Sans variables Supabase, la page fonctionne en mode local avec les sources directes, mais l’historique persistant et la synchronisation cron ne sont pas activés. Le déploiement et l’application de la migration ne font pas partie d’une modification locale tant qu’aucun projet Supabase cible n’est fourni.
