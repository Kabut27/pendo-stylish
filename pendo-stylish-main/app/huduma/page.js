import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingSocial from "@/components/FloatingSocial";
import ServiceRow from "@/components/ServiceRow";
import { query } from "@/lib/db";
import { getSettings } from "@/lib/getSettings";

export const revalidate = 0;
export const metadata = { title: "Huduma — Pendo Stylish" };

async function getServices() {
  try {
    const { rows } = await query(
      `SELECT * FROM services WHERE active = true ORDER BY sort_order ASC, created_at DESC`
    );
    return rows;
  } catch (err) {
    console.error("Imeshindwa kusoma huduma:", err.message);
    return [];
  }
}

export default async function HudumaPage() {
  const settings = await getSettings();
  const services = await getServices();

  return (
    <>
      <Header />
      <FloatingSocial />
      <section className="section container" style={{ maxWidth: 760 }}>
        <div className="section-title">
          <h2>Huduma za Saluni</h2>
          <p>Bei zetu za huduma - wasiliana WhatsApp kuweka miadi</p>
        </div>
        {services.map((s) => (
          <ServiceRow key={s.id} service={s} whatsappNumber={settings.whatsapp_number} />
        ))}
        {services.length === 0 && <p className="center muted">Hakuna huduma kwa sasa.</p>}
      </section>
      <Footer />
    </>
  );
}
