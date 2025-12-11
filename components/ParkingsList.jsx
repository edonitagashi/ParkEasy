import React, { useCallback, useMemo } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import ParkingCard from "./ParkingCard";

/**
 * ParkingsList - Generic optimized FlatList wrapper for ParkingCard
 * Use this komponent ne screens qe shfaqin lista parkingu, per te perfituar nga optimizimet.
 */
const ITEM_HEIGHT = 160; 

export default function ParkingsList({ data = [], onItemPress = () => {}, hideReserve = false }) {
  const listData = useMemo(() => data, [data]);

  const keyExtractor = useCallback((item) => item.id?.toString() || String(item._id || Math.random()), []);

  const renderItem = useCallback(
    ({ item }) => {
      return <ParkingCard item={item} hideReserve={hideReserve} />;
    },
    [hideReserve]
  );

  const getItemLayout = useCallback((_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index }), []);

  return (
    <View style={styles.container}>
      <FlatList
        data={listData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={9}
        removeClippedSubviews={true}
        updateCellsBatchingPeriod={50}
        getItemLayout={getItemLayout}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContainer: { paddingVertical: 8 },
});