-- ============================================================
-- Pendo Stylish — Muundo wa Database (PostgreSQL)
-- Endesha: psql -U pendo_user -d pendo_stylish -f db/schema.sql
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ------------------------------------------------------------
-- WATUMIAJI (Mmiliki + Wafanyakazi) — huingia kwenye Dashibodi
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username        VARCHAR(60) UNIQUE NOT NULL,
    password_hash   TEXT NOT NULL,
    role            VARCHAR(10) NOT NULL CHECK (role IN ('admin', 'staff')),
    full_name       VARCHAR(150) NOT NULL,
    phone           VARCHAR(30),
    skills          TEXT[] DEFAULT '{}',            -- ujuzi wa mfanyakazi, mfano: {"Nywele","Kucha"}
    profile_image   TEXT,                            -- njia ya picha ya profaili (webp)
    active          BOOLEAN NOT NULL DEFAULT TRUE,   -- admin anaweza "kuzima" akaunti badala ya kufuta
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- BIDHAA (zinazouzwa dukani, mawasiliano kupitia WhatsApp)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(200) NOT NULL,
    price           NUMERIC(12,2) NOT NULL CHECK (price >= 0),
    description     TEXT,
    image_url       TEXT,                            -- picha "kuu" (ya kwanza) - kwa nafasi zinazoonyesha picha 1 tu
    video_url       TEXT,                             -- video fupi ya hiari ya bidhaa (mp4/webm)
    badge           VARCHAR(20) CHECK (badge IN ('mpya', 'inayopendwa') OR badge IS NULL),
    active          BOOLEAN NOT NULL DEFAULT TRUE,    -- kuficha bila kufuta kabisa
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Kuongeza column mpya kwenye database iliyokuwepo tayari (haiharibu data iliyopo)
ALTER TABLE products ADD COLUMN IF NOT EXISTS video_url TEXT;

-- ------------------------------------------------------------
-- PICHA ZA BIDHAA (bidhaa moja - picha nyingi)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_images (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url       TEXT NOT NULL,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id, sort_order);

-- ------------------------------------------------------------
-- HUDUMA ZA SALUNI
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS services (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(200) NOT NULL,
    price           NUMERIC(12,2) NOT NULL CHECK (price >= 0),
    description     TEXT,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- MAUZO — kila mfanyakazi anaingiza yake, admin anaona yote
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sales (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_date       DATE NOT NULL DEFAULT CURRENT_DATE,
    item_type       VARCHAR(10) NOT NULL CHECK (item_type IN ('huduma', 'bidhaa')),
    item_name       VARCHAR(200) NOT NULL,            -- jina la huduma/bidhaa wakati wa mauzo (historia thabiti)
    staff_id        UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    customer_name   VARCHAR(150),                     -- hiari
    revenue         NUMERIC(12,2) NOT NULL CHECK (revenue >= 0),   -- Mapato
    cost            NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (cost >= 0), -- Matumizi/malighafi
    profit          NUMERIC(12,2) GENERATED ALWAYS AS (revenue - cost) STORED, -- Faida halisi (auto)
    entered_by      UUID REFERENCES users(id),        -- nani aliINGIZA mfumoni (mfano: keshia/msaidizi)
    service_detail  VARCHAR(300),                      -- maelezo mahususi ya huduma, mf. "Kusuka - Braids ndefu"
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Kuongeza column mpya kwenye database iliyokuwepo tayari (haiharibu data iliyopo)
ALTER TABLE sales ADD COLUMN IF NOT EXISTS service_detail VARCHAR(300);

CREATE INDEX IF NOT EXISTS idx_sales_staff_date ON sales(staff_id, sale_date);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date);

-- ------------------------------------------------------------
-- KUFUNGA MAUZO (period locks) — Admin anaweza "kufunga" siku au
-- mwezi mzima wa mauzo. Baada ya kufungwa, MFANYAKAZI hawezi tena
-- kuhariri au kufuta mauzo ya kipindi hicho (Admin bado anaweza,
-- na anaweza "kufungua" tena akihitaji). Uthibitisho wa hii
-- unafanyika upande wa SERVER kwenye app/api/sales - si UI tu.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sale_locks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lock_type       VARCHAR(10) NOT NULL CHECK (lock_type IN ('day', 'month')),
    period_value    VARCHAR(10) NOT NULL,   -- 'YYYY-MM-DD' kwa siku, 'YYYY-MM' kwa mwezi
    locked_by       UUID REFERENCES users(id),
    locked_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (lock_type, period_value)
);

CREATE INDEX IF NOT EXISTS idx_sale_locks_period ON sale_locks(period_value);

-- ------------------------------------------------------------
-- MATUMIZI YA BIASHARA (P&L ya jumla ya mmiliki)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS business_expenses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_date    DATE NOT NULL DEFAULT CURRENT_DATE,
    category        VARCHAR(100) NOT NULL,   -- umeme, maji, kodi, mshahara, ununuzi, matengenezo, n.k
    amount          NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
    description     TEXT,
    entered_by      UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_expenses_date ON business_expenses(expense_date);

-- ------------------------------------------------------------
-- KABLA NA BAADA (gallery ya mabadiliko ya wateja)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS gallery (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    before_image    TEXT NOT NULL,
    after_image     TEXT NOT NULL,
    description     TEXT,
    gallery_date    DATE NOT NULL DEFAULT CURRENT_DATE,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_by      UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- MIPANGILIO (settings ya jumla - key/value, mmiliki anabadilisha bila code)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS settings (
    key             VARCHAR(100) PRIMARY KEY,
    value           TEXT,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Thamani chaguo-msingi (default) - zibadilishwe kwenye Dashibodi > Mipangilio
INSERT INTO settings (key, value) VALUES
    ('business_name', 'Pendo Stylish'),
    ('whatsapp_number', '255753834960'),
    ('phone_number', '+255753834960'),
    ('address_text', 'Iringa Plaza, Ghorofa ya Pili, Iringa'),
    ('latitude', '-7.782665'),
    ('longitude', '35.696247'),
    ('instagram_salon_url', 'https://www.instagram.com/pendo_stylish_saloon'),
    ('instagram_makeup_url', 'https://www.instagram.com/pendo_stylish'),
    ('tiktok_url', 'https://www.tiktok.com/@pendo_stylish'),
    ('hero_tagline', 'Urembo wa Kiwango cha Juu, Iringa'),
    ('announcement_text', 'Punguzo Maalum kwa Wateja Wapya'),
    ('loyalty_threshold', '5'),
    ('loyalty_reward_text', 'Punguzo la 20% baada ya huduma 5')
ON CONFLICT (key) DO NOTHING;

-- ------------------------------------------------------------
-- AUDIT LOG — nani alibadilisha nini na lini
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_log (
    id              BIGSERIAL PRIMARY KEY,
    user_id         UUID REFERENCES users(id),
    username        VARCHAR(60),
    action          VARCHAR(100) NOT NULL,   -- mfano: "PRODUCT_UPDATE", "STAFF_DELETE", "LOGIN_FAILED"
    entity_type     VARCHAR(50),
    entity_id       TEXT,
    details         JSONB,
    ip_address      VARCHAR(64),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at DESC);

-- ------------------------------------------------------------
-- LOYALTY — kufuatilia idadi ya huduma za kila mteja (kwa jina/simu)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS loyalty_customers (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_identifier VARCHAR(150) NOT NULL UNIQUE, -- jina au namba ya simu ya mteja
    visit_count         INTEGER NOT NULL DEFAULT 0,
    last_visit          DATE,
    reward_claimed_at   TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- RUHUSA (GRANTS) — hakikisha 'pendo_user' ana ruhusa KAMILI
-- kwenye majedwali yote hapo juu.
--
-- MUHIMU: Hii inahitajika HATA kama database ilipewa "OWNER pendo_user"
-- wakati wa kuiunda. Kuwa "owner" wa database HAKUMPI mtu ruhusa
-- kiotomatiki kwenye majedwali yaliyoundwa na role NYINGINE - na
-- kwa kawaida schema.sql inaendeshwa na role "postgres" (superuser),
-- si "pendo_user" mwenyewe (mfano: pgcrypto extension inahitaji
-- superuser). Bila block hii, app itapata hitilafu ya aina:
--   "permission denied for table settings/products/gallery/..."
-- hata kama password ya database ni sahihi kabisa.
-- ------------------------------------------------------------
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'pendo_user') THEN
        GRANT USAGE ON SCHEMA public TO pendo_user;
        GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO pendo_user;
        GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO pendo_user;
    END IF;
END
$$;

-- Kama schema.sql itaendeshwa tena baadaye (mfano baada ya kuongeza
-- jedwali jipya kwenye toleo jipya la mfumo), majedwali MAPYA
-- yataundwa na role hii hii inayoendesha faili - hivyo yatakuwa na
-- ruhusa moja kwa moja bila hitaji la GRANT ya ziada, ISIPOKUWA
-- ukiendesha kama "postgres" - kwa hiyo endelea kuendesha block
-- hili la GRANT kila baada ya kubadilisha schema.
