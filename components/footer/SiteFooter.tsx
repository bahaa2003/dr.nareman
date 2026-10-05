"use client";

import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { footerContent } from "@/data/footer";
import { SocialPlatformIcon } from "@/components/ui/SocialPlatformIcon";
import styles from "./SiteFooter.module.css";

const ease = [0.2, 0.74, 0.24, 1] as const;

const footerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.06
    }
  }
};

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease }
  }
};

export function SiteFooter() {
  const reduceMotion = useReducedMotion();
  const year = new Date().getFullYear();

  const handleBackToTop = () => {
    const shouldReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: shouldReduceMotion ? "auto" : "smooth" });
  };

  return (
    <motion.footer
      className={styles.footer}
      initial={reduceMotion ? "visible" : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={footerVariants}
    >
      <div className={styles.inner}>
        <motion.div
          className={styles.separator}
          aria-hidden="true"
          initial={reduceMotion ? { scaleX: 1 } : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: reduceMotion ? 0 : 0.95, ease }}
        />

        <div className={styles.top}>
          <motion.div className={styles.brand} variants={revealVariants}>
            <p className={styles.brandName}>{footerContent.brand.name}</p>
            <p className={styles.specialty}>{footerContent.brand.specialty}</p>
          </motion.div>

          <motion.nav className={styles.nav} aria-label="روابط التذييل" variants={revealVariants}>
            {footerContent.nav.map((item, index) => (
              <Link key={item.href} href={item.href} className={styles.navLink}>
                <span>{item.label}</span>
                {index < footerContent.nav.length - 1 ? <span className={styles.navDot} aria-hidden="true" /> : null}
              </Link>
            ))}
          </motion.nav>
        </div>

        {footerContent.socialLinks.length > 0 ? (
          <motion.div className={styles.socialRail} variants={revealVariants}>
            {footerContent.socialLinks.map((item) => (
              <a
                key={item.href}
                className={styles.socialLink}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`زيارة ${item.label}`}
              >
                <SocialPlatformIcon platform={item.label} />
              </a>
            ))}
          </motion.div>
        ) : null}

        <motion.div className={styles.bottom} variants={revealVariants}>
          <p>© {year} {footerContent.brand.name}. جميع الحقوق محفوظة.</p>
          <button type="button" className={styles.backTop} onClick={handleBackToTop} aria-label="العودة إلى أعلى الصفحة">
            <span>العودة للأعلى</span>
            <ArrowUp aria-hidden="true" size={17} strokeWidth={2.2} />
          </button>
        </motion.div>
      </div>
    </motion.footer>
  );
}
