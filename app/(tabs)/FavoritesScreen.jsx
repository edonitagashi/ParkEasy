import React, { useMemo, useCallback, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, StatusBar, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import theme, { colors } from "../hooks/theme";
import TaskCompleteOverlay from "../../components/animation/TaskCompleteOverlay";
import ParkingCard from "../../components/ParkingCard";
import SearchHeader from "../../components/SearchHeader";
import { resolveImage } from "../../components/images";

import useParkings from "../hooks/useParkings";
import useFavorites from "../hooks/useFavorites";

// Use an existing fallback image that is present in the repo
const placeholderImage = require("../../assets/images/image1.png");
const ITEM_HEIGHT = 160;

export default function FavoritesScreen() {
  const { parkings, loading: parkingsLoading, error: parkingsError, refresh } = useParkings();
  const { favorites, loading: favsLoading, error: favsError, toggleFavorite } = useFavorites();
  const [doneVisible, setDoneVisible] = useState(false);

  const loading = parkingsLoading || favsLoading;
  const error = parkingsError || favsError;

  const favoriteParkings = useMemo(() => {
    if (!parkings || !favorites) return [];
    return parkings.filter((p) => favorites.includes(p.id));
  }, [parkings, favorites]);

  const keyExtractor = useCallback((item) => item.id, []);

  const renderItem = useCallback(
    ({ item }) => {
      // Use same image resolution/fallback logic as Search screen:
      const imageSource =
        item.image ||
        (item.imageUrl && resolveImage(item.imageUrl)) ||
        placeholderImage;

      return (
        <ParkingCard
          item={{
            ...item,
            image: imageSource,
            isFavorite: favorites.includes(item.id),
            onFavoriteToggle: () => {
              toggleFavorite(item.id);
              setDoneVisible(true);
              setTimeout(() => setDoneVisible(false), 600);
            },
          }}
        />
      );
    },
    [favorites, toggleFavorite]
  );

  const getItemLayout = useCallback((_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index }), []);

  if (loading) {
    // Render lightweight skeleton list
    const skeletons = Array.from({ length: 6 }).map((_, i) => (
      <View key={i} style={{ height: ITEM_HEIGHT, marginHorizontal: 16, marginBottom: theme.spacing.md }}>
        <View style={{ flexDirection: 'row', height: '100%', borderRadius: 14, overflow: 'hidden', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider }}>
          <View style={{ width: 120, height: '100%', backgroundColor: colors.divider }} />
          <View style={{ flex: 1, padding: theme.spacing.md }}>
            <View style={{ height: 14, width: '30%', backgroundColor: colors.divider, borderRadius: 6, marginBottom: theme.spacing.sm }} />
            <View style={{ height: 18, width: '60%', backgroundColor: colors.divider, borderRadius: 6, marginBottom: theme.spacing.sm }} />
            <View style={{ height: 12, width: '50%', backgroundColor: colors.divider, borderRadius: 6, marginBottom: theme.spacing.xs }} />
            <View style={{ height: 12, width: '40%', backgroundColor: colors.divider, borderRadius: 6 }} />
          </View>
        </View>
      </View>
    ));

    return (
      <SafeAreaView style={styles.container} edges={["left", "right"]}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
        <SearchHeader title="Favorites" />
        <View style={{ paddingTop: theme.spacing.md }}>{skeletons}</View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={["left", "right"]}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
        <SearchHeader title="Favorites" />
        <View style={{ padding: 20, alignItems: "center" }}>
          <Text style={{ color: colors.danger, marginBottom: 12 }}>Failed to load favorites.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <SearchHeader title="Favorites" />

      {favoriteParkings.length === 0 ? (
        <View style={styles.noFavorites}>
          <Text style={styles.noText}>You have no favorite parkings yet.</Text>
        </View>
      ) : (
        <FlatList
          data={favoriteParkings}
          keyExtractor={keyExtractor}
          renderItem={(args) => {
            const node = renderItem(args);
            return React.cloneElement(node, { blur: true });
          }}
          ItemSeparatorComponent={() => (
            <View style={{ height: 1, backgroundColor: theme.colors.divider, marginVertical: theme.spacing.sm }} />
          )}
          contentContainerStyle={{ paddingBottom: theme.spacing.lg }}
          style={{ flex: 1 }}
          initialNumToRender={6}
          maxToRenderPerBatch={8}
          windowSize={9}
          removeClippedSubviews={true}
          updateCellsBatchingPeriod={50}
          getItemLayout={getItemLayout}
        />
      )}
      <TaskCompleteOverlay visible={doneVisible} message="Updated" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  noFavorites: { flex: 1, justifyContent: "center", alignItems: "center" },
  noText: { fontSize: 16, color: colors.textMuted },
});