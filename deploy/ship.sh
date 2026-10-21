#!/bin/bash
# Déploiement sur le serveur de prod OVH (alias ssh `prod`, Tailscale, mattioo + sudo, jamais root).
# Même patron qu'ads-hub / saas-gmb : sources par `git archive HEAD`, images construites SUR le
# serveur (builder buildx dédié au projet), conteneurs publiés sur 127.0.0.1 seulement, nginx devant.
#
#   bash deploy/ship.sh            # depuis le Mac, à la racine du dépôt
#
# Paramètres du projet : deploy/ship.conf (APP, HEALTH, build_images, IMAGES).
# Côté serveur, dans ~/apps/$APP :
#   compose.yaml   copié depuis deploy/compose.yaml à chaque déploiement
#   .env           IMAGE_TAG=<tag> (géré par ce script)
#   *.env          secrets (jamais dans le dépôt, chmod 600, posés à la main une fois)
# Si deploy/nginx/*.conf existe : copié dans /etc/nginx/sites-available/, lien dans sites-enabled,
# `nginx -t` avant reload, restauration de l'ancien fichier si le test échoue.
# Si deploy/systemd/*.{service,timer} existe : copié dans /etc/systemd/system/, daemon-reload,
# timers activés.
# Retour arrière automatique au tag précédent si une sonde de santé ne rend pas 200.
set -euo pipefail
umask 077
SERVER="prod"
KEEP=3

die() { echo "ship : ÉCHEC : $*" >&2; exit 1; }
say() { echo "ship : $*"; }
valid_tag() { [[ "${1:-}" =~ ^[0-9a-f]{12}$ ]]; }

local_main() {
  cd "$(dirname "$0")/.."
  cd "$(git rev-parse --show-toplevel)"
  # shellcheck source=/dev/null
  . deploy/ship.conf
  git update-index -q --refresh >/dev/null 2>&1 || true
  if ! git diff --quiet HEAD -- deploy; then die "deploy/ modifié sans commit : committer avant de déployer"; fi
  git diff --quiet HEAD -- || say "attention : modifications non commitées ignorées (seul HEAD est déployé)"
  local tag; tag="$(git rev-parse --short=12 HEAD)"
  valid_tag "$tag" || die "tag inattendu : $tag"
  say "$APP $tag ($(git log -1 --format='%s')) -> $SERVER"
  # shellcheck disable=SC2029
  git archive --format=tar HEAD | ssh "$SERVER" "set -eu; umask 022; app=\$HOME/apps/$APP; install -d -m 700 \$app \$app/src \$app/logs
    rm -rf -- \$app/src/$tag; mkdir -p \$app/src/$tag; tar -x -C \$app/src/$tag; touch \$app/src/$tag" || die "envoi des sources"
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
  local f name changed=0
  for f in "$1"/deploy/nginx/*.conf; do
    [ -e "$f" ] || return 0
    name="$(basename "$f" .conf)"
    if ! sudo -n cmp -s "$f" "/etc/nginx/sites-available/$name"; then
      [ -e "/etc/nginx/sites-available/$name" ] && sudo -n cp -p "/etc/nginx/sites-available/$name" "/tmp/$name.ship-bak"
      sudo -n install -m 644 "$f" "/etc/nginx/sites-available/$name"
      sudo -n ln -sfn "/etc/nginx/sites-available/$name" "/etc/nginx/sites-enabled/$name"
      changed=1; say "nginx : $name mis à jour"
    fi
  done
  [ "$changed" = 1 ] || return 0
  # Verrou partagé avec les autres déploiements de la machine (plusieurs sessions touchent nginx).
  if sudo -n flock -w 120 /run/lock/nginx-deploy.lock sh -c 'nginx -t && systemctl reload nginx' 2>&1 | tail -n 2; [ "${PIPESTATUS[0]}" -eq 0 ]; then
    say "nginx testé et rechargé"
  else
    for f in "$1"/deploy/nginx/*.conf; do
      name="$(basename "$f" .conf)"
      if [ -e "/tmp/$name.ship-bak" ]; then sudo -n mv "/tmp/$name.ship-bak" "/etc/nginx/sites-available/$name"
      else sudo -n rm -f "/etc/nginx/sites-enabled/$name" "/etc/nginx/sites-available/$name"; fi
    done
    die "nginx -t en échec : anciennes confs restaurées, rien rechargé"
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
  exec 8>"$app/.ship.lock"; flock -n 8 || die "un autre ship est en cours"
  cd "$src"; umask 022
  say "$APP $tag, $(date '+%F %T')"
  docker buildx inspect "$APP" >/dev/null 2>&1 || docker buildx create --name "$APP" --driver docker-container >/dev/null
  build_images "$tag" || die "build en échec : rien n'a été déployé"
  install -m 600 deploy/compose.yaml "$app/compose.yaml"
  cd "$app"
  [ -f .env ] || printf 'IMAGE_TAG=none\n' > .env
  local prev; prev="$(sed -n 's/^IMAGE_TAG=//p' .env)"
  sed "s/^IMAGE_TAG=.*/IMAGE_TAG=$tag/" .env > .env.tmp && mv -f .env.tmp .env
  docker compose up -d --remove-orphans
  if ! healthy; then
    docker compose logs --no-color --tail 30 || true
    if [ -n "$prev" ] && [ "$prev" != none ] && [ "$prev" != "$tag" ]; then
      sed "s/^IMAGE_TAG=.*/IMAGE_TAG=$prev/" .env > .env.tmp && mv -f .env.tmp .env
      docker compose up -d --remove-orphans; healthy && say "retour arrière : $prev en ligne"
    fi
    die "$tag ne répond pas"
  fi
  [ "$prev" != "$tag" ] && printf '%s\n' "$prev" > .previous-image-tag
  install_nginx "$src"
  install_systemd "$src"
  # Ménage : 3 dossiers source, images de ce projet sauf courante et précédente, cache du builder.
  ls -1t "$app/src" | tail -n +$((KEEP + 1)) | while IFS= read -r d; do valid_tag "$d" && [ "$d" != "$tag" ] && rm -rf -- "${app:?}/src/$d"; done
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
