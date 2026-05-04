// context/UserContext.js
"use client";

// Estado global ligero del usuario activo.
// - Lee el ID desde la URL (?user=ID) o desde localStorage.
// - Se suscribe a Firestore para que cualquier cambio (perder vida, ser
//   marcado como fantasma, etc.) llegue automáticamente a la UI.
// - Persiste el ID en localStorage para que recargar la pestaña no eche
//   al usuario.

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { subscribeToUser } from "@/lib/usersApi";

const STORAGE_KEY = "paula-party:userId";

const UserContext = createContext({
  user: null,
  userId: null,
  loading: true,
  error: null,
  setUserId: () => {},
  logout: () => {},
});

export function UserProvider({ children }) {
  const [userId, setUserIdState] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Resolver el userId al montar: prioriza ?user= en la URL, si no, localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    const urlId = new URLSearchParams(window.location.search).get("user");
    const storedId = window.localStorage.getItem(STORAGE_KEY);
    const resolved = urlId || storedId;

    if (urlId && urlId !== storedId) {
      window.localStorage.setItem(STORAGE_KEY, urlId);
    }

    if (!resolved) {
      setLoading(false);
      setError("missing_id");
      return;
    }

    setUserIdState(resolved);
  }, []);

  // 2. Suscripción en tiempo real al documento del usuario
  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError(null);

    const unsub = subscribeToUser(userId, (u) => {
      if (!u) {
        setUser(null);
        setError("not_found");
      } else {
        setUser(u);
        setError(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [userId]);

  const setUserId = useCallback((id) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, id);
    }
    setUserIdState(id);
  }, []);

  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    setUserIdState(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, userId, loading, error, setUserId, logout }),
    [user, userId, loading, error, setUserId, logout]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}
