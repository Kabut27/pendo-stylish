// components/LocationButtons.js
// Kitufe kimoja chenye chaguo mbili: Bolt na Google Maps.
//
// Google Maps: inatumia link rasmi ya "dir/?api=1&destination=lat,lng" -
// hii ni API rasmi ya Google na inafanya kazi 100% ya wakati, popote.
//
// Bolt: Bolt HAITOI (publicly) deep link rasmi ya kuweka destination moja
// kwa moja - hilo ni jambo linalohitaji ushirikiano wa "Bolt for Business"
// (Ride Booker API), si kitu ambacho tovuti ya kawaida inaweza kufanya.
// Njia bora tuliyonayo bila API hiyo: tunanakili (copy) anwani kwenye
// clipboard ya mtumiaji kabla ya kufungua Bolt, ili aweze ku-"paste"
// moja kwa moja kwenye sehemu ya "Where to?" ndani ya Bolt - mguso mmoja
// badala ya kuandika anwani kwa mkono kutoka mwanzo.

"use client";
import { useState } from "react";

export default function LocationButtons({ latitude, longitude, address }) {
  const [copied, setCopied] = useState(false);
  const lat = latitude || "-7.7690";
  const lng = longitude || "35.6910";
  const fullAddress = address || `Pendo Stylish (${lat}, ${lng})`;

  const boltUrl = "https://bolt.eu/en-tz/rides/";
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  const handleBoltClick = async (e) => {
    try {
      await navigator.clipboard.writeText(fullAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 4000);
    } catch (err) {
      // Kama clipboard haifanyi kazi (kivinjari cha zamani), acha tu
      // kifungue Bolt kama kawaida bila kunakili - haizuii kitufe.
    }
  };

  return (
    <div>
      <p className="small muted mb-8">Tuone Ramani / Tufikie</p>
      <div className="flex gap-12 wrap center" style={{ justifyContent: "center" }}>
        <a
          href={boltUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
          onClick={handleBoltClick}
        >
          🚗 Fungua Bolt
        </a>
        <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
          🗺️ Fungua Google Maps
        </a>
      </div>
      {copied && (
        <p className="small" style={{ marginTop: 8, color: "var(--gold)", textAlign: "center" }}>
          ✅ Anwani imenakiliwa - bandika (paste) kwenye "Where to?" ndani ya Bolt
        </p>
      )}
    </div>
  );
}
