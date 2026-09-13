"use client";
import { useRef, useState } from "react";

/**
 * Kuruhusu admin kupakia video FUPI ya bidhaa (hiari). Video haichakatwi -
 * inahifadhiwa kama ilivyo, kwa hiyo tunashauri video fupi (chini ya dakika 1) na ubora wa kawaida.
 */
export default function VideoUploader({ value, onChange, subfolder = "video", label }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");

    if (!["video/mp4", "video/webm", "video/quicktime"].includes(file.type)) {
      setError("Tafadhali chagua video ya MP4, WebM au MOV.");
      return;
    }
    if (file.size > 40 * 1024 * 1024) {
      setError("Video ni kubwa mno (upeo 40MB). Tumia video fupi/ubora wa kawaida.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", "video");
      formData.append("subfolder", subfolder);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Imeshindwa kupakia video.");
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
      <label>{label || "Video ya Bidhaa (hiari)"}</label>
      {value && (
        <div style={{ marginBottom: 8 }}>
          <video src={value} controls style={{ width: 180, borderRadius: 10 }} />
        </div>
      )}
      <input ref={inputRef} type="file" accept="video/mp4,video/webm,video/quicktime" onChange={handleFile} disabled={uploading} />
      {uploading && <p className="small muted mt-8">Inapakia video... (inaweza kuchukua muda)</p>}
      {error && <div className="alert alert-error mt-8">{error}</div>}
      {value && !uploading && (
        <button type="button" className="btn btn-sm btn-secondary mt-8" onClick={() => onChange("")}>
          Ondoa Video
        </button>
      )}
    </div>
  );
}
