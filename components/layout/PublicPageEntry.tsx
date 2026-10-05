"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

import styles from "./PublicPageEntry.module.css";

export function PublicPageEntry({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) return <>{children}</>;

  return (
    <div className={styles.publicEntry}>
      <div className={styles.overlay} aria-hidden="true">
        <span className={styles.ring} />
        <Image className={styles.logo} src="/images/nariman-logo-primary.png" alt="" width={1328} height={514} priority />
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
