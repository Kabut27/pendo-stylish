"use client";
import { useEffect, useState } from "react";

export default function AdminAuditPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/audit?limit=200")
      .then((r) => r.json())
      .then((d) => setLogs(d.logs || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2>Audit Log — Nani Alifanya Nini na Lini</h2>
      <p className="small muted mb-16">Kila kitendo muhimu (kuongeza/kuhariri/kufuta) kinarekodiwa hapa moja kwa moja.</p>
      {loading ? (
        <p className="muted">Inapakia...</p>
      ) : (
        <>
          <span className="scroll-hint">↔️ Sogeza kando kuona safu zote</span>
          <div className="table-wrap">
            <table className="tbl-cards tbl-audit">
              <thead>
                <tr><th>Tarehe/Muda</th><th>Mtumiaji</th><th>Kitendo</th><th>Kipengele</th><th>IP</th></tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id}>
                    <td className="small">{new Date(l.created_at).toLocaleString("sw-TZ")}</td>
                    <td>{l.username || "—"}</td>
                    <td className="small">{l.action}</td>
                    <td className="small">{l.entity_type ? `${l.entity_type}` : "—"}</td>
                    <td className="small muted">{l.ip_address || "—"}</td>
                  </tr>
                ))}
                {logs.length === 0 && <tr><td colSpan={5} className="center muted">Hakuna rekodi bado.</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
