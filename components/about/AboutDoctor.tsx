"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { animate, motion, useInView, useReducedMotion, type Variants } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { aboutDoctor } from "@/data/about";
import { AnimatedSectionTitle } from "@/components/ui/AnimatedSectionTitle";
import { DoctorAboutVisual } from "./DoctorAboutVisual";
import styles from "./AboutDoctor.module.css";

const sectionVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12
    }
  }
};

const revealUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.62, ease: [0.2, 0.74, 0.24, 1] }
  }
};

const credentialLine: Variants = {
  hidden: { scaleY: 0, opacity: 0 },
  visible: {
    scaleY: 1,
    opacity: 1,
    transition: { duration: 0.68, ease: [0.2, 0.74, 0.24, 1] }
  }
};

function ExperienceCounter() {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);
  const isInView = useInView(ref, { once: true, amount: 0.6 });
  const [count, setCount] = useState(aboutDoctor.experience.value);
  const displayCount = reduceMotion ? aboutDoctor.experience.value : count;

  useEffect(() => {
    if (!isInView || reduceMotion || hasAnimated.current) {
      return;
    }

    hasAnimated.current = true;
    const controls = animate(0, aboutDoctor.experience.value, {
      duration: 1.55,
      ease: [0.2, 0.74, 0.24, 1],
      onUpdate: (latest) => setCount(Math.round(latest))
    });

    return () => controls.stop();
  }, [isInView, reduceMotion]);

  return (
    <motion.div
      ref={ref}
      className={styles.experience}
      variants={revealUp}
      role="text"
      aria-label={`${aboutDoctor.experience.value}${aboutDoctor.experience.suffix} ${aboutDoctor.experience.label}`}
    >
      <span className={styles.experienceNumber} aria-hidden="true">
        <span className={styles.digits}>{displayCount}</span>
        <span>{aboutDoctor.experience.suffix}</span>
      </span>
      <span className={styles.experienceLabel} aria-hidden="true">
        {aboutDoctor.experience.label}
      </span>
    </motion.div>
  );
}

export function AboutDoctor() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      id="doctor"
      className={styles.about}
      aria-labelledby="about-title"
      initial={reduceMotion ? "visible" : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.18 }}
      variants={sectionVariants}
    >
      <div className={styles.inner}>
        <div className={styles.backgroundName} aria-hidden="true">
          ناريمان
        </div>
        <div className={styles.organicShape} aria-hidden="true" />

        <motion.header className={styles.header} variants={sectionVariants}>
          <motion.p className={styles.label} variants={revealUp}>
            <span className={styles.labelLine} aria-hidden="true" />
            <AnimatedSectionTitle>{aboutDoctor.label}</AnimatedSectionTitle>
            <span className={styles.labelLine} aria-hidden="true" />
          </motion.p>
          <motion.h2 id="about-title" className={styles.heading} variants={revealUp}>
            <AnimatedSectionTitle>
              {aboutDoctor.headingLines.map((line) => (
                <span key={line}>
                  {line}
                  <br />
                </span>
              ))}
            </AnimatedSectionTitle>
          </motion.h2>
        </motion.header>

        <motion.div className={styles.scene} variants={sectionVariants}>
          <motion.div className={styles.copy} variants={revealUp}>
            <p>{aboutDoctor.paragraph}</p>
          </motion.div>

          <ExperienceCounter />

          <DoctorAboutVisual />

          <motion.div className={styles.credentials} variants={sectionVariants}>
            <motion.div className={styles.credentialsLine} aria-hidden="true" variants={credentialLine} />
            <ol>
              {aboutDoctor.credentials.map((credential, index) => (
                <motion.li key={credential.title} variants={revealUp}>
                  <span className={styles.credentialIndex}>{String(index + 1).padStart(2, "0")}</span>
                  <span className={styles.credentialCopy}>
                    <strong>{credential.title}</strong>
                    <span>{credential.detail}</span>
                  </span>
                </motion.li>
              ))}
            </ol>
          </motion.div>

          <motion.div className={styles.actionSlot} variants={revealUp}>
            <Link className={styles.cta} href={aboutDoctor.cta.href}>
              <span>{aboutDoctor.cta.label}</span>
              <ArrowLeft aria-hidden="true" size={20} strokeWidth={2.2} />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}
