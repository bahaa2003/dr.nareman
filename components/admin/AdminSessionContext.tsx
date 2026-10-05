"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import { logoutAdmin } from "@/lib/admin-api/auth";
import type { AdminIdentity } from "@/types/admin";

interface AdminSessionContextValue {
  admin: AdminIdentity | null;
  isLoading: boolean;
  isLoggingOut: boolean;
  setAdmin: (admin: AdminIdentity) => void;
  clearAdmin: () => void;
  handleUnauthorized: () => void;
  setIsLoading: (isLoading: boolean) => void;
  logout: () => Promise<boolean>;
}

const AdminSessionContext = createContext<AdminSessionContextValue | undefined>(undefined);

export function AdminSessionProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminIdentity | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const clearAdmin = useCallback(() => {
    setAdmin(null);
  }, []);

  const handleUnauthorized = clearAdmin;

  const logout = useCallback(async () => {
    setIsLoggingOut(true);

    try {
      await logoutAdmin();
      clearAdmin();
      return true;
    } catch {
      // The local identity is cleared even when revocation cannot be confirmed.
      clearAdmin();
      return false;
    } finally {
      setIsLoggingOut(false);
    }
  }, [clearAdmin]);

  const value = useMemo(
    () => ({ admin, isLoading, isLoggingOut, setAdmin, clearAdmin, handleUnauthorized, setIsLoading, logout }),
    [admin, clearAdmin, handleUnauthorized, isLoading, isLoggingOut, logout]
  );

  return <AdminSessionContext.Provider value={value}>{children}</AdminSessionContext.Provider>;
}

export function useAdminSession(): AdminSessionContextValue {
  const context = useContext(AdminSessionContext);

  if (!context) {
    throw new Error("useAdminSession must be used within an AdminSessionProvider");
  }

  return context;
}
