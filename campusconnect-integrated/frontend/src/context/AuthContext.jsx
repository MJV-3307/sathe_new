import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getToken, setToken } from "../api/client";
import { login as apiLogin, logout as apiLogout, getCurrentUser } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiOffline, setApiOffline] = useState(false);

  const loadUser = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await getCurrentUser();
      setUser(me);
      setApiOffline(false);
    } catch (err) {
      // Bad/expired token, or the backend simply isn't running (dev demo
      // mode). Either way, drop back to a logged-out state rather than
      // getting stuck on a spinner.
      setToken(null);
      setUser(null);
      if (err?.status === undefined) setApiOffline(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    await apiLogin(email, password);
    await loadUser();
  };

  const logout = () => {
    apiLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, apiOffline, login, logout, refresh: loadUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
