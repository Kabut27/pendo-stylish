"use client";
import { useEffect, useState } from "react";

const CATEGORIES = ["Umeme", "Maji", "Kodi ya Jengo", "Mshahara", "Ununuzi wa Bidhaa", "Matengenezo", "Nyingine"];
const EMPTY = { category: CATEGORIES[0], amount: "", description: "" };

export default function AdminMatumiziPage() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/expenses");
    const data = await res.json();
    setExpenses(data.expenses || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    const amount = Number(form.amount);
    if (Number.isNaN(amount) || amount < 0) return setError("Kiasi si sahihi.");

    setSaving(true);
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: form.category,
          amount,
          description: form.description.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Imeshindwa kuhifadhi.");
      else {
        setSuccess("Tumizi limeongezwa.");
        setForm(EMPTY);
        await load();
      }
    } catch {
      setError("Hitilafu ya mtandao.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Una uhakika unataka kufuta tumizi hili?")) return;
    const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    if (res.ok) await load();
    else alert((await res.json()).error || "Imeshindwa kufuta.");
  }

  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div>
      <h2>Matumizi ya Biashara</h2>

      <div className="card" style={{ padding: 18, marginBottom: 24, maxWidth: 480 }}>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Aina ya Tumizi</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Kiasi (TZS)</label>
              <input type="number" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
            </div>
          </div>
          <div className="form-group">
            <label>Maelezo (hiari)</label>
            <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? "Inahifadhi..." : "Ongeza Tumizi"}
          </button>
        </form>
      </div>

      <h3>Matumizi Yote — Jumla: {total.toLocaleString("sw-TZ")} TZS</h3>
      {loading ? (
        <p className="muted">Inapakia...</p>
      ) : (
        <table>
          <thead>
            <tr><th>Tarehe</th><th>Aina</th><th>Maelezo</th><th>Kiasi</th><th></th></tr>
          </thead>
          <tbody>
            {expenses.map((ex) => (
              <tr key={ex.id}>
                <td className="small">{new Date(ex.expense_date).toLocaleDateString("sw-TZ")}</td>
                <td>{ex.category}</td>
                <td className="small muted">{ex.description || "—"}</td>
                <td>{Number(ex.amount).toLocaleString("sw-TZ")} TZS</td>
                <td><button className="btn btn-sm btn-danger" onClick={() => handleDelete(ex.id)}>Futa</button></td>
              </tr>
            ))}
            {expenses.length === 0 && <tr><td colSpan={5} className="center muted">Hakuna matumizi bado.</td></tr>}
          </tbody>
        </table>
      )}
    </div>
  );
}
