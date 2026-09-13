"use client";
import { useEffect, useState } from "react";
import ImageUploader from "@/components/ImageUploader";

const EMPTY = { before_image: "", after_image: "", description: "" };

export default function AdminGalleryPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/gallery?all=1");
    const data = await res.json();
    setItems(data.gallery || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!form.before_image || !form.after_image) {
      setError("Pakia picha zote mbili - Kabla na Baada.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Imeshindwa kuhifadhi.");
      else {
        setSuccess("Picha zimeongezwa kwenye Kabla na Baada.");
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
    if (!confirm("Una uhakika unataka kufuta picha hizi?")) return;
    const res = await fetch(`/api/gallery/${id}`, { method: "DELETE" });
    if (res.ok) await load();
    else alert((await res.json()).error || "Imeshindwa kufuta.");
  }

  return (
    <div>
      <h2>Kabla na Baada — Gallery</h2>

      <div className="card" style={{ padding: 18, marginBottom: 24, maxWidth: 560 }}>
        <h3>Ongeza Picha Mpya</h3>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <ImageUploader
              value={form.before_image}
              onChange={(url) => setForm({ ...form, before_image: url })}
              kind="gallery"
              subfolder="gallery"
              label="Picha ya Kabla"
            />
            <ImageUploader
              value={form.after_image}
              onChange={(url) => setForm({ ...form, after_image: url })}
              kind="gallery"
              subfolder="gallery"
              label="Picha ya Baada"
            />
          </div>
          <div className="form-group">
            <label>Maelezo (hiari)</label>
            <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? "Inahifadhi..." : "Ongeza"}
          </button>
        </form>
      </div>

      <h3>Picha Zote ({items.length})</h3>
      <div className="grid">
        {items.map((g) => (
          <div key={g.id} className="card">
            <div className="ba-card">
              <img src={g.before_image} alt="Kabla" />
              <img src={g.after_image} alt="Baada" />
            </div>
            <div className="card-body">
              {g.description && <p className="small muted mb-8">{g.description}</p>}
              <button className="btn btn-sm btn-danger" onClick={() => handleDelete(g.id)}>Futa</button>
            </div>
          </div>
        ))}
      </div>
      {!loading && items.length === 0 && <p className="muted">Hakuna picha bado.</p>}
    </div>
  );
}
