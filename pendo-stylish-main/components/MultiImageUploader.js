"use client";
import { useRef, useState } from "react";

/**
 * Kuruhusu admin kupakia picha ZAIDI YA MOJA kwa bidhaa moja.
 * value = array ya URL (mfano ["/uploads/bidhaa/x.webp", ...]) - picha ya kwanza
 * kwenye array ndiyo "picha kuu" inayotumika sehemu zinazohitaji picha 1 tu.
 */
export default function MultiImageUploader({ value = [], onChange, kind = "product", subfolder = "bidhaa", label, max = 8 }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFiles(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setError("");

    const room = max - value.length;
    if (room <= 0) {
      setError(`Umefikia idadi ya juu ya picha (${max}).`);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    const toUpload = files.slice(0, room);
    setUploading(true);
    const uploaded = [];
    try {
      for (const file of toUpload) {
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
          setError("Tafadhali chagua picha za JPG, PNG au WebP pekee.");
          continue;
        }
        if (file.size > 12 * 1024 * 1024) {
          setError("Picha moja au zaidi ni kubwa mno (upeo 12MB).");
          continue;
        }
        const formData = new FormData();
        formData.append("file", file);
        formData.append("kind", kind);
        formData.append("subfolder", subfolder);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Imeshindwa kupakia picha moja.");
          continue;
        }
        uploaded.push(data.url);
      }
      if (uploaded.length) onChange([...value, ...uploaded]);
    } catch {
      setError("Hitilafu ya mtandao. Hakikisha intaneti yako ipo kisha jaribu tena.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeAt(idx) {
    const next = value.filter((_, i) => i !== idx);
    onChange(next);
  }

  function moveToFront(idx) {
    if (idx === 0) return;
    const next = [...value];
    const [item] = next.splice(idx, 1);
    next.unshift(item);
    onChange(next);
  }

  return (
    <div className="form-group">
      <label>{label || "Picha za Bidhaa"} ({value.length}/{max})</label>
      <p className="small muted" style={{ marginTop: -4, marginBottom: 8 }}>
        Picha ya kwanza (yenye alama "Kuu") ndiyo itakayoonekana kwanza. Bonyeza picha kuifanya ya kwanza.
      </p>

      {value.length > 0 && (
        <div className="multi-image-grid">
          {value.map((url, i) => (
            <div key={url + i} className="multi-image-thumb">
              <img src={url} alt={`Picha ${i + 1}`} onClick={() => moveToFront(i)} />
              {i === 0 && <span className="multi-image-main-tag">Kuu</span>}
              <button type="button" className="multi-image-remove" onClick={() => removeAt(i)} aria-label="Ondoa picha">
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {value.length < max && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleFiles}
            disabled={uploading}
          />
          {uploading && <p className="small muted mt-8">Inapakia na kubana picha...</p>}
        </>
      )}
      {error && <div className="alert alert-error mt-8">{error}</div>}
    </div>
  );
}
