import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingSocial from "@/components/FloatingSocial";
import LocationButtons from "@/components/LocationButtons";
import WhatsAppButton from "@/components/WhatsAppButton";
import { getSettings } from "@/lib/getSettings";

export const revalidate = 0;
export const metadata = { title: "Mawasiliano — Pendo Stylish" };

export default async function MawasilianoPage() {
  const settings = await getSettings();
  const siteUrl = process.env.SITE_URL || "https://pendostylish.co.tz";
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(siteUrl)}`;

  return (
    <>
      <Header />
      <FloatingSocial />
      <section className="section container center" style={{ maxWidth: 640 }}>
        <div className="section-title">
          <h2>Wasiliana Nasi</h2>
          <p>{settings.address_text || "Iringa, Tanzania"}</p>
        </div>

        <div className="flex gap-12 wrap center mb-16" style={{ justifyContent: "center" }}>
          <WhatsAppButton number={settings.whatsapp_number} />
          {settings.phone_number && (
            <a className="btn btn-outline" href={`tel:${settings.phone_number}`}>
              📞 Piga Simu
            </a>
          )}
        </div>

        <div className="mb-16">
          <LocationButtons
            latitude={settings.latitude}
            longitude={settings.longitude}
            address={settings.address_text}
          />
        </div>

        <div className="card" style={{ display: "inline-block", padding: 20, marginTop: 20 }}>
          <img src={qrUrl} alt="QR code ya duka" width={200} height={200} />
          <p className="small muted mt-8">Skani (Scan) kufungua tovuti yetu</p>
        </div>
      </section>
      <Footer />
    </>
  );
}
