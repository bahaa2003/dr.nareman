import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ArticlePreview } from "@/data/mockArticles";
import { articlesCta } from "@/data/mockArticles";
import { AnimatedSectionTitle } from "@/components/ui/AnimatedSectionTitle";
import { ArticleRail } from "./ArticleRail";
import styles from "./ArticlesSection.module.css";

type ArticlesSectionProps = {
  articles: ArticlePreview[];
};

export function ArticlesSection({ articles }: ArticlesSectionProps) {
  if (articles.length === 0) return null;

  return (
    <section id="articles" className={styles.articles} aria-labelledby="articles-title">
      <span id="blog" className={styles.blogAnchor} aria-hidden="true" />
      <div className={styles.backgroundWord} aria-hidden="true">
        اقرئي
      </div>
      <div className={styles.inner}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>معرفة تساعدك على فهم رحلتك</p>
          <h2 id="articles-title" className={styles.heading}>
            <AnimatedSectionTitle>من المدونة الطبية</AnimatedSectionTitle>
          </h2>
          <p className={styles.lead}>
            مقالات قصيرة بصياغة هادئة تساعدك على ترتيب الأسئلة قبل الاستشارة وفهم الخيارات الطبية العامة.
          </p>
        </div>

        <ArticleRail articles={articles} />

        <div className={styles.footer}>
          <Link className={styles.allArticles} href={articlesCta.href}>
            <span>{articlesCta.label}</span>
            <ArrowLeft aria-hidden="true" size={20} strokeWidth={2.2} />
          </Link>
        </div>
      </div>
    </section>
  );
}
