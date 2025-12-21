import React, { useState, useEffect, useRef } from "react";
import theme from "../hooks/theme";
const { colors } = theme;
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Linking,
  Platform,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import useParkings from "../hooks/useParkings";
import useFavorites from "../hooks/useFavorites";
import { resolveImage } from "../../components/images";
import Icon from 'react-native-vector-icons/Ionicons';

const placeholderImage = require("../../assets/favicon.png");

const getDistanceFromLatLon = (lat1, lon1, lat2, lon2) => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distanceKm = R * c;
  const distanceMi = distanceKm * 0.621371;
  return distanceMi < 1 
    ? `${(distanceMi * 5280).toFixed(0)} ft` 
    : `${distanceMi.toFixed(1)} mi`;
};

const CustomMarker = React.memo(({ parking, onPress, available, userLocation }) => {
  const imageSource = parking.imageUrl || parking.image || parking.photoUri
    ? resolveImage(parking.imageUrl || parking.image || parking.photoUri) || placeholderImage
    : placeholderImage;

  const lat = parseFloat(parking.coordinate?.latitude ?? parking.latitude ?? 0);
  const lng = parseFloat(parking.coordinate?.longitude ?? parking.longitude ?? 0);
  if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) return null;

  const price = parking.price ? `$${parking.price}/hr` : "Free";
  const distance = userLocation 
    ? getDistanceFromLatLon(userLocation.latitude, userLocation.longitude, lat, lng)
    : null;

  return (
    <Marker coordinate={{ latitude: lat, longitude: lng }} onPress={() => onPress(parking)}>
      <View style={styles.markerOuter}>
        <View style={[
          styles.markerContainer,
          !available && styles.markerUnavailable 
        ]}>
          <Image source={imageSource} style={styles.markerImage} resizeMode="cover" />
        </View>

       
        <View style={styles.infoTag}>
          <Text style={styles.priceTagText}>{price}</Text>
          {distance && <Text style={styles.distanceText}>· {distance}</Text>}
        </View>
      </View>
    </Marker>
  );
});

export default function Nearby() {
  const router = useRouter();
  const { parkings, loading } = useParkings();
  const { favorites, toggleFavorite } = useFavorites();

  const [selectedParking, setSelectedParking] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(false);

  const mapRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLocationError(true);
          return;
        }
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setUserLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      } catch (error) {
        console.error("Location error:", error);
        setLocationError(true);
      }
    })();
  }, []);

  const centerOnUser = async () => {
    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      setUserLocation(coords);
      mapRef.current?.animateToRegion({
        ...coords,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 800);
    } catch (e) {}
  };

  const openModal = (parking) => {
    setSelectedParking(parking);
    setModalVisible(true);
  };

  const openDirections = (parking) => {
    const lat = parking.coordinate?.latitude ?? parking.latitude;
    const lng = parking.coordinate?.longitude ?? parking.longitude;
    const url = Platform.OS === 'ios'
      ? `maps://app?daddr=${lat},${lng}`
      : `geo:${lat},${lng}?q=${lat},${lng}`;
    Linking.openURL(url);
  };

  const handleReserve = (parking) => {
    setModalVisible(false);
    router.push(`/BookParkingScreen?id=${parking.id}&name=${encodeURIComponent(parking.name || "")}`);
  };

  const getImageSource = (parking) => {
    if (!parking) return placeholderImage;
    const imagePath = parking.imageUrl || parking.image || parking.photoUri;
    return imagePath ? resolveImage(imagePath) || placeholderImage : placeholderImage;
  };

  const isFavorite = (id) => favorites?.includes(id);
  const hasAvailableSpots = (spots) => {
    const num = parseInt(spots, 10);
    return !isNaN(num) && num > 0;
  };

  if (loading || (!userLocation && !locationError)) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D6A" />
        <Text style={styles.loadingText}>Finding parking nearby...</Text>
      </View>
    );
  }

  const initialRegion = userLocation
    ? { latitude: userLocation.latitude, longitude: userLocation.longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 }
    : { latitude: 37.78825, longitude: -122.4324, latitudeDelta: 0.05, longitudeDelta: 0.05 };

  return (
    <View style={styles.container}>
      
      <TouchableOpacity onPress={centerOnUser} style={styles.locateBtn} activeOpacity={0.8}>
        <Icon name="locate-outline" size={32} color="#2E7D6A" />
      </TouchableOpacity>


      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
        showsUserLocation={true}
        showsMyLocationButton={false}
        initialRegion={initialRegion}
      >
        {parkings?.map((p) => (
          <CustomMarker
            key={p.id}
            parking={p}
            onPress={openModal}
            available={hasAvailableSpots(p.spots)}
            userLocation={userLocation}
          />
        ))}
      </MapView>

    
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setModalVisible(false)} />
          <View style={styles.modalBottomSheet}>
            <View style={styles.sheetHandle} />
            {selectedParking && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalTitle}>{selectedParking.name || "Parking Spot"}</Text>
                <Image source={getImageSource(selectedParking)} style={styles.modalImage} resizeMode="cover" />

                <Text style={styles.modalAddress}>{selectedParking.address || "Address not available"}</Text>

                <View style={styles.infoRow}>
                  <View>
                    <Text style={styles.labelText}>Hourly Rate</Text>
                    <Text style={styles.priceText}>
                      {selectedParking.price ? `$${selectedParking.price}` : "Free"}
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.labelText}>Spots Available</Text>
                    <Text style={[styles.spotsText, { color: hasAvailableSpots(selectedParking.spots) ? "#2E7D6A" : "#e74c3c" }]}>
                      {selectedParking.spots || "0"}
                    </Text>
                  </View>
                </View>

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.reserveButton, !hasAvailableSpots(selectedParking.spots) && styles.reserveButtonDisabled]}
                    onPress={() => handleReserve(selectedParking)}
                    disabled={!hasAvailableSpots(selectedParking.spots)}
                  >
                    <Text style={styles.reserveButtonText}>
                      {hasAvailableSpots(selectedParking.spots) ? "Reserve Spot" : "Fully Booked"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, isFavorite(selectedParking.id) && styles.actionButtonActive]}
                    onPress={() => toggleFavorite(selectedParking.id)}
                  >
                    <Icon name={isFavorite(selectedParking.id) ? "heart" : "heart-outline"} size={24} color={isFavorite(selectedParking.id) ? "#fff" : "#666"} />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.directionsButton} onPress={() => openDirections(selectedParking)}>
                  <Icon name="navigate" size={20} color="#2E7D6A" />
                  <Text style={styles.directionsText}>Get Directions</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 16, fontSize: 16, color: "#555" },

  locateBtn: {
    position: "absolute",
    bottom: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: "#fff",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 20,
    borderWidth: 1,
    borderColor: "#eee",
  },

  markerOuter: { alignItems: "center" },
  markerContainer: {
    width: 76,
    height: 76,
    borderRadius: 38,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 15,
  },
  markerUnavailable: {
    opacity: 0.6,
  },
  markerImage: {
    width: "100%",
    height: "100%",
    borderRadius: 35,
  },

  infoTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2E7D6A",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  priceTagText: { color: "#fff", fontWeight: "bold", fontSize: 13 },
  distanceText: { color: "#fff", fontSize: 12, marginLeft: 4 },

  modalOverlay: { flex: 1, justifyContent: "flex-end" },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)" },
  modalBottomSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
    maxHeight: "88%",
  },
  sheetHandle: { width: 50, height: 5, backgroundColor: "#ddd", borderRadius: 3, alignSelf: "center", marginBottom: 16 },
  modalTitle: { fontSize: 26, fontWeight: "bold", textAlign: "center", color: "#222", marginBottom: 16 },
  modalImage: { width: "100%", height: 240, borderRadius: 20, marginBottom: 16 },
  modalAddress: { fontSize: 16, color: "#666", textAlign: "center", marginBottom: 24, lineHeight: 22 },

  labelText: { fontSize: 14, color: "#888", marginBottom: 6 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 10 },
  priceText: { fontSize: 28, fontWeight: "bold", color: "#2E7D6A" },
  spotsText: { fontSize: 24, fontWeight: "bold" },

  buttonRow: { flexDirection: "row", gap: 16, marginTop: 10 },
  reserveButton: { flex: 1, backgroundColor: "#2E7D6A", paddingVertical: 18, borderRadius: 16, alignItems: "center" },
  reserveButtonDisabled: { backgroundColor: "#ccc" },
  reserveButtonText: { color: "#fff", fontWeight: "bold", fontSize: 17 },

  actionButton: {
    width: 56,
    height: 56,
    backgroundColor: "#f0f0f0",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#ddd",
  },
  actionButtonActive: { backgroundColor: "#e74c3c", borderColor: "#e74c3c" },

  directionsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: "#2E7D6A",
    borderRadius: 16,
  },
  directionsText: { color: "#2E7D6A", fontWeight: "bold", fontSize: 16, marginLeft: 8 },
});