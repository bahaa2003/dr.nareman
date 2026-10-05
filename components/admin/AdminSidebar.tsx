import { CalendarDays, FileText, Images, UsersRound } from "lucide-react";
import Link from "next/link";

import styles from "./AdminShell.module.css";

interface AdminSidebarProps {
  isOpen: boolean;
  onNavigate: () => void;
}

export function AdminSidebar({ isOpen, onNavigate }: AdminSidebarProps) {
  return (
    <aside className={`${styles.sidebar}${isOpen ? ` ${styles.sidebarOpen}` : ""}`}>
      <div className={styles.brand}>
        <span className={styles.brandMark} aria-hidden="true" />
        <div>
          <strong>د. ناريمان</strong>
          <span>لوحة التحكم</span>
        </div>
      </div>
      <nav className={styles.navigation} aria-label="تنقل لوحة التحكم">
        <Link href="/admin/articles" className={styles.navigationLink} onClick={onNavigate}>
          <FileText aria-hidden="true" size={18} />
          <span>المقالات</span>
        </Link>
        <Link href="/admin/weekly-live" className={styles.navigationLink} onClick={onNavigate}>
          <CalendarDays aria-hidden="true" size={18} />
          <span>اللقاءات الأسبوعية</span>
        </Link>
        <Link href="/admin/testimonials" className={styles.navigationLink} onClick={onNavigate}>
          <Images aria-hidden="true" size={18} />
          <span>آراء وتجارب المراجعات</span>
        </Link>
        <Link href="/admin/leads" className={styles.navigationLink} onClick={onNavigate}>
          <UsersRound aria-hidden="true" size={18} />
          <span>العملاء المحتملون</span>
        </Link>
      </nav>
    </aside>
  );
}
