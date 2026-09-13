"use client";
import { useEffect, useState } from "react";

const FIELDS = [
  { key: "business_name", label: "Jina la Biashara" },
  { key: "hero_tagline", label: "Kauli Mbiu (Ukurasa wa Mwanzo)" },
  { key: "announcement_text", label: "Tangazo la Juu (Announcement Bar)" },
  { key: "whatsapp_number", label: "Namba ya WhatsApp (mfano 255700000000)" },
  { key: "phone_number", label: "Namba ya Simu" },
  { key: "address_text", label: "Anwani" },
  { key: "latitude", label: "Latitude (eneo)" },
  { key: "longitude", label: "Longitude (eneo)" },
  { key: "instagram_salon_url", label: "Instagram - Saluni" },
  { key: "instagram_makeup_url", label: "Instagram - Makeup" },
  { key: "tiktok_url", label: "Kiungo cha TikTok" },
  { key: "loyalty_threshold", label: "Idadi ya Huduma kwa Zawadi ya Uaminifu" },
  { key: "loyalty_reward_text", label: "Maandishi ya Zawadi ya Uaminifu" },
];

export default function AdminMipangilioPage() {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        setForm(d.settings || {});
        setLoading(false);
      });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Imeshindwa kuhifadhi.");
      else {
        setForm(data.settings);
        setSuccess("Mipangilio imehifadhiwa.");
      }
    } catch {
      setError("Hitilafu ya mtandao.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="muted">Inapakia...</p>;

  return (
    <div>
      <h2>Mipangilio</h2>
      <p className="small muted mb-16">
        Badilisha taarifa hizi wakati wowote - zinaonekana kwenye website ya umma papo hapo.
      </p>
      <div className="card" style={{ padding: 18, maxWidth: 560 }}>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <form onSubmit={handleSubmit}>
          {FIELDS.map((f) => (
            <div className="form-group" key={f.key}>
              <label>{f.label}</label>
              <input
                value={form[f.key] || ""}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              />
            </div>
          ))}
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? "Inahifadhi..." : "Hifadhi Mipangilio"}
          </button>
        </form>
      </div>
    </div>
  );
}
