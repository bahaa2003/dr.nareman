"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAdminSession } from "@/components/admin/AdminSessionContext";
import { createAdminArticle, getAdminArticle, updateAdminArticle } from "@/lib/admin-api/articles";
import { ApiError } from "@/lib/admin-api/client";
import type { ArticleDetail } from "@/types/admin";

import {
  ArticleForm,
  articleToFormValues,
  buildArticleUpdateInput,
  buildCreateArticleInput,
  emptyArticleFormValues,
  type ArticleFormSubmitError,
  type ArticleFormValues
} from "./ArticleForm";
import { CoverImageManager } from "./CoverImageManager";
import { ArticleDeleteAction } from "./ArticleDeleteAction";
import { ArticlePublicationActions } from "./ArticlePublicationActions";
import styles from "./AdminArticleEditor.module.css";

type EditorErrorKind = "invalidId" | "notFound" | "request";

interface EditorLoadError {
  kind: EditorErrorKind;
  message: string;
}

function getMutationError(error: unknown): ArticleFormSubmitError {
  if (!(error instanceof ApiError)) {
    return { message: "تعذر حفظ المقال الآن. حاول مرة أخرى." };
  }

  if (error.status === 400) {
    return { message: "تحقق من البيانات المدخلة ثم حاول مرة أخرى." };
  }

  if (error.status === 403) {
    return { message: "غير مسموح بتنفيذ هذا الطلب." };
  }

  if (error.status === 404) {
    return { message: "المقال غير موجود." };
  }

  if (error.status === 409) {
    return { message: "هذا الرابط مستخدم بالفعل. اختر رابطًا مختلفًا.", field: "slug" };
  }

  return { message: "تعذر حفظ المقال الآن. حاول مرة أخرى." };
}

function getLoadError(error: unknown): EditorLoadError {
  if (error instanceof ApiError && error.status === 400) {
    return { kind: "invalidId", message: "معرّف المقال غير صالح." };
  }

  if (error instanceof ApiError && error.status === 404) {
    return { kind: "notFound", message: "المقال غير موجود." };
  }

  return { kind: "request", message: "تعذر تحميل المقال الآن. حاول مرة أخرى." };
}

function EditorState({
  title,
  description,
  retry,
  backToList = true
}: {
  title: string;
  description: string;
  retry?: () => void;
  backToList?: boolean;
}) {
  return (
    <section className={styles.state} aria-live="polite">
      <h1>{title}</h1>
      <p>{description}</p>
      <div className={styles.stateActions}>
        {retry ? (
          <button type="button" onClick={retry}>
            إعادة المحاولة
          </button>
        ) : null}
        {backToList ? <Link href="/admin/articles">العودة إلى المقالات</Link> : null}
      </div>
    </section>
  );
}

export function AdminArticleCreateEditor() {
  const router = useRouter();
  const { handleUnauthorized } = useAdminSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitCreate = async (values: ArticleFormValues): Promise<ArticleFormSubmitError | null> => {
    if (isSubmitting) {
      return null;
    }

    setIsSubmitting(true);

    try {
      const article = await createAdminArticle(buildCreateArticleInput(values));
      router.replace(`/admin/articles/${encodeURIComponent(article.id)}/edit`);
      return null;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        handleUnauthorized();
        router.replace("/admin/login");
        return { message: "انتهت جلسة الإدارة. جارٍ تحويلك إلى تسجيل الدخول." };
      }

      return getMutationError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ArticleForm
      mode="create"
      initialValues={emptyArticleFormValues}
      isSubmitting={isSubmitting}
      onSubmit={submitCreate}
    />
  );
}

export function AdminArticleEditEditor({ articleId }: { articleId: string }) {
  const router = useRouter();
  const { handleUnauthorized } = useAdminSession();
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loadError, setLoadError] = useState<EditorLoadError | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [mediaSuccessMessage, setMediaSuccessMessage] = useState<string | null>(null);
  const [isTextDirty, setIsTextDirty] = useState(false);
  const [retryVersion, setRetryVersion] = useState(0);
  const [formVersion, setFormVersion] = useState(0);
  const requestId = useRef(0);

  useEffect(() => {
    const controller = new AbortController();
    const currentRequestId = ++requestId.current;

    const loadArticle = async () => {
      try {
        const response = await getAdminArticle(articleId, controller.signal);

        if (controller.signal.aborted || currentRequestId !== requestId.current) {
          return;
        }

        setArticle(response);
        setLoadError(null);
      } catch (error) {
        if (controller.signal.aborted || currentRequestId !== requestId.current) {
          return;
        }

        if (error instanceof ApiError && error.status === 401) {
          handleUnauthorized();
          router.replace("/admin/login");
          return;
        }

        setLoadError(getLoadError(error));
      }
    };

    void loadArticle();

    return () => {
      controller.abort();
    };
  }, [articleId, handleUnauthorized, retryVersion, router]);

  const submitUpdate = async (values: ArticleFormValues): Promise<ArticleFormSubmitError | null> => {
    if (!article || isSubmitting) {
      return null;
    }

    const update = buildArticleUpdateInput(values, articleToFormValues(article));

    if (Object.keys(update).length === 0) {
      setSuccessMessage("لا توجد تغييرات للحفظ.");
      return null;
    }

    setIsSubmitting(true);
    setSuccessMessage(null);

    try {
      const updatedArticle = await updateAdminArticle(article.id, update);
      setArticle(updatedArticle);
      setFormVersion((version) => version + 1);
      setSuccessMessage("تم حفظ التغييرات.");
      setMediaSuccessMessage(null);
      return null;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        handleUnauthorized();
        router.replace("/admin/login");
        return { message: "انتهت جلسة الإدارة. جارٍ تحويلك إلى تسجيل الدخول." };
      }

      return getMutationError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTextDirtyChange = useCallback((isDirty: boolean) => {
    setIsTextDirty(isDirty);
  }, []);

  if (loadError) {
    return (
      <EditorState
        title={loadError.kind === "notFound" ? "المقال غير موجود" : "تعذر فتح المقال"}
        description={loadError.message}
        retry={loadError.kind === "request" ? () => setRetryVersion((version) => version + 1) : undefined}
      />
    );
  }

  if (!article) {
    return <EditorState title="جارٍ تحميل المقال" description="يرجى الانتظار قليلًا." backToList={false} />;
  }

  const handleMediaArticleChange = (updatedArticle: ArticleDetail, message: string) => {
    setArticle(updatedArticle);
    setMediaSuccessMessage(message);
  };

  const handleMediaUnauthorized = () => {
    handleUnauthorized();
    router.replace("/admin/login");
  };

  const handleArticleNotFound = () => {
    setLoadError({ kind: "notFound", message: "المقال غير موجود." });
  };

  const handlePublicationArticleChange = (updatedArticle: ArticleDetail) => {
    setArticle(updatedArticle);
    setSuccessMessage(updatedArticle.status === "published" ? "تم نشر المقال." : "تم إلغاء نشر المقال.");
    setMediaSuccessMessage(null);
  };

  return (
    <>
      <ArticleForm
        key={`${article.id}-${formVersion}`}
        mode="edit"
        initialValues={articleToFormValues(article)}
        article={article}
        isSubmitting={isSubmitting}
        successMessage={successMessage}
        onDirtyChange={handleTextDirtyChange}
        onSubmit={submitUpdate}
      />
      <ArticlePublicationActions
        article={article}
        isTextDirty={isTextDirty}
        onArticleChange={handlePublicationArticleChange}
        onUnauthorized={handleMediaUnauthorized}
        onNotFound={handleArticleNotFound}
      />
      <CoverImageManager
        key={`${article.id}-${article.coverImage?.url ?? "no-cover"}-${article.coverImage?.alt ?? ""}`}
        article={article}
        successMessage={mediaSuccessMessage}
        onArticleChange={handleMediaArticleChange}
        onUnauthorized={handleMediaUnauthorized}
      />
      <ArticleDeleteAction
        article={article}
        variant="editor"
        hasUnsavedChanges={isTextDirty}
        onDeleted={() => router.replace("/admin/articles")}
        onUnauthorized={handleMediaUnauthorized}
        onNotFound={handleArticleNotFound}
      />
    </>
  );
}
