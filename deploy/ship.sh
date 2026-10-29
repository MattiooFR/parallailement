#!/bin/bash
# ship.sh — déploiement standard des applis Docker, sur les DEUX serveurs de prod (26/10/2026) :
# la prod OVH (alias ssh `prod`) et le Hetzner (alias `hetzner`). Exemplaire de référence :
# services/prod-deploy/ship.sh du dépôt VDL ; chaque appli en garde une copie dans deploy/ship.sh.
# Sources par `git archive`, images construites SUR le serveur (builder buildx dédié au projet),
# conteneurs publiés sur 127.0.0.1 seulement, nginx devant. Toujours mattioo + sudo, jamais root.
#
#   bash deploy/ship.sh            # depuis le Mac, à la racine du dépôt
#   (CI)  ssh <serveur> "deploy <app> <sha>"  ->  ~/bin/ship-gate  ->  deploy/ship.sh --on-server
#
# Paramètres du projet : deploy/ship.conf
#   APP=<nom>  IMAGES=(…)  HEALTH=("port chemin [host]" …)  build_images() { … "$1" = tag ; }
#   SERVER=hetzner          serveur cible (défaut : prod)
#   BUILD_LOCK=<fichier>    verrou de build partagé de la machine (Hetzner : $HOME/.verrou-builds)
# Hooks optionnels de ship.conf :
#   pre_ship <révision>  Mac, avant envoi
#   pre_up <tag>         serveur, après le build, avant la mise en service (migrations : elles
#                        doivent rester compatibles avec l'image précédente, le retour arrière
#                        automatique ne les défait pas)
#   roll_out             remplacement réplique par réplique, à la place de `compose up`
#   post_ship            sonde de bout en bout après nginx ; échec = retour arrière
# Côté serveur, dans ~/apps/$APP :
#   compose.yaml   copié depuis deploy/compose.yaml à chaque déploiement (fixer `name:` pour
#                  reprendre des conteneurs et volumes existants ; chemins de montage ABSOLUS)
#   .env           IMAGE_TAG=<tag> (géré par ce script)
#   *.env          secrets (jamais dans le dépôt, chmod 600, posés à la main une fois)
# Si deploy/nginx/*.conf existe : copié dans /etc/nginx/sites-available/, lien dans sites-enabled,
# `nginx -t` avant reload, restauration de l'ancien fichier si le test échoue.
# Si deploy/systemd/*.{service,timer} existe : copié dans /etc/systemd/system/, daemon-reload,
# timers activés.
# Retour arrière automatique au tag précédent si une sonde de santé ne rend pas 200 ou si post_ship échoue.
set -euo pipefail
umask 077
SERVER="prod"   # remplacé par SERVER= de ship.conf
KEEP=3

die() { echo "ship : ÉCHEC : $*" >&2; exit 1; }
say() { echo "ship : $*"; }
valid_tag() { [[ "${1:-}" =~ ^[0-9a-f]{12}$ ]]; }

local_main() {
  # Depuis le dépôt (cwd), ou via le chemin du script quand il est dans le dépôt.
  git rev-parse --show-toplevel >/dev/null 2>&1 || cd "$(dirname "$0")/.."
  cd "$(git rev-parse --show-toplevel)"
  # shellcheck source=/dev/null
  eval "$(git show "${SHIP_REF:-HEAD}:deploy/ship.conf")"   # (bash 3.2 du Mac : pas de `. <(...)`)
  git update-index -q --refresh >/dev/null 2>&1 || true
  # SHIP_REF : révision à déployer (défaut HEAD). Ex. SHIP_REF=origin/main quand le main local
  # porte des commits d'une autre session pas encore poussés.
  local ref="${SHIP_REF:-HEAD}"
  if [ "$ref" = HEAD ]; then
    if ! git diff --quiet HEAD -- deploy; then die "deploy/ modifié sans commit : committer avant de déployer"; fi
    git diff --quiet HEAD -- || say "attention : modifications non commitées ignorées (seul HEAD est déployé)"
  fi
  local tag; tag="$(git rev-parse --short=12 "$ref^{commit}")"
  valid_tag "$tag" || die "tag inattendu : $tag"
  say "$APP $tag ($(git log -1 --format='%s' "$ref")) -> $SERVER"
  # pre_ship (ship.conf, optionnel) : contrôle de la révision à déployer, avant tout envoi.
  if declare -F pre_ship >/dev/null; then pre_ship "$ref" || die "pre_ship en échec : rien n'a été envoyé"; fi
  # shellcheck disable=SC2029
  # Envoi dans un dossier temporaire propre à cet envoi, puis renommage d'un bloc. Un même tag a
  # le même contenu (git archive) : s'il est déjà complet, on ne le réécrit pas. Avant ça, deux
  # sessions qui déployaient le même commit s'effaçaient les sources en plein build (23/10/2026).
  git archive --format=tar "$ref" | ssh "$SERVER" "set -eu; umask 022; app=\$HOME/apps/$APP; install -d -m 700 \$app \$app/src \$app/logs
    d=\$app/src/$tag; if [ -e \$d/.ship-complete ]; then cat >/dev/null; touch \$d; exit 0; fi
    t=\$(mktemp -d \$app/src/.$tag.XXXXXX); tar -x -C \$t; touch \$t/.ship-complete; chmod 755 \$t
    if [ -e \$d/.ship-complete ]; then rm -rf -- \$t; else rm -rf -- \$d; mv -T \$t \$d; fi; touch \$d" || die "envoi des sources"
  local rc=0
  ssh -n "$SERVER" "bash \$HOME/apps/$APP/src/$tag/deploy/ship.sh --on-server $tag" || rc=$?
  [ "$rc" -eq 255 ] && { echo "ship : connexion perdue, le déploiement continue peut-être : ssh $SERVER 'tail -50 \$(ls -t ~/apps/$APP/logs/*.log | head -1)'" >&2; exit 255; }
  [ "$rc" -eq 0 ] || exit "$rc"
  say "terminé : $tag en ligne"
}

on_server() {
  local tag="$1"; valid_tag "$tag" || die "tag"
  # shellcheck source=/dev/null
  . "$(dirname "$(dirname "$(readlink -f "$0")")")/deploy/ship.conf"
  local app="$HOME/apps/$APP" log
  log="$(mktemp --suffix=.log "$app/logs/$(date +%Y%m%d-%H%M%S)-$tag-XXXXXX")"
  nohup bash "$app/src/$tag/deploy/ship.sh" --detached "$tag" </dev/null >"$log" 2>&1 &
  local pid=$!
  say "journal : $log"
  tail -n +1 -F --pid="$pid" "$log" 2>/dev/null || true
  local rc=0; wait "$pid" || rc=$?
  ls -1t "$app"/logs/*.log 2>/dev/null | tail -n +21 | while IFS= read -r f; do rm -f -- "$f"; done
  exit "$rc"
}

healthy() {   # toutes les sondes HEALTH ("port chemin [host]") en 200, 40 essais
  local i probe port path host code ok
  for i in $(seq 1 40); do
    ok=1
    for probe in "${HEALTH[@]}"; do
      read -r port path host <<<"$probe"
      code="$(curl -s -o /dev/null --max-time 10 -w '%{http_code}' ${host:+-H "Host: $host"} "http://127.0.0.1:$port$path" || true)"
      [ "$code" = 200 ] || { ok=0; break; }
    done
    [ "$ok" = 1 ] && return 0
    sleep 3
  done
  echo "sonde KO : $probe -> $code" >&2
  return 1
}

install_nginx() {   # $1 = dossier source
  # Seuls les fichiers modifiés par CE passage sont restaurés en cas d'échec. Avant le 26/10/2026, la
  # restauration supprimait aussi les vhosts inchangés (pas de sauvegarde = « nouveau ») : le vhost
  # d'ads-hub a été effacé de sites-available et sites-enabled par un nginx -t en échec.
  local f name changed=()
  for f in "$1"/deploy/nginx/*.conf; do
    [ -e "$f" ] || return 0
    name="$(basename "$f" .conf)"
    if ! sudo -n cmp -s "$f" "/etc/nginx/sites-available/$name"; then
      sudo -n rm -f "/tmp/$name.ship-bak"   # créée par sudo cp : un rm sans sudo échoue (sticky bit de /tmp)
      [ -e "/etc/nginx/sites-available/$name" ] && sudo -n cp -p "/etc/nginx/sites-available/$name" "/tmp/$name.ship-bak"
      sudo -n install -m 644 "$f" "/etc/nginx/sites-available/$name"
      sudo -n ln -sfn "/etc/nginx/sites-available/$name" "/etc/nginx/sites-enabled/$name"
      changed+=("$name"); say "nginx : $name mis à jour"
    fi
  done
  [ "${#changed[@]}" -gt 0 ] || return 0
  # Verrou partagé avec les autres déploiements de la machine (plusieurs sessions touchent nginx).
  if sudo -n flock -w 120 /run/lock/nginx-deploy.lock sh -c 'nginx -t && systemctl reload nginx' 2>&1 | tail -n 2; [ "${PIPESTATUS[0]}" -eq 0 ]; then
    say "nginx testé et rechargé"
  else
    for name in "${changed[@]}"; do
      if [ -e "/tmp/$name.ship-bak" ]; then sudo -n mv "/tmp/$name.ship-bak" "/etc/nginx/sites-available/$name"
      else sudo -n rm -f "/etc/nginx/sites-enabled/$name" "/etc/nginx/sites-available/$name"; fi
    done
    die "nginx -t en échec : confs de ce passage restaurées (${changed[*]}), rien rechargé"
  fi
}

install_systemd() {
  local f changed=0
  for f in "$1"/deploy/systemd/*.service "$1"/deploy/systemd/*.timer; do
    [ -e "$f" ] || continue
    if ! cmp -s "$f" "/etc/systemd/system/$(basename "$f")"; then
      sudo -n install -m 644 "$f" /etc/systemd/system/; changed=1; say "systemd : $(basename "$f")"
    fi
  done
  [ "$changed" = 1 ] && sudo -n systemctl daemon-reload
  for f in "$1"/deploy/systemd/*.timer; do
    [ -e "$f" ] || continue
    sudo -n systemctl enable --now "$(basename "$f")" >/dev/null
  done
  return 0
}

detached() {
  local tag="$1"; valid_tag "$tag" || die "tag"
  local src; src="$(dirname "$(dirname "$(readlink -f "$0")")")"
  # shellcheck source=/dev/null
  . "$src/deploy/ship.conf"
  local app="$HOME/apps/$APP"
  # Attendre plutôt qu'échouer : le Mac et la CI (deploy-web.yml) peuvent se croiser. 45 min
  # couvrent un build complet ; au-delà, le ship en cours est sûrement bloqué.
  exec 8>"$app/.ship.lock"
  if ! flock -n 8; then
    say "un autre ship est en cours, attente du verrou"
    flock -w 2700 8 || die "un autre ship est en cours depuis plus de 45 min"
  fi
  cd "$src"; umask 022
  say "$APP $tag, $(date '+%F %T')"
  docker buildx inspect "$APP" >/dev/null 2>&1 || docker buildx create --name "$APP" --driver docker-container >/dev/null
  if [ -n "${BUILD_LOCK:-}" ]; then
    exec 7>>"$BUILD_LOCK"
    flock -n 7 || { say "verrou de build de la machine pris, attente"; flock -w 2700 7 || die "verrou de build pris depuis plus de 45 min"; }
  fi
  build_images "$tag" || die "build en échec : rien n'a été déployé"
  if [ -n "${BUILD_LOCK:-}" ]; then exec 7>&-; fi
  install -m 600 deploy/compose.yaml "$app/compose.yaml"
  cd "$app"
  [ -f .env ] || printf 'IMAGE_TAG=none\n' > .env
  grep -q '^IMAGE_TAG=' .env || printf 'IMAGE_TAG=none\n' >> .env   # .env d'avant ship (rag, 26/10/2026)
  local prev; prev="$(sed -n 's/^IMAGE_TAG=//p' .env)"
  sed "s/^IMAGE_TAG=.*/IMAGE_TAG=$tag/" .env > .env.tmp && mv -f .env.tmp .env
  # pre_up (ship.conf, optionnel) : migrations avec la nouvelle image, avant de la mettre en service.
  if declare -F pre_up >/dev/null && ! pre_up "$tag"; then
    sed "s/^IMAGE_TAG=.*/IMAGE_TAG=$prev/" .env > .env.tmp && mv -f .env.tmp .env
    die "pre_up en échec : rien n'a été redémarré"
  fi
  # roll_out (ship.conf, optionnel) : remplacement réplique par réplique, sans coupure.
  if declare -F roll_out >/dev/null; then roll_out || true; else docker compose up -d --remove-orphans; fi
  rollback() {   # $1 = motif ; remet l'image précédente puis échoue
    docker compose logs --no-color --tail 30 || true
    if [ -n "$prev" ] && [ "$prev" != none ] && [ "$prev" != "$tag" ]; then
      sed "s/^IMAGE_TAG=.*/IMAGE_TAG=$prev/" .env > .env.tmp && mv -f .env.tmp .env
      docker compose up -d --remove-orphans; healthy && say "retour arrière : $prev en ligne"
    fi
    die "$tag : $1"
  }
  healthy || rollback "ne répond pas"
  [ "$prev" != "$tag" ] && printf '%s\n' "$prev" > .previous-image-tag
  install_nginx "$src"
  # post_ship (ship.conf, optionnel) : sonde de bout en bout (Cloudflare -> nginx -> app),
  # possible seulement une fois nginx installé. Échec = retour à l'image précédente.
  if declare -F post_ship >/dev/null; then post_ship || rollback "post_ship en échec"; fi
  install_systemd "$src"
  # Ménage : 3 dossiers source, images de ce projet sauf courante et précédente, cache du builder.
  # (`if`, pas `&&` : un dossier qui n'est pas un tag finissait la boucle en échec, donc le ship aussi.)
  ls -1t "$app/src" | tail -n +$((KEEP + 1)) | while IFS= read -r d; do
    if valid_tag "$d" && [ "$d" != "$tag" ]; then rm -rf -- "${app:?}/src/$d"; fi
  done
  local keep_prev; keep_prev="$(cat .previous-image-tag 2>/dev/null || true)"
  for name in "${IMAGES[@]}"; do
    docker image ls "$APP-$name" --format '{{.Tag}}' | while IFS= read -r t; do
      [ "$t" = "$tag" ] || [ "$t" = "$keep_prev" ] || docker image rm "$APP-$name:$t" >/dev/null 2>&1 || true
    done
  done
  docker buildx prune --builder "$APP" --max-used-space 3gb -f >/dev/null 2>&1 || true
  say "OK : $tag déployé ($(date '+%F %T'))"
}

case "${1:-}" in
  --on-server) shift; on_server "$@" ;;
  --detached) shift; detached "$@" ;;
  *) local_main "$@" ;;
esac
