"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, Plus, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams, type ReadonlyURLSearchParams } from "next/navigation";

import { useAdminSession } from "@/components/admin/AdminSessionContext";
import { getAdminArticles } from "@/lib/admin-api/articles";
import { ApiError, resolveBackendAssetUrl } from "@/lib/admin-api/client";
import type { AdminArticleListResponse, ArticleListItem, ArticleStatus } from "@/types/admin";

import styles from "./AdminArticleList.module.css";
import { ArticleDeleteAction } from "./ArticleDeleteAction";

const pageSize = 20;

interface AppliedFilters {
  status?: ArticleStatus;
  category?: string;
  search?: string;
}

interface ArticleListState extends AppliedFilters {
  page: number;
}

function readPositivePage(value: string | null): number {
  if (!value || !/^[1-9]\d*$/.test(value)) {
    return 1;
  }

  const page = Number(value);
  return Number.isSafeInteger(page) ? page : 1;
}

function readListState(searchParams: URLSearchParams | ReadonlyURLSearchParams): ArticleListState {
  const status = searchParams.get("status");
  const category = searchParams.get("category")?.trim();
  const search = searchParams.get("search")?.trim();

  return {
    page: readPositivePage(searchParams.get("page")),
    ...(status === "draft" || status === "published" ? { status } : {}),
    ...(category && category.length <= 80 ? { category } : {}),
    ...(search && search.length <= 100 ? { search } : {})
  };
}

function getArticleListErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 403) {
    return "غير مسموح بتنفيذ هذا الطلب.";
  }

  if (error instanceof ApiError && error.status === 400) {
    return "تعذر تحميل المقالات بسبب بيانات التصفية.";
  }

  return "تعذر تحميل المقالات الآن. حاول مرة أخرى.";
}

function formatDate(value: string | null): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium" }).format(date);
}

function getStatusLabel(status: ArticleStatus): string {
  return status === "published" ? "منشور" : "مسودة";
}

interface ArticleFiltersProps {
  initialFilters: AppliedFilters;
  onApply: (filters: AppliedFilters) => void;
  onReset: () => void;
}

function ArticleFilters({ initialFilters, onApply, onReset }: ArticleFiltersProps) {
  const [search, setSearch] = useState(initialFilters.search ?? "");
  const [category, setCategory] = useState(initialFilters.category ?? "");
  const [status, setStatus] = useState<ArticleStatus | "">(initialFilters.status ?? "");
  const hasActiveFilters = Boolean(initialFilters.search || initialFilters.category || initialFilters.status);

  return (
    <form
      className={styles.filters}
      onSubmit={(event) => {
        event.preventDefault();
        onApply({
          ...(status ? { status } : {}),
          ...(category.trim() ? { category: category.trim() } : {}),
          ...(search.trim() ? { search: search.trim() } : {})
        });
      }}
    >
      <div className={`${styles.filterField} ${styles.searchField}`}>
        <label htmlFor="article-search">البحث في العنوان أو الملخص</label>
        <div className={styles.searchInputWrap}>
          <Search aria-hidden="true" size={18} />
          <input
            id="article-search"
            type="search"
            value={search}
            maxLength={100}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ابحث عن مقال"
          />
        </div>
      </div>
      <div className={styles.filterField}>
        <label htmlFor="article-status">الحالة</label>
        <select
          id="article-status"
          value={status}
          onChange={(event) => setStatus(event.target.value as ArticleStatus | "")}
        >
          <option value="">الكل</option>
          <option value="draft">مسودة</option>
          <option value="published">منشور</option>
        </select>
      </div>
      <div className={styles.filterField}>
        <label htmlFor="article-category">الفئة</label>
        <input
          id="article-category"
          value={category}
          maxLength={80}
          onChange={(event) => setCategory(event.target.value)}
          placeholder="مثال: صحة المرأة"
        />
      </div>
      <div className={styles.filterActions}>
        <button className={styles.applyButton} type="submit">
          تطبيق
        </button>
        {hasActiveFilters ? (
          <button className={styles.resetButton} type="button" onClick={onReset}>
            مسح التصفية
          </button>
        ) : null}
      </div>
    </form>
  );
}

function ArticleStatusBadge({ status }: { status: ArticleStatus }) {
  return <span className={`${styles.statusBadge} ${status === "published" ? styles.published : styles.draft}`}>{getStatusLabel(status)}</span>;
}

function ArticleCoverThumbnail({ article }: { article: ArticleListItem }) {
  if (!article.coverImage) {
    return (
      <div className={styles.coverFallback} role="img" aria-label="لا توجد صورة غلاف">
        <FileText aria-hidden="true" size={20} />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- Backend-origin Admin thumbnails do not require Next remote image configuration.
    <img
      className={styles.coverImage}
      src={resolveBackendAssetUrl(article.coverImage.url)}
      alt={article.coverImage.alt}
    />
  );
}

function ArticleRows({
  articles,
  onArticleDeleted,
  onUnauthorized
}: {
  articles: ArticleListItem[];
  onArticleDeleted: (article: ArticleListItem) => void;
  onUnauthorized: () => void;
}) {
  return (
    <div className={styles.list} role="table" aria-label="قائمة المقالات">
      <div className={`${styles.listRow} ${styles.listHeader}`} role="row">
        <span role="columnheader">المقال</span>
        <span role="columnheader">الفئة</span>
        <span role="columnheader">الحالة</span>
        <span role="columnheader">التفاصيل</span>
        <span role="columnheader">إجراءات</span>
      </div>
      {articles.map((article) => (
        <article className={styles.listRow} role="row" key={article.id}>
          <div className={styles.articleSummary} role="cell">
            <ArticleCoverThumbnail article={article} />
            <div>
              <h2>{article.title}</h2>
              <p>{article.excerpt}</p>
            </div>
          </div>
          <p className={styles.category} role="cell">
            <span className={styles.mobileLabel}>الفئة</span>
            {article.category}
          </p>
          <div role="cell">
            <span className={styles.mobileLabel}>الحالة</span>
            <ArticleStatusBadge status={article.status} />
          </div>
          <div className={styles.articleMeta} role="cell">
            <span className={styles.mobileLabel}>التفاصيل</span>
            <span>{article.readingTime} دقائق قراءة</span>
            <span>تحديث: {formatDate(article.updatedAt)}</span>
            {article.status === "published" ? <span>نشر: {formatDate(article.publishedAt)}</span> : null}
          </div>
          <div className={styles.rowAction} role="cell">
            <Link href={`/admin/articles/${encodeURIComponent(article.id)}/edit`} aria-label={`تعديل المقال: ${article.title}`}>
              تعديل
            </Link>
            <ArticleDeleteAction
              article={article}
              variant="list"
              onDeleted={() => onArticleDeleted(article)}
              onUnauthorized={onUnauthorized}
              onNotFound={() => onArticleDeleted(article)}
            />
          </div>
        </article>
      ))}
    </div>
  );
}

function ArticleEmptyState({
  filtered,
  pageOutOfRange,
  onReset
}: {
  filtered: boolean;
  pageOutOfRange: boolean;
  onReset: () => void;
}) {
  const title = pageOutOfRange
    ? "لا توجد مقالات في هذه الصفحة"
    : filtered
      ? "لا توجد مقالات تطابق التصفية"
      : "لا توجد مقالات حتى الآن";
  const description = pageOutOfRange
    ? "يمكنك العودة إلى الصفحة الأولى لعرض المقالات المتاحة."
    : filtered
      ? "جرّب تعديل كلمات البحث أو الفئة أو الحالة."
      : "ابدأ بإضافة أول مقال إلى مساحة المحتوى.";

  return (
    <section className={styles.emptyState} aria-live="polite">
      <FileText aria-hidden="true" size={30} />
      <h2>{title}</h2>
      <p>{description}</p>
      {filtered || pageOutOfRange ? (
        <button className={styles.resetButton} type="button" onClick={onReset}>
          {pageOutOfRange ? "العودة للصفحة الأولى" : "مسح التصفية"}
        </button>
      ) : (
        <Link className={styles.newArticleButton} href="/admin/articles/new">
          <Plus aria-hidden="true" size={18} />
          مقال جديد
        </Link>
      )}
    </section>
  );
}

export function AdminArticleList() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleUnauthorized } = useAdminSession();
  const listState = readListState(searchParams);
  const [result, setResult] = useState<AdminArticleListResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryVersion, setRetryVersion] = useState(0);
  const requestId = useRef(0);

  const navigateToListState = (nextState: ArticleListState) => {
    const nextQuery = new URLSearchParams();

    if (nextState.page > 1) {
      nextQuery.set("page", String(nextState.page));
    }
    if (nextState.status) {
      nextQuery.set("status", nextState.status);
    }
    if (nextState.category) {
      nextQuery.set("category", nextState.category);
    }
    if (nextState.search) {
      nextQuery.set("search", nextState.search);
    }

    const suffix = nextQuery.size > 0 ? `?${nextQuery.toString()}` : "";
    router.push(`${pathname}${suffix}`);
  };

  const applyFilters = (filters: AppliedFilters) => {
    navigateToListState({ page: 1, ...filters });
  };

  const resetFilters = () => {
    navigateToListState({ page: 1 });
  };

  const refreshAfterDeletion = () => {
    if (result && result.items.length === 1 && listState.page > 1) {
      navigateToListState({ ...listState, page: listState.page - 1 });
      return;
    }

    setError(null);
    setRetryVersion((version) => version + 1);
  };

  useEffect(() => {
    const controller = new AbortController();
    const currentRequestId = ++requestId.current;

    const loadArticles = async () => {
      try {
        const response = await getAdminArticles(
          {
            page: listState.page,
            limit: pageSize,
            status: listState.status,
            category: listState.category,
            search: listState.search
          },
          { signal: controller.signal }
        );

        if (currentRequestId !== requestId.current) {
          return;
        }

        setResult(response);
        setError(null);
      } catch (caughtError) {
        if (controller.signal.aborted || currentRequestId !== requestId.current) {
          return;
        }

        if (caughtError instanceof ApiError && caughtError.status === 401) {
          handleUnauthorized();
          setResult(null);
          router.replace("/admin/login");
          return;
        }

        setError(getArticleListErrorMessage(caughtError));
      }
    };

    void loadArticles();

    return () => {
      controller.abort();
    };
  }, [handleUnauthorized, listState.category, listState.page, listState.search, listState.status, retryVersion, router]);

  const hasActiveFilters = Boolean(listState.search || listState.category || listState.status);
  const isInitialLoad = result === null && error === null;
  const pagination = result?.pagination;
  const pageOutOfRange = Boolean(pagination && pagination.total > 0 && pagination.page > pagination.totalPages);

  return (
    <section className={styles.page} aria-labelledby="articles-page-title" aria-busy={isInitialLoad}>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>المحتوى</p>
          <h2 id="articles-page-title">المقالات</h2>
          <p>إدارة قائمة المقالات المنشورة والمسودات.</p>
        </div>
        <Link className={styles.newArticleButton} href="/admin/articles/new">
          <Plus aria-hidden="true" size={18} />
          مقال جديد
        </Link>
      </div>

      <ArticleFilters
        key={`${listState.status ?? ""}-${listState.category ?? ""}-${listState.search ?? ""}`}
        initialFilters={listState}
        onApply={applyFilters}
        onReset={resetFilters}
      />

      {isInitialLoad ? (
        <section className={styles.loadingState} aria-live="polite">
          <p>جارٍ تحميل المقالات…</p>
        </section>
      ) : null}

      {error ? (
        <section className={styles.errorState} role="alert">
          <h2>تعذر تحميل المقالات</h2>
          <p>{error}</p>
          <button type="button" className={styles.applyButton} onClick={() => setRetryVersion((version) => version + 1)}>
            إعادة المحاولة
          </button>
        </section>
      ) : null}

      {result && !error ? (
        <>
          {result.items.length > 0 ? (
            <ArticleRows
              articles={result.items}
              onArticleDeleted={refreshAfterDeletion}
              onUnauthorized={() => {
                handleUnauthorized();
                router.replace("/admin/login");
              }}
            />
          ) : (
            <ArticleEmptyState filtered={hasActiveFilters} pageOutOfRange={pageOutOfRange} onReset={resetFilters} />
          )}

          {pagination && result.items.length > 0 ? (
            <nav className={styles.pagination} aria-label="ترقيم صفحات المقالات">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => navigateToListState({ ...listState, page: pagination.page - 1 })}
              >
                السابق
              </button>
              <p>
                صفحة {pagination.page} من {pagination.totalPages} · {pagination.total} مقال
              </p>
              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => navigateToListState({ ...listState, page: pagination.page + 1 })}
              >
                التالي
              </button>
            </nav>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
