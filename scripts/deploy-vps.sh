#!/usr/bin/env bash
# Deploy V CHARGE pe VPS (site static pe v-charge.volta.md)
# Folosire: cd /var/www/app/v-charge && chmod +x scripts/deploy-vps.sh && ./scripts/deploy-vps.sh

set -eo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

echo "v-charge — deploy VPS"
echo "====================="

if [ ! -d .git ]; then
  echo "Eroare: nu e un repo git în $PROJECT_ROOT"
  exit 1
fi

echo ">>> git pull"
git pull origin main || git pull origin master

echo ">>> gata — https://v-charge.volta.md/"
