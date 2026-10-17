# Comptes, espace membres et administration du calendrier — conception

Date : 17/10/2026 · statut : validé oralement (« vas-y commence »)

## Pourquoi

Le calendrier de la page d'accueil lit le Google Agenda partagé du groupe. Des
membres y mettent des rendez-vous perso, qui finissent sur le site public. Le
mot de passe partagé de `/stages` ne dit pas qui a accès.

On veut que le club gère tout depuis le site : des comptes, une validation à la
main par les admins, des droits par personne, des événements créés sur le site
avec inscriptions et rappels.

## Objectifs

- Inscription libre (nom, email, mot de passe). Le compte reste **en attente**
  jusqu'à validation par un admin. Petit club : tout se valide à la main.
- Niveaux : visiteur, en attente / refusé / suspendu, membre, membre avec droits
  à cocher (**gère le calendrier**, **voit les stages**), **admin** (tout).
- Événements créés sur le site : type (liste gérée dans l'admin, avec couleur),
  titre, description, début, fin facultative, journée entière ou heure, lieu
  (lieux enregistrés réutilisables ou adresse libre), visibilité **public** ou
  **membres**, places max et date limite d'inscription facultatives, brouillon /
  publié / annulé.
- Inscriptions : un membre validé clique « J'y vais » / se désinscrit. Les
  membres voient qui vient ; le public ne voit que le nombre de participants.
  Les gestionnaires voient et exportent la liste (CSV).
- Alertes email configurables dans l'admin (activer, destinataires, délais de
  rappel) ; chaque membre choisit les siennes dans son espace.
  - nouvelle inscription à valider → admins
  - compte validé / refusé → la personne
  - nouvel événement publié → membres abonnés
  - rappel avant l'événement → inscrits (délais réglables, par défaut la veille)
  - événement modifié ou annulé → inscrits
- `/stages` réservé aux membres qui ont le droit « voit les stages » (ou admin).
  Le mot de passe partagé disparaît.
- Le Google Agenda est débranché.

## Hors périmètre (choix du builder)

Contenu de l'espace membres au-delà du compte et des alertes (documents,
annuaire, cotisations HelloAsso), édition des textes et photos de l'accueil,
paiement des événements, import automatique de l'ancien Google Agenda.

## Contraintes

- Données sur le Hetzner (`prod`) : nouvelle pile `appdb-parallailement` dans
  `~/infra/apps-db/` sur le modèle SmartLetter (Postgres supabase, PostgREST,
  GoTrue), exposée en `https://db.parallailement.fr` derrière Cloudflare,
  ajoutée aux sauvegardes. Le catalogue des stages y vit aussi.
- Pas encore d'envoi d'email. GoTrue tourne en confirmation automatique
  (pas de lien à cliquer) — sans risque puisque chaque compte est validé à la
  main. Les emails sont mis en file (`email_outbox`) et envoyés dès qu'une clé
  Resend (`RESEND_API_KEY`) est configurée ; l'admin voit la file.
- Sans email, « mot de passe oublié » ne peut pas marcher : un admin peut
  générer un mot de passe provisoire pour un membre.
- Le site reste sur Vercel (Next 16). Tâche planifiée horaire pour les rappels
  et l'envoi de la file.
- Règles RLS du poste : RLS activée partout, `anon` et `authenticated` révoqués,
  tout passe par le serveur Next avec la clé `service_role` après vérification
  de la session GoTrue. Les autorisations sont décidées dans un seul module
  testé (`lib/access.ts`).
- Mobile d'abord : créer un événement doit tenir en un écran sur téléphone.

## Décisions du builder

- Premier admin : promu à la main en SQL après sa propre inscription (pas
  d'email « magique » en variable d'environnement : sans confirmation d'email,
  n'importe qui pourrait s'inscrire avec cette adresse).
- Un gestionnaire du calendrier gère événements et lieux ; types d'événements,
  membres et alertes restent aux admins.
- Un admin ne peut pas se retirer lui-même le rôle admin (évite de verrouiller
  le club dehors).
- Heures saisies et affichées en Europe/Paris, stockées en `timestamptz`.
- Fichier ICS public des événements publics (`/calendrier.ics`) pour que ceux
  qui le veulent s'abonnent depuis leur agenda.
