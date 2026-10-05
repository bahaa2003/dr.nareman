"use client";

import Link from "next/link";
import { ArrowLeft, CalendarDays, Clock3, MessageCircle } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { bookingFinale, type BookingLink } from "@/data/booking";
import styles from "./ServicesBookingFinale.module.css";

const ease = [0.2, 0.74, 0.24, 1] as const;

function linkProps(link: BookingLink) {
  return link.external ? { target: "_blank", rel: "noopener noreferrer" } : {};
}

export function ServicesBookingFinale() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      id="booking"
      className={styles.section}
      aria-labelledby="services-booking-title"
      initial={reduceMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <div className={styles.scene}>
        <motion.span
          className={styles.backgroundWord}
          aria-hidden="true"
          variants={{
            hidden: { opacity: 0, y: 16 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.72, ease } }
          }}
        >
          موعد
        </motion.span>

        <svg className={styles.editorialLine} viewBox="0 0 720 240" aria-hidden="true" focusable="false">
          <path d="M-22 190 C112 116 248 112 358 148 C488 190 594 126 748 38" />
          <circle cx="358" cy="148" r="5" />
        </svg>

        <div className={styles.copy}>
          <motion.p
            className={styles.eyebrow}
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.5, ease } } }}
          >
            الخطوة التالية
          </motion.p>
          <motion.h2
            id="services-booking-title"
            variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.64, ease, delay: 0.07 } } }}
          >
            مش متأكدة
            <span>أي خدمة تناسب حالتك؟</span>
          </motion.h2>
          <motion.p
            className={styles.lead}
            variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.56, ease, delay: 0.14 } } }}
          >
            {bookingFinale.lead}
          </motion.p>
        </div>

        <motion.div
          className={styles.details}
          variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.56, ease, delay: 0.22 } } }}
        >
          <Link className={styles.bookingCta} href={bookingFinale.links.whatsapp.href} {...linkProps(bookingFinale.links.whatsapp)}>
            <MessageCircle aria-hidden="true" size={20} strokeWidth={2.15} />
            <span>{bookingFinale.links.whatsapp.label}</span>
            <ArrowLeft className={styles.ctaArrow} aria-hidden="true" size={19} strokeWidth={2.25} />
          </Link>

          <p className={styles.schedule}>
            <CalendarDays aria-hidden="true" size={17} strokeWidth={2} />
            <span>{bookingFinale.schedule.days.join(" · ")}</span>
            <span className={styles.scheduleDivider} aria-hidden="true" />
            <Clock3 aria-hidden="true" size={17} strokeWidth={2} />
            <span>{bookingFinale.schedule.hours}</span>
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
}
