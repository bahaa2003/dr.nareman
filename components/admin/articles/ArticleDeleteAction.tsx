"use client";

import { useState } from "react";

import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { deleteAdminArticle } from "@/lib/admin-api/articles";
import { ApiError } from "@/lib/admin-api/client";

import styles from "./ArticleDeleteAction.module.css";

interface ArticleDeleteActionProps {
  article: { id: string; title: string };
  variant: "editor" | "list";
  hasUnsavedChanges?: boolean;
  onDeleted: () => void;
  onUnauthorized: () => void;
  onNotFound: () => void;
}

function getDeleteError(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return "تعذر حذف المقال الآن. حاول مرة أخرى.";
  }

  if (error.status === 400) {
    return "تعذر حذف المقال بسبب معرّف غير صالح.";
  }

  if (error.status === 403) {
    return "غير مسموح بتنفيذ هذا الطلب.";
  }

  return "تعذر حذف المقال الآن. حاول مرة أخرى.";
}

export function ArticleDeleteAction({
  article,
  variant,
  hasUnsavedChanges = false,
  onDeleted,
  onUnauthorized,
  onNotFound
}: ArticleDeleteActionProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (isDeleting) {
      return;
    }

    setIsDeleting(true);
    setErrorMessage(null);

    try {
      await deleteAdminArticle(article.id);
      setIsConfirmOpen(false);
      onDeleted();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        onUnauthorized();
      } else if (error instanceof ApiError && error.status === 404) {
        setIsConfirmOpen(false);
        onNotFound();
      } else {
        setIsConfirmOpen(false);
        setErrorMessage(getDeleteError(error));
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const action = (
    <button type="button" className={variant === "editor" ? styles.editorButton : styles.listButton} onClick={() => {
      setErrorMessage(null);
      setIsConfirmOpen(true);
    }} disabled={isDeleting}>
      حذف المقال
    </button>
  );

  return (
    <section className={variant === "editor" ? styles.editorSection : styles.listSection} aria-labelledby={variant === "editor" ? "article-delete-heading" : undefined}>
      {variant === "editor" ? (
        <div>
          <p className={styles.eyebrow}>منطقة خطرة</p>
          <h2 id="article-delete-heading">حذف المقال</h2>
          <p>الحذف نهائي. سيحاول الخادم تنظيف صورة الغلاف المُدارة عند وجودها.</p>
        </div>
      ) : null}
      {errorMessage ? <p className={styles.errorMessage} role="alert">{errorMessage}</p> : null}
      {action}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="حذف المقال نهائيًا؟"
        description={
          <>
            <span>سيُحذف مقال «{article.title}» نهائيًا. هذه العملية ليست إلغاءً للنشر، وسيحاول الخادم تنظيف صورة الغلاف المُدارة عند وجودها.</span>
            {hasUnsavedChanges ? <span className={styles.unsavedWarning}>لديك أيضًا تغييرات نصية غير محفوظة ستفقدها عند الحذف.</span> : null}
          </>
        }
        confirmLabel="حذف المقال"
        destructive
        isSubmitting={isDeleting}
        onConfirm={() => void confirmDelete()}
        onClose={() => setIsConfirmOpen(false)}
      />
    </section>
  );
}
