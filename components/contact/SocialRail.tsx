"use client";

import { motion, useReducedMotion } from "framer-motion";
import { footerContent } from "@/data/footer";
import { SocialPlatformIcon } from "@/components/ui/SocialPlatformIcon";
import styles from "./SocialRail.module.css";

const ease = [0.2, 0.74, 0.24, 1] as const;

export function SocialRail() {
  const reduceMotion = useReducedMotion();
  const transition = { duration: reduceMotion ? 0 : 0.56, ease } as const;

  if (footerContent.socialLinks.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby="social-rail-title">
      <div className={styles.inner}>
        <motion.h2
          id="social-rail-title"
          className={styles.title}
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={transition}
        >
          تابعي د. ناريمان
        </motion.h2>
        <nav className={styles.links} aria-label="روابط التواصل الاجتماعي">
          {footerContent.socialLinks.map((link, index) => (
            <motion.a
              key={link.href}
              className={styles.link}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`زيارة ${link.label}`}
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ ...transition, delay: reduceMotion ? 0 : 0.1 + index * 0.07 }}
            >
              <SocialPlatformIcon platform={link.label} />
            </motion.a>
          ))}
        </nav>
      </div>
    </section>
  );
}
