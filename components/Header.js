import Link from "next/link";
import AnnouncementBar from "./AnnouncementBar";
import { getSettings } from "@/lib/getSettings";
import { MENU_TABS, MENU_LINKS } from "@/lib/categories";

const STATIC_LINKS = [
  { label: "Nyumbani", href: "/" },
  { label: "Ingia (Dashibodi)", href: "/login" },
];

// Header hii nzima ni server component (hakuna "use client", hakuna useState) -
// menu ya hamburger inafunguka kwa CSS pekee ("checkbox hack"), hivyo
// inafanya kazi papo hapo hata kabla JavaScript ya ukurasa haijamaliza
// kupakia - muhimu kwenye mtandao dhaifu wa simu.
export default async function Header() {
  const settings = await getSettings();

  return (
    <>
      {/* Checkbox iko HAPA (nje ya <header>) ili isiathiriwe na
          backdrop-filter ya .site-header - filter/backdrop-filter huunda
          "containing block" mpya kwa vitu vya position:fixed vilivyomo
          ndani yake, jambo linalovunja .mmenu-overlay isifunike skrini
          nzima. Bado ni "ndugu" (sibling) wa .mmenu-overlay chini, hivyo
          selector ya CSS #mmenu-toggle:checked ~ .mmenu-overlay inaendelea
          kufanya kazi. */}
      <input type="checkbox" id="mmenu-toggle" className="mmenu-toggle-input" />

      <AnnouncementBar
        text={settings.announcement_text || "Punguzo Maalum kwa Wateja Wapya"}
        linkHref="/huduma"
        linkLabel="Angalia Sasa"
      />
      <header className="site-header">
        <div className="header-icons container">
          <label htmlFor="mmenu-toggle" className="icon-btn" aria-label="Fungua menu">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
            </svg>
          </label>

          <a href="/huduma" className="icon-btn" aria-label="Tafuta huduma/bidhaa">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" strokeLinecap="round" />
            </svg>
          </a>

          <Link href="/" className="brand brand-center">
            Pendo <span>Stylish</span>
          </Link>

          <Link href="/login" className="icon-btn" aria-label="Ingia akaunti">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" strokeLinecap="round" />
            </svg>
          </Link>

          {settings.whatsapp_number && (
            <a
              href={`https://wa.me/${settings.whatsapp_number}`}
              target="_blank"
              rel="noopener noreferrer"
              className="icon-btn"
              aria-label="Wasiliana WhatsApp"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm0 1.8a8.2 8.2 0 0 1 6.9 12.6l-.2.4.7 2.5-2.6-.7-.4.2A8.2 8.2 0 1 1 12 3.8Zm-3 4.3c-.2 0-.5 0-.7.3-.2.3-.9.9-.9 2.1 0 1.2.9 2.4 1 2.6.2.2 1.7 2.7 4.1 3.7 2 .8 2.4.7 2.9.6.4-.1 1.3-.5 1.5-1 .2-.5.2-.9.1-1-.1-.1-.3-.2-.6-.3-.3-.2-1.5-.8-1.8-.9-.2-.1-.4-.1-.6.1-.2.3-.6.9-.8 1.1-.1.2-.3.2-.5.1-.3-.1-1.2-.4-2.2-1.4-.8-.7-1.3-1.6-1.5-1.9-.1-.3 0-.4.1-.5l.4-.5c.1-.2.1-.3.2-.5v-.6c-.1-.2-.6-1.5-.9-2-.2-.5-.4-.4-.6-.4Z" />
              </svg>
            </a>
          )}
        </div>
      </header>

      {/* .mmenu-overlay pia iko NJE ya <header>, kama ndugu yake, ili
          position:fixed itumike dhidi ya skrini nzima ya kifaa - si
          dhidi ya kisanduku kidogo cha .site-header. */}
      <div className="mmenu-overlay" role="dialog" aria-modal="true">
        {/* Inaunganisha kila radio (tab) na panel yake + "active" state -
            imetengenezwa hapa moja kwa moja kwa sababu majina ya tab.key
            yanatoka MENU_TABS (yanaweza kubadilika). */}
        <style>{`${MENU_TABS.map(
          (tab) => `
          #mmenu-tab-${tab.key}:checked ~ .mmenu-body .mmenu-panel-${tab.key} {
            display: flex;
          }
          #mmenu-tab-${tab.key}:checked ~ .mmenu-body label[for="mmenu-tab-${tab.key}"] {
            background: var(--white);
            color: var(--purple);
            font-weight: 700;
            border-left-color: var(--purple);
          }`
        ).join("\n")}`}</style>
        {MENU_TABS.map((tab, i) => (
          <input
            key={tab.key}
            type="radio"
            name="mmenu-tab"
            id={`mmenu-tab-${tab.key}`}
            className="mmenu-tab-input"
            defaultChecked={i === 0}
          />
        ))}

        <div className="mmenu-header">
          <span>Menu</span>
          <label htmlFor="mmenu-toggle" className="mmenu-close" aria-label="Funga menu">
            ✕
          </label>
        </div>

        <div className="mmenu-body">
          <div className="mmenu-tabs">
            {MENU_TABS.map((tab) => (
              <label key={tab.key} htmlFor={`mmenu-tab-${tab.key}`} className="mmenu-tab">
                {tab.label}
              </label>
            ))}
            <div className="mmenu-tabs-divider" />
            {STATIC_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="mmenu-tab">
                {link.label}
              </a>
            ))}
          </div>

          {MENU_TABS.map((tab) => (
            <div key={tab.key} className={`mmenu-panel mmenu-panel-${tab.key}`}>
              {MENU_LINKS[tab.key].map((item) =>
                item.featured ? (
                  <a key={item.label} href={item.href} className="mmenu-featured">
                    <span>{item.label}</span>
                    <span className="mmenu-featured-more">Ona Zaidi →</span>
                  </a>
                ) : (
                  <a key={item.label} href={item.href} className="mmenu-tile">
                    <span className="mmenu-tile-icon">{item.icon}</span>
                    <span>{item.label}</span>
                  </a>
                )
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
