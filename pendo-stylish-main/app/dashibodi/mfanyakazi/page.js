"use client";
import { useEffect, useState } from "react";
import CountUp from "@/components/CountUp";

const EMPTY = { item_type: "huduma", item_name: "", service_detail: "", customer_name: "", revenue: "", cost: "", notes: "", staff_id: "" };

export default function StaffDashboardPage() {
  const [sales, setSales] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [me, setMe] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    // Server inarudisha: mauzo YAKO (uliyofanya) + mauzo ULIYOINGIZA kwa niaba ya mwenzako
    const res = await fetch("/api/sales");
    const data = await res.json();
    setSales(data.sales || []);
    setLoading(false);
  }

  async function loadStaff() {
    const res = await fetch("/api/staff");
    if (!res.ok) return;
    const data = await res.json();
    const list = data.staff || [];
    setStaffList(list);
  }

  useEffect(() => {
    load();
    loadStaff();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!form.item_name.trim()) return setError("Jaza jina la huduma/bidhaa.");
    const revenue = Number(form.revenue);
    if (Number.isNaN(revenue) || revenue < 0) return setError("Mapato si sahihi.");
    const cost = Number(form.cost) || 0;
    if (cost < 0) return setError("Matumizi si sahihi.");

    setSaving(true);
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_type: form.item_type,
          item_name: form.item_name.trim(),
          service_detail: form.service_detail.trim() || null,
          customer_name: form.customer_name.trim() || null,
          revenue,
          cost,
          notes: form.notes.trim() || null,
          staff_id: form.staff_id || undefined, // ukiacha wazi, huduma inahesabiwa umeifanya wewe
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Imeshindwa kuhifadhi.");
      } else {
        setSuccess("Mauzo yameingizwa kwa mafanikio.");
        setForm({ ...EMPTY, staff_id: form.staff_id });
        await load();
      }
    } catch {
      setError("Hitilafu ya mtandao. Hakikisha una intaneti kisha jaribu tena.");
    } finally {
      setSaving(false);
    }
  }

  const totalRevenue = sales.reduce((s, x) => s + Number(x.revenue), 0);
  const totalProfit = sales.reduce((s, x) => s + Number(x.profit), 0);
  const showStaffPicker = staffList.length > 1;

  return (
    <div>
      <h2>Ingiza Mauzo</h2>

      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(2,1fr)", maxWidth: 480 }}>
        <div className="stat-card">
          <div className="value"><CountUp value={totalRevenue} suffix=" TZS" /></div>
          <div className="label">Jumla ya Mapato</div>
        </div>
        <div className="stat-card">
          <div className="value"><CountUp value={totalProfit} suffix=" TZS" /></div>
          <div className="label">Jumla ya Faida</div>
        </div>
      </div>

      <div className="card" style={{ padding: 18, marginBottom: 24, maxWidth: 480 }}>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Aina</label>
            <select value={form.item_type} onChange={(e) => setForm({ ...form, item_type: e.target.value })}>
              <option value="huduma">Huduma</option>
              <option value="bidhaa">Bidhaa</option>
            </select>
          </div>

          {showStaffPicker && (
            <div className="form-group">
              <label>Aliyefanya Huduma</label>
              <select value={form.staff_id} onChange={(e) => setForm({ ...form, staff_id: e.target.value })}>
                <option value="">Mimi mwenyewe</option>
                {staffList.map((s) => (
                  <option key={s.id} value={s.id}>{s.full_name}</option>
                ))}
              </select>
              <p className="small muted" style={{ marginTop: 4 }}>
                Kama unaingiza mauzo kwa niaba ya mwenzako (mfano wewe ni keshia), chagua jina lake hapa.
              </p>
            </div>
          )}

          <div className="form-group">
            <label>Huduma/Bidhaa</label>
            <input value={form.item_name} onChange={(e) => setForm({ ...form, item_name: e.target.value })} required placeholder="Mfano: Kusuka, Nywele bandia..." />
          </div>

          {form.item_type === "huduma" && (
            <div className="form-group">
              <label>Maelezo Mahususi ya Huduma (hiari)</label>
              <input
                value={form.service_detail}
                onChange={(e) => setForm({ ...form, service_detail: e.target.value })}
                placeholder="Mfano: Aina ya nywele - Braids ndefu, Cornrows..."
              />
            </div>
          )}

          <div className="form-group">
            <label>Jina la Mteja (hiari)</label>
            <input value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Mapato (TZS)</label>
              <input type="number" min="0" value={form.revenue} onChange={(e) => setForm({ ...form, revenue: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Matumizi/Malighafi (TZS)</label>
              <input type="number" min="0" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label>Maelezo Mengine (hiari)</label>
            <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? "Inahifadhi..." : "Ingiza Mauzo"}
          </button>
        </form>
      </div>

      <h3>Historia ya Mauzo</h3>
      {loading ? (
        <p className="muted">Inapakia...</p>
      ) : (
        <table className={`tbl-cards ${showStaffPicker ? "tbl-history-staff" : "tbl-history"}`}>
          <thead>
            <tr><th>Tarehe</th><th>Kitu</th>{showStaffPicker && <th>Aliyefanya</th>}<th>Mapato</th><th>Matumizi</th><th>Faida</th></tr>
          </thead>
          <tbody>
            {sales.map((s) => (
              <tr key={s.id}>
                <td className="small">{new Date(s.sale_date).toLocaleDateString("sw-TZ")}</td>
                <td>
                  {s.item_name}
                  {s.service_detail ? <><br/><span className="small muted">{s.service_detail}</span></> : null}
                  {s.customer_name ? <><br/><span className="small muted">Mteja: {s.customer_name}</span></> : null}
                </td>
                {showStaffPicker && <td className="small">{s.staff_name}</td>}
                <td>{Number(s.revenue).toLocaleString("sw-TZ")}</td>
                <td>{Number(s.cost).toLocaleString("sw-TZ")}</td>
                <td>{Number(s.profit).toLocaleString("sw-TZ")}</td>
              </tr>
            ))}
            {sales.length === 0 && <tr><td colSpan={showStaffPicker ? 6 : 5} className="center muted">Bado hujaingiza mauzo yoyote.</td></tr>}
          </tbody>
        </table>
      )}
    </div>
  );
}
