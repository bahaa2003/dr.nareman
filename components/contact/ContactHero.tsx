"use client";

import { MessageCircle } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { bookingFinale, type BookingLink } from "@/data/booking";
import styles from "./ContactHero.module.css";

const ease = [0.2, 0.74, 0.24, 1] as const;

function linkProps(link: BookingLink) {
  return link.external ? { target: "_blank", rel: "noopener noreferrer" } : {};
}

export function ContactHero() {
  const reduceMotion = useReducedMotion();
  const transition = { duration: reduceMotion ? 0 : 0.62, ease } as const;

  return (
    <section className={styles.shell} aria-labelledby="contact-hero-title">
      <div className={styles.panel}>
        <motion.span
          className={styles.backgroundWord}
          aria-hidden="true"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ...transition, delay: reduceMotion ? 0 : 0.18 }}
        >
          تواصل
        </motion.span>
        <span className={styles.pinkDot} aria-hidden="true" />
        <span className={styles.mintLine} aria-hidden="true" />
        <svg className={styles.editorialCurve} viewBox="0 0 740 240" aria-hidden="true" focusable="false">
          <path d="M-28 206 C140 138 272 80 416 123 C548 162 632 117 780 18" />
        </svg>

        <div className={styles.content}>
          <motion.p
            className={styles.eyebrow}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transition}
          >
            تواصل واحجزي
          </motion.p>
          <h1 id="contact-hero-title" className={styles.title}>
            {["خطوتك الأولى", "تبدأ بسؤال"].map((line, index) => (
              <motion.span
                key={line}
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
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
            التواصل والحجز متاحان بسهولة عبر القنوات المتاحة، لتبدئي الخطوة التالية بهدوء.
          </motion.p>
          <motion.a
            className={styles.bookingCta}
            href={bookingFinale.links.whatsapp.href}
            aria-label="احجزي عبر واتساب"
            {...linkProps(bookingFinale.links.whatsapp)}
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition, delay: reduceMotion ? 0 : 0.4 }}
          >
            <MessageCircle aria-hidden="true" size={20} strokeWidth={2.2} />
            <span>احجزي عبر واتساب</span>
          </motion.a>
        </div>
      </div>
    </section>
  );
}
