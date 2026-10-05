"use client";

import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowLeft, CalendarDays, Clock3, ExternalLink, MapPin, MessageCircle } from "lucide-react";
import { bookingFinale, type BookingLink } from "@/data/booking";
import { AnimatedSectionTitle } from "@/components/ui/AnimatedSectionTitle";
import { trackMarketingEvent } from "@/lib/marketing-events";
import styles from "./BookingFinale.module.css";

const ease = [0.2, 0.74, 0.24, 1] as const;

const sectionVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.13,
      delayChildren: 0.08
    }
  }
};

const revealUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.62, ease }
  }
};

const wordVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.72, ease }
  }
};

function linkProps(link: BookingLink) {
  return link.external
    ? {
        target: "_blank",
        rel: "noopener noreferrer"
      }
    : {};
}

export function BookingFinale() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      id="booking"
      className={styles.booking}
      aria-labelledby="booking-title"
      initial={reduceMotion ? "visible" : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.26 }}
      variants={sectionVariants}
    >
      <div className={styles.outer}>
        <motion.div className={styles.scene} variants={sectionVariants}>
          <motion.div className={styles.backgroundWord} aria-hidden="true" variants={wordVariants}>
            احجزي
          </motion.div>

          <div className={styles.content}>
            <div className={styles.primaryZone}>
              <motion.p className={styles.eyebrow} variants={revealUp}>
                {bookingFinale.eyebrow}
              </motion.p>
              <motion.h2 id="booking-title" className={styles.heading} variants={revealUp}>
                <AnimatedSectionTitle>{bookingFinale.heading}</AnimatedSectionTitle>
              </motion.h2>
              <motion.p className={styles.lead} variants={revealUp}>
                {bookingFinale.lead}
              </motion.p>
              <motion.div variants={revealUp}>
                <Link
                  className={styles.bookingCta}
                  href={bookingFinale.links.whatsapp.href}
                  aria-label={bookingFinale.links.whatsapp.label}
                  onClick={() => trackMarketingEvent("booking_cta_clicked", { placement: "homepage_finale" })}
                  {...linkProps(bookingFinale.links.whatsapp)}
                >
                  <MessageCircle aria-hidden="true" size={23} strokeWidth={2.2} />
                  <span>{bookingFinale.links.whatsapp.label}</span>
                  <ArrowLeft className={styles.ctaArrow} aria-hidden="true" size={22} strokeWidth={2.4} />
                </Link>
              </motion.div>
            </div>

            <motion.aside id="booking-location" className={styles.locationPreview} variants={revealUp}>
              <div className={styles.mapWindow} aria-hidden="true">
                <svg viewBox="0 0 360 220" className={styles.mapLines} focusable="false">
                  <path d="M18 72 C86 44 118 88 176 66 C238 42 284 55 342 30" />
                  <path d="M22 160 C86 130 122 148 176 118 C226 91 268 118 338 92" />
                  <path d="M64 18 C92 78 80 122 116 202" />
                  <path d="M230 18 C210 82 234 128 206 202" />
                </svg>
                <span className={styles.mapPin}>
                  <MapPin aria-hidden="true" size={24} strokeWidth={2.4} />
                </span>
              </div>
              <div className={styles.locationCopy}>
                <span className={styles.locationLabel}>موقع العيادة</span>
                <Link
                  className={styles.mapLink}
                  href={bookingFinale.links.maps.href}
                  aria-label={bookingFinale.links.maps.label}
                  {...linkProps(bookingFinale.links.maps)}
                >
                  <span>{bookingFinale.links.maps.label}</span>
                  <ExternalLink aria-hidden="true" size={17} strokeWidth={2.1} />
                </Link>
              </div>
            </motion.aside>

            <motion.div className={styles.schedule} variants={revealUp}>
              <div className={styles.scheduleHeader}>
                <span>
                  <CalendarDays aria-hidden="true" size={20} strokeWidth={2} />
                  مواعيد العيادة
                </span>
                <span>
                  <Clock3 aria-hidden="true" size={20} strokeWidth={2} />
                  {bookingFinale.schedule.hours}
                </span>
              </div>

              <div className={styles.route}>
                <svg className={styles.routeSvg} viewBox="0 0 1120 170" aria-hidden="true" focusable="false">
                  <defs>
                    <linearGradient id="bookingRouteGradient" x1="100%" y1="0%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#fffaf6" />
                      <stop offset="48%" stopColor="#bfe8df" />
                      <stop offset="100%" stopColor="#e9a8b8" />
                    </linearGradient>
                  </defs>
                  <motion.path
                    d="M1060 88 C850 36 706 136 546 88 C386 40 260 54 76 112"
                    pathLength={1}
                    initial={reduceMotion ? { pathLength: 1 } : { pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: reduceMotion ? 0 : 0.92, ease, delay: 0.58 }}
                  />
                </svg>

                <div className={styles.days}>
                  {bookingFinale.schedule.days.map((day, index) => (
                    <motion.span
                      key={day}
                      className={styles.day}
                      initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.5 }}
                      transition={{ duration: reduceMotion ? 0 : 0.42, ease, delay: 0.9 + index * 0.14 }}
                    >
                      {day}
                    </motion.span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
