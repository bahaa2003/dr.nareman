"use client";

import Image from "next/image";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { verifiedServices } from "@/data/services";
import { siteContent } from "@/data/site";
import { ActionLink } from "@/components/ui/ActionLink";
import styles from "./ServicesHero.module.css";

const serviceCount = String(verifiedServices.length).padStart(2, "0");

export function ServicesHero() {
  const reduceMotion = useReducedMotion();
  const transition = { duration: reduceMotion ? 0 : 0.62, ease: [0.2, 0.74, 0.24, 1] } as const;

  return (
    <section className={styles.shell} aria-labelledby="services-hero-title">
      <div className={styles.panel}>
        <Image
          className={styles.medicalImage}
          src="/images/articles/ivf-lab-suite.png"
          alt=""
          fill
          priority
          sizes="(max-width: 767px) calc(100vw - 24px), (max-width: 1023px) 92vw, 90vw"
        />
        <div className={styles.imageOverlay} aria-hidden="true" />
        <div className={styles.atmosphere} aria-hidden="true" />

        <motion.span
          className={styles.backgroundWord}
          aria-hidden="true"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition, delay: reduceMotion ? 0 : 0.16 }}
        >
          الخدمات
        </motion.span>

        <svg className={styles.editorialLine} viewBox="0 0 760 300" aria-hidden="true" focusable="false">
          <path d="M-20 246 C150 136 284 88 430 138 C554 181 635 144 784 28" />
          <circle cx="430" cy="138" r="5" />
        </svg>

        <div className={styles.content}>
          <motion.p
            className={styles.eyebrow}
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={transition}
          >
            خدمات د. ناريمان الطريري
          </motion.p>

          <motion.h1
            id="services-hero-title"
            className={styles.title}
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition, delay: reduceMotion ? 0 : 0.1 }}
          >
            رعاية متخصصة
            <span>لكل مرحلة من رحلة الإنجاب</span>
          </motion.h1>

          <motion.div
            className={styles.actions}
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition, delay: reduceMotion ? 0 : 0.22 }}
          >
            <ActionLink
              href="#all-services"
              variant="primary"
              className={styles.primaryAction}
              icon={<ArrowLeft aria-hidden="true" size={19} strokeWidth={2.2} />}
            >
              استكشفي الخدمات
            </ActionLink>
            <ActionLink
              href={siteContent.ctas.booking.href}
              variant="secondary"
              className={styles.secondaryAction}
              icon={<CalendarDays aria-hidden="true" size={18} strokeWidth={2.1} />}
            >
              احجزي موعدك
            </ActionLink>
          </motion.div>
        </div>

        <motion.div
          className={styles.serviceIndex}
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition, delay: reduceMotion ? 0 : 0.3 }}
        >
          <span className={styles.indexNumber}>01 — {serviceCount}</span>
          <span>خدمات متخصصة</span>
        </motion.div>
      </div>
    </section>
  );
}
