import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import FloatingSocial from "@/components/FloatingSocial";
import { query } from "@/lib/db";
import { getSettings } from "@/lib/getSettings";
import { CATEGORIES } from "@/lib/categories";
import { attachProductImages } from "@/lib/products";

export const revalidate = 0;

const TRUST_ICONS = [
  { icon: "⭐", label: "Wateja Wanaoridhika" },
];

async function getHomeProducts() {
  try {
    const { rows } = await query(
      `SELECT * FROM products WHERE active = true ORDER BY
         CASE badge WHEN 'inayopendwa' THEN 0 WHEN 'mpya' THEN 1 ELSE 2 END,
         sort_order ASC, created_at DESC
       LIMIT 8`
    );
    return await attachProductImages(rows);
  } catch (err) {
    console.error("Imeshindwa kusoma bidhaa:", err.message);
    return [];
  }
}

async function getHomeGallery() {
  try {
    const { rows } = await query(
      `SELECT * FROM gallery WHERE active = true ORDER BY gallery_date DESC LIMIT 4`
    );
    return rows;
  } catch (err) {
    console.error("Imeshindwa kusoma gallery:", err.message);
    return [];
  }
}

export default async function HomePage() {
  const settings = await getSettings();
  const products = await getHomeProducts();
  const gallery = await getHomeGallery();

  return (
    <>
      <Header />
      <FloatingSocial />

      <section className="promo-hero">
        <div className="promo-hero-orb promo-hero-orb-1" aria-hidden="true" />
        <div className="promo-hero-orb promo-hero-orb-2" aria-hidden="true" />
        <span className="promo-badge">SALUNI YA KIFAHARI</span>
        <h1>
          Pendo <span className="gradient-text">Stylish</span>
        </h1>
        <p className="promo-tagline">{settings.hero_tagline || "Urembo wa Kiwango cha Juu, Iringa"}</p>
        <p className="promo-offer">
          Punguzo la <strong>Wateja Wapya</strong>
        </p>
        <div className="hero-actions">
          <a href="/huduma" className="btn btn-dark-pill">Angalia Sasa</a>
        </div>
        <div className="promo-coupon">
          <span className="promo-coupon-badge">Zawadi</span>
        </div>
      </section>

      <section className="trust-icons container">
        {TRUST_ICONS.map((t, i) => (
          <div className="trust-icon-item" key={i}>
            <span className="trust-icon-emoji">{t.icon}</span>
            <span>{t.label}</span>
          </div>
        ))}
      </section>

      <section className="container" style={{ marginTop: 8 }}>
        <div className="category-tiles">
          {CATEGORIES.map((c) => (
            <a href={c.href} key={c.label} className="category-tile">
              <span className="category-tile-thumb">{c.icon}</span>
              <span className="category-tile-label">{c.label}</span>
            </a>
          ))}
        </div>
      </section>

      <section id="bidhaa" className="section container">
        <div className="section-title">
          <h2>Bidhaa Zetu</h2>
          <p>Chagua unachokipenda, wasiliana nasi WhatsApp kununua</p>
        </div>
        <div className="grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} whatsappNumber={settings.whatsapp_number} />
          ))}
        </div>
        {products.length === 0 && <p className="center muted">Bidhaa zitaongezwa hivi karibuni.</p>}
        <div className="center mt-24">
          <a href="/huduma" className="btn btn-outline">Ona Huduma za Saluni →</a>
        </div>
      </section>

      {gallery.length > 0 && (
        <section className="section container" style={{ background: "var(--pink-soft)", borderRadius: 24 }}>
          <div className="section-title">
            <h2>Kabla na Baada</h2>
            <p>Mabadiliko halisi ya wateja wetu</p>
          </div>
          <div className="grid">
            {gallery.map((g) => (
              <div key={g.id} className="card">
                <div className="ba-card">
                  <img src={g.before_image} alt="Kabla" loading="lazy" className="fade-in-img" />
                  <img src={g.after_image} alt="Baada" loading="lazy" className="fade-in-img" />
                </div>
                <div className="ba-label">KABLA — BAADA</div>
              </div>
            ))}
          </div>
          <div className="center mt-24">
            <a href="/kabla-na-baada" className="btn btn-primary">Ona Zaidi →</a>
          </div>
        </section>
      )}

      <section className="section container center">
        <div className="loyalty-card" style={{ maxWidth: 480, margin: "0 auto" }}>
          🌟 {settings.loyalty_reward_text || "Punguzo maalum kwa wateja wanaorudi"}
        </div>
      </section>

      <Footer />
    </>
  );
}
