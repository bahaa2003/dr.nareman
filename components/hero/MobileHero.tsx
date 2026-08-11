"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { heroAssets, heroMobilePhrases, siteContent } from "@/data/site";
import { HeroTypewriter } from "./HeroTypewriter";
import styles from "./MobileHero.module.css";

export function MobileHero() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className={styles.mobileHeroShell} aria-labelledby="mobile-hero-title">
      <div className={styles.mobilePanel}>
        <Image
          className={styles.background}
          src={heroAssets.background}
          alt=""
          fill
          priority
          sizes="(max-width: 767px) calc(100vw - 28px), 0px"
        />
        <div className={styles.overlay} aria-hidden="true" />

        <svg className={styles.decorLine} viewBox="0 0 390 690" aria-hidden="true" focusable="false">
          <path d="M24 474 C110 398 215 398 306 456 C342 478 366 478 392 452" />
        </svg>

        <div className={styles.copyZone}>
          <p className={styles.eyebrow}>{siteContent.specialty}</p>
          <h1
            id="mobile-hero-title"
            className={styles.title}
            aria-label={`رعاية متخصصة في ${heroMobilePhrases[0]}`}
          >
            <span className={styles.lead}>رعاية متخصصة في</span>
            <span className={styles.keyword}>
              <HeroTypewriter phrases={heroMobilePhrases} className={styles.keywordTypewriter} />
            </span>
          </h1>
        </div>

        <motion.div
          className={styles.doctorFrame}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          animate={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.72, ease: [0.2, 0.72, 0.22, 1] }}
        >
          <Image
            className={styles.doctorImage}
            src={heroAssets.doctor}
            alt="د. ناريمان الطريري، استشارية علاج العقم وأطفال الأنابيب"
            width={1024}
            height={1024}
            sizes="(max-width: 430px) 275px, (max-width: 767px) 300px, 0px"
            priority
          />
        </motion.div>

        <div className={styles.actions}>
          <a className={styles.primaryCta} href={siteContent.ctas.booking.href}>
            <CalendarDays aria-hidden="true" size={18} strokeWidth={2.2} />
            <span>{siteContent.ctas.booking.label}</span>
          </a>
          <a className={styles.secondaryCta} href={siteContent.ctas.services.href}>
            <span>{siteContent.ctas.services.label}</span>
            <ArrowLeft aria-hidden="true" size={17} strokeWidth={2.2} />
          </a>
        </div>

        <svg className={styles.bottomCurve} viewBox="0 0 390 64" preserveAspectRatio="none" aria-hidden="true">
          <path d="M-20 32 C58 52 132 50 205 36 C278 22 333 26 412 46 L412 76 L-20 76 Z" />
          <path className={styles.mintStroke} d="M-20 32 C58 52 132 50 205 36 C278 22 333 26 412 46" />
          <path className={styles.pinkStroke} d="M-20 28 C58 48 132 46 205 32 C278 18 333 22 412 42" />
        </svg>
      </div>
    </section>
  );
}
