"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";

const LINKS = [
  { href: "/dashibodi/admin", label: "Muhtasari", icon: "📊" },
  { href: "/dashibodi/admin/bidhaa", label: "Bidhaa", icon: "🛍️" },
  { href: "/dashibodi/admin/huduma", label: "Huduma", icon: "💇‍♀️" },
  { href: "/dashibodi/admin/wafanyakazi", label: "Wafanyakazi", icon: "👥" },
  { href: "/dashibodi/admin/mauzo", label: "Mauzo", icon: "💰" },
  { href: "/dashibodi/admin/matumizi", label: "Matumizi", icon: "🧾" },
  { href: "/dashibodi/admin/ripoti", label: "Ripoti (P&L)", icon: "📈" },
  { href: "/dashibodi/admin/gallery", label: "Kabla na Baada", icon: "📸" },
  { href: "/dashibodi/admin/mipangilio", label: "Mipangilio", icon: "⚙️" },
  { href: "/dashibodi/admin/audit", label: "Audit Log", icon: "📜" },
  { href: "/dashibodi/admin/backup", label: "Backup", icon: "💾" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Funga drawer kiotomatiki kila ukurasa unapobadilika (baada ya
  // mtumiaji kubonyeza kiungo) - hii inasaidia hasa kama navigation
  // itaisha kabla ya onClick kufika kwenye Link.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        className="dash-sidebar-toggle"
        aria-label={open ? "Funga menu" : "Fungua menu"}
        onClick={() => setOpen((v) => !v)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          ) : (
            <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
          )}
        </svg>
      </button>

      {open && <div className="dash-sidebar-overlay" onClick={() => setOpen(false)} />}

      <aside className={`dash-sidebar${open ? " dash-sidebar-open" : ""}`}>
        <div className="brand">Pendo Admin</div>
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={pathname === l.href ? "active" : ""}
            onClick={() => setOpen(false)}
          >
            <span className="dash-sidebar-icon" aria-hidden="true">{l.icon}</span>
            <span>{l.label}</span>
          </Link>
        ))}
        <div style={{ marginTop: 16 }}>
          <LogoutButton />
        </div>
      </aside>
    </>
  );
}
