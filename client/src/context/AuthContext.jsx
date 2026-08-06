import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { api, getToken, setToken, setOnUnauthorized } from "../api.js";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const clearAuth = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const finishAuth = useCallback(({ token, user: u }) => {
    setToken(token);
    setUser(u);
    setAuthOpen(false);
  }, []);

  // Restore session on load / on 401 anywhere
  useEffect(() => {
    const restore = async () => {
      if (!getToken()) {
        setReady(true);
        return;
      }
      try {
        const { user: u } = await api.me();
        setUser(u);
      } catch {
        clearAuth();
      } finally {
        setReady(true);
      }
    };
    restore();
  }, [clearAuth]);

  useEffect(() => {
    setOnUnauthorized(() => {
      clearAuth();
    });
    return () => setOnUnauthorized(null);
  }, [clearAuth]);

  const login = async (credentials) => finishAuth(await api.login(credentials));
  const signup = async (details) => finishAuth(await api.signup(details));
  const logout = async () => {
    await api.logout();
    clearAuth();
  };
  const openAuth = () => setAuthOpen(true);
  const closeAuth = () => setAuthOpen(false);

  const value = {
    user,
    ready,
    authOpen,
    openAuth,
    closeAuth,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
