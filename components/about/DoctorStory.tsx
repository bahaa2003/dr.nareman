"use client";

import { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform
} from "framer-motion";
import { aboutDoctor } from "@/data/about";
import styles from "./DoctorStory.module.css";

const ease = [0.2, 0.74, 0.24, 1] as const;

function ExperienceCountUp() {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.45 });
  const count = useMotionValue(0);
  const roundedCount = useTransform(count, (latest) => Math.round(latest));
  const [displayCount, setDisplayCount] = useState(0);
  const [isComplete, setIsComplete] = useState(reduceMotion);

  useMotionValueEvent(roundedCount, "change", setDisplayCount);

  useEffect(() => {
    if (!isInView || reduceMotion) {
      return;
    }

    const controls = animate(count, aboutDoctor.experience.value, {
      duration: 1.75,
      ease,
      onComplete: () => setIsComplete(true)
    });

    return () => controls.stop();
  }, [count, isInView, reduceMotion]);

  const value = reduceMotion ? aboutDoctor.experience.value : displayCount;

  return (
    <div
      ref={ref}
      className={styles.experience}
      role="text"
      aria-label={`${aboutDoctor.experience.value}${aboutDoctor.experience.suffix} ${aboutDoctor.experience.label}`}
    >
      <span className={styles.experienceValue} aria-hidden="true">
        {value}
        {isComplete ? aboutDoctor.experience.suffix : null}
      </span>
      <span className={styles.experienceLabel}>{aboutDoctor.experience.label}</span>
    </div>
  );
}

export function DoctorStory() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      id="doctor-story"
      className={styles.story}
      aria-labelledby="doctor-story-title"
      initial={reduceMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className={styles.inner}>
        <motion.span
          className={styles.backgroundWord}
          aria-hidden="true"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: reduceMotion ? 0 : 1, ease }}
        >
          رعاية
        </motion.span>
        <motion.svg
          className={styles.manifestoCurve}
          viewBox="0 0 980 360"
          aria-hidden="true"
          focusable="false"
          initial={reduceMotion ? false : { opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: reduceMotion ? 0 : 0.82, ease, delay: reduceMotion ? 0 : 0.12 }}
          style={{ transformOrigin: "right center" }}
        >
          <path d="M32 300 C198 234 290 152 458 184 C650 222 760 128 956 36" />
          <circle cx="458" cy="184" r="5" />
        </motion.svg>

        <div className={styles.manifesto}>
          <div className={styles.narrative}>
            <motion.p
              className={styles.eyebrow}
              initial={reduceMotion ? false : { opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: reduceMotion ? 0 : 0.58, ease }}
            >
              فلسفة الرعاية
            </motion.p>
            <motion.h2
              id="doctor-story-title"
              className={styles.title}
              initial={reduceMotion ? false : { opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: reduceMotion ? 0 : 0.66, ease, delay: reduceMotion ? 0 : 0.06 }}
            >
              رعاية تبدأ بتشخيص دقيق وخطة علاج واضحة
            </motion.h2>
            <motion.p
              className={styles.copy}
              initial={reduceMotion ? false : { opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: reduceMotion ? 0 : 0.6, ease, delay: reduceMotion ? 0 : 0.12 }}
            >
              {aboutDoctor.paragraph}
            </motion.p>
          </div>

          <div className={styles.experienceWrap}>
            <ExperienceCountUp />
          </div>
        </div>
      </div>
    </motion.section>
  );
}
