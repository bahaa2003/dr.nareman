"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { getCurrentAdmin } from "@/lib/admin-api/auth";
import { ApiError } from "@/lib/admin-api/client";

import { useAdminSession } from "./AdminSessionContext";
import styles from "./AdminSessionGate.module.css";

interface AdminSessionGateProps {
  children: ReactNode;
}

export function AdminSessionGate({ children }: AdminSessionGateProps) {
  const router = useRouter();
  const { admin, handleUnauthorized, isLoading, setAdmin, setIsLoading } = useAdminSession();
  const [error, setError] = useState<string | null>(null);
  const [hasVerified, setHasVerified] = useState(false);

  const verifySession = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setHasVerified(false);

    try {
      const currentAdmin = await getCurrentAdmin();
      setAdmin(currentAdmin);
      setHasVerified(true);
    } catch (caughtError) {
      if (caughtError instanceof ApiError && caughtError.status === 401) {
        handleUnauthorized();
        router.replace("/admin/login");
        return;
      }

      setError("تعذر التحقق من الجلسة الآن. يرجى المحاولة مرة أخرى.");
      setHasVerified(true);
    } finally {
      setIsLoading(false);
    }
  }, [handleUnauthorized, router, setAdmin, setIsLoading]);

  useEffect(() => {
    const verificationTimer = window.setTimeout(() => {
      void verifySession();
    }, 0);

    return () => {
      window.clearTimeout(verificationTimer);
    };
  }, [verifySession]);

  if (isLoading || !hasVerified) {
    return (
      <main className={styles.state} aria-live="polite">
        <div className={styles.panel}>
          <p className={styles.eyebrow}>لوحة التحكم</p>
          <h1>جارٍ التحقق من الجلسة</h1>
          <p>يرجى الانتظار قليلًا.</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.state} aria-live="polite">
        <div className={styles.panel}>
          <p className={styles.eyebrow}>تعذر الوصول</p>
          <h1>لم نتمكن من التحقق من جلسة الإدارة</h1>
          <p>{error}</p>
          <button className={styles.retryButton} type="button" onClick={() => void verifySession()}>
            إعادة المحاولة
          </button>
        </div>
      </main>
    );
  }

  if (!admin) {
    return null;
  }

  return <>{children}</>;
}
