"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import type { ArticlePreview } from "@/types/public-articles";
import styles from "./ArticlesSection.module.css";

type ArticleSlideProps = {
  article: ArticlePreview;
  index: number;
  total: number;
  variant: "active" | "peek";
  reduceMotion: boolean;
};

const revealEase = [0.2, 0.74, 0.24, 1] as const;

const reveal = {
  hidden: { opacity: 0, y: 18, clipPath: "inset(0 0 32% 0)" },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    clipPath: "inset(0 0 0% 0)",
    transition: {
      duration: 0.52,
      delay,
      ease: revealEase
    }
  })
};

export function ArticleSlide({ article, index, total, variant, reduceMotion }: ArticleSlideProps) {
  const isActive = variant === "active";
  const number = String(index + 1).padStart(2, "0");
  const count = String(total).padStart(2, "0");

  return (
    <article className={[styles.slide, isActive ? styles.activeSlide : styles.peekSlide].join(" ")}>
      <div className={styles.imageWrap}>
        {article.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className={styles.articleImage} src={article.image} alt={article.imageAlt} />
        ) : (
          <div className={styles.missingImage} role="img" aria-label="لا توجد صورة غلاف للمقال" />
        )}
      </div>

      <div className={styles.articleOverlay} aria-hidden="true" />

      {isActive ? (
        <div className={styles.articleContent}>
          <motion.div
            className={styles.articleMeta}
            custom={reduceMotion ? 0 : 0.08}
            variants={reveal}
            initial={reduceMotion ? false : "hidden"}
            animate="visible"
          >
            <span>{article.category}</span>
            {article.readingTime ? <span>{article.readingTime}</span> : null}
          </motion.div>

          <motion.h3
            className={styles.articleTitle}
            custom={reduceMotion ? 0 : 0.16}
            variants={reveal}
            initial={reduceMotion ? false : "hidden"}
            animate="visible"
          >
            {article.title}
          </motion.h3>

          <motion.p
            className={styles.articleExcerpt}
            custom={reduceMotion ? 0 : 0.24}
            variants={reveal}
            initial={reduceMotion ? false : "hidden"}
            animate="visible"
          >
            {article.excerpt}
          </motion.p>

          <motion.div
            custom={reduceMotion ? 0 : 0.32}
            variants={reveal}
            initial={reduceMotion ? false : "hidden"}
            animate="visible"
          >
            <Link className={styles.articleCta} href={`/articles/${article.slug}`}>
              <span>قراءة المقال</span>
              <ArrowLeft aria-hidden="true" size={19} strokeWidth={2.2} />
            </Link>
          </motion.div>
        </div>
      ) : (
        <div className={styles.peekContent} aria-hidden="true">
          <span className={styles.peekNumber}>{number}</span>
          <span className={styles.peekTotal}>/ {count}</span>
        </div>
      )}
    </article>
  );
}
