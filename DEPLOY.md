# Pendo Stylish - Maelekezo ya Deployment

## Chaguo 1: Cloudflare Workers + D1 (BURE)

### Hatua 1: Tengeneza Cloudflare Account
1.enda [cloudflare.com](https://cloudflare.com) na tengeneza account (bure)

### Hatua 2: Tengeneza D1 Database
1. Ingia kwenye Cloudflare Dashboard
2. Nenda kwenye "Workers & Pages"
3. Bonyeza "D1" kisha "Create"
4. Weka jina: `pendo-stylish-db`
5. Copy Database ID (itahitajika baadaye)

### Hatua 3: Weka Schema
1. Kwenye D1 dashboard, bonyeza "Console" au tumia wrangler:
```bash
npx wrangler d1 execute pendo-stylish-db --file=./schema.sql
```

### Hatua 4: Install Wrangler
```bash
npm install -g wrangler
npx wrangler login
```

### Hatua 5: Tengeneza `wrangler.toml`
```toml
name = "pendo-stylish"
main = "dist/worker.js"
compatibility_date = "2026-05-19"

[[d1_databases]]
binding = "DB"
database_name = "pendo-stylish-db"
database_id = "WEKA-DATABASE-ID-HAPA"
```

### Hatua 6: Build na Deploy
```bash
# Install dependencies
npm install

# Build
npm run build

# Deploy
npx wrangler deploy
```

### Hatua 7: Weka Mazingira (Secrets)
```bash
npx wrangler secret put JWT_SECRET
# Weka: pendo-stylish-secret-key-2026

npx wrangler secret put VAULT_PIN
# Weka: 0000 (au PIN yako)
```

### Hatua 8: Seed Data
```bash
npx wrangler d1 execute pendo-stylish-db --file=./seed.sql
```

---

## Chaguo 2: VPS (DigitalOcean, Linode, etc.)

### Hatua 1: Build Image
```bash
docker build -t pendo-stylish .
```

### Hatua 2: Run Container
```bash
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL=file:./local.db \
  -e JWT_SECRET=pendo-stylish-secret-key-2026 \
  --name pendo-stylish \
  pendo-stylish
```

### Hatua 3: Seed Data
```bash
docker exec -it pendo-stylish npx tsx db/seed.ts
```

### Hatua 4: Nginx Reverse Proxy (Optional)
```nginx
server {
    listen 80;
    server_name salon.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## Chaguo 3: GitHub → Cloudflare (Free CI/CD)

### Hatua 1: Weka Repo kwenye GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/username/pendo-stylish.git
git push -u origin main
```

### Hatua 2: Connect kwenze Cloudflare Pages
1. Nenda Cloudflare Dashboard → Workers & Pages → Pages
2. Bonyeza "Connect to Git"
3. Chagua repo yako
4. Weka build command: `npm run build`
5. Weka output directory: `dist`
6. Bonyeza "Save and Deploy"

### Hatua 3: Ongeza D1 Binding
1. Kwenye project settings, nenda "Functions"
2. Ongeza D1 database binding
3. Deploy tena

---

## Taarifa za Mwisho

- **Admin Default**: Jina: `Admin`, PIN: `1234`
- **Vault Default PIN**: `0000`
- **Port**: 3000
- **Database**: SQLite (local) au D1 (Cloudflare)
- **WhatsApp Ordering**: Inakuja hivi karibuni - imeandaliwa kwenye public page
