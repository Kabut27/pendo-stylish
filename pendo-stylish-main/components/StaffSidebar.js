"use client";
import { useState } from "react";
import LogoutButton from "./LogoutButton";

export default function StaffSidebar({ fullName }) {
  const [open, setOpen] = useState(false);

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
        <div className="brand">Pendo Stylish</div>
        <p className="small" style={{ opacity: 0.8, padding: "0 12px 10px" }}>
          Karibu, {fullName || "Mfanyakazi"}
        </p>
        <div style={{ marginTop: 8 }}>
          <LogoutButton />
        </div>
      </aside>
    </>
  );
}
