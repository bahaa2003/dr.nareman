"use client";

import Link from "next/link";

import { SiteFooter } from "@/components/footer/SiteFooter";
import { Header } from "@/components/layout/Header";
import styles from "@/components/articles/ArticleDetail.module.css";

type ArticleDetailErrorProps = {
  reset: () => void;
};

export default function ArticleDetailError({ reset }: ArticleDetailErrorProps) {
  return (
    <>
      <Header />
      <main className={styles.statePage}>
        <section className={styles.state} role="alert" aria-labelledby="article-error-title">
          <h1 id="article-error-title">تعذر تحميل المقال حاليًا</h1>
          <p>يرجى المحاولة مرة أخرى بعد قليل.</p>
          <div className={styles.stateActions}>
            <button className={styles.retryButton} type="button" onClick={reset}>
              إعادة المحاولة
            </button>
            <Link className={styles.stateLink} href="/articles">
              العودة إلى المقالات
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
