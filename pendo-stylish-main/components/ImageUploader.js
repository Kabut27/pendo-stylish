"use client";
import { useRef, useState } from "react";

/**
 * Mmiliki/mfanyakazi anachagua picha ya kawaida (JPG/PNG) - mfumo wenyewe
 * unaituma kwenye /api/upload ambako inabadilishwa kiotomatiki kuwa WebP
 * na kupunguzwa ukubwa (angalia lib/imageProcessing.js). Hauitaji kujua
 * chochote kuhusu WebP.
 */
export default function ImageUploader({ value, onChange, kind, subfolder, label }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Tafadhali chagua picha ya JPG, PNG au WebP.");
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      setError("Picha ni kubwa mno (upeo 12MB).");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", kind);
      formData.append("subfolder", subfolder);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Imeshindwa kupakia picha.");
      } else {
        onChange(data.url);
      }
    } catch {
      setError("Hitilafu ya mtandao. Hakikisha intaneti yako ipo kisha jaribu tena.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="form-group">
      <label>{label || "Picha"}</label>
      {value && (
        <div style={{ marginBottom: 8 }}>
          <img
            src={value}
            alt="Onyesho la picha"
            style={{ width: 110, height: 110, objectFit: "cover", borderRadius: 10 }}
          />
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} disabled={uploading} />
      {uploading && <p className="small muted mt-8">Inapakia na kubana picha...</p>}
      {error && <div className="alert alert-error mt-8">{error}</div>}
      {value && !uploading && (
        <button type="button" className="btn btn-sm btn-secondary mt-8" onClick={() => onChange("")}>
          Ondoa Picha
        </button>
      )}
    </div>
  );
}
