"use client";
import { useEffect, useState } from "react";
import ImageUploader from "@/components/ImageUploader";

const EMPTY = {
  full_name: "",
  username: "",
  password: "",
  phone: "",
  skillsText: "",
  profile_image: "",
  role: "staff",
};

export default function AdminWafanyakaziPage() {
  const [staff, setStaff] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/staff");
    const data = await res.json();
    setStaff(data.staff || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(s) {
    setEditingId(s.id);
    setForm({
      full_name: s.full_name,
      username: s.username,
      password: "",
      phone: s.phone || "",
      skillsText: (s.skills || []).join(", "),
      profile_image: s.profile_image || "",
      role: s.role,
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

    if (!form.full_name.trim()) return setError("Jina kamili linahitajika.");
    if (!editingId && !form.username.trim()) return setError("Jina la kuingia linahitajika.");
    if (!editingId && !form.password) return setError("Weka password ya awali.");

    const skills = form.skillsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    setSaving(true);
    try {
      let res;
      if (editingId) {
        res = await fetch(`/api/staff/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            full_name: form.full_name.trim(),
            phone: form.phone.trim() || null,
            skills,
            profile_image: form.profile_image || null,
            password: form.password || undefined,
          }),
        });
      } else {
        res = await fetch("/api/staff", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            full_name: form.full_name.trim(),
            username: form.username.trim(),
            password: form.password,
            phone: form.phone.trim() || null,
            skills,
            profile_image: form.profile_image || null,
            role: form.role,
          }),
        });
      }
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Imeshindwa kuhifadhi.");
      } else {
        setSuccess(editingId ? "Taarifa za mfanyakazi zimesasishwa." : "Mfanyakazi ameongezwa.");
        resetForm();
        await load();
      }
    } catch {
      setError("Hitilafu ya mtandao.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(s) {
    const verb = s.active ? "kuzima" : "kuwasha";
    if (!confirm(`Una uhakika unataka ${verb} akaunti ya ${s.full_name}?`)) return;
    const res = await fetch(`/api/staff/${s.id}`, {
      method: s.active ? "DELETE" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: s.active ? undefined : JSON.stringify({ full_name: s.full_name, phone: s.phone, skills: s.skills, active: true }),
    });
    if (res.ok) await load();
    else alert((await res.json()).error || "Imeshindwa.");
  }

  return (
    <div>
      <h2>Usimamizi wa Wafanyakazi</h2>

      <div className="card" style={{ padding: 18, marginBottom: 24, maxWidth: 520 }}>
        <h3>{editingId ? "Hariri Mfanyakazi" : "Ongeza Mfanyakazi Mpya"}</h3>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Jina Kamili</label>
            <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
          </div>
          {!editingId && (
            <div className="form-row">
              <div className="form-group">
                <label>Jina la Kuingia (username)</label>
                <input
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase() })}
                  placeholder="mfano: neema"
                  required
                />
              </div>
              <div className="form-group">
                <label>Aina ya Akaunti</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="staff">Mfanyakazi</option>
                  <option value="admin">Mmiliki/Msimamizi</option>
                </select>
              </div>
            </div>
          )}
          <div className="form-group">
            <label>{editingId ? "Password Mpya (acha wazi kama hutaki kubadilisha)" : "Password ya Awali"}</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Angalau herufi 8, herufi kubwa+ndogo+namba"
              required={!editingId}
            />
          </div>
          <div className="form-group">
            <label>Namba ya Simu</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0700 000 000" />
          </div>
          <div className="form-group">
            <label>Ujuzi (tenganisha kwa koma)</label>
            <input
              value={form.skillsText}
              onChange={(e) => setForm({ ...form, skillsText: e.target.value })}
              placeholder="Nywele, Kucha, Braids"
            />
          </div>
          <ImageUploader
            value={form.profile_image}
            onChange={(url) => setForm({ ...form, profile_image: url })}
            kind="profile"
            subfolder="wafanyakazi"
            label="Picha ya Profaili"
          />
          <div className="flex gap-8">
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? "Inahifadhi..." : editingId ? "Hifadhi Mabadiliko" : "Ongeza Mfanyakazi"}
            </button>
            {editingId && (
              <button type="button" className="btn btn-secondary" onClick={resetForm}>Ghairi</button>
            )}
          </div>
        </form>
      </div>

      <h3>Wafanyakazi Wote ({staff.length})</h3>
      {loading ? (
        <p className="muted">Inapakia...</p>
      ) : (
        <>
          <span className="scroll-hint">↔️ Sogeza kando kuona safu zote</span>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Picha</th>
                  <th>Jina</th>
                  <th>Aina</th>
                  <th>Ujuzi</th>
                  <th>Hali</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {staff.map((s) => (
                  <tr key={s.id}>
                    <td>
                      {s.profile_image ? (
                        <img src={s.profile_image} alt={s.full_name} style={{ width: 40, height: 40, objectFit: "cover", borderRadius: "50%" }} />
                      ) : "—"}
                    </td>
                    <td>{s.full_name}<br /><span className="small muted">@{s.username}</span></td>
                    <td>{s.role === "admin" ? "Msimamizi" : "Mfanyakazi"}</td>
                    <td className="small">{(s.skills || []).join(", ") || "—"}</td>
                    <td>
                      <span className={`pill ${s.active ? "pill-on" : "pill-off"}`}>
                        {s.active ? "Anafanya kazi" : "Amezimwa"}
                      </span>
                    </td>
                    <td className="flex gap-8">
                      <button className="btn btn-sm btn-secondary" onClick={() => startEdit(s)}>Hariri</button>
                      <button className="btn btn-sm btn-danger" onClick={() => toggleActive(s)}>
                        {s.active ? "Zima" : "Washa"}
                      </button>
                    </td>
                  </tr>
                ))}
                {staff.length === 0 && <tr><td colSpan={6} className="center muted">Hakuna wafanyakazi bado.</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
