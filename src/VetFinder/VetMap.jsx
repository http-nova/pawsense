import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { useState } from "react";
import "leaflet/dist/leaflet.css";
import "./VetMap.css";

function VetMap() {
  const [pincode, setPincode] = useState("");
  const [location, setLocation] = useState(null);
  const [vets, setVets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchByPincode = async () => {
    if (!/^\d{6}$/.test(pincode)) {
      setError("Enter a valid 6-digit pincode");
      return;
    }

    setLoading(true);
    setError("");
    setVets([]);
    setLocation(null);

    try {
      /* ===== PINCODE → LAT/LON ===== */
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?postalcode=${pincode}&country=India&format=json`,
        {
          headers: {
            "User-Agent": "PawSense/1.0 (contact:pawsensemain@gmail.com)",
          },
        }
      );

      const geoData = await geoRes.json();
      if (!geoData.length) throw new Error("Location not found");

      const lat = parseFloat(geoData[0].lat);
      const lon = parseFloat(geoData[0].lon);
      setLocation([lat, lon]);

      /* ===== OVERPASS (GET – BROWSER SAFE) ===== */
      const query = `
        [out:json][timeout:25];
        node["amenity"="veterinary"](around:6000,${lat},${lon});
        out;
      `;

      const overpassUrl =
        "https://overpass-api.de/api/interpreter?data=" +
        encodeURIComponent(query);

      const vetRes = await fetch(overpassUrl);
      if (!vetRes.ok) throw new Error("Overpass failed");

      const vetData = await vetRes.json();
      if (!vetData.elements.length) {
        setError("No veterinary clinics found nearby");
        setLoading(false);
        return;
      }

      setVets(vetData.elements.slice(0, 4));
    } catch (err) {
      console.error(err);
      setError("Unable to fetch vet clinics. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="vet-section">
      {/* ===== MAP BOX ===== */}
      <div className="map-box">
        {/* SEARCH BAR ON TOP */}
        <div className="map-search">
          <input
            type="text"
            placeholder="Enter Pincode"
            maxLength={6}
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
          />
          <button onClick={searchByPincode}>Search</button>
        </div>

        {/* MAP */}
        {location && (
          <MapContainer
            center={location}
            zoom={13}
            className="vet-map"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* User location */}
            <Marker position={location} />

            {/* Vet markers */}
            {vets.map((vet) => (
              <Marker
                key={vet.id}
                position={[vet.lat, vet.lon]}
              />
            ))}
          </MapContainer>
        )}

        {!location && !loading && (
          <div className="map-placeholder">
            Enter a pincode to find nearby vet clinics 🐾
          </div>
        )}
      </div>

      {loading && <p className="loading-text">Searching nearby vets…</p>}
      {error && <p className="error-text">{error}</p>}

      {/* ===== VET CARDS ===== */}
      {vets.length > 0 && (
        <div className="vet-cards">
          {vets.map((vet) => (
            <div className="vet-card" key={vet.id}>
              <div className="vet-info">
                <h4>{vet.tags?.name || "Veterinary Clinic"}</h4>
                <p>
                  {vet.tags?.["addr:street"] ||
                    vet.tags?.["addr:city"] ||
                    "Address not available"}
                </p>
              </div>

              <button
                onClick={() =>
                  window.open(
                    `https://www.openstreetmap.org/directions?to=${vet.lat},${vet.lon}`,
                    "_blank"
                  )
                }
              >
                Directions
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default VetMap;
