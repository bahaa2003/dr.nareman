import type { ReactNode } from "react";
import styles from "./ActionLink.module.css";

type ActionLinkProps = {
  href: string;
  children: ReactNode;
  icon?: ReactNode;
  variant?: "primary" | "secondary" | "header";
  className?: string;
  onClick?: () => void;
  target?: "_blank";
  rel?: string;
};

export function ActionLink({
  href,
  children,
  icon,
  variant = "primary",
  className,
  onClick,
  target,
  rel
}: ActionLinkProps) {
  const classes = [styles.action, styles[variant], className].filter(Boolean).join(" ");

  return (
    <a className={classes} href={href} onClick={onClick} target={target} rel={rel}>
      {icon ? <span className={styles.icon}>{icon}</span> : null}
      <span>{children}</span>
    </a>
  );
}
