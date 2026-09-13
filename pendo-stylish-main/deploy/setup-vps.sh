#!/usr/bin/env bash
# deploy/setup-vps.sh
# Andaa VPS mpya (Ubuntu 24.04) kwa ajili ya Pendo Stylish: usalama wa msingi,
# Nginx, Certbot, PostgreSQL, Node.js, PM2, fail2ban, firewall.
#
# MATUMIZI (kama root au mtumiaji mwenye sudo):
#   chmod +x deploy/setup-vps.sh
#   ./deploy/setup-vps.sh yourdomain.co.tz your@email.com
#
# Soma kila hatua kabla ya kuendesha - script hii inabadilisha mipangilio ya server.

set -euo pipefail

DOMAIN="${1:-}"
EMAIL="${2:-}"

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
  echo "Matumizi: ./setup-vps.sh yourdomain.co.tz your@email.com"
  exit 1
fi

echo "=== 1/8: Kusasisha OS ==="
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl ca-certificates gnupg

echo "=== 2/8: Kufunga Node.js 20 LTS ==="
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2

echo "=== 3/8: Kufunga PostgreSQL ==="
sudo apt install -y postgresql postgresql-contrib build-essential

echo "=== 4/8: Kufunga Nginx na Certbot ==="
sudo apt install -y nginx certbot python3-certbot-nginx

echo "=== 5/8: Kufunga Fail2ban ==="
sudo apt install -y fail2ban
sudo systemctl enable fail2ban --now

echo "=== 6/8: Firewall (ufw) - fungua bandari 22, 80, 443 tu ==="
sudo ufw allow OpenSSH
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

echo "=== 7/8: Usalama wa SSH - zima login ya password ==="
echo "   (Hakikisha umeshaweka SSH key yako KABLA ya kuendelea, la sivyo utajifungia nje!)"
read -p "Umeshaweka SSH key na unaweza kuingia nayo? (ndio/hapana): " CONFIRM
if [ "$CONFIRM" = "ndio" ]; then
  sudo sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
  sudo systemctl restart ssh
  echo "   Password login ya SSH imezimwa."
else
  echo "   Nimeruka hatua hii - fanya baadaye kwa mkono kwenye /etc/ssh/sshd_config"
fi

echo "=== 8/8: Kutengeneza database na mtumiaji ==="
DB_PASSWORD=$(openssl rand -base64 24)
sudo -u postgres psql -c "CREATE USER pendo_user WITH PASSWORD '${DB_PASSWORD}';" || true
sudo -u postgres psql -c "CREATE DATABASE pendo_stylish OWNER pendo_user;" || true

echo ""
echo "=================================================================="
echo "VPS imeandaliwa. Fuata hatua zilizobaki kwa mkono:"
echo ""
echo "1. Nakili code ya mradi kwenye server (git clone au scp)."
echo "2. cd ndani ya folder ya mradi, kisha:"
echo "     cp .env.example .env"
echo "     nano .env"
echo "   Jaza:"
echo "     DATABASE_URL=postgresql://pendo_user:${DB_PASSWORD}@127.0.0.1:5432/pendo_stylish"
echo "     SESSION_SECRET=\$(openssl rand -base64 48)"
echo "3. Weka muundo wa database:"
echo "     sudo -u postgres psql -d pendo_stylish -f db/schema.sql"
echo "4. (Hiari) Weka data ya mfano:"
echo "     node --env-file=.env scripts/seed.js"
echo "5. npm install && npm run build"
echo "6. mkdir -p logs && pm2 start ecosystem.config.js && pm2 save && pm2 startup"
echo "7. Weka Nginx:"
echo "     sudo cp deploy/nginx.conf /etc/nginx/sites-available/pendostylish"
echo "     sudo sed -i 's/pendostylish.co.tz/${DOMAIN}/g' /etc/nginx/sites-available/pendostylish"
echo "     sudo ln -s /etc/nginx/sites-available/pendostylish /etc/nginx/sites-enabled/"
echo "     sudo nginx -t && sudo systemctl reload nginx"
echo "8. Pata HTTPS bila malipo:"
echo "     sudo certbot --nginx -d ${DOMAIN} -m ${EMAIL} --agree-tos"
echo "9. Weka backup ya kila siku (cron):"
echo "     crontab -e"
echo "     ongeza mstari: 0 2 * * * /njia/kamili/deploy/backup-cron.sh >> /var/log/pendo-backup.log 2>&1"
echo "=================================================================="
echo ""
echo "DATABASE PASSWORD (hifadhi mahali salama): ${DB_PASSWORD}"
