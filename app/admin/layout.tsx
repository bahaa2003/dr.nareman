import { AdminSessionProvider } from "@/components/admin/AdminSessionContext";

import styles from "./AdminRootLayout.module.css";

export default function AdminRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <AdminSessionProvider>
      <div className={styles.root}>{children}</div>
    </AdminSessionProvider>
  );
}
