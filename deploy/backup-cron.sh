#!/usr/bin/env bash
# deploy/backup-cron.sh
# Backup ya KIOTOMATIKO ya kila siku (tofauti na kitufe cha "Pakua Backup Kamili"
# kwenye Dashibodi - hii ni ya dharura, inayoendeshwa na cron bila mtu kugusa).
#
# MAHITAJI KABLA YA KUTUMIA:
#   1. Weka rclone na uunganishe na akaunti yako ya Backblaze B2 / Google Drive:
#        curl https://rclone.org/install.sh | sudo bash
#        rclone config    # fuata maelekezo, ita-remote yako "offsite"
#   2. Badilisha thamani za env hapa chini kulingana na mfumo wako.
#
# MATUMIZI (kwenye crontab, mfano saa 2 usiku kila siku):
#   0 2 * * * /njia/kamili/deploy/backup-cron.sh >> /var/log/pendo-backup.log 2>&1

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="${PROJECT_DIR}/backups"
DATE=$(date +%Y-%m-%d_%H%M)
DB_NAME="pendo_stylish"
DB_USER="pendo_user"
RCLONE_REMOTE="offsite:pendo-stylish-backups" # badilisha kulingana na "rclone config" yako
KEEP_LOCAL_DAYS=7

mkdir -p "$BACKUP_DIR"

echo "[$(date)] Kuanza backup..."

# 1. Dump ya database
PGPASSWORD="${DB_PASSWORD:-}" pg_dump -U "$DB_USER" -h 127.0.0.1 -d "$DB_NAME" \
  -F c -f "${BACKUP_DIR}/db_${DATE}.dump"

# 2. Compress folder ya picha zilizopakiwa
tar -czf "${BACKUP_DIR}/uploads_${DATE}.tar.gz" -C "${PROJECT_DIR}/public" uploads

# 3. Tuma nje ya VPS (Backblaze B2 / Google Drive kupitia rclone)
if command -v rclone >/dev/null 2>&1; then
  rclone copy "${BACKUP_DIR}/db_${DATE}.dump" "$RCLONE_REMOTE" --quiet
  rclone copy "${BACKUP_DIR}/uploads_${DATE}.tar.gz" "$RCLONE_REMOTE" --quiet
  echo "[$(date)] Backup imetumwa offsite kwenye ${RCLONE_REMOTE}"
else
  echo "[$(date)] ONYO: rclone haijawekwa - backup imebaki VPS pekee (haipendekezwi kwa muda mrefu)."
fi

# 4. Safisha backup za zamani (za VPS) zaidi ya siku KEEP_LOCAL_DAYS
find "$BACKUP_DIR" -type f -mtime "+${KEEP_LOCAL_DAYS}" -delete

echo "[$(date)] Backup imekamilika: db_${DATE}.dump, uploads_${DATE}.tar.gz"
