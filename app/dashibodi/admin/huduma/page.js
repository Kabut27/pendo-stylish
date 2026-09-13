"use client";
import { useEffect, useState } from "react";

const EMPTY = { name: "", price: "", description: "", active: true };

export default function AdminHudumaPage() {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/services?all=1");
    const data = await res.json();
    setServices(data.services || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(s) {
    setEditingId(s.id);
    setForm({ name: s.name, price: s.price, description: s.description || "", active: s.active });
    setError("");
    setSuccess("");
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!form.name.trim()) return setError("Jina la huduma linahitajika.");
    const priceNum = Number(form.price);
    if (Number.isNaN(priceNum) || priceNum < 0) return setError("Bei si sahihi.");

    setSaving(true);
    const payload = {
      name: form.name.trim(),
      price: priceNum,
      description: form.description.trim() || null,
      active: form.active,
    };
    try {
      const url = editingId ? `/api/services/${editingId}` : "/api/services";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Imeshindwa kuhifadhi.");
      else {
        setSuccess(editingId ? "Huduma imesasishwa." : "Huduma imeongezwa.");
        resetForm();
        await load();
      }
    } catch {
      setError("Hitilafu ya mtandao.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Una uhakika unataka kufuta huduma hii?")) return;
    const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
    if (res.ok) await load();
    else alert((await res.json()).error || "Imeshindwa kufuta.");
  }

  return (
    <div>
      <h2>Usimamizi wa Huduma</h2>
      <div className="card" style={{ padding: 18, marginBottom: 24, maxWidth: 480 }}>
        <h3>{editingId ? "Hariri Huduma" : "Ongeza Huduma Mpya"}</h3>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Jina la Huduma</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Bei (TZS)</label>
            <input type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Maelezo (hiari)</label>
            <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="flex gap-8" style={{ alignItems: "center" }}>
              <input type="checkbox" style={{ width: "auto" }} checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
              Ionyeshwe kwenye website
            </label>
          </div>
          <div className="flex gap-8">
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? "Inahifadhi..." : editingId ? "Hifadhi Mabadiliko" : "Ongeza Huduma"}
            </button>
            {editingId && <button type="button" className="btn btn-secondary" onClick={resetForm}>Ghairi</button>}
          </div>
        </form>
      </div>

      <h3>Huduma Zote ({services.length})</h3>
      {loading ? (
        <p className="muted">Inapakia...</p>
      ) : (
        <div className="table-wrap">
          <table className="tbl-cards tbl-services">
            <thead><tr><th>Jina</th><th>Bei</th><th>Hali</th><th></th></tr></thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{Number(s.price).toLocaleString("sw-TZ")} TZS</td>
                  <td><span className={`pill ${s.active ? "pill-on" : "pill-off"}`}>{s.active ? "Inaonekana" : "Imefichwa"}</span></td>
                  <td className="flex gap-8">
                    <button className="btn btn-sm btn-secondary" onClick={() => startEdit(s)}>Hariri</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(s.id)}>Futa</button>
                  </td>
                </tr>
              ))}
              {services.length === 0 && <tr><td colSpan={4} className="center muted">Hakuna huduma bado.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
