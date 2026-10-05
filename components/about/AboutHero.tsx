"use client";

import Image from "next/image";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { aboutDoctor } from "@/data/about";
import { siteContent } from "@/data/site";
import { ActionLink } from "@/components/ui/ActionLink";
import styles from "./AboutHero.module.css";

export function AboutHero() {
  const reduceMotion = useReducedMotion();
  const transition = { duration: reduceMotion ? 0 : 0.62, ease: [0.2, 0.74, 0.24, 1] } as const;
  const titleLines = [
    { label: "خبرة طبية" },
    { label: "ورؤية واضحة", accent: true },
    { label: "في رحلة" },
    { label: "العلاج" }
  ];

  return (
    <section className={styles.shell} aria-labelledby="about-hero-title">
      <div className={styles.panel}>
        <span className={styles.backgroundName} aria-hidden="true">
          ناريمان
        </span>
        <span className={styles.pinkDot} aria-hidden="true" />
        <svg className={styles.editorialLine} viewBox="0 0 720 250" aria-hidden="true" focusable="false">
          <path d="M-20 188 C126 126 210 82 360 120 C482 151 594 106 742 18" />
        </svg>

        <motion.figure
          className={styles.doctorVisual}
          initial={reduceMotion ? false : { opacity: 0, x: -24, scale: 0.985 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.75, ease: [0.2, 0.74, 0.24, 1], delay: reduceMotion ? 0 : 0.08 }}
        >
          <Image
            src={aboutDoctor.media.relaxed}
            alt="د. ناريمان الطريري، استشارية علاج العقم وأطفال الأنابيب"
            fill
            priority
            sizes="(max-width: 767px) 84vw, (max-width: 1100px) 48vw, 620px"
            className={styles.doctorImage}
          />
        </motion.figure>

        <div className={styles.content}>
          <motion.p
            className={styles.eyebrow}
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transition}
          >
            عن د. ناريمان الطريري
          </motion.p>

          <h1
            id="about-hero-title"
            className={styles.title}
          >
            {titleLines.map((line, index) => (
              <motion.span
                key={line.label}
                className={`${styles.titleLine}${line.accent ? ` ${styles.accentLine}` : ""}`}
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.54, ease: [0.2, 0.74, 0.24, 1], delay: reduceMotion ? 0 : 0.16 + index * 0.08 }}
              >
                {line.label}
              </motion.span>
            ))}
          </h1>

          <motion.p
            className={styles.intro}
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition, delay: reduceMotion ? 0 : 0.56 }}
          >
            {aboutDoctor.paragraph}
          </motion.p>

          <motion.div
            className={styles.experience}
            aria-label="10+ سنوات خبرة"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition, delay: reduceMotion ? 0 : 0.62 }}
          >
            <span className={styles.experienceValue}>
              {aboutDoctor.experience.value}
              {aboutDoctor.experience.suffix}
            </span>
            <span>{aboutDoctor.experience.label}</span>
          </motion.div>

          <motion.div
            className={styles.actions}
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition, delay: reduceMotion ? 0 : 0.7 }}
          >
            <ActionLink
              href="#doctor-story"
              variant="primary"
              className={styles.primaryAction}
              icon={<ArrowLeft aria-hidden="true" size={18} strokeWidth={2.2} />}
            >
              تعرفي أكثر
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
      </div>
    </section>
  );
}
