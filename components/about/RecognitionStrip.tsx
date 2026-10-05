"use client";

import { motion, useReducedMotion } from "framer-motion";
import { aboutDoctor } from "@/data/about";
import styles from "./RecognitionStrip.module.css";

const ease = [0.2, 0.74, 0.24, 1] as const;

export function RecognitionStrip() {
  const reduceMotion = useReducedMotion();

  return (
    <section className={styles.section} aria-labelledby="recognition-title">
      <div className={styles.inner}>
        <h2 id="recognition-title">محطات وإنجازات</h2>
        <ol>
          {aboutDoctor.recognitions.map((recognition, index) => (
            <motion.li
              key={`${recognition.year}-${recognition.title}`}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: reduceMotion ? 0 : 0.5, ease, delay: reduceMotion ? 0 : index * 0.1 }}
            >
              <motion.span
                className={styles.year}
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: reduceMotion ? 0 : 0.46, ease, delay: reduceMotion ? 0 : index * 0.1 }}
              >
                {recognition.year}
              </motion.span>
              <motion.span
                className={styles.copy}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: reduceMotion ? 0 : 0.46, ease, delay: reduceMotion ? 0 : 0.08 + index * 0.1 }}
              >
                <strong>{recognition.title}</strong>
                <span>{recognition.organization}</span>
              </motion.span>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
