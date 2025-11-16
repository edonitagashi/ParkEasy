import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import { doc, onSnapshot, updateDoc, setDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db, auth } from "../firebase/firebase";

/**
 * useFavorites - listens to /favorites/{uid} and exposes:
 *  - favorites: string[] (parking ids)
 *  - loading, error
 *  - toggleFavorite(parkingId): add/remove parkingId for current user
 *  - refresh(): re-subscribe
 *
 * Doc shape: /favorites/{uid} => { parkingIds: ["id1","id2", ...] }
 */
export default function useFavorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const unsubRef = useRef(null);
  const favsRef = useRef(favorites);
  favsRef.current = favorites;

  const startListener = useCallback(() => {
    setLoading(true);
    setError(null);

    const user = auth.currentUser;
    if (!user) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    // cleanup previous
    if (unsubRef.current) {
      try { unsubRef.current(); } catch (e) {}
      unsubRef.current = null;
    }

    const ref = doc(db, "favorites", user.uid);
    unsubRef.current = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setFavorites(Array.isArray(data.parkingIds) ? data.parkingIds : []);
        } else {
          setFavorites([]);
        }
        setLoading(false);
      },
      (err) => {
        console.error("useFavorites onSnapshot error:", err);
        setError(err);
        setFavorites([]);
        setLoading(false);
      }
    );
  }, []);

  useEffect(() => {
    startListener();
    return () => {
      if (unsubRef.current) {
        try { unsubRef.current(); } catch (e) {}
        unsubRef.current = null;
      }
    };
  }, [startListener]);

  const refresh = useCallback(() => {
    startListener();
  }, [startListener]);

  const toggleFavorite = useCallback(
    async (parkingId) => {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Sign in required", "Please log in to manage favorites.");
        return;
      }

      const ref = doc(db, "favorites", user.uid);
      const currently = favsRef.current || [];
      const isFav = currently.includes(parkingId);
      const newArray = isFav ? currently.filter((id) => id !== parkingId) : [...currently, parkingId];

      // Optimistic local update for snappy UI
      setFavorites(newArray);

      try {
        if (isFav) {
          // remove
          await updateDoc(ref, { parkingIds: arrayRemove(parkingId) });
        } else {
          // add
          await updateDoc(ref, { parkingIds: arrayUnion(parkingId) });
        }
      } catch (err) {
        // updateDoc may fail if doc doesn't exist -> fallback to setDoc
        try {
          await setDoc(ref, { parkingIds: newArray }, { merge: true });
        } catch (err2) {
          console.error("toggleFavorite failed:", err2);
          Alert.alert("Error", "Could not update favorites. Please try again.");
          setFavorites(currently);
        }
      }
    },
    []
  );

  return { favorites, loading, error, toggleFavorite, refresh };
}