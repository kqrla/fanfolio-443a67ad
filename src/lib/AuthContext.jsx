import React, { createContext, useState, useContext, useEffect } from "react";
import { supabase } from "@/api/supabaseClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings] = useState(false);
  const [authError] = useState(null);
  const [appPublicSettings] = useState({ id: "ocverse", public_settings: {} });

  useEffect(() => {
    let mounted = true;
    const apply = (session) => {
      if (!mounted) return;
      const u = session?.user;
      if (u) {
        setUser({
          id: u.id,
          email: u.email,
          full_name: u.user_metadata?.full_name || u.email,
          role: u.app_metadata?.role || "user",
        });
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsLoadingAuth(false);
    };

    supabase.auth
      .getSession()
      .then(({ data }) => apply(data?.session))
      .catch(() => mounted && setIsLoadingAuth(false));

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => apply(session));
    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  const logout = async (shouldRedirect = true) => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
    if (shouldRedirect) window.location.href = "/account";
  };

  const navigateToLogin = () => {
    const from = encodeURIComponent(window.location.href);
    window.location.href = `/account?from=${from}`;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        isLoadingPublicSettings,
        authError,
        appPublicSettings,
        logout,
        navigateToLogin,
        checkAppState: () => {},
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
