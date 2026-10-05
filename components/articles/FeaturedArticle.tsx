"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { ArticlePreview } from "@/types/public-articles";
import styles from "./FeaturedArticle.module.css";

type FeaturedArticleProps = {
  article: ArticlePreview;
};

const ease = [0.2, 0.74, 0.24, 1] as const;

export function FeaturedArticle({ article }: FeaturedArticleProps) {
  const reduceMotion = useReducedMotion();
  const transition = { duration: reduceMotion ? 0 : 0.62, ease } as const;

  return (
    <section className={styles.section} aria-labelledby="featured-article-title">
      <div className={styles.inner}>
        <motion.figure
          className={styles.imageFrame}
          initial={reduceMotion ? false : { opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={transition}
        >
          {article.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className={styles.image} src={article.image} alt={article.imageAlt} />
          ) : (
            <div className={styles.missingImage} role="img" aria-label="لا توجد صورة غلاف للمقال" />
          )}
        </motion.figure>

        <motion.article
          className={styles.story}
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ ...transition, delay: reduceMotion ? 0 : 0.1 }}
        >
          <motion.div
            className={styles.topline}
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ ...transition, delay: reduceMotion ? 0 : 0.19 }}
          >
            <span className={styles.kicker}>المقال المميز</span>
            <span className={styles.articleNumber} aria-label="المقال رقم 01">01</span>
          </motion.div>

          <motion.p
            className={styles.category}
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ ...transition, delay: reduceMotion ? 0 : 0.26 }}
          >
            {article.category}
          </motion.p>

          <motion.h2
            id="featured-article-title"
            className={styles.title}
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ ...transition, delay: reduceMotion ? 0 : 0.33 }}
          >
            {article.title}
          </motion.h2>

          <motion.p
            className={styles.excerpt}
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ ...transition, delay: reduceMotion ? 0 : 0.4 }}
          >
            {article.excerpt}
          </motion.p>

          {article.readingTime ? (
            <motion.div
              className={styles.meta}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ ...transition, delay: reduceMotion ? 0 : 0.47 }}
            >
              <span>{article.readingTime}</span>
              <Link className={styles.comingSoon} href={`/articles/${article.slug}`}>
                قراءة المقال
              </Link>
            </motion.div>
          ) : null}
        </motion.article>
      </div>
    </section>
  );
}
