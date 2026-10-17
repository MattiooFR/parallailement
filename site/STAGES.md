# Agenda des stages

La route `/stages` agrège les calendriers publics d’écoles, clubs, ligues et fédérations de parapente. Le catalogue couvre les stages en France, les organisateurs européens et leurs voyages hors d’Europe. Il propose une liste, un calendrier et une carte qui partagent les mêmes filtres.

En production, une tâche Vercel appelle `/api/stages/sync` toutes les heures. Elle collecte les sources avec isolation des pannes, normalise les résultats puis les enregistre dans la base. Une source en panne ne supprime pas immédiatement ses stages : ils restent actifs jusqu’à deux collectes réussies consécutives sans résultat. Sans configuration Supabase, la page utilise les flux directs avec un cache Next.js d’une heure.

## Accès réservé aux membres

La page déclare `noindex, nofollow` et envoie `X-Robots-Tag: noindex, nofollow, noarchive, nosnippet`. Seuls les membres validés qui ont le droit « voit les stages » (ou les admins) y accèdent : un visiteur est renvoyé vers `/connexion`, un membre sans ce droit voit une page « Accès réservé ». Les droits se donnent dans `/admin/membres` (voir `MEMBRES.md`).

## Collecte et sources

- calendrier complet Virevolte, y compris les sessions à zéro place ;
- planning Soaring Académie, y compris les mentions « stage complet » ;
- API publique de l’agenda Parapente Valley ;
- pages de réservation BookAndGlide d’Acrobi, Air Alpin, Bauges Parapente, Darentasia, EPVL, Baronnies, EPiC Chambéry, Existenciel, JokAir, Les Grands Espaces, Les Hirond’ailes, Mc Fly, Montlamb’air, Parapente 66, Parapente Family, Pégase & Particule, Pollen et Sur Un Nuage ;
- le catalogue central officiel FSVL/SHV, avec attribution de chaque offre à son école ;
- les calendriers officiels BHPA, SkySchool UK, RISE, Entrenúvols, Prodelta, Manta, Paragliding Academy, plusieurs écoles allemandes et autrichiennes, la FBVL et d’autres organismes européens ;
- quelques fiches vérifiées de clubs, CDVL et ligues lorsque la source n’expose pas de flux structuré.

Les sources françaises sont déclarées dans `lib/stage-sources.ts`. Les sources internationales sont dans `lib/stage-source-registry.ts`. Les parseurs prennent en charge les flux JSON officiels, JSON-LD, ICS, calendriers HTML et formats spécialisés. Chaque source conserve son état et l’heure de son dernier contrôle.

## Langues, titres et géolocalisation

Le filtre propose toujours le français, l’anglais, l’espagnol, l’italien, l’allemand et « À confirmer ». Une langue n’est enregistrée que lorsqu’elle est publiée explicitement par l’organisateur ou définie avec certitude pour une source monolingue. Le titre original est conservé et une traduction française automatique est affichée lorsqu’elle est disponible.

Les coordonnées exactes publiées par une source sont prioritaires. À défaut, une table de lieux connus fournit des coordonnées de ville ou de région. Les lieux trop imprécis restent dans la liste et le calendrier, mais sont comptés à part sur la carte.

## Fiabilité des disponibilités

- `available` et `few` : nombre de places publié par la réservation ;
- `full` et `waitlist` : mention explicite dans le calendrier source ;
- `restricted` : session annoncée comme réservée à un club ou protégée par un code ;
- `unknown` : le calendrier annonce la date mais ne publie pas son remplissage.

Une source indisponible ne bloque jamais les autres. Elle apparaît en orange dans la section « D’où viennent les informations ? » et sera retentée à la prochaine collecte.

Les pages BookAndGlide ne publient généralement que les stages encore réservables. Un stage complet n’est donc affiché que si l’organisateur expose aussi un calendrier public qui le conserve, comme Virevolte ou Soaring.

## Variables de production

- `CRON_SECRET` : clé Bearer de la tâche horaire ;
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` et `SUPABASE_SERVICE_ROLE_KEY` : accès à la base `appdb-parallailement` du Hetzner (`https://db.parallailement.fr`).

La migration `supabase/migrations/202608150001_stages_catalog.sql` active RLS sur toutes les tables, révoque `anon` et `authenticated`, et réserve les écritures et lectures au `service_role` côté serveur.
