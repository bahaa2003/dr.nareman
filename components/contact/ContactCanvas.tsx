"use client";

import { ExternalLink, MapPin, MessageCircle } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { bookingFinale, type BookingLink } from "@/data/booking";
import styles from "./ContactCanvas.module.css";

const ease = [0.2, 0.74, 0.24, 1] as const;

function linkProps(link: BookingLink) {
  return link.external ? { target: "_blank", rel: "noopener noreferrer" } : {};
}

export function ContactCanvas() {
  const reduceMotion = useReducedMotion();
  const transition = { duration: reduceMotion ? 0 : 0.7, ease } as const;

  return (
    <section className={styles.section} aria-label="معلومات الحجز والتواصل">
      <div className={styles.inner}>
        <div className={styles.canvas}>
          <motion.section
            className={styles.schedule}
            initial={reduceMotion ? false : { opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={transition}
            aria-labelledby="clinic-hours-title"
          >
            <p className={styles.sectionLabel}>مواعيد العيادة</p>
            <h2 id="clinic-hours-title" className={styles.scheduleDays}>
              {bookingFinale.schedule.days.map((day, index) => (
                <motion.span
                  key={day}
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ ...transition, delay: reduceMotion ? 0 : 0.12 + index * 0.08 }}
                >
                  {day}
                </motion.span>
              ))}
            </h2>
            <p className={styles.hours}>{bookingFinale.schedule.hours}</p>
          </motion.section>

          <motion.section
            id="booking-location"
            className={styles.location}
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ ...transition, delay: reduceMotion ? 0 : 0.1 }}
            aria-labelledby="location-title"
          >
            <motion.span
              className={styles.locationLine}
              aria-hidden="true"
              initial={reduceMotion ? false : { scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ ...transition, delay: reduceMotion ? 0 : 0.2 }}
            />
            <div className={styles.locationVisual} aria-hidden="true">
              <svg viewBox="0 0 340 180" focusable="false">
                <path d="M-8 137 C48 92 86 117 132 78 C177 39 211 66 248 46 C288 24 313 31 350 -5" />
                <path d="M10 172 C65 130 119 154 162 107 C203 62 260 86 329 35" />
                <circle cx="162" cy="107" r="5" />
              </svg>
            </div>
            <MapPin className={styles.mapPin} aria-hidden="true" size={21} strokeWidth={2.2} />
            <p className={styles.sectionLabel}>موقع العيادة</p>
            <h2 id="location-title" className={styles.locationTitle}>موقع العيادة على الخريطة</h2>
            <a
              className={styles.mapLink}
              href={bookingFinale.links.maps.href}
              {...linkProps(bookingFinale.links.maps)}
            >
              <span>افتحي الخريطة</span>
              <ExternalLink aria-hidden="true" size={17} strokeWidth={2.1} />
            </a>
          </motion.section>

          <motion.section
            className={styles.booking}
            initial={reduceMotion ? false : { opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ ...transition, delay: reduceMotion ? 0 : 0.18 }}
            aria-labelledby="direct-booking-title"
          >
            <span className={styles.bookingMark} aria-hidden="true">01</span>
            <p className={styles.sectionLabel}>الحجز المباشر</p>
            <h2 id="direct-booking-title" className={styles.bookingTitle}>ابدئي المحادثة</h2>
            <p className={styles.bookingCaption}>الرد عبر واتساب</p>
            <a
              className={styles.bookingCta}
              href={bookingFinale.links.whatsapp.href}
              aria-label="احجزي عبر واتساب"
              {...linkProps(bookingFinale.links.whatsapp)}
            >
              <MessageCircle aria-hidden="true" size={20} strokeWidth={2.2} />
              <span>احجزي موعدك</span>
            </a>
          </motion.section>
        </div>

      </div>
    </section>
  );
}
