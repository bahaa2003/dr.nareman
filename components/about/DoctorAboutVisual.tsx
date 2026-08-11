"use client";

import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { aboutDoctor } from "@/data/about";
import styles from "./AboutDoctor.module.css";

const visualVariants: Variants = {
  hidden: { opacity: 0, y: 36, scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.82, ease: [0.2, 0.74, 0.24, 1] }
  }
};

const relaxedPose: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.99 },
  visible: {
    opacity: [0, 1, 1, 0],
    y: [20, 0, 0, -6],
    scale: [0.99, 1, 1, 0.995],
    transition: {
      duration: 1.95,
      times: [0, 0.3, 0.68, 1],
      ease: [0.2, 0.74, 0.24, 1]
    }
  }
};

const foldedPose: Variants = {
  hidden: { opacity: 0, y: 16, scale: 1.01 },
  visible: {
    opacity: [0, 0, 1],
    y: [16, 16, 0],
    scale: [1.01, 1.01, 1],
    transition: {
      duration: 1.9,
      times: [0, 0.58, 1],
      ease: [0.2, 0.74, 0.24, 1]
    }
  }
};

export function DoctorAboutVisual() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.figure
      className={styles.doctorVisual}
      variants={visualVariants}
      role="img"
      aria-label="د. ناريمان الطريري، استشارية علاج العقم وأطفال الأنابيب"
    >
      <svg className={styles.visualCurve} viewBox="0 0 620 520" aria-hidden="true" focusable="false">
        <path d="M52 346 C150 176 298 152 406 240 C500 318 540 284 592 164" />
        <path d="M92 416 C186 286 310 278 430 350 C512 400 558 370 600 292" />
        <circle cx="417" cy="246" r="6" />
      </svg>

      <div className={styles.imageStack}>
        {reduceMotion ? (
          <Image
            src={aboutDoctor.media.fallback}
            alt=""
            fill
            priority={false}
            sizes="(max-width: 767px) 86vw, (max-width: 1180px) 52vw, 620px"
            className={styles.doctorImage}
            aria-hidden="true"
          />
        ) : (
          <>
            <motion.div className={styles.poseLayer} variants={relaxedPose} aria-hidden="true">
              <Image
                src={aboutDoctor.media.relaxed}
                alt=""
                fill
                priority={false}
                sizes="(max-width: 767px) 86vw, (max-width: 1180px) 52vw, 620px"
                className={styles.doctorImage}
              />
            </motion.div>
            <motion.div className={styles.poseLayer} variants={foldedPose} aria-hidden="true">
              <Image
                src={aboutDoctor.media.armsCrossed}
                alt=""
                fill
                priority={false}
                sizes="(max-width: 767px) 86vw, (max-width: 1180px) 52vw, 620px"
                className={styles.doctorImage}
              />
            </motion.div>
          </>
        )}
      </div>
    </motion.figure>
  );
}
