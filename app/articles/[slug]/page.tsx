import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays, Clock3 } from "lucide-react";

import { ArticleMarkdown } from "@/components/articles/ArticleMarkdown";
import styles from "@/components/articles/ArticleDetail.module.css";
import { SiteFooter } from "@/components/footer/SiteFooter";
import { Header } from "@/components/layout/Header";
import { resolveBackendAssetUrl } from "@/lib/backend-origin";
import { getPublicArticleBySlug, PublicArticleApiError } from "@/lib/public-api/articles";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

const arabicDateFormatter = new Intl.DateTimeFormat("ar-EG", {
  dateStyle: "long"
});
const arabicNumberFormatter = new Intl.NumberFormat("ar-EG");

function isNotFoundArticleError(error: unknown): boolean {
  return error instanceof PublicArticleApiError && (error.status === 400 || error.status === 404);
}

function formatPublishedDate(publishedAt: string | null): string | null {
  if (!publishedAt) {
    return null;
  }

  const date = new Date(publishedAt);
  return Number.isNaN(date.getTime()) ? null : arabicDateFormatter.format(date);
}

function normalizeRouteSlug(slug: string): string {
  const trimmedSlug = slug.trim();

  if (!trimmedSlug) {
    return "";
  }

  try {
    return decodeURIComponent(trimmedSlug);
  } catch {
    return trimmedSlug;
  }
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug: routeSlug } = await params;
  const slug = normalizeRouteSlug(routeSlug);

  try {
    const article = await getPublicArticleBySlug(slug);
    const title = article.seoTitle ?? article.title;
    const description = article.seoDescription ?? article.excerpt;
    const coverUrl = article.coverImage ? resolveBackendAssetUrl(article.coverImage.url) : undefined;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "article",
        publishedTime: article.publishedAt ?? undefined,
        ...(coverUrl
          ? {
              images: [{ url: coverUrl, alt: article.coverImage?.alt ?? "" }]
            }
          : {})
      }
    };
  } catch {
    return {};
  }
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const { slug: routeSlug } = await params;
  const slug = normalizeRouteSlug(routeSlug);

  let article;

  try {
    article = await getPublicArticleBySlug(slug);
  } catch (error) {
    if (isNotFoundArticleError(error)) {
      notFound();
    }

    throw error;
  }

  const publishedDate = formatPublishedDate(article.publishedAt);
  const coverUrl = article.coverImage ? resolveBackendAssetUrl(article.coverImage.url) : null;

  return (
    <>
      <Header />
      <main className={styles.page}>
        <article className={styles.article}>
          <header className={styles.intro}>
            <Link className={styles.backLink} href="/articles">
              <ArrowRight aria-hidden="true" size={18} />
              العودة إلى المقالات
            </Link>
            <p className={styles.category}>{article.category}</p>
            <h1 className={styles.title}>{article.title}</h1>
            <p className={styles.excerpt}>{article.excerpt}</p>
            <div className={styles.metadata} aria-label="معلومات المقال">
              <span>
                <Clock3 aria-hidden="true" size={17} />
                {arabicNumberFormatter.format(article.readingTime)} دقائق قراءة
              </span>
              {publishedDate ? (
                <span>
                  <CalendarDays aria-hidden="true" size={17} />
                  نُشر في {publishedDate}
                </span>
              ) : null}
            </div>
          </header>

          {coverUrl && article.coverImage ? (
            <div className={styles.cover}>
              <figure className={styles.coverFrame}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className={styles.coverImage} src={coverUrl} alt={article.coverImage.alt} />
              </figure>
            </div>
          ) : null}

          <ArticleMarkdown content={article.content} />

          {article.videos.length > 0 ? (
            <section className={styles.videos} aria-label="فيديوهات المقال">
              <h2>فيديوهات المقال</h2>
              {article.videos.map((video) => (
                <video key={video.id} className={styles.video} controls preload="metadata">
                  <source src={resolveBackendAssetUrl(video.url)} type={video.mimeType} />
                  متصفحك لا يدعم تشغيل الفيديو.
                </video>
              ))}
            </section>
          ) : null}

          <div className={styles.footerAction}>
            <Link className={styles.backLink} href="/articles">
              <ArrowRight aria-hidden="true" size={18} />
              العودة إلى المقالات
            </Link>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
