# Mabadiliko Yaliyofanyika (toleo hili)

## 1. Bidhaa — Picha Nyingi + Video + Zinazofunguka (accordion)
- Jedwali jipya la database: `product_images` (bidhaa moja inaweza kuwa na hadi picha 8).
- Column mpya: `products.video_url` (video fupi ya hiari, upeo 40MB — MP4/WebM/MOV).
- Admin (Dashibodi > Bidhaa) sasa ana:
  - **MultiImageUploader** — pakia picha kadhaa, bonyeza picha kuifanya "Kuu", futa picha.
  - **VideoUploader** — pakia video fupi ya bidhaa.
- Kwenye website ya wateja: kadi ya bidhaa sasa:
  - Inaonyesha idadi ya picha (📷 2, 3...) na dots za kubadilisha picha.
  - Ina kitufe cha ▶ cha kucheza video (kinafungua video mahali pa picha).
  - Inabonyezeka/kufunguka (accordion) kuonyesha maelezo kamili ya bidhaa ("Soma Zaidi ▼").

## 2. Mfanyakazi wa "Keshia" (haifanyi huduma yeye mwenyewe)
- Mfumo tayari ulikuwa na tofauti kati ya "aliyefanya huduma" (`staff_id`) na "aliyeingiza mfumoni"
  (`entered_by`) — sasa hili limefunguliwa kwenye dashibodi ya mfanyakazi pia (siyo admin tu):
  - Kwenye "Ingiza Mauzo" (mfanyakazi), ikiwa kuna zaidi ya mfanyakazi mmoja anayefanya kazi,
    dropdown "Aliyefanya Huduma" inaonekana — keshia anaweza kuchagua jina la msusi aliyefanya
    huduma badala ya jina lake mwenyewe.
  - Ameongezewa uga wa "Maelezo Mahususi ya Huduma" (mfano: aina ya nywele/aina ya kusuka).
  - Historia ya mauzo sasa inaonyesha atakayoona: mauzo aliyofanya YEYE + mauzo ALIYOINGIZA
    kwa niaba ya mwenzake.

## 3. Admin — Mauzo ya Mfanyakazi Mmoja Mmoja (siyo jumla tu)
- Kwenye Dashibodi > Muhtasari, jedwali la "Mauzo kwa Kila Mfanyakazi" sasa lina kitufe
  "Ona Orodha" kwa kila mfanyakazi — kinampeleka admin kwenye ukurasa wa Mauzo ukiwa
  tayari umechujwa kwa mfanyakazi huyo, ukionyesha kila huduma/bidhaa moja moja
  (siyo jumla tu), pamoja na maelezo mahususi na "aliyeingiza".

## Hatua za Kupeleka VPS

1. `git pull` kwenye VPS (au pakua zip hii na uibadilishe na folder ya sasa).
2. Endesha schema tena (ni salama — haiharibu data iliyopo):
   ```
   psql -U pendo_user -d pendo_stylish -f db/schema.sql
   ```
3. Ongeza `client_max_body_size` mpya ya nginx (kwa video), kisha reload:
   ```
   sudo cp deploy/nginx.conf /etc/nginx/sites-available/pendostylish
   sudo nginx -t && sudo systemctl reload nginx
   ```
   (Kama umebadilisha nginx.conf yako mwenyewe kwa mkono, badilisha tu mstari wa
   `client_max_body_size` kuwa `45M`.)
4. `npm install` (hakuna package mpya iliyoongezwa, lakini si vibaya kuhakikisha),
   kisha `npm run build && pm2 restart <jina-la-app>` (au utaratibu wako wa kawaida).

## Bado Haijafanyika (kwa mzunguko ujao)
- Huduma (`services`) bado hazina picha/video — hiyo ilikuwa ni kwa "Bidhaa" tu kama ulivyoomba.
- Reordering ya picha kwa drag-and-drop bado haipo (kwa sasa: bonyeza picha "kuifanya ya kwanza").
