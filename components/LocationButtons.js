// components/LocationButtons.js
// Kitufe kimoja chenye chaguo mbili: Bolt (deep link ya "universal link" - hufungua
// app kama imewekwa, la sivyo hupeleka kwenye ukurasa wa kupakua) na Google Maps
// (njia ya uhakika ya ziada, inafanya kazi kila mahali bila kushindwa).

export default function LocationButtons({ latitude, longitude, address }) {
  const lat = latitude || "-7.7690";
  const lng = longitude || "35.6910";

  // NOTE: Bolt (tofauti na Uber) hai-publish hadharani URL rasmi ya
  // "universal link" yenye dropoff[latitude]/dropoff[longitude]. Endpoint
  // "link.bolt.eu/ride" iliyokuwepo hapo awali haikuwepo kabisa upande wa
  // Bolt (ilirudisha 404 - ilikuwa link isiyo sahihi). Kwa usalama
  // tunaelekeza kwenye ukurasa halisi wa Bolt Tanzania - unafanya kazi kila
  // wakati (unamwomba mtumiaji apakue/afungue app), ijapokuwa haiwezi kujaza
  // eneo la kuelekea kiotomatiki bila akaunti ya "Bolt for Business"
  // (Ride Booker) yenye ufikiaji wa API.
  const boltUrl = "https://bolt.eu/en-tz/rides/";

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
