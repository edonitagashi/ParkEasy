import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { collection, getDocs } from "firebase/firestore";
 import { db } from "../firebase/firebase";

import ParkingCard from "../../components/ParkingCard";
import { useRouter } from "expo-router";
import { resolveImage } from "../../components/images";

export default function NearbyWeb() {
  const router = useRouter();

  const [parkings, setParkings] = useState([]);
  const [selectedParking, setSelectedParking] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const loadParkings = async () => {
      const snap = await getDocs(collection(db, "parkings"));
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setParkings(items);
    };
    loadParkings();
  }, []);

  const handleReserve = (parking) => {
    setModalVisible(false);
    setSelectedParking(null);

    setTimeout(() => {
      router.push(`/BookParkingScreen?id=${parking.id}`);
    }, 50);
  };

  const openModal = (p) => {
    setSelectedParking(p);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>

      {/* MAP */}
      <div style={styles.mapWrapper}>
        <MapContainer center={[42.6629, 21.1655]} zoom={13} style={styles.map}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {parkings.map((p) => {
            const resolved = resolveImage(p.imageUrl);
            const imageSrc =
              typeof resolved === "object" ? resolved.uri : resolved;

            if (!p.coordinate) return null;

            return (
              <Marker
                key={p.id}
                position={[p.coordinate.latitude, p.coordinate.longitude]}
                icon={L.divIcon({
                  className: "custom_marker",
                  html: `
                    <div style="
                      width: 36px;
                      height: 36px;
                      border-radius: 50%;
                      overflow: hidden;
                      border: 2px solid white;
                      box-shadow: 0 2px 5px rgba(0,0,0,0.25);
                    ">
                      <img src="${imageSrc}" style="
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                      "/>
                    </div>
                  `,
                  iconSize: [34, 34],
                  iconAnchor: [17, 17],
                })}
                eventHandlers={{ click: () => openModal(p) }}
              />
            );
          })}
        </MapContainer>
      </div>

      {/* WEB MODAL */}
      {modalVisible && selectedParking && (
        <div style={styles.webModalOverlay}>
          <div style={styles.webModalContent}>

            {/* TITLE ONLY (NO IMAGE HERE) */}
            <div style={styles.webHeaderOnlyTitle}>
              <h2 style={styles.webTitle}>{selectedParking.name}</h2>
            </div>

            {/* ParkingCard WITH IMAGE */}
            <ParkingCard
              item={selectedParking}
              hideReserve={false}
              onReserve={() => handleReserve(selectedParking)}
            />

            <button
              style={styles.webCloseButton}
              onClick={() => setModalVisible(false)}
            >
              Close
            </button>

          </div>
        </div>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100vh",
    position: "relative",
  },

  mapWrapper: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100vh",
  },

  map: {
    width: "100%",
    height: "100%",
  },

  webModalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },

  webModalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 18,
    width: "90%",
    maxWidth: 420,
  },

  webHeaderOnlyTitle: {
    display: "flex",
    justifyContent: "center",
    marginBottom: 10,
  },

  webTitle: {
    fontSize: 22,
    fontWeight: "bold",
    margin: 0,
  },

  webCloseButton: {
    marginTop: 15,
    width: "100%",
    padding: 12,
    borderRadius: 10,
    border: "none",
    backgroundColor: "#2E7D6A",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: 16,
  },

  custom_marker: {
    background: "transparent !important",
    border: "none !important",
  },
});