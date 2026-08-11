"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  ArrowLeft,
  Baby,
  CalendarDays,
  Dna,
  Microscope,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Syringe,
  HeartPulse,
  type LucideIcon
} from "lucide-react";
import { homepageServices, servicesCta, type MedicalService } from "@/data/services";
import { AnimatedSectionTitle } from "@/components/ui/AnimatedSectionTitle";
import styles from "./Services.module.css";

const iconMap: Record<MedicalService["icon"], LucideIcon> = {
  calendar: CalendarDays,
  syringe: Syringe,
  baby: Baby,
  microscope: Microscope,
  sparkles: Sparkles,
  dna: Dna,
  scan: ScanSearch,
  shield: ShieldCheck,
  pulse: HeartPulse
};

const sectionVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12
    }
  }
};

const introVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.2, 0.74, 0.24, 1] }
  }
};

const lineVariants: Variants = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: {
    scaleX: 1,
    opacity: 1,
    transition: { duration: 0.72, ease: [0.2, 0.74, 0.24, 1] }
  }
};

const cardDirections = [
  { y: 38, x: 0 },
  { y: 22, x: 26 },
  { y: 34, x: 0 },
  { y: 24, x: -24 },
  { y: 32, x: 0 },
  { y: 20, x: 18 }
];

const mobileMediaQuery = "(max-width: 767px)";

function subscribeToMobileViewport(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const mediaQuery = window.matchMedia(mobileMediaQuery);
  mediaQuery.addEventListener("change", onStoreChange);

  return () => mediaQuery.removeEventListener("change", onStoreChange);
}

function getMobileViewportSnapshot() {
  return typeof window !== "undefined" && window.matchMedia(mobileMediaQuery).matches;
}

function getServerMobileViewportSnapshot() {
  return false;
}

function useMobileViewport() {
  return useSyncExternalStore(
    subscribeToMobileViewport,
    getMobileViewportSnapshot,
    getServerMobileViewportSnapshot
  );
}

function getCardVariants(index: number, reduceMotion: boolean, isMobile: boolean): Variants {
  if (reduceMotion) {
    return {
      hidden: { opacity: 1, x: 0, y: 0, scale: 1 },
      visible: { opacity: 1, x: 0, y: 0, scale: 1 }
    };
  }

  if (isMobile) {
    const entersFromRight = index % 2 === 0;

    return {
      hidden: {
        opacity: 0,
        x: entersFromRight ? 130 : -130,
        y: 0,
        scale: 0.96
      },
      visible: {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        transition: {
          duration: 0.85,
          ease: [0.16, 1, 0.3, 1]
        }
      }
    };
  }

  const direction = cardDirections[index] ?? cardDirections[0];

  return {
    hidden: {
      opacity: 0,
      x: direction.x,
      y: direction.y,
      scale: 0.97
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      transition: {
        duration: index === 0 ? 0.68 : 0.58,
        ease: [0.2, 0.74, 0.24, 1]
      }
    }
  };
}

export function Services() {
  const reduceMotion = useReducedMotion();
  const isMobile = useMobileViewport();

  return (
    <motion.section
      id="services"
      className={styles.services}
      aria-labelledby="services-title"
      initial={isMobile ? false : reduceMotion ? "visible" : "hidden"}
      whileInView={isMobile ? undefined : "visible"}
      viewport={isMobile ? undefined : { once: true, amount: 0.22 }}
      variants={isMobile ? undefined : sectionVariants}
    >
      <div className={styles.backgroundMark} aria-hidden="true" />
      <div className={styles.inner}>
        <div className={styles.intro}>
          <motion.div
            className={styles.introCopy}
            initial={isMobile ? (reduceMotion ? "visible" : "hidden") : undefined}
            whileInView={isMobile ? "visible" : undefined}
            viewport={isMobile ? { once: true, amount: 0.35 } : undefined}
            variants={introVariants}
          >
            <p className={styles.eyebrow}>خدمات طبية متخصصة</p>
            <h2 id="services-title">
              <AnimatedSectionTitle>رعاية متخصصة لكل مرحلة من رحلة العلاج</AnimatedSectionTitle>
            </h2>
          </motion.div>
          <motion.p
            className={styles.lead}
            initial={isMobile ? (reduceMotion ? "visible" : "hidden") : undefined}
            whileInView={isMobile ? "visible" : undefined}
            viewport={isMobile ? { once: true, amount: 0.35 } : undefined}
            variants={introVariants}
          >
            مسارات علاجية واضحة في العقم وتقنيات المساعدة على الإنجاب، مع تقييم طبي دقيق واختيار الإجراء الأنسب لكل حالة.
          </motion.p>
        </div>

        <motion.div
          className={styles.accentLine}
          aria-hidden="true"
          initial={isMobile ? (reduceMotion ? "visible" : "hidden") : undefined}
          whileInView={isMobile ? "visible" : undefined}
          viewport={isMobile ? { once: true, amount: 0.35 } : undefined}
          variants={lineVariants}
        />

        <motion.div className={styles.bento} variants={isMobile ? undefined : sectionVariants}>
          {homepageServices.map((service, index) => {
            const Icon = iconMap[service.icon];
            const cardClass = [
              styles.card,
              styles[`card${index + 1}`],
              styles[service.tone],
              service.featured ? styles.featured : ""
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <motion.article
                key={`${isMobile ? "mobile" : "desktop"}-${service.slug}`}
                className={cardClass}
                inherit={isMobile ? false : undefined}
                initial={isMobile && !reduceMotion ? "hidden" : undefined}
                whileInView={isMobile && !reduceMotion ? "visible" : undefined}
                viewport={isMobile && !reduceMotion ? { once: true, amount: 0.35 } : undefined}
                variants={getCardVariants(index, Boolean(reduceMotion), isMobile)}
              >
                <Link href={`/services#${service.slug}`} className={styles.cardLink} aria-label={`${service.title} - تفاصيل الخدمة`}>
                  <span className={styles.cardTop}>
                    <span className={styles.cardNumber}>{String(index + 1).padStart(2, "0")}</span>
                    <motion.span
                      className={styles.icon}
                      aria-hidden="true"
                      initial={reduceMotion ? false : { opacity: 0, scale: 0.86 }}
                      whileInView={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.42, delay: 0.14 + index * 0.06, ease: "easeOut" }}
                    >
                      <Icon size={service.featured ? 31 : 25} strokeWidth={1.75} />
                    </motion.span>
                  </span>

                  <span className={styles.cardCopy}>
                    <span className={styles.title}>{service.title}</span>
                    <span className={styles.description}>{service.description}</span>
                  </span>

                  {service.featured ? (
                    <svg className={styles.featurePath} viewBox="0 0 420 180" aria-hidden="true" focusable="false">
                      <path d="M10 128 C90 32 188 28 260 92 C318 144 365 135 410 78" />
                      <circle cx="272" cy="99" r="5" />
                    </svg>
                  ) : null}

                  <span className={styles.cardArrow} aria-hidden="true">
                    <ArrowLeft size={20} strokeWidth={2} />
                  </span>
                </Link>
              </motion.article>
            );
          })}
        </motion.div>

        <motion.div className={styles.footer} variants={introVariants}>
          <Link className={styles.allServices} href={servicesCta.href}>
            <span>{servicesCta.label}</span>
            <ArrowLeft aria-hidden="true" size={20} strokeWidth={2.2} />
          </Link>
        </motion.div>
      </div>
    </motion.section>
  );
}
