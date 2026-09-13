"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import CountUp from "@/components/CountUp";

const PERIODS = [
  { key: "today", label: "Leo" },
  { key: "week", label: "Wiki" },
  { key: "month", label: "Mwezi" },
  { key: "year", label: "Mwaka" },
];

export default function AdminOverviewPage() {
  const [period, setPeriod] = useState("week");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/reports/summary?period=${period}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, [period]);

  const maxTrend = data?.trend?.length
    ? Math.max(...data.trend.map((t) => Number(t.revenue)), 1)
    : 1;

  return (
    <div>
      <div className="flex wrap gap-8 mb-16" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>Muhtasari wa Biashara</h2>
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
              <div className="label">Jumla ya Mapato</div>
            </div>
            <div className="stat-card">
              <div className="value"><CountUp value={data.totalProfit} suffix=" TZS" /></div>
              <div className="label">Faida ya Mauzo</div>
            </div>
            <div className="stat-card">
              <div className="value"><CountUp value={data.salesCount} /></div>
              <div className="label">Idadi ya Mauzo</div>
            </div>
            <div className="stat-card">
              <div className="value"><CountUp value={data.staffCount} /></div>
              <div className="label">Wafanyakazi Wanaofanya Kazi</div>
            </div>
          </div>

          <div className="card" style={{ padding: 18, marginBottom: 24 }}>
            <h3>Mwenendo wa Mapato — Siku 14 Zilizopita</h3>
            <div className="bar-chart">
              {data.trend.map((t) => (
                <div
                  key={t.day}
                  className="bar"
                  style={{ height: `${Math.max((Number(t.revenue) / maxTrend) * 100, 2)}%` }}
                  title={`${t.day}: ${Number(t.revenue).toLocaleString("sw-TZ")} TZS`}
                />
              ))}
            </div>
            {data.trend.length === 0 && <p className="small muted">Hakuna data bado.</p>}
          </div>

          <div className="card" style={{ padding: 18 }}>
            <h3>Mauzo kwa Kila Mfanyakazi ({PERIODS.find((p) => p.key === period)?.label})</h3>
            <p className="small muted" style={{ marginTop: -8, marginBottom: 12 }}>
              Bonyeza jina la mfanyakazi kuona orodha kamili ya huduma/bidhaa alizofanya (si jumla tu).
            </p>
            <table>
              <thead>
                <tr>
                  <th>Mfanyakazi</th>
                  <th>Idadi</th>
                  <th>Mapato</th>
                  <th>Faida</th>
                </tr>
              </thead>
              <tbody>
                {data.byStaff.map((s) => (
                  <tr key={s.staff_id}>
                    <td>
                      <Link
                        href={`/dashibodi/admin/mauzo?staff_id=${s.staff_id}`}
                        style={{ color: "var(--purple)", fontWeight: 600, textDecoration: "underline" }}
                      >
                        {s.full_name}
                      </Link>
                    </td>
                    <td>{s.count}</td>
                    <td>{Number(s.revenue).toLocaleString("sw-TZ")} TZS</td>
                    <td>{Number(s.profit).toLocaleString("sw-TZ")} TZS</td>
                  </tr>
                ))}
                {data.byStaff.length === 0 && (
                  <tr><td colSpan={4} className="center muted">Hakuna wafanyakazi bado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
