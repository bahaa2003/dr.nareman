import { Menu } from "lucide-react";

import styles from "./AdminShell.module.css";

interface AdminTopbarProps {
  adminEmail: string;
  isLoggingOut: boolean;
  onLogout: () => void;
  onMenuToggle: () => void;
}

export function AdminTopbar({ adminEmail, isLoggingOut, onLogout, onMenuToggle }: AdminTopbarProps) {
  return (
    <header className={styles.topbar}>
      <button className={styles.menuButton} type="button" aria-label="فتح تنقل لوحة التحكم" onClick={onMenuToggle}>
        <Menu aria-hidden="true" size={20} />
      </button>
      <div>
        <p className={styles.topbarEyebrow}>مساحة العمل</p>
        <h1 className={styles.topbarTitle}>إدارة المحتوى</h1>
      </div>
      <div className={styles.topbarActions}>
        <p className={styles.adminEmail} dir="ltr">
          {adminEmail}
        </p>
        <button className={styles.logoutButton} type="button" disabled={isLoggingOut} onClick={onLogout}>
          {isLoggingOut ? "جارٍ تسجيل الخروج…" : "تسجيل الخروج"}
        </button>
      </div>
    </header>
  );
}
