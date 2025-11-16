import React, { useMemo, useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import useParkings from "../hooks/useParkings";
import useFavorites from "../hooks/useFavorites";
import { resolveImage } from "../../components/images";
import { Ionicons } from "@expo/vector-icons";

import WeatherScreen from "../../components/WeatherScreen";

const placeholderImage = "/favicon.png"; 

function FlyToParking({ parking }) {
  const map = useMap();
  useEffect(() => {
    if (parking) {
      const lat = parking.coordinate?.latitude ?? parking.latitude;
      const lng = parking.coordinate?.longitude ?? parking.longitude;
      if (lat && lng) {
        map.flyTo([lat, lng], 17, { animate: true });
      }
    }
  }, [parking, map]);
  return null;
}

export default function NearbyWeb() {
  const router = useRouter();
  const { parkings, loading, error } = useParkings();
  const { favorites, toggleFavorite } = useFavorites();

  const [selectedParking, setSelectedParking] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

 
  const [weatherVisible, setWeatherVisible] = useState(false);

  const filtered = useMemo(() => parkings || [], [parkings]);

  const openModal = (p) => {
    setSelectedParking(p);
    setModalVisible(true);
  };

  const handleReserve = (parking) => {
    setModalVisible(false);
    setSelectedParking(null);
    router.push(`/BookParkingScreen?id=${parking.id}&name=${encodeURIComponent(parking.name || "")}`);
  };

  const getImageSrc = (p) => {
    if (!p) return placeholderImage;
    if (p.imageUrl && (p.imageUrl.startsWith("http://") || p.imageUrl.startsWith("https://"))) return p.imageUrl;

    try {
      const resolved = resolveImage(p.image || p.imageUrl);
      if (!resolved) return placeholderImage;
      if (typeof resolved === "object" && resolved.uri) return resolved.uri;
      if (typeof resolved === "string") return resolved;
      if (typeof resolved === "object" && resolved.default) return resolved.default;
      return placeholderImage;
    } catch (e) {
      return placeholderImage;
    }
  };

  const makeMarkerIconHtml = (imgSrc, isFav) => {
    const safeSrc = imgSrc || placeholderImage;
    const borderColor = isFav ? "#FFD166" : "#fff";
    return `
      <div style="
        width:36px;
        height:36px;
        border-radius:50%;
        overflow:hidden;
        border:2px solid ${borderColor};
        box-shadow:0 2px 6px rgba(0,0,0,0.25);
        display:flex;
        align-items:center;
        justify-content:center;
      ">
        <img src="${safeSrc}" style="width:100%;height:100%;object-fit:cover" />
      </div>
    `;
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}><h2 style={styles.title}>Nearby Parkings</h2></div>
        <div style={styles.center}><p>Loading parkings...</p></div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.header}><h2 style={styles.title}>Nearby Parkings</h2></div>
        <div style={styles.center}><p style={{ color: "red" }}>Failed to load parkings.</p></div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <button
        onClick={() => setWeatherVisible(true)}
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          zIndex: 2000,
          backgroundColor: "#2E7D6A",
          color: "white",
          padding: "10px 14px",
          borderRadius: 10,
          border: "none",
          cursor: "pointer",
          fontWeight: "600"
        }}
      >
        Weather
      </button>

      <div style={styles.mapWrapper}>
        <MapContainer
          center={[42.6629, 21.1655]}
          zoom={13}
          style={styles.map}
          scrollWheelZoom={true}   
          dragging={true}          
          doubleClickZoom={true}   
          zoomControl={true}       
          touchZoom={true}         
          tap={true}              
          keyboard={true}   
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {filtered.map((p) => {
            const lat = p.coordinate?.latitude ?? p.latitude;
            const lng = p.coordinate?.longitude ?? p.longitude;
            if (!lat || !lng) return null;
            const imgSrc = getImageSrc(p);
            const isFav = favorites?.includes?.(p.id);
            const icon = L.divIcon({
              className: "custom_marker",
              html: makeMarkerIconHtml(imgSrc, isFav),
              iconSize: [36, 36],
              iconAnchor: [18, 36],
            });

            return (
              <Marker
                key={p.id}
                position={[lat, lng]}
                icon={icon}
                eventHandlers={{ click: () => openModal(p) }}
              />
            );
          })}

          <FlyToParking parking={selectedParking} />
        </MapContainer>
      </div>

      {modalVisible && selectedParking && (
        <div style={styles.webModalOverlay}>
          <div style={styles.webModalContent}>
            <div style={styles.webHeaderOnlyTitle}><h2 style={styles.webTitle}>{selectedParking.name}</h2></div>

            <div style={styles.card}>
              <img src={getImageSrc(selectedParking)} alt="parking" style={styles.cardImage} />
              <div style={styles.cardBody}>
                <h3 style={{ margin: 0 }}>{selectedParking.name}</h3>
                <p style={{ margin: "6px 0" }}>{selectedParking.address}</p>
                <p style={{ margin: "6px 0", color: "#555" }}>{selectedParking.price ?? ""} • {selectedParking.spots ?? "—"} spots</p>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                style={styles.webReserveButton}
                onClick={() => handleReserve(selectedParking)}
              >
                Reserve
              </button>

              <button
                style={{
                  ...styles.webReserveButton,
                  backgroundColor: favorites?.includes(selectedParking.id) ? "#FFD166" : "#fff",
                  color: favorites?.includes(selectedParking.id) ? "#1B1B1B" : "#000",
                  border: "1px solid #DDD"
                }}
                onClick={() => toggleFavorite(selectedParking.id)}
              >
                {favorites?.includes(selectedParking.id) ? "★ Favorited" : "☆ Add to favorites"}
              </button>
            </div>

            <button style={styles.webCloseButton} onClick={() => setModalVisible(false)}>Close</button>
          </div>
        </div>
      )}

      
      {weatherVisible && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999
        }}>
          <div style={{
            background: "white",
            padding: 20,
            borderRadius: 20,
            width: "90%",
            maxWidth: 420
          }}>
            <WeatherScreen />
            <button
              onClick={() => setWeatherVisible(false)}
              style={{
                marginTop: 16,
                width: "100%",
                padding: 12,
                borderRadius: 10,
                border: "none",
                backgroundColor: "#b02a37",
                color: "white",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: 16
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { width: "100%", height: "100vh", position: "relative", fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, Arial" },
  mapWrapper: { position: "absolute", inset: 0, width: "100%", height: "100vh" },
  map: { width: "100%", height: "100%" },
  webModalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 },
  webModalContent: { backgroundColor: "white", padding: 20, borderRadius: 18, width: "90%", maxWidth: 420, boxShadow: "0 8px 30px rgba(0,0,0,0.2)" },
  webHeaderOnlyTitle: { display: "flex", justifyContent: "center", marginBottom: 10 },
  webTitle: { fontSize: 22, fontWeight: "700", margin: 0 },
  webCloseButton: { marginTop: 12, width: "100%", padding: 12, borderRadius: 10, border: "none", backgroundColor: "#b02a37", color: "white", fontWeight: "700", cursor: "pointer", fontSize: 16 },
  webReserveButton: { marginTop: 12, padding: 12, borderRadius: 10, border: "none", backgroundColor: "#2E7D6A", color: "white", fontWeight: "700", cursor: "pointer", fontSize: 16, minWidth: 120 },
  card: { display: "flex", gap: 12, alignItems: "center", marginTop: 8, marginBottom: 10 },
  cardImage: { width: "100%", height: 160, objectFit: "cover", borderRadius: 10 },
  cardBody: { width: "100%" },
};
