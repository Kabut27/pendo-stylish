#!/usr/bin/env bash
# deploy/restart-clean.sh
#
# Restart SALAMA KABISA ya app - tumia hii badala ya "pm2 restart pendo-stylish"
# wakati wowote programu inaonyesha tabia za ajabu, kwa mfano:
#   - Faili mpya zilizopakiwa (picha) kwenye public/uploads hazionekani (404)
#     licha ya kuwepo kwenye disk.
#   - Programu ilikuwa na crashes/auto-restarts nyingi mfululizo hivi karibuni
#     (angalia "restarts" kwenye `pm2 show pendo-stylish`) - kwa mfano baada
#     ya kutatua tatizo la database (password/ruhusa) ambalo lilikuwa
#     likisababisha app ivunjike kila ombi.
#
# "pm2 restart" peke yake wakati mwingine haitoshi kusafisha kabisa hali kama
# hizo - kufuta process kabisa (pm2 delete) na kuianzisha upya kabisa kunatatua.
#
# MATUMIZI:
#   chmod +x deploy/restart-clean.sh
#   ./deploy/restart-clean.sh

set -euo pipefail
cd "$(dirname "$0")/.."

echo "=== Kufuta process ya sasa kabisa (kama ipo) ==="
pm2 delete pendo-stylish 2>/dev/null || true

echo "=== Kuhakikisha hakuna kinachobaki kushikilia port 3000 ==="
fuser -k 3000/tcp 2>/dev/null || true
sleep 2

echo "=== Kuanzisha upya kabisa ==="
mkdir -p logs
pm2 start ecosystem.config.js
pm2 save

echo ""
echo "Imekamilika. Thibitisha:"
echo "  pm2 show pendo-stylish   (angalia 'status: online' na 'restarts: 0')"
echo "  pm2 logs pendo-stylish --lines 20 --nostream"
echo "  curl -I http://127.0.0.1:3000/"
