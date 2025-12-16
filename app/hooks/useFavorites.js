import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Platform } from "react-native";
import {
  doc,
  onSnapshot,
  updateDoc,
  setDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db, auth } from "../../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function useFavorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const unsubRef = useRef(null);
  const favsRef = useRef([]);
  favsRef.current = favorites;

  const userRef = useRef(auth.currentUser);

  // subscribe to Firebase auth state changes so the hook reacts properly after refresh
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      userRef.current = user;
      // restart listener when auth changes
      startListener();
    });

    return () => {
      try { unsubAuth(); } catch (e) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startListener = useCallback(() => {
    setLoading(true);
    setError(null);

    // cleanup previous listener
    if (unsubRef.current) {
      try { unsubRef.current(); } catch (e) {}
      unsubRef.current = null;
    }

    const user = userRef.current;
    if (!user) {
      setFavorites([]);
      setLoading(false);
      return;
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

  const showAlert = (title, msg) => {
    if (Platform.OS === "web" && typeof window !== "undefined" && window.alert) {
      window.alert(`${title}\n\n${msg}`);
    } else {
      Alert.alert(title, msg);
    }
  };

  const toggleFavorite = useCallback(
    async (parkingId) => {
      const user = userRef.current;
      if (!user) {
        showAlert("Sign in required", "Please sign in to manage favorites.");
        return;
      }

      const ref = doc(db, "favorites", user.uid);
      const currently = favsRef.current || [];
      const isFav = currently.includes(parkingId);

      // optimistic update
      const optimistic = isFav
        ? currently.filter((id) => id !== parkingId)
        : [...currently, parkingId];
      setFavorites(optimistic);

      setIsSaving(true);
      try {
        if (isFav) {
          await updateDoc(ref, { parkingIds: arrayRemove(parkingId) });
        } else {
          await updateDoc(ref, { parkingIds: arrayUnion(parkingId) });
        }
      } catch (err) {
        // fallback: doc may not exist -> setDoc with merge
        try {
          await setDoc(ref, { parkingIds: optimistic }, { merge: true });
        } catch (err2) {
          console.error("useFavorites toggle failed:", err2 || err);
          showAlert("Error", "Could not update favorites. Please try again.");
          // revert optimistic update
          setFavorites(currently);
        }
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  return { favorites, loading, error, isSaving, toggleFavorite, refresh };
}