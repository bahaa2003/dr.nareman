"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { ArticlePreview } from "@/types/public-articles";
import styles from "./ArticlesIndex.module.css";

type ArticlesIndexProps = {
  articles: ArticlePreview[];
};

const ease = [0.2, 0.74, 0.24, 1] as const;

export function ArticlesIndex({ articles }: ArticlesIndexProps) {
  const reduceMotion = useReducedMotion();
  const transition = { duration: reduceMotion ? 0 : 0.7, ease } as const;

  if (articles.length === 0) return null;

  return (
    <section id="all-articles" className={styles.section} aria-label="باقي المقالات">
      <div className={styles.inner}>
        {articles.map((article, index) => {
          const articleNumber = String(index + 2).padStart(2, "0");
          const isReversed = index % 2 === 1;
          const imageOffset = isReversed ? -24 : 24;

          return (
            <div key={article.id}>
              {index > 0 ? (
                <div className={styles.separator} aria-hidden="true">
                  <span />
                  <i />
                  <span />
                </div>
              ) : null}

              <article className={`${styles.story}${isReversed ? ` ${styles.storyReversed}` : ""}`}>
                <motion.div
                  className={styles.storyHeader}
                  initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={transition}
                >
                  <span className={styles.articleNumber} aria-label={`المقال رقم ${articleNumber}`}>
                    {articleNumber}
                  </span>
                  <p className={styles.category}>{article.category}</p>
                </motion.div>

                <motion.figure
                  className={styles.imageFrame}
                  initial={reduceMotion ? false : { opacity: 0, x: imageOffset }}
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

                <motion.div
                  className={styles.copy}
                  initial={reduceMotion ? false : { opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ ...transition, delay: reduceMotion ? 0 : 0.1 }}
                >
                  <h2 className={styles.title}>{article.title}</h2>
                  <p className={styles.excerpt}>{article.excerpt}</p>
                  {article.readingTime ? (
                    <div className={styles.meta}>
                      <span>{article.readingTime}</span>
                      <Link className={styles.comingSoon} href={`/articles/${article.slug}`}>
                        قراءة المقال
                      </Link>
                    </div>
                  ) : null}
                </motion.div>
              </article>
            </div>
          );
        })}
      </div>
    </section>
  );
}
