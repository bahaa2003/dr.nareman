import type { ReactNode } from "react";
import styles from "./AnimatedSectionTitle.module.css";

type AnimatedSectionTitleProps = {
  children: ReactNode;
  className?: string;
};

export function AnimatedSectionTitle({ children, className }: AnimatedSectionTitleProps) {
  const classes = [styles.title, className].filter(Boolean).join(" ");

  return <span className={classes}>{children}</span>;
}
