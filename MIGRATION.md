# Kuhamisha Mfumo Kwenda Server Nyingine (Migration Guide)

Mfumo huu umejengwa kimakusudi bila "vendor lock-in" — teknolojia zote ni za
kawaida (PostgreSQL + Node.js/Next.js), hivyo unaweza kuuhamisha kwenda VPS
nyingine yoyote (Hetzner, DigitalOcean, Contabo, n.k) wakati wowote.

## Njia 1: Kutumia Kitufe cha "Pakua Backup Kamili" (Rahisi Zaidi)

1. Dashibodi ya Mmiliki → Backup → bofya "Pakua Backup Kamili".
2. Utapata faili ZIP yenye: `schema.sql`, `data/*.json` (database nzima), na
   `uploads/` (picha zote), pamoja na `README.txt` yenye maelekezo ndani yake.
3. Kwenye server mpya:
   ```bash
   git clone <repo-yako> pendo-stylish   # au pakia code kwa scp
   cd pendo-stylish
   npm install
   cp .env.example .env
   nano .env   # jaza DATABASE_URL mpya na SESSION_SECRET mpya
   ```
4. Tengeneza database tupu na uweke muundo:
   ```bash
   sudo -u postgres createdb pendo_stylish
   sudo -u postgres psql -d pendo_stylish -f schema.sql   # kutoka kwenye ZIP uliyopakua
   ```
5. Rudisha data:
   ```bash
   unzip pendo-stylish-backup-*.zip -d backup-folder
   node --env-file=.env scripts/restore.js backup-folder
   ```
6. Nakili picha:
   ```bash
   cp -r backup-folder/uploads/* public/uploads/
   ```
7. Jenga na endesha:
   ```bash
   npm run build
   mkdir -p logs
   pm2 start ecosystem.config.js
   pm2 save
   ```
8. Weka Nginx + Certbot kama ilivyoelezwa kwenye README.md kuu, ukielekeza domain
   yako mpya kwenye IP ya server mpya.

## Njia 2: Kutumia Backup ya Kiotomatiki (cron)

Kama unatumia `deploy/backup-cron.sh`, una nakala za `db_*.dump` (pg_dump format
"custom") na `uploads_*.tar.gz` kwenye eneo lako la offsite (Backblaze B2/Google
Drive). Kurudisha:

```bash
pg_restore -U pendo_user -d pendo_stylish db_2026-09-13_0200.dump
tar -xzf uploads_2026-09-13_0200.tar.gz -C public/
```

## Orodha ya Kuhakiki Baada ya Kuhamisha (Checklist)

- [ ] Website ya umma inaonekana vizuri (bidhaa, huduma, picha zinaonekana)
- [ ] Unaweza kuingia kama Mmiliki na kama Mfanyakazi
- [ ] Mipangilio (WhatsApp, ramani, social links) ni sahihi — Dashibodi → Mipangilio
- [ ] HTTPS inafanya kazi (padlock kijani kwenye browser)
- [ ] Umejaribu kupakia picha mpya ya bidhaa - inafanya kazi
- [ ] Umeweka backup ya kiotomatiki mpya kwenye server hii (crontab + rclone)
- [ ] Umefuta/kuzima ufikiaji wa server ya zamani baada ya kuhakikisha kila kitu kipo salama

## Marekebisho: Ruhusa za Database kwa `pendo_user` (permission denied)

**Tatizo:** Baada ya kuweka DATABASE_URL sahihi, app ilikuwa ikipata hitilafu ya aina
`permission denied for table settings/products/gallery` hata kama password ilikuwa sahihi.

**Sababu:** `db/schema.sql` ilikuwa ikiendeshwa kama role `postgres` (superuser), hivyo
majedwali yote yaliundwa yakiwa "owned" na `postgres`, si `pendo_user` - hata kama
database yenyewe ilikuwa na `OWNER pendo_user`. Kuwa owner wa database hakumpi mtu
ruhusa kiotomatiki kwenye majedwali ya role nyingine.

**Marekebisho:** `db/schema.sql` sasa ina block ya `GRANT` mwishoni inayompa `pendo_user`
ruhusa kamili kwenye majedwali na sequences zote, moja kwa moja, bila kujali role
gani iliendesha faili hilo.

**Kama tayari una database iliyokwisha kuundwa** (kabla ya marekebisho haya), endesha
amri hizi mara moja ili kurekebisha bila kuunda upya database:

```bash
sudo -u postgres psql -d pendo_stylish -c "GRANT USAGE ON SCHEMA public TO pendo_user;"
sudo -u postgres psql -d pendo_stylish -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO pendo_user;"
sudo -u postgres psql -d pendo_stylish -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO pendo_user;"
```

## Marekebisho: Faili mpya za public/uploads hazionekani (404) baada ya matatizo ya awali ya DB

**Tatizo:** Hata baada ya kurekebisha password/ruhusa za database, na hata kama picha
zinaandikwa kikamilifu kwenye `public/uploads/...` (zinaonekana kwa `ls -la`), Next.js
ilikuwa ikirudisha `404 Not Found` kwa faili HIZO HIZO - hata kwa jaribio la faili
rahisi la maandishi lisilohusiana na sharp/picha kabisa.

**Sababu:** Process ya app ilikuwa imeshaanguka na kuanzishwa upya na PM2 mara nyingi
mfululizo (angalia `restarts` kwenye `pm2 show pendo-stylish`) wakati wa kipindi cha
matatizo ya database (permission denied kwa kila ombi). Baada ya mfululizo huo wa
crashes/auto-restarts, process iliishia kwenye hali isiyo ya kawaida ambapo
iliendelea kujibu maombi mengine (login, API za database) lakini haikuweza tena
kutoa (serve) faili mpya kutoka `public/` folder - `pm2 restart` peke yake
haikutosha kusafisha hali hiyo.

**Marekebisho:** Tumia `deploy/restart-clean.sh` badala ya `pm2 restart` wakati
wowote unaposhuku tabia kama hii (hasa mara baada ya kutatua tatizo la database
lililokuwa likisababisha crashes mfululizo):

```bash
chmod +x deploy/restart-clean.sh
./deploy/restart-clean.sh
```

Script hii inafuta process kabisa (`pm2 delete`), inahakikisha hakuna kinachobaki
kushikilia port 3000, kisha inaanzisha upya kabisa. Baada ya hapo, jaribu tena
kufikia faili/picha zilizokuwa zikishindwa.
