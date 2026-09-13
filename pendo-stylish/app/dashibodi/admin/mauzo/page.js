"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const EMPTY = { staff_id: "", item_type: "huduma", item_name: "", service_detail: "", customer_name: "", revenue: "", cost: "", notes: "" };

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function monthStr() {
  return new Date().toISOString().slice(0, 7);
}
const EMPTY_LOCK = { lock_type: "day", period_value: todayStr() };

export default function AdminMauzoPage() {
  return (
    <Suspense fallback={<p className="muted">Inapakia...</p>}>
      <AdminMauzoContent />
    </Suspense>
  );
}

function AdminMauzoContent() {
  const searchParams = useSearchParams();
  const initialStaffId = searchParams.get("staff_id") || "";

  const [sales, setSales] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [filterStaff, setFilterStaff] = useState(initialStaffId);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [locks, setLocks] = useState([]);
  const [lockForm, setLockForm] = useState(EMPTY_LOCK);
  const [lockError, setLockError] = useState("");
  const [lockSaving, setLockSaving] = useState(false);

  async function loadStaff() {
    const res = await fetch("/api/staff");
    const data = await res.json();
    setStaffList((data.staff || []).filter((s) => s.active));
  }

  async function loadSales(staffId = filterStaff) {
    setLoading(true);
    const qs = staffId ? `?staff_id=${staffId}` : "";
    const res = await fetch(`/api/sales${qs}`);
    const data = await res.json();
    setSales(data.sales || []);
    setLoading(false);
  }

  async function loadLocks() {
    const res = await fetch("/api/sale-locks");
    if (!res.ok) return;
    const data = await res.json();
    setLocks(data.locks || []);
  }

  useEffect(() => {
    loadStaff();
    loadSales(initialStaffId);
    loadLocks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredStaffName = staffList.find((s) => s.id === filterStaff)?.full_name;

  // Seti za kukagua haraka kama tarehe fulani ya mauzo imefungwa (siku au mwezi wake)
  const lockedDays = new Set(locks.filter((l) => l.lock_type === "day").map((l) => l.period_value));
  const lockedMonths = new Set(locks.filter((l) => l.lock_type === "month").map((l) => l.period_value));
  function isRowLocked(saleDateStr) {
    return lockedDays.has(saleDateStr) || lockedMonths.has(saleDateStr.slice(0, 7));
  }

  async function handleLockSubmit(e) {
    e.preventDefault();
    setLockError("");
    setLockSaving(true);
    try {
      const res = await fetch("/api/sale-locks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lockForm),
      });
      const data = await res.json();
      if (!res.ok) setLockError(data.error || "Imeshindwa kufunga.");
      else await loadLocks();
    } catch {
      setLockError("Hitilafu ya mtandao.");
    } finally {
      setLockSaving(false);
    }
  }

  async function handleUnlock(id) {
    if (!confirm("Ufungue kipindi hiki? Wafanyakazi wataweza kuhariri/kufuta mauzo yake tena.")) return;
    const res = await fetch(`/api/sale-locks/${id}`, { method: "DELETE" });
    if (res.ok) await loadLocks();
    else alert((await res.json()).error || "Imeshindwa kufungua.");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!form.staff_id) return setError("Chagua mfanyakazi.");
    if (!form.item_name.trim()) return setError("Jaza jina la huduma/bidhaa.");
    const revenue = Number(form.revenue);
    if (Number.isNaN(revenue) || revenue < 0) return setError("Mapato si sahihi.");

    setSaving(true);
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staff_id: form.staff_id,
          item_type: form.item_type,
          item_name: form.item_name.trim(),
          service_detail: form.service_detail.trim() || null,
          customer_name: form.customer_name.trim() || null,
          revenue,
          cost: Number(form.cost) || 0,
          notes: form.notes.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Imeshindwa kuhifadhi.");
      else {
        setSuccess("Mauzo yameingizwa.");
        setForm({ ...EMPTY, staff_id: form.staff_id });
        await loadSales();
      }
    } catch {
      setError("Hitilafu ya mtandao.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Una uhakika unataka kufuta mauzo haya?")) return;
    const res = await fetch(`/api/sales/${id}`, { method: "DELETE" });
    if (res.ok) await loadSales();
    else alert((await res.json()).error || "Imeshindwa kufuta.");
  }

  return (
    <div>
      <h2>Mauzo — Ingiza kwa Niaba ya Mfanyakazi</h2>

      <div className="card" style={{ padding: 18, marginBottom: 24, maxWidth: 560 }}>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Mfanyakazi Aliyefanya Huduma</label>
              <select value={form.staff_id} onChange={(e) => setForm({ ...form, staff_id: e.target.value })} required>
                <option value="">-- Chagua --</option>
                {staffList.map((s) => (
                  <option key={s.id} value={s.id}>{s.full_name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Aina</label>
              <select value={form.item_type} onChange={(e) => setForm({ ...form, item_type: e.target.value })}>
                <option value="huduma">Huduma</option>
                <option value="bidhaa">Bidhaa</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Jina la Huduma/Bidhaa</label>
            <input value={form.item_name} onChange={(e) => setForm({ ...form, item_name: e.target.value })} required />
          </div>
          {form.item_type === "huduma" && (
            <div className="form-group">
              <label>Maelezo Mahususi (hiari)</label>
              <input
                value={form.service_detail}
                onChange={(e) => setForm({ ...form, service_detail: e.target.value })}
                placeholder="Mfano: Aina ya nywele - Braids ndefu, Cornrows..."
              />
            </div>
          )}
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
            <label>Jina la Mteja (hiari)</label>
            <input value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} />
          </div>
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? "Inahifadhi..." : "Ingiza Mauzo"}
          </button>
        </form>
      </div>

      <div className="card" style={{ padding: 18, marginBottom: 24, maxWidth: 560 }}>
        <h3 style={{ marginTop: 0 }}>Kufunga Hesabu za Mauzo</h3>
        <p className="small muted" style={{ marginTop: -8 }}>
          Ukifunga siku au mwezi, wafanyakazi hawataweza tena kuhariri au kufuta mauzo ya kipindi
          hicho. Wewe (Admin) bado unaweza kufungua tena wakati wowote.
        </p>
        {lockError && <div className="alert alert-error">{lockError}</div>}
        <form onSubmit={handleLockSubmit} className="form-row" style={{ alignItems: "flex-end" }}>
          <div className="form-group">
            <label>Aina</label>
            <select
              value={lockForm.lock_type}
              onChange={(e) =>
                setLockForm({
                  lock_type: e.target.value,
                  period_value: e.target.value === "day" ? todayStr() : monthStr(),
                })
              }
            >
              <option value="day">Siku Maalum</option>
              <option value="month">Mwezi Mzima</option>
            </select>
          </div>
          <div className="form-group">
            <label>{lockForm.lock_type === "day" ? "Tarehe" : "Mwezi"}</label>
            <input
              type={lockForm.lock_type === "day" ? "date" : "month"}
              value={lockForm.period_value}
              onChange={(e) => setLockForm({ ...lockForm, period_value: e.target.value })}
              required
            />
          </div>
          <div className="form-group" style={{ flex: "0 0 auto" }}>
            <button className="btn btn-primary" type="submit" disabled={lockSaving}>
              {lockSaving ? "Inafunga..." : "🔒 Funga"}
            </button>
          </div>
        </form>

        {locks.length > 0 && (
          <table style={{ marginTop: 10 }}>
            <thead>
              <tr>
                <th>Kipindi</th>
                <th>Aina</th>
                <th>Alifunga</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {locks.map((l) => (
                <tr key={l.id}>
                  <td>{l.period_value}</td>
                  <td className="small muted">{l.lock_type === "day" ? "Siku" : "Mwezi"}</td>
                  <td className="small muted">{l.locked_by_name || "—"}</td>
                  <td>
                    <button className="btn btn-sm btn-secondary" onClick={() => handleUnlock(l.id)}>
                      🔓 Fungua
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex wrap gap-8 mb-16" style={{ alignItems: "center", justifyContent: "space-between" }}>
        <h3 style={{ margin: 0 }}>
          Historia ya Mauzo {filteredStaffName ? `— ${filteredStaffName}` : ""}
        </h3>
        <select
          value={filterStaff}
          onChange={(e) => {
            setFilterStaff(e.target.value);
            loadSales(e.target.value);
          }}
          style={{ maxWidth: 220 }}
        >
          <option value="">Wafanyakazi Wote</option>
          {staffList.map((s) => (
            <option key={s.id} value={s.id}>{s.full_name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="muted">Inapakia...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Tarehe</th>
              <th>Aliyefanya</th>
              <th>Kitu</th>
              <th>Mapato</th>
              <th>Matumizi</th>
              <th>Faida</th>
              <th>Aliyeingiza</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sales.map((s) => (
              <tr key={s.id}>
                <td className="small">
                  {new Date(s.sale_date).toLocaleDateString("sw-TZ")}
                  {isRowLocked(String(s.sale_date).slice(0, 10)) && (
                    <span title="Kipindi hiki kimefungwa kwa wafanyakazi" style={{ marginLeft: 4 }}>🔒</span>
                  )}
                </td>
                <td>{s.staff_name}</td>
                <td>
                  {s.item_name}
                  {s.service_detail ? <><br /><span className="small muted">{s.service_detail}</span></> : null}
                  {s.customer_name ? <><br /><span className="small muted">Mteja: {s.customer_name}</span></> : null}
                </td>
                <td>{Number(s.revenue).toLocaleString("sw-TZ")}</td>
                <td>{Number(s.cost).toLocaleString("sw-TZ")}</td>
                <td>{Number(s.profit).toLocaleString("sw-TZ")}</td>
                <td className="small muted">{s.entered_by_name || "—"}</td>
                <td>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(s.id)}>Futa</button>
                </td>
              </tr>
            ))}
            {sales.length === 0 && <tr><td colSpan={8} className="center muted">Hakuna mauzo bado.</td></tr>}
          </tbody>
        </table>
      )}
    </div>
  );
}
