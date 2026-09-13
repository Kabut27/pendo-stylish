#!/usr/bin/env bash
# deploy/deploy-all.sh
# ============================================================================
# DEPLOY MOJA KAMILI ya Pendo Stylish kwenye VPS mpya (Ubuntu 24.04).
# Inaunganisha hatua zote (setup-vps.sh + .env + build + DB + PM2 + Nginx +
# HTTPS + backup cron) kwenye amri MOJA.
#
# MATUMIZI (kama root au mtumiaji mwenye sudo, kwenye VPS mpya):
#
#   # Kama huna code bado kwenye VPS - itaikwambia clone kutoka git:
#   sudo ./deploy-all.sh yourdomain.co.tz you@email.com \
#        --repo=https://github.com/wewe/pendo-stylish.git
#
#   # Kama tayari umenakili code kwenye /var/www/pendo-stylish (git clone/scp):
#   cd /var/www/pendo-stylish
#   sudo ./deploy/deploy-all.sh yourdomain.co.tz you@email.com
#
# Chaguo za ziada (si lazima):
#   --dir=/njia/nyingine       (default: /var/www/pendo-stylish)
#   --seed                     (weka data ya mfano baada ya schema)
#   --skip-ssh-harden          (usizime password login ya SSH)
#
# Soma script hii kabla ya kuiendesha - inabadilisha mipangilio ya server.
# ============================================================================

set -euo pipefail

# ---------- 0. Soma hoja (arguments) ----------
DOMAIN="${1:-}"
EMAIL="${2:-}"
shift 2 || true

PROJECT_DIR="/var/www/pendo-stylish"
GIT_REPO=""
DO_SEED="no"
SKIP_SSH_HARDEN="no"

for arg in "$@"; do
  case "$arg" in
    --repo=*) GIT_REPO="${arg#--repo=}" ;;
    --dir=*) PROJECT_DIR="${arg#--dir=}" ;;
    --seed) DO_SEED="yes" ;;
    --skip-ssh-harden) SKIP_SSH_HARDEN="yes" ;;
    *) echo "Hoja isiyotambulika: $arg"; exit 1 ;;
  esac
done

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
  echo "Matumizi: sudo ./deploy-all.sh yourdomain.co.tz you@email.com [--repo=URL] [--dir=/path] [--seed]"
  exit 1
fi

if [ "$(id -u)" -ne 0 ]; then
  echo "Endesha script hii na sudo/root: sudo ./deploy-all.sh ..."
  exit 1
fi

DB_NAME="pendo_stylish"
DB_USER="pendo_user"
DB_PASSWORD="$(openssl rand -base64 24)"
SESSION_SECRET="$(openssl rand -base64 48)"

echo "=============================================================="
echo " PENDO STYLISH — DEPLOY KAMILI"
echo " Domain     : ${DOMAIN}"
echo " Project dir: ${PROJECT_DIR}"
echo "=============================================================="

# ---------- 1. OS + vifurushi vya msingi ----------
echo "=== [1/11] Kusasisha OS ==="
apt update && apt upgrade -y
apt install -y curl ca-certificates gnupg

echo "=== [2/11] Kufunga Node.js 20 LTS + PM2 ==="
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs git
npm install -g pm2

echo "=== [3/11] Kufunga PostgreSQL, Nginx, Certbot, Fail2ban, build tools ==="
apt install -y postgresql postgresql-contrib nginx certbot python3-certbot-nginx fail2ban ufw build-essential
systemctl enable fail2ban --now

echo "=== [4/11] Firewall (ufw): bandari 22, 80, 443 tu ==="
ufw allow OpenSSH
ufw allow 80
ufw allow 443
ufw --force enable

# ---------- 2. Code ya mradi ----------
echo "=== [5/11] Kuweka code ya mradi ==="
if [ -n "$GIT_REPO" ]; then
  if [ -d "$PROJECT_DIR/.git" ]; then
    echo "   Repo ipo tayari - kufanya git pull..."
    git -C "$PROJECT_DIR" pull
  else
    mkdir -p "$(dirname "$PROJECT_DIR")"
    git clone "$GIT_REPO" "$PROJECT_DIR"
  fi
elif [ -d "$PROJECT_DIR" ]; then
  echo "   Code tayari ipo kwenye ${PROJECT_DIR} - naendelea nayo."
else
  echo "HITILAFU: ${PROJECT_DIR} haipo na hukupa --repo=URL."
  echo "Nakili code huko kwanza (git clone / scp) kisha rudia, au tumia --repo=."
  exit 1
fi

cd "$PROJECT_DIR"

# ---------- 3. Database ----------
echo "=== [6/11] Kutengeneza database na mtumiaji (idempotent) ==="
sudo -u postgres psql -c "CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';" 2>/dev/null || \
  sudo -u postgres psql -c "ALTER USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';"
sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};" 2>/dev/null || true

echo "   Kuweka muundo wa database (db/schema.sql)..."
sudo -u postgres psql -d "${DB_NAME}" -f db/schema.sql

if [ "$DO_SEED" = "yes" ]; then
  echo "   Kuweka data ya mfano (seed)..."
fi

# ---------- 4. .env ----------
echo "=== [7/11] Kutengeneza .env ==="
cp -n .env.example .env || true
sed -i "s#^DATABASE_URL=.*#DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@127.0.0.1:5432/${DB_NAME}#" .env
sed -i "s#^SESSION_SECRET=.*#SESSION_SECRET=${SESSION_SECRET}#" .env
sed -i "s#^SITE_URL=.*#SITE_URL=https://${DOMAIN}#" .env
sed -i "s#^NODE_ENV=.*#NODE_ENV=production#" .env

if [ "$DO_SEED" = "yes" ]; then
  node --env-file=.env scripts/seed.js
fi

# ---------- 5. Install + build ----------
echo "=== [8/11] npm install && npm run build ==="
npm install
npm run build

# ---------- 6. PM2 ----------
echo "=== [9/11] Kuwasha programu na PM2 ==="
mkdir -p logs
pm2 delete pendo-stylish 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u "${SUDO_USER:-root}" --hp "$(eval echo ~${SUDO_USER:-root})" | tail -n 1 | bash || true

echo "   Kuangalia kama programu imewaka kikamilifu (sekunde 5)..."
sleep 5
if curl -fsS -o /dev/null "http://127.0.0.1:3000"; then
  echo "   ✅ Programu inajibu kwenye port 3000."
else
  echo ""
  echo "   ⚠️  ONYO: Programu HAIJIBU kwenye port 3000 bado. Nginx itaonyesha"
  echo "      '502 Bad Gateway' mpaka hili litatuliwe. Logs za hivi karibuni:"
  echo "   -----------------------------------------------------------"
  pm2 logs pendo-stylish --lines 30 --nostream || true
  echo "   -----------------------------------------------------------"
  echo "   Baada ya kutatua chanzo (angalia error hapo juu), endesha:"
  echo "     pm2 restart pendo-stylish && pm2 logs pendo-stylish"
  echo ""
fi

# ---------- 7. Nginx + HTTPS ----------
echo "=== [10/11] Kuweka Nginx na HTTPS (Certbot) ==="
cp deploy/nginx.conf /etc/nginx/sites-available/pendostylish
sed -i "s/pendostylish.co.tz/${DOMAIN}/g" /etc/nginx/sites-available/pendostylish
ln -sf /etc/nginx/sites-available/pendostylish /etc/nginx/sites-enabled/pendostylish
nginx -t && systemctl reload nginx

echo "   Kuangalia kama ${DOMAIN} tayari inaelekeza kwenye VPS hii (DNS)..."
SERVER_IP="$(curl -fsS https://api.ipify.org || true)"
DOMAIN_IP="$(getent ahostsv4 "${DOMAIN}" 2>/dev/null | awk '{print $1}' | head -n1 || true)"
HTTPS_OK="no"
if [ -n "$DOMAIN_IP" ] && [ -n "$SERVER_IP" ] && [ "$DOMAIN_IP" = "$SERVER_IP" ]; then
  if certbot --nginx -d "${DOMAIN}" -m "${EMAIL}" --agree-tos --non-interactive --redirect; then
    HTTPS_OK="yes"
  else
    echo "   ONYO: Certbot imeshindwa hata DNS ikionekana sahihi - jaribu tena baadaye kwa mkono:
   certbot --nginx -d ${DOMAIN} -m ${EMAIL} --agree-tos"
  fi
else
  echo "   ⏭️  Kuruka HTTPS kwa sasa: DNS ya ${DOMAIN} (${DOMAIN_IP:-hakuna A record}) haielekezi bado"
  echo "      kwenye IP ya VPS hii (${SERVER_IP:-haijulikani}). Tovuti itafanya kazi kwa HTTP kwa sasa."
  echo "      Ukishasahihisha A record kwenye DNS yako, rudia kwa mkono:"
  echo "        certbot --nginx -d ${DOMAIN} -m ${EMAIL} --agree-tos"
fi

# ---------- 8. Backup cron ----------
echo "=== [11/11] Kuweka backup ya kila siku (cron, saa 2 usiku) ==="
chmod +x deploy/backup-cron.sh
( crontab -l 2>/dev/null | grep -v "backup-cron.sh" ; \
  echo "0 2 * * * DB_PASSWORD=${DB_PASSWORD} ${PROJECT_DIR}/deploy/backup-cron.sh >> /var/log/pendo-backup.log 2>&1" \
) | crontab -

# ---------- 9. SSH hardening (hiari) ----------
if [ "$SKIP_SSH_HARDEN" = "no" ]; then
  echo ""
  read -p "Umeshaweka SSH key na unaweza kuingia nayo? Zima password login? (ndio/hapana): " CONFIRM
  if [ "$CONFIRM" = "ndio" ]; then
    sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
    systemctl restart ssh
    echo "   Password login ya SSH imezimwa."
  fi
fi

SITE_PROTOCOL="http"
if [ "$HTTPS_OK" = "yes" ]; then
  SITE_PROTOCOL="https"
fi

echo ""
echo "=============================================================="
echo " DEPLOY IMEKAMILIKA ✅"
echo " Tovuti      : ${SITE_PROTOCOL}://${DOMAIN}"
echo " Dashibodi   : ${SITE_PROTOCOL}://${DOMAIN}/login"
echo ""
echo " Database password (hifadhi mahali salama): ${DB_PASSWORD}"
echo " (Tayari imewekwa ndani ya .env na ndani ya cron ya backup)"
echo ""
echo " Amri muhimu za baadaye:"
echo "   pm2 status / pm2 logs pendo-stylish / pm2 restart pendo-stylish"
echo "   Kusasisha code: git pull && npm install && npm run build && ./deploy/restart-clean.sh"
echo "   (tumia restart-clean.sh badala ya 'pm2 restart' peke yake - ni salama zaidi)"
echo "=============================================================="
