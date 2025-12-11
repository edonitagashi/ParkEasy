import React, { useEffect, useState, useMemo } from "react";
import { View, Image, StyleSheet, Animated } from "react-native";
import { resolveImage } from "./images";

const placeholder = require("../assets/placeholder.webp");

export default function OptimizedImage({ source, thumbnail, style, resizeMode = "cover" }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPrefetched, setIsPrefetched] = useState(false);
  const opacity = useMemo(() => new Animated.Value(0), []);

  const resolved = (() => {
    if (!source) return null;
    if (typeof source === "string") {
      const looked = resolveImage(source);
      if (looked) return looked;
      return { uri: source };
    }
    return source; 
  })();

  const thumbSrc = thumbnail
    ? thumbnail.startsWith && thumbnail.startsWith("http")
      ? { uri: thumbnail }
      : resolveImage(thumbnail) || { uri: thumbnail }
    : null;

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
        useNativeDriver: true,
      }).start();
    }
  }, [isLoaded, opacity]);

  const lowRes = thumbSrc || (resolved && resolved.uri ? { uri: resolved.uri } : placeholder);

  return (
    <View style={[styles.wrapper, style]}>
      <Image
        source={lowRes}
        resizeMode={resizeMode}
        style={[StyleSheet.absoluteFill, { borderRadius: style?.borderRadius || 0 }]}
      />
      {resolved && resolved.uri && isPrefetched ? (
        <Animated.Image
          source={resolved}
          resizeMode={resizeMode}
          onLoad={() => setIsLoaded(true)}
          style={[StyleSheet.absoluteFill, { opacity }, { borderRadius: style?.borderRadius || 0 }]}
        />
      ) : resolved && !resolved.uri ? (
        <Image
          source={resolved}
          resizeMode={resizeMode}
          style={[StyleSheet.absoluteFill, { borderRadius: style?.borderRadius || 0 }]}
          onLoad={() => setIsLoaded(true)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: "hidden",
    backgroundColor: "#f0f4f8",
  },
});