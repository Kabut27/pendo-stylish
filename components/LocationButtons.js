// components/LocationButtons.js
// Kitufe kimoja tu: Google Maps (maelekezo/directions).
//
// Kwa nini Google Maps peke yake: link hii
// (https://www.google.com/maps/dir/?api=1&destination=lat,lng) ni
// "Universal Link" rasmi ya Google - kwenye simu yenye app ya Google Maps
// (Android AU iPhone), inafungua APP halisi moja kwa moja na maelekezo
// tayari yamejazwa. Kama app haipo, inafungua ukurasa wa wavuti wa ramani
// badala yake - haifanyi kazi ya "kushindwa" kamwe. Hii ndiyo sababu
// tuliondoa Bolt: Bolt hawana "universal link" rasmi ya aina hii kwa umma,
// kwa hiyo hawakuweza kutoa uzoefu sawa kwa watumiaji wa Android na iPhone.

export default function LocationButtons({ latitude, longitude, address }) {
  const lat = latitude || "-7.7690";
  const lng = longitude || "35.6910";

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <div>
      <p className="small muted mb-8">Tuone Ramani / Tufikie</p>
      <div className="flex gap-12 wrap center" style={{ justifyContent: "center" }}>
        <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
          🗺️ Fungua Google Maps
        </a>
      </div>
    </div>
  );
}
