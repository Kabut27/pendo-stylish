"use client";
import { useEffect, useState } from "react";
import MultiImageUploader from "@/components/MultiImageUploader";
import VideoUploader from "@/components/VideoUploader";

const EMPTY = { name: "", price: "", description: "", images: [], video_url: "", badge: "", active: true };

export default function AdminBidhaaPage() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/products?all=1");
    const data = await res.json();
    setProducts(data.products || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(p) {
    setEditingId(p.id);
    setForm({
      name: p.name,
      price: p.price,
      description: p.description || "",
      images: (p.images || []).map((img) => img.url),
      video_url: p.video_url || "",
      badge: p.badge || "",
      active: p.active,
    });
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Jina la bidhaa linahitajika.");
      return;
    }
    const priceNum = Number(form.price);
    if (Number.isNaN(priceNum) || priceNum < 0) {
      setError("Bei si sahihi.");
      return;
    }

    setSaving(true);
    const payload = {
      name: form.name.trim(),
      price: priceNum,
      description: form.description.trim() || null,
      images: form.images,
      video_url: form.video_url || null,
      badge: form.badge || null,
      active: form.active,
    };

    try {
      const url = editingId ? `/api/products/${editingId}` : "/api/products";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Imeshindwa kuhifadhi.");
      } else {
        setSuccess(editingId ? "Bidhaa imesasishwa (updated)." : "Bidhaa imeongezwa.");
        resetForm();
        await load();
      }
    } catch {
      setError("Hitilafu ya mtandao. Hakikisha una intaneti kisha jaribu tena.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Una uhakika unataka kufuta bidhaa hii? Hatua hii haiwezi kurudishwa.")) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      await load();
    } else {
      const data = await res.json();
      alert(data.error || "Imeshindwa kufuta.");
    }
  }

  return (
    <div>
      <h2>Usimamizi wa Bidhaa</h2>

      <div className="card" style={{ padding: 18, marginBottom: 24, maxWidth: 520 }}>
        <h3>{editingId ? "Hariri Bidhaa" : "Ongeza Bidhaa Mpya"}</h3>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Jina la Bidhaa</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Bei (TZS)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Alama (Badge)</label>
              <select value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })}>
                <option value="">Hakuna</option>
                <option value="mpya">Mpya</option>
                <option value="inayopendwa">Inayopendwa</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Maelezo</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <MultiImageUploader
            value={form.images}
            onChange={(images) => setForm({ ...form, images })}
            kind="product"
            subfolder="bidhaa"
            label="Picha za Bidhaa"
          />
          <VideoUploader
            value={form.video_url}
            onChange={(video_url) => setForm({ ...form, video_url })}
            subfolder="video"
            label="Video ya Bidhaa (hiari)"
          />
          <div className="form-group">
            <label className="flex gap-8" style={{ alignItems: "center" }}>
              <input
                type="checkbox"
                style={{ width: "auto" }}
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
              Ionyeshwe kwenye website (Active)
            </label>
          </div>
          <div className="flex gap-8">
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? "Inahifadhi..." : editingId ? "Hifadhi Mabadiliko" : "Ongeza Bidhaa"}
            </button>
            {editingId && (
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Ghairi
              </button>
            )}
          </div>
        </form>
      </div>

      <h3>Bidhaa Zote ({products.length})</h3>
      {loading ? (
        <p className="muted">Inapakia...</p>
      ) : (
        <>
          <span className="scroll-hint">↔️ Sogeza kando kuona safu zote</span>
          <div className="table-wrap">
            <table className="tbl-cards tbl-products">
          <thead>
            <tr>
              <th>Picha</th>
              <th>Jina</th>
              <th>Bei</th>
              <th>Hali</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>
                  {p.image_url ? (
                    <div style={{ position: "relative", width: 46, height: 46 }}>
                      <img src={p.image_url} alt={p.name} style={{ width: 46, height: 46, objectFit: "cover", borderRadius: 8 }} />
                      {p.images && p.images.length > 1 && (
                        <span
                          style={{
                            position: "absolute", bottom: -4, right: -4, background: "var(--purple)", color: "#fff",
                            fontSize: "0.6rem", borderRadius: "999px", padding: "1px 5px", fontWeight: 700,
                          }}
                        >
                          +{p.images.length - 1}
                        </span>
                      )}
                      {p.video_url && (
                        <span style={{ position: "absolute", top: -4, left: -4, fontSize: "0.75rem" }} title="Ina video">🎬</span>
                      )}
                    </div>
                  ) : (
                    "—"
                  )}
                </td>
                <td>{p.name}</td>
                <td>{Number(p.price).toLocaleString("sw-TZ")} TZS</td>
                <td>
                  <span className={`pill ${p.active ? "pill-on" : "pill-off"}`}>
                    {p.active ? "Inaonekana" : "Imefichwa"}
                  </span>
                </td>
                <td className="flex gap-8">
                  <button className="btn btn-sm btn-secondary" onClick={() => startEdit(p)}>Hariri</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p.id)}>Futa</button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={5} className="center muted">Hakuna bidhaa bado.</td></tr>
            )}
          </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
