"use client";
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
  return (
    <aside className="dash-sidebar">
      <div className="brand">Pendo Admin</div>
      {LINKS.map((l) => (
        <Link key={l.href} href={l.href} className={pathname === l.href ? "active" : ""}>
          <span className="dash-sidebar-icon" aria-hidden="true">{l.icon}</span>
          <span>{l.label}</span>
        </Link>
      ))}
      <div style={{ marginTop: 16 }}>
        <LogoutButton />
      </div>
    </aside>
  );
}
