"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowLeft, CalendarDays, CheckCircle2 } from "lucide-react";
import { aboutDoctor } from "@/data/about";
import styles from "./AboutDoctor.module.css";

const sectionVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12
    }
  }
};

const copyVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.64, ease: [0.2, 0.74, 0.24, 1] }
  }
};

const stageVariants: Variants = {
  hidden: { opacity: 0, y: 34, scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.76, ease: [0.2, 0.74, 0.24, 1] }
  }
};

const relaxedImageVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.985 },
  visible: {
    opacity: [0, 1, 1, 0],
    y: [24, 0, 0, -8],
    scale: [0.985, 1, 1, 0.995],
    transition: {
      duration: 2.35,
      times: [0, 0.24, 0.7, 1],
      ease: [0.2, 0.74, 0.24, 1]
    }
  }
};

const crossedImageVariants: Variants = {
  hidden: { opacity: 0, y: 18, scale: 1.015 },
  visible: {
    opacity: [0, 0, 1],
    y: [18, 18, 0],
    scale: [1.015, 1.015, 1],
    transition: {
      duration: 2.45,
      times: [0, 0.58, 1],
      ease: [0.2, 0.74, 0.24, 1]
    }
  }
};

export function AboutDoctor() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      id="doctor"
      className={styles.about}
      aria-labelledby="about-title"
      initial={reduceMotion ? "visible" : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.24 }}
      variants={sectionVariants}
    >
      <div className={styles.inner}>
        <motion.div className={styles.shell} variants={sectionVariants}>
          <div className={styles.orbOne} aria-hidden="true" />
          <div className={styles.orbTwo} aria-hidden="true" />

          <motion.figure
            className={styles.visual}
            variants={stageVariants}
            role="img"
            aria-label="د. ناريمان الطريري، استشارية علاج العقم وأطفال الأنابيب"
          >
            <div className={styles.visualBackdrop} aria-hidden="true" />
            <svg className={styles.visualLine} viewBox="0 0 560 460" aria-hidden="true" focusable="false">
              <path d="M38 306 C126 170 254 134 360 202 C450 260 487 229 532 143" />
              <path d="M84 356 C174 236 280 226 372 286 C446 334 492 314 534 250" />
              <circle cx="366" cy="205" r="5" />
            </svg>

            <div className={styles.imageFrame}>
              <motion.div
                className={styles.imageLayer}
                variants={reduceMotion ? undefined : relaxedImageVariants}
                initial={reduceMotion ? false : "hidden"}
                whileInView={reduceMotion ? undefined : "visible"}
                viewport={{ once: true, amount: 0.35 }}
                aria-hidden="true"
              >
                <Image
                  src={aboutDoctor.images.relaxed}
                  alt=""
                  fill
                  sizes="(max-width: 767px) 78vw, (max-width: 1180px) 46vw, 520px"
                  className={styles.doctorImage}
                />
              </motion.div>

              <motion.div
                className={styles.imageLayer}
                variants={reduceMotion ? undefined : crossedImageVariants}
                initial={reduceMotion ? { opacity: 1 } : "hidden"}
                whileInView={reduceMotion ? undefined : "visible"}
                viewport={{ once: true, amount: 0.35 }}
                aria-hidden="true"
              >
                <Image
                  src={aboutDoctor.images.armsCrossed}
                  alt=""
                  fill
                  sizes="(max-width: 767px) 78vw, (max-width: 1180px) 46vw, 520px"
                  className={styles.doctorImage}
                />
              </motion.div>
            </div>

            <figcaption className={styles.namePlate}>
              <span>{aboutDoctor.name}</span>
              <small>{aboutDoctor.specialty}</small>
            </figcaption>
          </motion.figure>

          <motion.div className={styles.copy} variants={sectionVariants}>
            <motion.p className={styles.label} variants={copyVariants}>
              {aboutDoctor.label}
            </motion.p>
            <motion.h2 id="about-title" variants={copyVariants}>
              {aboutDoctor.heading}
            </motion.h2>
            <motion.p className={styles.paragraph} variants={copyVariants}>
              {aboutDoctor.paragraph}
            </motion.p>

            <motion.ul className={styles.highlights} variants={sectionVariants}>
              {aboutDoctor.highlights.map((item) => (
                <motion.li key={item} variants={copyVariants}>
                  <CheckCircle2 aria-hidden="true" size={19} strokeWidth={2} />
                  <span>{item}</span>
                </motion.li>
              ))}
            </motion.ul>

            <motion.div className={styles.actions} variants={copyVariants}>
              <Link className={styles.primary} href={aboutDoctor.ctas.booking.href}>
                <CalendarDays aria-hidden="true" size={20} strokeWidth={2.2} />
                <span>{aboutDoctor.ctas.booking.label}</span>
              </Link>
              <Link className={styles.secondary} href={aboutDoctor.ctas.services.href}>
                <ArrowLeft aria-hidden="true" size={20} strokeWidth={2.2} />
                <span>{aboutDoctor.ctas.services.label}</span>
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}
