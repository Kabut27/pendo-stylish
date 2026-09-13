"use client";
import { useEffect, useState } from "react";
import CountUp from "@/components/CountUp";

const PERIODS = [
  { key: "today", label: "Leo" },
  { key: "week", label: "Wiki" },
  { key: "month", label: "Mwezi" },
];

export default function AdminRipotiPage() {
  const [period, setPeriod] = useState("month");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/reports/summary?period=${period}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [period]);

  return (
    <div>
      <div className="flex wrap gap-8 mb-16" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>Ripoti ya Faida na Hasara (P&amp;L)</h2>
        <div className="flex gap-8">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              className={`btn btn-sm ${period === p.key ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setPeriod(p.key)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading || !data ? (
        <p className="muted">Inapakia...</p>
      ) : (
        <>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="value"><CountUp value={data.totalRevenue} suffix=" TZS" /></div>
              <div className="label">Jumla ya Mapato (Mauzo)</div>
            </div>
            <div className="stat-card">
              <div className="value"><CountUp value={data.totalExpenses} suffix=" TZS" /></div>
              <div className="label">Jumla ya Matumizi ya Biashara</div>
            </div>
            <div className="stat-card" style={{ borderTopColor: data.netProfit >= 0 ? "var(--success)" : "var(--danger)" }}>
              <div className="value"><CountUp value={data.netProfit} suffix=" TZS" /></div>
              <div className="label">Faida Halisi ya Biashara</div>
            </div>
            <div className="stat-card">
              <div className="value"><CountUp value={data.totalCost} suffix=" TZS" /></div>
              <div className="label">Malighafi za Mauzo</div>
            </div>
          </div>

          <div className="card" style={{ padding: 18 }}>
            <h3>Hesabu ya P&amp;L</h3>
            <table>
              <tbody>
                <tr><td>Jumla ya Mapato (mauzo ya bidhaa + huduma)</td><td>{data.totalRevenue.toLocaleString("sw-TZ")} TZS</td></tr>
                <tr><td>Toa: Malighafi za Mauzo</td><td>− {data.totalCost.toLocaleString("sw-TZ")} TZS</td></tr>
                <tr><td><strong>= Faida ya Mauzo</strong></td><td><strong>{data.totalProfit.toLocaleString("sw-TZ")} TZS</strong></td></tr>
                <tr><td>Toa: Matumizi ya Biashara (umeme, kodi, n.k)</td><td>− {data.totalExpenses.toLocaleString("sw-TZ")} TZS</td></tr>
                <tr>
                  <td><strong>= Faida Halisi ya Biashara</strong></td>
                  <td><strong style={{ color: data.netProfit >= 0 ? "var(--success)" : "var(--danger)" }}>
                    {data.netProfit.toLocaleString("sw-TZ")} TZS
                  </strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
