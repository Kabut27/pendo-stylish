import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingSocial from "@/components/FloatingSocial";
import { query } from "@/lib/db";

export const revalidate = 0;
export const metadata = { title: "Kabla na Baada — Pendo Stylish" };

async function getGallery() {
  try {
    const { rows } = await query(
      `SELECT * FROM gallery WHERE active = true ORDER BY gallery_date DESC LIMIT 100`
    );
    return rows;
  } catch (err) {
    console.error("Imeshindwa kusoma gallery:", err.message);
    return [];
  }
}

export default async function GalleryPage() {
  const gallery = await getGallery();

  return (
    <>
      <Header />
      <FloatingSocial />
      <section className="section container">
        <div className="section-title">
          <h2>Kabla na Baada</h2>
          <p>Mabadiliko halisi ya wateja wetu baada ya huduma</p>
        </div>
        <div className="grid">
          {gallery.map((g) => (
            <div key={g.id} className="card">
              <div className="ba-card">
                <img src={g.before_image} alt="Kabla" loading="lazy" className="fade-in-img" />
                <img src={g.after_image} alt="Baada" loading="lazy" className="fade-in-img" />
              </div>
              <div className="ba-label">KABLA — BAADA</div>
              {g.description && (
                <div className="card-body">
                  <p className="small muted">{g.description}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        {gallery.length === 0 && <p className="center muted">Picha zitaongezwa hivi karibuni.</p>}
      </section>
      <Footer />
    </>
  );
}
