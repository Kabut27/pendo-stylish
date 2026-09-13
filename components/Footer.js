import { getSettings } from "@/lib/getSettings";

export default async function Footer() {
  const settings = await getSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
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
