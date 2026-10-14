#!/usr/bin/env bash
# Run in a disposable Linux container as root. Docker operations are mocked.
set -euo pipefail
root=/opt/guia-deploy-test
test ! -e "$root"
mkdir -p "$root/incoming" "$root/data" /tmp/guia-mocks
touch "$root/runtime.env" "$root/deploy.env"
export DEPLOY_TEST_LOG=/tmp/guia-deploy-test.log
export PATH="/tmp/guia-mocks:$PATH"
cat > /tmp/guia-mocks/docker <<'MOCK'
#!/usr/bin/env bash
set -euo pipefail
if [[ "$1" == load ]]; then cat > /dev/null; exit 0; fi
if [[ "$1" != compose ]]; then exit 2; fi
if [[ "${2:-}" == version ]]; then exit 0; fi
printf '%s %s\n' "$GUIA_IMAGE" "$*" >> "$DEPLOY_TEST_LOG"
[[ "$*" != *' up '* || "$GUIA_IMAGE" != "${FAIL_IMAGE:-}" ]]
MOCK
chmod +x /tmp/guia-mocks/docker
cat > /tmp/guia-mocks/curl <<'MOCK'
#!/usr/bin/env bash
set -euo pipefail
printf '%s public-health\n' "$GUIA_IMAGE" >> "$DEPLOY_TEST_LOG"
[[ "$GUIA_IMAGE" != "${FAIL_PUBLIC_IMAGE:-}" ]]
MOCK
chmod +x /tmp/guia-mocks/curl

pack() {
  local release=$1 directory
  directory=$(mktemp -d)
  printf 'services: {}\n' > "$directory/compose.yml"
  printf 'guia-da-ti:%s\n' "$release" > "$directory/image.txt"
  printf 'mock-image' | gzip > "$directory/image.tar.gz"
  tar -czf "$root/incoming/$release.tar.gz" -C "$directory" .
}
first=0000000000000000000000000000000000000001-1-1
second=0000000000000000000000000000000000000002-2-1
third=0000000000000000000000000000000000000003-3-1
fourth=0000000000000000000000000000000000000004-4-1

pack "$first"
export FAIL_IMAGE="guia-da-ti:$first"
if bash /repo/deploy/deploy.sh "$root" "$first"; then exit 1; fi
test ! -f "$root/current-release"
grep -q ' down$' "$DEPLOY_TEST_LOG"

pack "$second"
unset FAIL_IMAGE
bash /repo/deploy/deploy.sh "$root" "$second"
test "$(cat "$root/current-release")" = "$second"
test ! -f "$root/incoming/$second.tar.gz"
test ! -f "$root/releases/$second/image.tar.gz"
printf 'persistent-data' > "$root/data/preserve.txt"

pack "$third"
export FAIL_IMAGE="guia-da-ti:$third"
if bash /repo/deploy/deploy.sh "$root" "$third"; then exit 1; fi
test "$(cat "$root/current-release")" = "$second"
test "$(cat "$root/data/preserve.txt")" = persistent-data
tail -1 "$DEPLOY_TEST_LOG" | grep -q "guia-da-ti:$second"
pack "$fourth"
unset FAIL_IMAGE
export FAIL_PUBLIC_IMAGE="guia-da-ti:$fourth"
if bash /repo/deploy/deploy.sh "$root" "$fourth" https://guiadati.com; then exit 1; fi
test "$(cat "$root/current-release")" = "$second"
test "$(cat "$root/data/preserve.txt")" = persistent-data
tail -1 "$DEPLOY_TEST_LOG" | grep -q "guia-da-ti:$second public-health"
if bash /repo/deploy/deploy.sh /opt/../invalid "$third"; then exit 1; fi
if bash /repo/deploy/deploy.sh "$root" '../invalid'; then exit 1; fi
if bash /repo/deploy/deploy.sh "$root" "$third" 'https://guiadati.com;echo invalid'; then exit 1; fi
echo 'Deployment checks passed: first failure, success, container/public health rollback, persistent data and input validation.'
