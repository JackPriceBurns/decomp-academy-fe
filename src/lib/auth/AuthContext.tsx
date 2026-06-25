"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { api } from "./api";
import { getIdToken, logout } from "./cognito";

export interface AuthUser {
  sub: string;
  email: string;
}

type Status = "loading" | "anon" | "authed";

interface AuthValue {
  status: Status;
  user: AuthUser | null;
  refresh: () => Promise<void>;
  signOut: () => void;
}

const Ctx = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);

  const refresh = useCallback(async () => {
    const token = await getIdToken();
    if (!token) {
      setUser(null);
      setStatus("anon");
      return;
    }
    try {
      const me = await api<AuthUser>("/me");
      setUser(me);
      setStatus("authed");
    } catch {
      // Token present but rejected (revoked/expired refresh) — treat as anon.
      setUser(null);
      setStatus("anon");
    }
  }, []);

  const signOut = useCallback(() => {
    logout();
    setUser(null);
    setStatus("anon");
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // The progress store dispatches this when an authed write is rejected for auth
  // reasons (a silently-expired session). Re-validate so a dead login downgrades
  // to "anon" — at which point ProgressProvider switches to local persistence.
  useEffect(() => {
    const handler = () => void refresh();
    window.addEventListener("decomp-auth-expired", handler);
    return () => window.removeEventListener("decomp-auth-expired", handler);
  }, [refresh]);

  return (
    <Ctx.Provider value={{ status, user, refresh, signOut }}>{children}</Ctx.Provider>
  );
}

export function useAuth(): AuthValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within <AuthProvider>");
  return v;
}
