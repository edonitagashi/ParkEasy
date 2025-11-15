import { useEffect, useRef, useState, useCallback } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "../firebase/firebase";

/**
 * useParkings - reusable hook to read 'parkings' collection in realtime.
 *
 * Returns:
 *  - parkings: array of parking objects { id, ...data }
 *  - loading: boolean
 *  - error: Error | null
 *  - refresh: () => void  // manual refresh (re-subscribes)
 *
 * Usage:
 *  const { parkings, loading, error, refresh } = useParkings();
 */
export default function useParkings() {
  const [parkings, setParkings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const unsubRef = useRef(null);

  const startListener = useCallback(() => {
    setLoading(true);
    setError(null);

    try {
      const q = query(collection(db, "parkings"));
      // unsubscribe existing
      if (unsubRef.current) {
        try { unsubRef.current(); } catch (e) {}
        unsubRef.current = null;
      }

      unsubRef.current = onSnapshot(
        q,
        (snapshot) => {
          const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
          setParkings(items);
          setLoading(false);
        },
        (err) => {
          console.error("useParkings onSnapshot error:", err);
          setError(err);
          setLoading(false);
        }
      );
    } catch (e) {
      console.error("useParkings error:", e);
      setError(e);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    startListener();
    return () => {
      if (unsubRef.current) {
        try {
          unsubRef.current();
        } catch (e) {}
        unsubRef.current = null;
      }
    };
  }, [startListener]);

  const refresh = useCallback(() => {
    // re-subscribe to force a fresh read
    startListener();
  }, [startListener]);

  return { parkings, loading, error, refresh };
}