"use client";

import { motion, useReducedMotion } from "framer-motion";
import styles from "./ArticlesHero.module.css";

const ease = [0.2, 0.74, 0.24, 1] as const;

export function ArticlesHero() {
  const reduceMotion = useReducedMotion();
  const transition = { duration: reduceMotion ? 0 : 0.58, ease } as const;

  return (
    <section className={styles.shell} aria-labelledby="articles-hero-title">
      <div className={styles.panel}>
        <motion.span
          className={styles.backgroundWord}
          aria-hidden="true"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ...transition, delay: reduceMotion ? 0 : 0.22 }}
        >
          مقالات
        </motion.span>
        <span className={styles.issue} aria-hidden="true">ISSUE 01 / 03</span>
        <span className={styles.pinkDot} aria-hidden="true" />
        <svg className={styles.editorialLine} viewBox="0 0 760 220" aria-hidden="true" focusable="false">
          <path d="M-30 168 C145 102 270 94 405 132 C520 164 630 119 790 28" />
        </svg>

        <div className={styles.content}>
          <motion.p
            className={styles.eyebrow}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transition}
          >
            المدونة الطبية
          </motion.p>
          <h1 id="articles-hero-title" className={styles.title}>
            {["معلومة أوضح", "لقرار أهدأ"].map((line, index) => (
              <motion.span
                key={line}
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...transition, delay: reduceMotion ? 0 : 0.1 + index * 0.09 }}
              >
                {line}
              </motion.span>
            ))}
          </h1>
          <motion.p
            className={styles.lead}
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition, delay: reduceMotion ? 0 : 0.3 }}
          >
            محتوى طبي مبسط وموثوق يساعدك على فهم الخيارات والخطوات بهدوء.
          </motion.p>
        </div>
      </div>
    </section>
  );
}
