import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import theme from "../app/hooks/theme";
import { colors } from "../app/hooks/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import OptimizedImage from "./OptimizedImage";
import AnimatedTouchable from "./animation/AnimatedTouchable";

function ParkingCard({ item, hideReserve, blur = false }) {
  const [isFavorite, setIsFavorite] = useState(item?.isFavorite);

  useEffect(() => {
    setIsFavorite(item?.isFavorite);
  }, [item?.isFavorite]);

  const toggleFavorite = useCallback(() => {
    setIsFavorite((prev) => !prev);
    if (item?.onFavoriteToggle) item.onFavoriteToggle();
    // haptics optional: removed to avoid missing module errors
  }, [item]);

  const handleReserve = useCallback(() => {
    router.push({
      pathname: "/(tabs)/BookParkingScreen",
      params: { id: item.id, name: item.name },
    });
    // haptics optional: removed to avoid missing module errors
  }, [item?.id, item?.name]);

  const showDetails = useCallback(() => {
    Alert.alert(
      "Parking Details",
      `Name: ${item.name}\nDistance: ${item.distance}\nPrice: ${item.price}\nAvailable Spots: ${item.spots || item.freeSpots}`
    );
  }, [item]);

  return (
    <View style={{ marginBottom: 15, marginHorizontal: 16 }}>
      <AnimatedTouchable onPress={showDetails} style={{ borderRadius: 14 }}>
          <LinearGradient
          colors={[theme.colors.secondary, theme.colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View>
            <OptimizedImage source={item.photoUri || item.image} thumbnail={item.imageThumb || null} style={styles.image} />
            {/* Stronger top/bottom fade overlays for better legibility */}
            <LinearGradient
              colors={["rgba(0,0,0,0.5)", "rgba(0,0,0,0.0)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.overlayTop}
            />
            {!blur && (
              <LinearGradient
              colors={["rgba(0,0,0,0.0)", "rgba(0,0,0,0.5)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.overlayBottom}
              />
            )}
            {blur && (
              <View style={styles.blurBottomFallback} />
            )}
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.bookingId}>ID: {item.id}</Text>
            <Text style={styles.name}>{item.name}</Text>

            <View style={styles.addressContainer}>
              <Ionicons name="location-outline" size={14} color={theme.colors.pickerDoneText} />
              <Text style={styles.address}>{item.address}</Text>
            </View>

            <View style={styles.detailsRow}>
              <Text style={styles.detail}>Distance: {item.distance}</Text>
              <Text style={styles.detail}>Price: {item.price}</Text>
            </View>

            <Text style={styles.detail}>Available: {item.spots || item.freeSpots} spots</Text>
          </View>

          <TouchableOpacity onPress={toggleFavorite} style={styles.bookmarkWrapper}>
            <Ionicons
              name={isFavorite ? "bookmark" : "bookmark-outline"}
              size={22}
              color={isFavorite ? "#e5d058ff" : theme.colors.pickerDoneText}
            />
          </TouchableOpacity>

          {!hideReserve && (
            <AnimatedTouchable style={styles.reserveBadge} onPress={handleReserve}>
              <Ionicons name="calendar-outline" size={16} color={theme.colors.pickerDoneText} style={{ marginRight: 4 }} />
              <Text style={styles.reserveBadgeText}>Reserve</Text>
            </AnimatedTouchable>
          )}
        </LinearGradient>
      </AnimatedTouchable>
    </View>
  );
}


const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    borderRadius: 14,
    overflow: "hidden",
    elevation: 4,
    padding: 8,
    position: "relative",
  },

  image: {
    width: 120,
    height: 130,
    borderRadius: 12,
  },
  overlayTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  overlayBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  blurBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    overflow: "hidden",
  },
  blurBottomFallback: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    backgroundColor: "rgba(0,0,0,0.25)",
  },

  infoContainer: {
    flex: 1,
    padding: 12,
    padding: theme.spacing.xs + 2,
  },

  bookingId: { fontSize: 12, color: theme.colors.pickerDoneText },
  name: { fontSize: 16, fontWeight: "bold", color: theme.colors.pickerDoneText, marginVertical: 4 },

  addressContainer: { flexDirection: "row", alignItems: "center" },
  address: { color: theme.colors.pickerDoneText, marginLeft: 4, fontSize: 12 },

  detailsRow: { flexDirection: "row", justifyContent: "space-between" },
  detail: { color: theme.colors.pickerDoneText, fontSize: 12, marginTop: 2 },

  bookmarkWrapper: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: theme.colors.backdrop,
    padding: 6,
    borderRadius: 20,
  },
  reserveBadge: {
    position: "absolute",
    bottom: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingVertical: theme.spacing.xs + 2,
    paddingHorizontal: theme.spacing.md + 2,
    borderRadius: 25,
    elevation: 6,
  },

  reserveBadgeText: {
    color: theme.colors.pickerDoneText,
    fontWeight: "700",
    fontSize: 14,
  },
});


function areEqual(prevProps, nextProps) {
  const p = prevProps.item || {};
  const n = nextProps.item || {};

  // If id changed, re-render
  if (p.id !== n.id) return false;

  // If favorite status changed, re-render
  if (p.isFavorite !== n.isFavorite) return false;

  // If important display fields changed, re-render
  if (p.distance !== n.distance) return false;
  if (p.price !== n.price) return false;
  if ((p.spots || p.freeSpots) !== (n.spots || n.freeSpots)) return false;

  // If image source changed, re-render (check both photoUri and image)
  const pImg = typeof (p.photoUri || p.image) === "string" ? (p.photoUri || p.image) : (p.photoUri || p.image)?.uri;
  const nImg = typeof (n.photoUri || n.image) === "string" ? (n.photoUri || n.image) : (n.photoUri || n.image)?.uri;
  if (pImg !== nImg) return false;

  // If photo uri changed specifically, re-render
  if (p.photoUri !== n.photoUri) return false;

  // hideReserve prop rarely changes — keep equality
  if (prevProps.hideReserve !== nextProps.hideReserve) return false;

  // Otherwise no re-render
  return true;
}

export default React.memo(ParkingCard, areEqual);