# Comptes membres, calendrier et administration

Conception : `docs/superpowers/specs/2026-10-17-espace-membres-admin-design.md`.

## Parcours

- `/inscription` : n’importe qui crée un compte (nom, email, téléphone, mot de passe). Le compte est **en attente**.
- `/admin/membres` : un admin valide, refuse, suspend, distribue les droits et crée un mot de passe provisoire (pas d’email de réinitialisation tant que l’envoi n’est pas branché).
- `/espace` : statut du compte, calendrier du club (événements publics + réservés aux membres), inscriptions, infos, alertes, mot de passe.
- `/evenements/[id]` : fiche d’un événement. Le public voit le nombre d’inscrits ; les membres voient les noms.
- `/admin/evenements` : créer, copier, modifier, annuler, supprimer ; liste et export CSV des inscrits, ajout manuel d’un membre.
- `/admin/lieux` : lieux habituels (gestionnaires) et types d’événements avec leur couleur (admins).
- `/admin/alertes` : activer chaque alerte, destinataires en plus, délais des rappels, file d’envoi.
- `/calendrier.ics` : abonnement public aux événements publics.

## Droits (`lib/access.ts`)

| Niveau | Peut |
|---|---|
| En attente / refusé / suspendu | rien de privé |
| Membre | voir les événements « membres », s’inscrire, voir qui vient |
| + gère le calendrier | événements, inscrits, lieux |
| + voit les stages | `/stages` |
| Admin | tout, y compris membres, droits, types, alertes |

Un admin ne peut pas se retirer lui-même le rôle admin ni suspendre son propre compte.

## Base

Pile `appdb-parallailement` sur le Hetzner (`~/infra/apps-db/parallailement`, Postgres + PostgREST + GoTrue), exposée en `https://db.parallailement.fr`. RLS active sur toutes les tables, aucun droit pour `anon` / `authenticated` : le site lit et écrit avec la clé `service_role`, après avoir vérifié la session auprès de GoTrue.

Appliquer une migration :

```sh
ssh prod 'docker exec -i appdb-parallailement-db psql -v ON_ERROR_STOP=1 -U supabase_admin -d postgres' < supabase/migrations/<fichier>.sql
ssh prod "docker exec -i appdb-parallailement-db psql -U supabase_admin -d postgres -c \"NOTIFY pgrst, 'reload schema';\""
```

Promouvoir le premier admin (après son inscription sur le site) :

```sh
ssh prod "docker exec -i appdb-parallailement-db psql -U supabase_admin -d postgres -c \"update profiles set status='active', is_admin=true where email='…';\""
```

## Emails

Pas encore d’envoi. GoTrue confirme les comptes automatiquement (validation à la main par un admin ensuite). Chaque alerte est écrite dans `email_outbox` ; elle part par l’API SmartLetter (compatible Resend, `https://api.smartletter.ai`, espace `dugue.mathieu`) dès que `SMARTLETTER_API_KEY` et `EMAIL_FROM` sont définies sur Vercel. Le domaine `parallailement.fr` y est vérifié (DKIM SES + MX/SPF sur `send.` dans Cloudflare). La clé du site est en `sending_access`, limitée à ce domaine. La tâche `/api/notifications/run` (toutes les heures à :15) met les rappels en file et vide la file.
