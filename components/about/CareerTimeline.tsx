"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion, type Variants } from "framer-motion";
import { aboutDoctor } from "@/data/about";
import styles from "./CareerTimeline.module.css";

const ease = [0.2, 0.74, 0.24, 1] as const;

const stageVariants: Variants = {
  hidden: { opacity: 0.35, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.58, ease }
  }
};

const separatorVariants: Variants = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 0.7, ease, delay: 0.1 }
  }
};

type CareerStageData = (typeof aboutDoctor.professionalExperience)[number];

type CareerStageProps = {
  stage: CareerStageData;
  index: number;
  isActive: boolean;
  onActive: (index: number) => void;
  reduceMotion: boolean | null;
};

function CareerStage({ stage, index, isActive, onActive, reduceMotion }: CareerStageProps) {
  const ref = useRef<HTMLLIElement>(null);
  const isInView = useInView(ref, { amount: 0.55 });

  useEffect(() => {
    if (isInView) {
      onActive(index);
    }
  }, [index, isInView, onActive]);

  return (
    <motion.li
      ref={ref}
      className={`${styles.stage}${isActive ? ` ${styles.active}` : ""}${stage.current ? ` ${styles.current}` : ""}`}
      aria-current={isActive ? "step" : undefined}
      initial={reduceMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <motion.time className={styles.period} variants={stageVariants} dateTime={stage.startYear}>
        {stage.startYear} — {stage.endYear}
      </motion.time>
      <motion.div className={styles.stageCopy} variants={stageVariants}>
        <motion.span
          className={styles.activeDot}
          aria-hidden="true"
          initial={false}
          animate={{ opacity: isActive ? 1 : 0.35, scale: isActive ? 1 : 0.6 }}
          transition={{ duration: reduceMotion ? 0 : 0.28, ease }}
        />
        <h3>{stage.title}</h3>
        <p>{stage.organization}</p>
      </motion.div>
      <motion.span className={styles.separator} aria-hidden="true" variants={separatorVariants} />
    </motion.li>
  );
}

export function CareerTimeline() {
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const activeStage = aboutDoctor.professionalExperience[activeIndex];

  return (
    <section className={styles.section} aria-labelledby="career-timeline-title">
      <div className={styles.inner}>
        <div className={styles.layout}>
          <aside className={styles.stickyYear} aria-label={`بداية المرحلة ${activeStage.startYear}`}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={activeStage.startYear}
                className={styles.stickyValue}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
                transition={{ duration: reduceMotion ? 0 : 0.38, ease }}
              >
                {activeStage.startYear}
              </motion.span>
            </AnimatePresence>
            <span className={styles.stickyLabel}>بداية المرحلة</span>
          </aside>

          <div className={styles.journey}>
            <header className={styles.header}>
              <p className={styles.eyebrow}>المسيرة المهنية</p>
              <h2 id="career-timeline-title" className={styles.title}>
                خبرة تراكمت عبر سنوات من الممارسة والتخصص
              </h2>
            </header>

            <ol className={styles.timeline}>
              {aboutDoctor.professionalExperience.map((stage, index) => (
                <CareerStage
                  key={`${stage.startYear}-${stage.endYear}-${stage.title}`}
                  stage={stage}
                  index={index}
                  isActive={index === activeIndex}
                  onActive={setActiveIndex}
                  reduceMotion={reduceMotion}
                />
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
