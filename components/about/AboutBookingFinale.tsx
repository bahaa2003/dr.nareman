"use client";

import Link from "next/link";
import { ArrowLeft, CalendarDays, Clock3 } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { bookingFinale, type BookingLink } from "@/data/booking";
import styles from "./AboutBookingFinale.module.css";

const ease = [0.2, 0.74, 0.24, 1] as const;

const sectionVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const eyebrowVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease } }
};

const headingVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.64, ease } }
};

const copyVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.54, ease } }
};

const ctaVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.56, ease } }
};

function linkProps(link: BookingLink) {
  return link.external ? { target: "_blank", rel: "noopener noreferrer" } : {};
}

export function AboutBookingFinale() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      id="booking"
      className={styles.section}
      aria-labelledby="about-booking-title"
      initial={reduceMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.28 }}
      variants={sectionVariants}
    >
      <div className={styles.scene}>
        <motion.span
          className={styles.backgroundWord}
          aria-hidden="true"
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.72, ease } } }}
        >
          معك
        </motion.span>
        <span className={styles.pinkDot} aria-hidden="true" />
        <svg className={styles.editorialLine} viewBox="0 0 720 180" aria-hidden="true" focusable="false">
          <path d="M-20 134 C156 86 280 150 410 98 C514 56 620 74 744 16" />
        </svg>

        <div className={styles.content}>
          <motion.p className={styles.eyebrow} variants={eyebrowVariants}>
            {bookingFinale.eyebrow}
          </motion.p>
          <motion.h2 id="about-booking-title" className={styles.title} variants={headingVariants}>
            ابدئي رحلتك بخطوة <span>واضحة</span>
          </motion.h2>
          <motion.p className={styles.copy} variants={copyVariants}>
            {bookingFinale.lead}
          </motion.p>
          <motion.div className={styles.actions} variants={ctaVariants}>
            <Link className={styles.bookingCta} href={bookingFinale.links.whatsapp.href} {...linkProps(bookingFinale.links.whatsapp)}>
              <span>احجزي موعدك</span>
              <ArrowLeft className={styles.ctaArrow} aria-hidden="true" size={19} strokeWidth={2.25} />
            </Link>
          </motion.div>
          <motion.p className={styles.schedule} variants={copyVariants}>
            <CalendarDays aria-hidden="true" size={16} strokeWidth={2} />
            <span>{bookingFinale.schedule.days.join(" · ")}</span>
            <span className={styles.scheduleDivider} aria-hidden="true" />
            <Clock3 aria-hidden="true" size={16} strokeWidth={2} />
            <span>{bookingFinale.schedule.hours}</span>
          </motion.p>
        </div>
      </div>
    </motion.section>
  );
}
