import type { ReactNode } from "react";
import styles from "./ActionLink.module.css";

type ActionLinkProps = {
  href: string;
  children: ReactNode;
  icon?: ReactNode;
  variant?: "primary" | "secondary" | "header";
  className?: string;
  onClick?: () => void;
};

export function ActionLink({
  href,
  children,
  icon,
  variant = "primary",
  className,
  onClick
}: ActionLinkProps) {
  const classes = [styles.action, styles[variant], className].filter(Boolean).join(" ");

  return (
    <a className={classes} href={href} onClick={onClick}>
      {icon ? <span className={styles.icon}>{icon}</span> : null}
      <span>{children}</span>
    </a>
  );
}
