// components/LocationButtons.js
// Kitufe kimoja chenye chaguo mbili: Bolt na Google Maps.
//
// Google Maps: link rasmi ya "dir/?api=1&destination=lat,lng" - inafanya
// kazi 100% ya wakati, popote, moja kwa moja.
//
// Bolt: Bolt HAITOI (publicly) deep link rasmi ya kuweka destination moja
// kwa moja - hilo linahitaji ushirikiano wa "Bolt for Business" (Ride
// Booker API). Njia bora tuliyonayo: tunanakili anwani kwenye clipboard
// KABLA ya kufungua Bolt, na tunaonyesha maelekezo WAZI ndani ya modal
// (siyo ujumbe mdogo unaopotea) ili mtumiaji ajue nini cha kufanya kwenye
// Bolt kabla hajaondoka ukurasa huu.

"use client";
import { useState } from "react";

export default function LocationButtons({ latitude, longitude, address }) {
  const [showModal, setShowModal] = useState(false);
  const [copyStatus, setCopyStatus] = useState("idle"); // idle | copied | failed

  const lat = latitude || "-7.7690";
  const lng = longitude || "35.6910";
  const fullAddress = address || `Pendo Stylish (${lat}, ${lng})`;

  const boltUrl = "https://bolt.eu/en-tz/rides/";
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  const openBoltModal = async () => {
    try {
      await navigator.clipboard.writeText(fullAddress);
      setCopyStatus("copied");
    } catch (err) {
      setCopyStatus("failed");
    }
    setShowModal(true);
  };

  const proceedToBolt = () => {
    window.open(boltUrl, "_blank", "noopener,noreferrer");
    setShowModal(false);
  };

  return (
    <div>
      <p className="small muted mb-8">Tuone Ramani / Tufikie</p>
      <div className="flex gap-12 wrap center" style={{ justifyContent: "center" }}>
        <button type="button" onClick={openBoltModal} className="btn btn-primary">
          🚗 Fungua Bolt
        </button>
        <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
          🗺️ Fungua Google Maps
        </a>
      </div>

      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setShowModal(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(0,0,0,0.55)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="card"
            style={{
              maxWidth: 380, width: "100%",
              background: "#fff", borderRadius: 16, padding: 24,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 8 }}>🚗</div>
            <h3 style={{ margin: "0 0 12px", color: "var(--purple-deep, #3b1057)" }}>
              Njia ya kufika kwa Bolt
            </h3>

            {copyStatus === "copied" ? (
              <p className="small" style={{ marginBottom: 16 }}>
                ✅ Anwani imenakiliwa: <strong>{fullAddress}</strong>
              </p>
            ) : (
              <p className="small" style={{ marginBottom: 16, color: "#b3261e" }}>
                ⚠️ Imeshindwa kunakili moja kwa moja. Anwani yetu ni: <strong>{fullAddress}</strong> — iandike mwenyewe.
              </p>
            )}

            <ol style={{ textAlign: "left", margin: "0 0 20px", paddingLeft: 20, lineHeight: 1.7 }}>
              <li>Bonyeza <strong>"Fungua Bolt Sasa"</strong> hapa chini</li>
              <li>Ndani ya Bolt, gusa sehemu ya <strong>"Where to?"</strong></li>
              <li>Bonyeza <strong>Paste</strong> (au bonyeza-shikilia na uchague "Paste")</li>
              <li>Chagua anwani, thibitisha safari</li>
            </ol>

            <div className="flex gap-12" style={{ justifyContent: "center" }}>
              <button type="button" onClick={proceedToBolt} className="btn btn-primary">
                Fungua Bolt Sasa
              </button>
              <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">
                Ghairi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
