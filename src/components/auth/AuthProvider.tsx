"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { OtpLoginModal } from "./OtpLoginModal";

type User = {
  id: string;
  phone: string;
  name: string | null;
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  openLogin: () => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  requireAuth: (action?: () => void) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginOpen, setLoginOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      setUser(data.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const openLogin = useCallback(() => setLoginOpen(true), []);

  const requireAuth = useCallback(
    (action?: () => void) => {
      if (user) {
        action?.();
        return true;
      }
      setPendingAction(action ?? null);
      setLoginOpen(true);
      return false;
    },
    [user],
  );

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  }, []);

  const handleLoginSuccess = useCallback(
    (loggedInUser: User) => {
      setUser(loggedInUser);
      pendingAction?.();
      setPendingAction(null);
    },
    [pendingAction],
  );

  const value = useMemo(
    () => ({ user, loading, openLogin, logout, refreshUser, requireAuth }),
    [user, loading, openLogin, logout, refreshUser, requireAuth],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <OtpLoginModal
        open={loginOpen}
        onClose={() => {
          setLoginOpen(false);
          setPendingAction(null);
        }}
        onSuccess={handleLoginSuccess}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
