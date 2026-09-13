"use client";
import { useState } from "react";

export default function AdminBackupPage() {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  async function handleDownload() {
    setError("");
    setDownloading(true);
    try {
      const res = await fetch("/api/backup");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Imeshindwa kutengeneza backup.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pendo-stylish-backup-${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError("Hitilafu ya mtandao. Jaribu tena.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div>
      <h2>Pakua Backup Kamili</h2>
      <p className="muted" style={{ maxWidth: 560 }}>
        Kitufe hiki kinakusanya <strong>kila kitu</strong> — database (bidhaa, huduma,
        wafanyakazi, mauzo, matumizi), picha zote, na maelekezo ya kurudisha (restore) —
        kwenye faili moja (ZIP) unayoweza kuhifadhi kwenye simu/kompyuta yako. Hii inakuwezesha
        kuhamisha mfumo kwenda server nyingine wakati wowote, bila kutegemea mtu wa IT.
      </p>
      {error && <div className="alert alert-error" style={{ maxWidth: 480 }}>{error}</div>}
      <button className="btn btn-primary" onClick={handleDownload} disabled={downloading}>
        {downloading ? "Inatengeneza Backup..." : "⬇️ Pakua Backup Kamili"}
      </button>

      <div className="card mt-24" style={{ padding: 18, maxWidth: 560 }}>
        <h3>Kumbuka</h3>
        <ul className="small muted">
          <li>Backup ya kiotomatiki (kila siku) pia inaendelea kuhifadhiwa nje ya VPS kama nakala ya dharura.</li>
          <li>Backup hii ya mkono ni ya ziada — ipakue mara kwa mara na uihifadhi mahali salama (Google Drive, email yako, n.k).</li>
          <li>Ndani ya ZIP kuna faili la README.txt lenye maelekezo kamili ya kurudisha kwenye server mpya.</li>
        </ul>
      </div>
    </div>
  );
}
