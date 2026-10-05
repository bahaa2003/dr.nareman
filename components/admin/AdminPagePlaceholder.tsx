import styles from "./AdminShell.module.css";

interface AdminPagePlaceholderProps {
  title: string;
  description: string;
}

export function AdminPagePlaceholder({ title, description }: AdminPagePlaceholderProps) {
  return (
    <section className={styles.placeholder} aria-labelledby="admin-page-title">
      <p className={styles.placeholderEyebrow}>لوحة إدارة المحتوى</p>
      <h2 id="admin-page-title">{title}</h2>
      <p>{description}</p>
    </section>
  );
}
