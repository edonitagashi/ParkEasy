import React, { useMemo, useState, useEffect, useRef } from "react";
import { View, Text, Image, TouchableOpacity, Modal, StyleSheet, ActivityIndicator } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import useParkings from "../hooks/useParkings";
import useFavorites from "../hooks/useFavorites";
import WeatherScreen from "../../components/WeatherScreen";

const placeholderImage = require("../../assets/favicon.png");

export default function Nearby() {
  const router = useRouter();
  const { parkings, loading, error } = useParkings();
  const { favorites, toggleFavorite } = useFavorites();

  const [selectedParking, setSelectedParking] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [weatherVisible, setWeatherVisible] = useState(false);

  const [userLocation, setUserLocation] = useState(null);

  const mapRef = useRef(null);

  // GET USER LOCATION
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        alert("Permission for location is required!");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setUserLocation(loc.coords);
    })();
  }, []);

  const filtered = useMemo(() => parkings || [], [parkings]);

  const openModal = (p) => {
    setSelectedParking(p);
    setModalVisible(true);

    if (mapRef.current && p.latitude && p.longitude) {
      mapRef.current.animateCamera({
        center: { latitude: p.latitude, longitude: p.longitude },
        zoom: 17,
        duration: 900,
      });
    }
  };

  const handleReserve = (parking) => {
    setModalVisible(false);
    setSelectedParking(null);
    router.push(`/BookParkingScreen?id=${parking.id}&name=${encodeURIComponent(parking.name || "")}`);
  };

  const getImageSrc = (p) => {
    if (!p) return placeholderImage;

    if (p.imageUrl?.startsWith("http")) {
      return { uri: p.imageUrl };
    }

    return placeholderImage;
  };

  if (loading || !userLocation) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2E7D6A" />
        <Text>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      
      {/* WEATHER BUTTON */}
      <TouchableOpacity
        onPress={() => setWeatherVisible(true)}
        style={styles.weatherBtn}
      >
        <Text style={{ color: "white", fontWeight: "600" }}>Weather</Text>
      </TouchableOpacity>

      {/* MAP */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.04,
          longitudeDelta: 0.04,
        }}
        showsUserLocation={true}
      >
        {filtered.map((p) => {
  const lat = Number(p.coordinate?.latitude ?? p.latitude);
  const lng = Number(p.coordinate?.longitude ?? p.longitude);

  // Skip invalid coordinates
  if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
    console.log("Invalid coordinate:", p);
    return null;
  }

  return (
    <Marker
      key={p.id}
      coordinate={{ latitude: lat, longitude: lng }}
      onPress={() => openModal(p)}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          overflow: "hidden",
          borderWidth: 2,
          borderColor: favorites?.includes(p.id) ? "#FFD166" : "white",
          backgroundColor: "white",
        }}
      >
        <Image
          source={getImageSrc(p)}
          style={{ width: "100%", height: "100%" }}
        />
      </View>
    </Marker>
  );
})}

      </MapView>

      {/* PARKING MODAL */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>

            <Text style={styles.modalTitle}>{selectedParking?.name}</Text>

            <Image source={getImageSrc(selectedParking)} style={styles.cardImage} />

            <Text style={styles.cardText}>{selectedParking?.address}</Text>
            <Text style={styles.cardText}>
              {selectedParking?.price} • {selectedParking?.spots} spots
            </Text>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                style={styles.reserveBtn}
                onPress={() => handleReserve(selectedParking)}
              >
                <Text style={styles.reserveText}>Reserve</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.favoriteBtn,
                  favorites?.includes(selectedParking?.id)
                    ? { backgroundColor: "#FFD166" }
                    : {},
                ]}
                onPress={() => toggleFavorite(selectedParking.id)}
              >
                <Text style={{ fontWeight: "700" }}>
                  {favorites?.includes(selectedParking?.id)
                    ? "★ Favorited"
                    : "☆ Add to favorites"}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeBtn}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

      {/* WEATHER MODAL */}
      <Modal visible={weatherVisible} transparent animationType="fade">
        <View style={styles.weatherOverlay}>
          <View style={styles.weatherContent}>
            <WeatherScreen />
            <TouchableOpacity
              onPress={() => setWeatherVisible(false)}
              style={styles.weatherCloseBtn}
            >
              <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  weatherBtn: {
    position: "absolute",
    zIndex: 999,
    top: 20,
    right: 20,
    backgroundColor: "#2E7D6A",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 18,
    width: "90%",
    maxWidth: 420,
  },

  modalTitle: { fontSize: 22, fontWeight: "700", textAlign: "center" },

  cardImage: {
    width: "100%",
    height: 160,
    borderRadius: 10,
    marginVertical: 10,
  },

  cardText: { marginVertical: 4, color: "#555" },

  reserveBtn: {
    flex: 1,
    padding: 12,
    backgroundColor: "#2E7D6A",
    borderRadius: 10,
    alignItems: "center",
  },
  reserveText: { color: "white", fontWeight: "700" },

  favoriteBtn: {
    flex: 1,
    padding: 12,
    backgroundColor: "white",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DDD",
    alignItems: "center",
  },

  closeBtn: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#b02a37",
    alignItems: "center",
  },
  closeText: { color: "white", fontWeight: "700" },

  weatherOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  weatherContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 20,
    width: "90%",
    maxWidth: 420,
  },

  weatherCloseBtn: {
    marginTop: 16,
    width: "100%",
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#b02a37",
    alignItems: "center",
  },
});
