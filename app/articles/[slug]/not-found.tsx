import Link from "next/link";

import { SiteFooter } from "@/components/footer/SiteFooter";
import { Header } from "@/components/layout/Header";
import styles from "@/components/articles/ArticleDetail.module.css";

export default function ArticleNotFound() {
  return (
    <>
      <Header />
      <main className={styles.statePage}>
        <section className={styles.state} aria-labelledby="article-not-found-title">
          <h1 id="article-not-found-title">لم يتم العثور على المقال</h1>
          <p>قد يكون الرابط غير صحيح أو أن المقال لم يعد متاحًا.</p>
          <div className={styles.stateActions}>
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
