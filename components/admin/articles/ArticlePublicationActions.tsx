"use client";

import { useState } from "react";

import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { updateAdminArticle } from "@/lib/admin-api/articles";
import { ApiError } from "@/lib/admin-api/client";
import type { ArticleDetail, ArticleStatus } from "@/types/admin";

import styles from "./ArticlePublicationActions.module.css";

interface ArticlePublicationActionsProps {
  article: ArticleDetail;
  isTextDirty: boolean;
  onArticleChange: (article: ArticleDetail) => void;
  onUnauthorized: () => void;
  onNotFound: () => void;
}

function getPublicationError(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return "تعذر تغيير حالة النشر الآن. حاول مرة أخرى.";
  }

  if (error.status === 400) {
    return "تعذر تغيير حالة النشر بسبب طلب غير صالح.";
  }

  if (error.status === 403) {
    return "غير مسموح بتنفيذ هذا الطلب.";
  }

  return "تعذر تغيير حالة النشر الآن. حاول مرة أخرى.";
}

function getStatusLabel(status: ArticleStatus): string {
  return status === "published" ? "منشور" : "مسودة";
}

export function ArticlePublicationActions({
  article,
  isTextDirty,
  onArticleChange,
  onUnauthorized,
  onNotFound
}: ArticlePublicationActionsProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const nextStatus: ArticleStatus = article.status === "draft" ? "published" : "draft";
  const isPublishing = nextStatus === "published";

  const openConfirmation = () => {
    setErrorMessage(null);

    if (isTextDirty) {
      setErrorMessage("احفظ التغييرات الحالية أولًا قبل تغيير حالة النشر.");
      return;
    }

    setIsConfirmOpen(true);
  };

  const confirmPublicationChange = async () => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const updatedArticle = await updateAdminArticle(article.id, { status: nextStatus });
      onArticleChange(updatedArticle);
      setIsConfirmOpen(false);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        onUnauthorized();
      } else if (error instanceof ApiError && error.status === 404) {
        setIsConfirmOpen(false);
        onNotFound();
      } else {
        setIsConfirmOpen(false);
        setErrorMessage(getPublicationError(error));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.panel} aria-labelledby="publication-actions-heading">
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>النشر</p>
          <h2 id="publication-actions-heading">حالة المقال</h2>
          <p>الحالة الحالية: <strong>{getStatusLabel(article.status)}</strong></p>
        </div>
        <span className={`${styles.statusBadge} ${article.status === "published" ? styles.published : styles.draft}`}>
          {getStatusLabel(article.status)}
        </span>
      </div>

      <p className={styles.description}>
        {article.status === "draft"
          ? "انشر المقال ليصبح متاحًا عبر واجهة برمجة المقالات العامة."
          : "إلغاء النشر يخفي المقال من واجهة برمجة المقالات العامة مع الاحتفاظ به كمسودة."}
      </p>
      {errorMessage ? <p className={styles.errorMessage} role="alert">{errorMessage}</p> : null}
      <button type="button" className={styles.primaryAction} onClick={openConfirmation} disabled={isSubmitting}>
        {isSubmitting ? "جارٍ التحديث…" : isPublishing ? "نشر المقال" : "إلغاء النشر"}
      </button>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title={isPublishing ? "نشر المقال؟" : "إلغاء نشر المقال؟"}
        description={
          isPublishing
            ? "سيصبح المقال متاحًا للظهور عبر واجهة برمجة المقالات العامة بعد النشر."
            : "سيختفي المقال من الواجهة العامة وسيظل محفوظًا كمسودة في لوحة التحكم."
        }
        confirmLabel={isPublishing ? "نشر المقال" : "إلغاء النشر"}
        isSubmitting={isSubmitting}
        onConfirm={() => void confirmPublicationChange()}
        onClose={() => setIsConfirmOpen(false)}
      />
    </section>
  );
}
