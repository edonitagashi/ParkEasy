import { useEffect, useState } from "react";
import { Image } from "react-native";

/**
 Simple hook to prefetch remote image URIs and return boolean isPrefetched.
 Useful for components that want to wait until an image is cached before rendering high-res.
 */
export default function usePrefetchImage(uri) {
  const [isPrefetched, setIsPrefetched] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!uri) {
      setIsPrefetched(false);
      return;
    }
    Image.prefetch(uri)
      .then(() => {
        if (!cancelled) setIsPrefetched(true);
      })
      .catch(() => {
        if (!cancelled) setIsPrefetched(false);
      });
    return () => {
      cancelled = true;
    };
  }, [uri]);

  return isPrefetched;
}