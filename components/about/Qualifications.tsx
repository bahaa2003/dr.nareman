"use client";

import { motion, useReducedMotion } from "framer-motion";
import { aboutDoctor } from "@/data/about";
import styles from "./Qualifications.module.css";

const ease = [0.2, 0.74, 0.24, 1] as const;

const qualificationPositions = [styles.firstQualification, styles.secondQualification, styles.thirdQualification] as const;

export function Qualifications() {
  const reduceMotion = useReducedMotion();

  return (
    <section className={styles.section} aria-labelledby="qualifications-title">
      <div className={styles.inner}>
        <motion.span
          className={styles.backgroundWord}
          aria-hidden="true"
          initial={reduceMotion ? false : { opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: reduceMotion ? 0 : 1.2, ease }}
        >
          REI
        </motion.span>
        <span className={styles.pinkDot} aria-hidden="true" />

        <motion.header
          className={styles.header}
          initial={reduceMotion ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, amount: 0.45 }}
        >
          <motion.p
            className={styles.eyebrow}
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: reduceMotion ? 0 : 0.5, ease }}
          >
            المؤهلات والاعتمادات
          </motion.p>
          <motion.h2
            id="qualifications-title"
            className={styles.title}
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: reduceMotion ? 0 : 0.62, ease, delay: reduceMotion ? 0 : 0.08 }}
          >
            أساس علمي يواكب خبرة الممارسة
          </motion.h2>
        </motion.header>

        <div className={styles.canvas}>
          {aboutDoctor.qualifications.map((qualification, index) => {
            const isFeatured = Boolean(qualification.acronym);
            const entrance = isFeatured ? { opacity: 0, y: 28, scale: 0.97 } : { opacity: 0, x: index === 0 ? 36 : 28 };

            return (
              <motion.article
                key={qualification.title}
                className={`${styles.qualification} ${qualificationPositions[index]}`}
                initial={reduceMotion ? false : entrance}
                whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: reduceMotion ? 0 : isFeatured ? 0.8 : 0.65, ease }}
              >
              {qualification.acronym ? (
                <motion.span
                  className={styles.featureField}
                  aria-hidden="true"
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: reduceMotion ? 0 : 0.58, ease }}
                />
              ) : null}
              {isFeatured ? (
                <motion.span
                  className={styles.index}
                  initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: reduceMotion ? 0 : 0.48, ease, delay: reduceMotion ? 0 : 0.08 }}
                >
                  {String(index + 1).padStart(2, "0")}
                </motion.span>
              ) : (
                <span className={styles.index}>{String(index + 1).padStart(2, "0")}</span>
              )}
              {isFeatured ? (
                <motion.h3
                  initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: reduceMotion ? 0 : 0.5, ease, delay: reduceMotion ? 0 : 0.15 }}
                >
                  {qualification.title}
                </motion.h3>
              ) : (
                <h3>{qualification.title}</h3>
              )}
              {qualification.acronym ? (
                <motion.span
                  className={styles.acronym}
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: reduceMotion ? 0 : 0.54, ease, delay: reduceMotion ? 0 : 0.22 }}
                >
                  {qualification.acronym}
                </motion.span>
              ) : null}
              {isFeatured ? (
                <motion.p
                  initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: reduceMotion ? 0 : 0.5, ease, delay: reduceMotion ? 0 : 0.29 }}
                >
                  {qualification.institution}
                </motion.p>
              ) : (
                <p>{qualification.institution}</p>
              )}
              </motion.article>
            );
          })}
        </div>

        <aside className={styles.accreditationRail}>
          <motion.span
            className={styles.railReveal}
            aria-hidden="true"
            initial={reduceMotion ? false : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: reduceMotion ? 0 : 0.7, ease }}
          />
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: reduceMotion ? 0 : 0.46, ease, delay: reduceMotion ? 0 : 0.12 }}
          >
            اعتماد مهني
          </motion.p>
          <ul>
            {aboutDoctor.accreditations.map((accreditation, index) => (
              <motion.li
                key={accreditation.title}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: reduceMotion ? 0 : 0.46, ease, delay: reduceMotion ? 0 : 0.2 + index * 0.08 }}
              >
                <strong>{accreditation.title}</strong>
                {accreditation.detail ? <span>{accreditation.detail}</span> : null}
              </motion.li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}
