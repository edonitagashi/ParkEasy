import React, { useEffect, useState, useMemo, useRef } from "react";
import { View, Image, StyleSheet, Animated, ActivityIndicator, Platform } from "react-native";
import theme from "./theme";
import { resolveImage } from "./images";

/**
 * OptimizedImage - enforce explicit width/height and consistent resizeMode to avoid zoom flicker.
 * - If the caller provides style.width & style.height, we will apply those exact dims to the underlying images.
 * - We use the same resizeMode for low-res (thumbnail) and high-res when thumbnail exists.
 * - If no thumbnail is present we show neutral BG + spinner and fade-in high-res (no low-res image swap).
 */

const DEFAULT_BG = theme.colors.chipBg || "#e6f0ec";

export default function OptimizedImage({ source, thumbnail, style = {}, resizeMode = "cover" }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPrefetched, setIsPrefetched] = useState(false);
  const opacity = useMemo(() => new Animated.Value(0), []);
  const skeletonOpacity = useRef(new Animated.Value(0.6)).current;

  // resolve provided source (string -> {uri} or resolveImage)
  const resolved = (() => {
    if (!source) return null;
    if (typeof source === "string") {
      const looked = resolveImage(source);
      if (looked) return looked;
      return { uri: source };
    }
    return source;
  })();

  const thumbResolved = (() => {
    if (!thumbnail) return null;
    if (typeof thumbnail === "string") {
      const looked = resolveImage(thumbnail);
      if (looked) return looked;
      return { uri: thumbnail };
    }
    return thumbnail;
  })();

  // Debug log (remove later) — helps check which items have thumb vs only high-res
  // console.log("OptimizedImage: hasThumb=", !!thumbResolved, "highResUri=", resolved && resolved.uri);

  // Prefetch high-res only when it's a remote URI
  useEffect(() => {
    let cancelled = false;
    const uriToPrefetch = resolved && resolved.uri ? resolved.uri : null;
    if (!uriToPrefetch) {
      setIsPrefetched(false);
      return;
    }
    Image.prefetch(uriToPrefetch)
      .then(() => {
        if (!cancelled) setIsPrefetched(true);
      })
      .catch(() => {
        if (!cancelled) setIsPrefetched(false);
      });
    return () => {
      cancelled = true;
    };
  }, [resolved]);

  useEffect(() => {
    if (isLoaded) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 260,
        useNativeDriver: Platform.OS !== "web",
      }).start();
    }
  }, [isLoaded, opacity]);

  // skeleton shimmer pulse while not loaded
  useEffect(() => {
    let anim;
    if (!isLoaded) {
      anim = Animated.loop(
        Animated.sequence([
          Animated.timing(skeletonOpacity, { toValue: 0.4, duration: 500, useNativeDriver: true }),
          Animated.timing(skeletonOpacity, { toValue: 0.7, duration: 500, useNativeDriver: true }),
        ])
      );
      anim.start();
    }
    return () => {
      try { anim && anim.stop(); } catch {}
    };
  }, [isLoaded, skeletonOpacity]);

  // Derive explicit width/height from style if present
  const explicitWidth = (style && (style.width || style?.width === 0)) ? style.width : null;
  const explicitHeight = (style && (style.height || style?.height === 0)) ? style.height : null;

  // Compose image style: if explicit dims exist, apply them; otherwise fill container
  const imageStyle = [
    explicitWidth ? { width: explicitWidth } : StyleSheet.absoluteFill,
    explicitHeight ? { height: explicitHeight } : StyleSheet.absoluteFill,
    { borderRadius: style?.borderRadius || 0 },
  ];

  // low-res source: only show if there's a thumbnail. If no thumbnail, we won't show an image placeholder.
  const lowResSource = thumbResolved ? thumbResolved : null;
  const highResSource = resolved ? resolved : null;

  return (
    <View style={[styles.wrapper, style, !lowResSource && { backgroundColor: DEFAULT_BG }]}>
      {/* Skeleton loader while image is not loaded */}
      {!isLoaded && (
        <Animated.View style={[StyleSheet.absoluteFill, styles.skeleton, { opacity: skeletonOpacity }]} />
      )}
      {/* Low-res thumbnail (use same resizeMode to keep crop identical) */}
      {lowResSource ? (
        <Image
          source={lowResSource}
          resizeMode={resizeMode}
          style={imageStyle}
        />
      ) : null}

      {/* Activity indicator if no thumbnail and remote image not yet prefetched/loaded */}
      {!lowResSource && highResSource && highResSource.uri && !isLoaded && !isPrefetched && (
        <View style={[StyleSheet.absoluteFill, styles.center]}>
          <ActivityIndicator size="small" color="#2E7D6A" />
        </View>
      )}

      {/* High-res - only render when prefetched (or local require) to avoid immediate swap flicker */}
      {highResSource && (isPrefetched || !highResSource.uri) ? (
        <Animated.Image
          source={highResSource}
          resizeMode={resizeMode}
          onLoad={() => setIsLoaded(true)}
          style={[imageStyle, { opacity }]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: "hidden",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  skeleton: {
    backgroundColor: theme.colors.divider,
  },
});