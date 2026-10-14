#!/usr/bin/env bash
set -euo pipefail
umask 077

root=${1:?Deployment root required}
release=${2:?Release id required}
[[ "$root" =~ ^/opt/[a-zA-Z0-9_-]+$ ]] || exit 2
[[ "$release" =~ ^[0-9a-f]{40}-[0-9]+-[0-9]+$ ]] || exit 2
test -d "$root" && test ! -L "$root"
test -f "$root/runtime.env" && test -f "$root/deploy.env"
test -d "$root/data" && test -d "$root/incoming"
docker compose version > /dev/null

# Serialize manual and CI deployments on this host as well.
exec 9>"$root/deploy.lock"
flock -w 300 9
mkdir -p "$root/releases"
release_dir="$root/releases/$release"
test ! -e "$release_dir"
mkdir "$release_dir"
tar -xzf "$root/incoming/$release.tar.gz" -C "$release_dir"
image=$(cat "$release_dir/image.txt")
[[ "$image" == "guia-da-ti:$release" ]] || exit 2
gzip -dc "$release_dir/image.tar.gz" | docker load > /dev/null

previous=''
if test -f "$root/current-release"; then
  previous=$(cat "$root/current-release")
  [[ "$previous" =~ ^[0-9a-f]{40}-[0-9]+-[0-9]+$ ]] || exit 2
fi

activate() {
  local selected=$1
  export GUIA_IMAGE="guia-da-ti:$selected"
  docker compose --project-name guia-da-ti --project-directory "$root" \
    --env-file "$root/deploy.env" -f "$root/releases/$selected/compose.yml" \
    up --detach --wait --wait-timeout 150
}

if ! activate "$release"; then
  echo 'New release failed its health check.' >&2
  if test -n "$previous"; then
    activate "$previous" || { echo 'Rollback failed. Check the Guia container on the VPS.' >&2; exit 1; }
    echo 'Previous release restored.' >&2
  else
    export GUIA_IMAGE="$image"
    docker compose --project-name guia-da-ti --project-directory "$root" \
      --env-file "$root/deploy.env" -f "$release_dir/compose.yml" down
    echo 'First deployment failed. There was no previous release to restore.' >&2
  fi
  exit 1
fi

printf '%s\n' "$release" > "$root/current-release.tmp"
mv "$root/current-release.tmp" "$root/current-release"
# Keep saved images and release metadata for rollback. Remove only this successful upload.
rm -f "$root/incoming/$release.tar.gz" "$release_dir/image.tar.gz"
echo "Release $release is healthy."
