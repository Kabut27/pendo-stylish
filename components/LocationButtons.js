// components/LocationButtons.js
// Kitufe kimoja chenye chaguo mbili: Bolt (deep link ya "universal link" - hufungua
// app kama imewekwa, la sivyo hupeleka kwenye ukurasa wa kupakua) na Google Maps
// (njia ya uhakika ya ziada, inafanya kazi kila mahali bila kushindwa).

export default function LocationButtons({ latitude, longitude, address }) {
  const lat = latitude || "-7.7690";
  const lng = longitude || "35.6910";

  // Bolt "universal link" - hufungua app ya Bolt ikiwa imewekwa ikiwa na eneo
  // la kuelekea limejazwa tayari; kama app haipo, simu inapeleka kwenye ukurasa wa Bolt.
  const boltUrl = `https://link.bolt.eu/ride?dropoff[latitude]=${lat}&dropoff[longitude]=${lng}${
    address ? `&dropoff[description]=${encodeURIComponent(address)}` : ""
  }`;

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <div>
      <p className="small muted mb-8">Tuone Ramani / Tufikie</p>
      <div className="flex gap-12 wrap center" style={{ justifyContent: "center" }}>
        <a href={boltUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
          🚗 Fungua Bolt
        </a>
        <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
          🗺️ Fungua Google Maps
        </a>
      </div>
    </div>
  );
}
