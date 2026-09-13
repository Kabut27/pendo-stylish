import { getSettings } from "@/lib/getSettings";
import LocationButtons from "@/components/LocationButtons";
import WhatsAppButton from "@/components/WhatsAppButton";

export default async function Footer() {
  const settings = await getSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container center" style={{ marginBottom: 28 }}>
        <p className="small" style={{ color: "var(--gold-light)", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 10 }}>
          Wasiliana Nasi
        </p>
        <div className="flex gap-12 wrap center mb-16" style={{ justifyContent: "center" }}>
          <WhatsAppButton number={settings.whatsapp_number} />
          {settings.phone_number && (
            <a className="btn btn-outline" style={{ borderColor: "rgba(255,255,255,0.4)", color: "var(--pink-soft)" }} href={`tel:${settings.phone_number}`}>
              📞 Piga Simu
            </a>
          )}
        </div>
        <div className="footer-location-buttons">
          <LocationButtons
            latitude={settings.latitude}
            longitude={settings.longitude}
            address={settings.address_text}
          />
        </div>
      </div>
      <div className="row container">
        <div>
          <div className="brand" style={{ marginBottom: 8 }}>Pendo Stylish</div>
          <p className="small">{settings.address_text}</p>
          {settings.phone_number && <p className="small">📞 {settings.phone_number}</p>}
        </div>
        <div>
          <p className="small" style={{ marginBottom: 8, fontWeight: 700 }}>Tufuate</p>
          <div className="social-icons">
            {settings.instagram_salon_url && (
              <a href={settings.instagram_salon_url} target="_blank" rel="noopener noreferrer" title="Instagram - Saluni">IG</a>
            )}
            {settings.instagram_makeup_url && (
              <a href={settings.instagram_makeup_url} target="_blank" rel="noopener noreferrer" title="Instagram - Makeup">IG</a>
            )}
            {settings.tiktok_url && (
              <a href={settings.tiktok_url} target="_blank" rel="noopener noreferrer">TT</a>
            )}
            <a href={`https://wa.me/${settings.whatsapp_number}`} target="_blank" rel="noopener noreferrer">
              WA
            </a>
          </div>
        </div>
      </div>
      <p className="footer-note">© {year} Pendo Stylish — Haki zote zimehifadhiwa.</p>
    </footer>
  );
}
