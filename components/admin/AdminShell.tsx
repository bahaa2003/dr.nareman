"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";
import { useAdminSession } from "./AdminSessionContext";
import styles from "./AdminShell.module.css";

interface AdminShellProps {
  children: ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const router = useRouter();
  const { admin, isLoggingOut, logout } = useAdminSession();
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);

  const handleLogout = async () => {
    const wasRevoked = await logout();
    router.replace(wasRevoked ? "/admin/login" : "/admin/login?logout=uncertain");
  };

  return (
    <div className={styles.shell}>
      <AdminSidebar isOpen={isNavigationOpen} onNavigate={() => setIsNavigationOpen(false)} />
      {isNavigationOpen ? (
        <button
          className={styles.backdrop}
          type="button"
          aria-label="إغلاق التنقل"
          onClick={() => setIsNavigationOpen(false)}
        />
      ) : null}
      <div className={styles.workspace}>
        <AdminTopbar
          adminEmail={admin?.email ?? ""}
          isLoggingOut={isLoggingOut}
          onLogout={() => void handleLogout()}
          onMenuToggle={() => setIsNavigationOpen((isOpen) => !isOpen)}
        />
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
