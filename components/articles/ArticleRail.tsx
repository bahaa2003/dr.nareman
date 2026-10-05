"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type PanInfo, type Variants } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { ArticlePreview } from "@/types/public-articles";
import { ArticleSlide } from "./ArticleSlide";
import styles from "./ArticlesSection.module.css";

const AUTOPLAY_MS = 5000;
const DRAG_THRESHOLD = 70;
const slideEase = [0.2, 0.74, 0.24, 1] as const;

type ArticleRailProps = {
  articles: ArticlePreview[];
};

const slideVariants: Variants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? "-24%" : "0%",
    scale: 0.96
  }),
  center: {
    opacity: 1,
    x: "0%",
    scale: 1,
    transition: { duration: 0.76, ease: slideEase }
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? "18%" : "-18%",
    scale: 0.97,
    transition: { duration: 0.58, ease: slideEase }
  })
};

export function ArticleRail({ articles }: ArticleRailProps) {
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isDocumentHidden, setIsDocumentHidden] = useState(false);
  const canNavigate = articles.length > 1;
  const isPaused = isHovered || isFocused || isDragging || isDocumentHidden;

  const activeArticle = articles[activeIndex];
  const nextIndex = useMemo(() => (activeIndex + 1) % articles.length, [activeIndex, articles.length]);
  const nextArticle = articles[nextIndex];

  const goTo = useCallback(
    (index: number, requestedDirection = 1) => {
      if (!canNavigate || index === activeIndex) return;
      setDirection(requestedDirection);
      setActiveIndex((index + articles.length) % articles.length);
    },
    [activeIndex, articles.length, canNavigate]
  );

  const goNext = useCallback(() => {
    if (!canNavigate) return;
    setDirection(1);
    setActiveIndex((current) => (current + 1) % articles.length);
  }, [articles.length, canNavigate]);

  const goPrevious = useCallback(() => {
    if (!canNavigate) return;
    setDirection(-1);
    setActiveIndex((current) => (current - 1 + articles.length) % articles.length);
  }, [articles.length, canNavigate]);

  useEffect(() => {
    const handleVisibility = () => setIsDocumentHidden(document.hidden);
    handleVisibility();
    document.addEventListener("visibilitychange", handleVisibility);

    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  useEffect(() => {
    if (!canNavigate || reduceMotion || isPaused) return;

    const timer = window.setInterval(goNext, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [canNavigate, goNext, isPaused, reduceMotion]);

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);

    if (!canNavigate) return;

    if (info.offset.x > DRAG_THRESHOLD) {
      goNext();
      return;
    }

    if (info.offset.x < -DRAG_THRESHOLD) {
      goPrevious();
    }
  };

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsFocused(false);
    }
  };

  if (!activeArticle) return null;

  return (
    <div
      className={styles.rail}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocusCapture={() => setIsFocused(true)}
      onBlurCapture={handleBlur}
    >
      <div className={styles.railViewport}>
        <AnimatePresence mode="popLayout" custom={direction}>
          <motion.div
            key={activeArticle.id}
            className={styles.activeSlot}
            custom={direction}
            variants={reduceMotion ? undefined : slideVariants}
            initial={reduceMotion ? { opacity: 1 } : "enter"}
            animate={reduceMotion ? { opacity: 1 } : "center"}
            exit={reduceMotion ? { opacity: 0 } : "exit"}
            drag={canNavigate ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.08}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
          >
            <ArticleSlide
              article={activeArticle}
              index={activeIndex}
              total={articles.length}
              variant="active"
              reduceMotion={Boolean(reduceMotion)}
            />
          </motion.div>
        </AnimatePresence>

        {canNavigate && nextArticle ? (
          <motion.button
            type="button"
            className={styles.peekSlot}
            onClick={goNext}
            aria-label={`عرض المقال التالي: ${nextArticle.title}`}
            initial={reduceMotion ? false : { opacity: 0, x: -20, scale: 0.94 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.54, ease: slideEase }}
          >
            <ArticleSlide
              article={nextArticle}
              index={nextIndex}
              total={articles.length}
              variant="peek"
              reduceMotion={Boolean(reduceMotion)}
            />
          </motion.button>
        ) : null}
      </div>

      <div className={styles.controls} aria-label="التحكم في المقالات">
        <button
          type="button"
          className={styles.arrowButton}
          onClick={goPrevious}
          disabled={!canNavigate}
          aria-label="عرض المقال السابق"
        >
          <ArrowRight aria-hidden="true" size={19} strokeWidth={2.2} />
        </button>

        <div className={styles.progressGroup}>
          <AnimatePresence mode="wait">
            <motion.span
              key={activeIndex}
              className={styles.currentIndex}
              initial={reduceMotion ? false : { opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: 12 }}
              transition={{ duration: 0.26, ease: "easeOut" }}
              aria-hidden="true"
            >
              {String(activeIndex + 1).padStart(2, "0")}
            </motion.span>
          </AnimatePresence>

          <span className={styles.progressTrack} aria-hidden="true">
            <span
              key={`${activeArticle.id}-${isPaused}`}
              className={[
                styles.progressFill,
                isPaused ? styles.progressPaused : "",
                reduceMotion ? styles.progressReduced : ""
              ]
                .filter(Boolean)
                .join(" ")}
            />
          </span>

          <span className={styles.totalIndex} aria-hidden="true">
            {String(articles.length).padStart(2, "0")}
          </span>
        </div>

        <button
          type="button"
          className={styles.arrowButton}
          onClick={goNext}
          disabled={!canNavigate}
          aria-label="عرض المقال التالي"
        >
          <ArrowLeft aria-hidden="true" size={19} strokeWidth={2.2} />
        </button>
      </div>

      {canNavigate ? (
        <div className={styles.indexButtons} aria-label="اختيار مقال">
          {articles.map((article, index) => (
            <button
              key={article.id}
              type="button"
              className={[styles.indexButton, index === activeIndex ? styles.indexButtonActive : ""].join(" ")}
              onClick={() => goTo(index, index > activeIndex ? 1 : -1)}
              aria-label={`عرض المقال ${String(index + 1).padStart(2, "0")}: ${article.title}`}
              aria-current={index === activeIndex ? "true" : undefined}
            >
              {String(index + 1).padStart(2, "0")}
            </button>
          ))}
        </div>
      ) : null}

      <span className={styles.liveRegion} aria-live="polite">
        {`المقال المعروض: ${activeArticle.title}`}
      </span>
    </div>
  );
}
