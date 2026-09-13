"use client";
import LogoutButton from "./LogoutButton";

export default function StaffSidebar({ fullName }) {
  return (
    <aside className="dash-sidebar">
      <div className="brand">Pendo Stylish</div>
      <p className="small" style={{ opacity: 0.8, padding: "0 12px 10px" }}>
        Karibu, {fullName || "Mfanyakazi"}
      </p>
      <div style={{ marginTop: 8 }}>
        <LogoutButton />
      </div>
    </aside>
  );
}
