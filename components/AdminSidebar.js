"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";

const LINKS = [
  { href: "/dashibodi/admin", label: "Muhtasari" },
  { href: "/dashibodi/admin/bidhaa", label: "Bidhaa" },
  { href: "/dashibodi/admin/huduma", label: "Huduma" },
  { href: "/dashibodi/admin/wafanyakazi", label: "Wafanyakazi" },
  { href: "/dashibodi/admin/mauzo", label: "Mauzo" },
  { href: "/dashibodi/admin/matumizi", label: "Matumizi" },
  { href: "/dashibodi/admin/ripoti", label: "Ripoti (P&L)" },
  { href: "/dashibodi/admin/gallery", label: "Kabla na Baada" },
  { href: "/dashibodi/admin/mipangilio", label: "Mipangilio" },
  { href: "/dashibodi/admin/audit", label: "Audit Log" },
  { href: "/dashibodi/admin/backup", label: "Backup" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="dash-sidebar">
      <div className="brand">Pendo Admin</div>
      {LINKS.map((l) => (
        <Link key={l.href} href={l.href} className={pathname === l.href ? "active" : ""}>
          {l.label}
        </Link>
      ))}
      <div style={{ marginTop: 16 }}>
        <LogoutButton />
      </div>
    </aside>
  );
}
