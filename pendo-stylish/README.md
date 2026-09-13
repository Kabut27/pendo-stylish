# Pendo Stylish — Mfumo wa Website + Dashibodi

Mfumo mmoja (Next.js + PostgreSQL) wenye sehemu mbili:
- **Website ya umma** — wateja wanaona bidhaa/huduma, wanawasiliana WhatsApp kununua.
- **Dashibodi ya ndani** — Mmiliki na Wafanyakazi wanaingia kusimamia biashara.

Imejengwa kwa ajili ya VPS binafsi ndogo (2vCPU / 2GB RAM / 30GB storage) — nyepesi
kimakusudi: hakuna maktaba nzito zisizo za lazima, picha zote zinabadilishwa
kiotomatiki kuwa WebP, na database ni PostgreSQL ya kawaida (hakuna "vendor lock-in").

## Muundo wa Mradi

```
app/                     Kurasa (Next.js App Router)
  page.js                Ukurasa wa mwanzo (umma)
  huduma/                Huduma za saluni (umma)
  mawasiliano/            Wasiliana + ramani + QR code (umma)
  kabla-na-baada/         Gallery ya umma
  login/                  Ukurasa wa kuingia
  dashibodi/
    admin/                Dashibodi ya Mmiliki (bidhaa, huduma, wafanyakazi, mauzo,
                          matumizi, ripoti P&L, gallery, mipangilio, audit, backup)
    mfanyakazi/           Dashibodi ya Mfanyakazi (ingiza mauzo, historia yake)
  api/                    API routes zote (kila moja inathibitisha ruhusa upande wa server)
components/               Vipengele vinavyotumika tena (Header, ProductCard, n.k)
lib/                      Database, auth, audit, image processing, settings, validators
db/schema.sql             Muundo kamili wa database
scripts/seed.js           Data ya mfano ya kuanzia
scripts/restore.js        Kurudisha backup kwenye server mpya
deploy/                   Setup script ya VPS, Nginx config, cron ya backup, PM2 config
```

## Kuanzisha Kwenye Kompyuta Yako (Maendeleo/Development)

Mahitaji: Node.js 20+, PostgreSQL 14+ (au docker).

```bash
npm install
cp .env.example .env
# jaza DATABASE_URL na SESSION_SECRET kwenye .env

# tengeneza muundo wa database
psql -d pendo_stylish -f db/schema.sql

# (hiari) weka data ya mfano
node --env-file=.env scripts/seed.js

npm run dev
# fungua http://localhost:3000
```

Baada ya `seed.js`, ingia na:
- **Mmiliki**: `admin` / `Pendo@2026`
- **Mfanyakazi**: `neema` / `Staff@2026` (na wengine: amina, zawadi, happiness, grace, faraja)

⚠️ Badilisha password hizi mara moja unapoanza kutumia mfumo halisi.

## Kupeleka Kwenye VPS (Production)

1. Nunua VPS (2vCPU/2GB RAM/30GB, Ubuntu 24.04) — Hetzner, DigitalOcean, n.k.
2. Elekeza domain yako kwenye IP ya VPS (A record).
3. Nakili code kwenye VPS (git clone au scp).
4. Endesha: `chmod +x deploy/setup-vps.sh && ./deploy/setup-vps.sh yourdomain.co.tz you@email.com`
   — hii inafunga Node.js, PostgreSQL, Nginx, Certbot, Fail2ban, na kuwasha firewall.
5. Fuata maelekezo yanayotokea mwishoni mwa script hiyo (kujaza `.env`, `npm run build`,
   `pm2 start ecosystem.config.js`, kuunganisha Nginx, kupata HTTPS bila malipo).
6. Weka backup ya kila siku kupitia `deploy/backup-cron.sh` kwenye crontab.

Maelekezo kamili, hatua kwa hatua, yapo ndani ya `deploy/setup-vps.sh` (yanachapishwa
mwishoni mwa kuendesha script).

## Matumizi ya Kila Siku (Bila Kugusa Code)

- **Kubadilisha bei/maelezo/picha ya bidhaa au huduma**: Dashibodi ya Mmiliki → Bidhaa/Huduma → Hariri.
- **Kuongeza mfanyakazi mpya**: Dashibodi ya Mmiliki → Wafanyakazi → Ongeza Mfanyakazi Mpya.
- **Kuingiza mauzo ya siku**: Mfanyakazi anaingia mwenyewe → Dashibodi yake → fomu ya "Ingiza Mauzo".
  Mmiliki pia anaweza kuingiza kwa niaba ya mfanyakazi yeyote kwenye Dashibodi ya Mmiliki → Mauzo.
- **Kubadilisha namba ya WhatsApp, anwani, lat/long ya ramani, Instagram/TikTok**:
  Dashibodi ya Mmiliki → Mipangilio.
- **Kupakua backup kamili**: Dashibodi ya Mmiliki → Backup → "Pakua Backup Kamili".
- **Kuona nani alifanya nini**: Dashibodi ya Mmiliki → Audit Log.

## Usalama Uliozingatiwa

- Password zote zinahifadhiwa kwa bcrypt hashing (kamwe si wazi).
- Session inatumia JWT ndani ya cookie ya `httpOnly` + `secure` (production) + `sameSite=lax`.
- Ruhusa (roles) zinathibitishwa **upande wa server** kwenye kila API route (`requireUser`),
  siyo tu kwenye frontend — mfanyakazi hawezi kuona mauzo ya mwenzake hata akibadilisha URL.
- Rate limiting kwenye login (`lib/rateLimit.js`) inazuia majaribio mengi ya password.
- Audit log inarekodi kila kitendo muhimu (nani, nini, lini, kutoka IP gani).
- Firewall (ufw) inafungua bandari 22/80/443 pekee; SSH inatumia key badala ya password;
  Fail2ban inazuia mashambulizi ya brute-force.

## Muonekano / Design

Mtindo wa kifahari (zambarau ya kina + dhahabu + waridi laini), mobile-first, na
micro-interactions nyepesi (fade-in ya picha, kadi zinazoinuka kidogo mtu anapoigusa,
namba za dashibodi zinazoongezeka taratibu - count-up), zote kwa CSS pekee (bila
maktaba nzito) ili tovuti ibaki nyepesi hata kwenye mtandao wa 3G/4G. Angalia
`app/globals.css` kwa maelezo zaidi ya rangi na mitindo iliyotumika.

## Backup na Portability

Angalia `MIGRATION.md` kwa maelekezo kamili ya kuhamisha mfumo kwenda server nyingine.
