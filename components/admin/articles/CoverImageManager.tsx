"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";

import { removeArticleCover, updateArticleCoverAlt, uploadArticleCover } from "@/lib/admin-api/media";
import { ApiError, resolveBackendAssetUrl } from "@/lib/admin-api/client";
import type { ArticleDetail } from "@/types/admin";

import styles from "./CoverImageManager.module.css";

const maxUploadBytes = 5 * 1024 * 1024;
const maxAltLength = 180;
const acceptedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

type MediaOperation = "upload" | "alt" | "remove" | null;

interface CoverImageManagerProps {
  article: ArticleDetail;
  successMessage?: string | null;
  onArticleChange: (article: ArticleDetail, message: string) => void;
  onUnauthorized: () => void;
}

function normalizeAlt(value: string): string {
  return value.trim();
}

function getMediaError(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return "تعذر تحديث صورة الغلاف الآن. حاول مرة أخرى.";
  }

  switch (error.status) {
    case 400:
      return "تحقق من الصورة والنص الوصفي ثم حاول مرة أخرى.";
    case 403:
      return "غير مسموح بتنفيذ هذا الطلب.";
    case 404:
      return "المقال أو صورة الغلاف غير موجودة.";
    case 413:
      return "حجم الصورة أكبر من الحد المسموح وهو 5 ميجابايت.";
    case 415:
      return "صيغة الصورة غير مدعومة أو أن الملف ليس صورة صالحة. استخدم JPEG أو PNG أو WebP.";
    default:
      return "تعذر تحديث صورة الغلاف الآن. حاول مرة أخرى.";
  }
}

function getClientFileError(file: File): string | null {
  if (!acceptedImageTypes.has(file.type)) {
    return "استخدم صورة بصيغة JPEG أو PNG أو WebP.";
  }

  if (file.size > maxUploadBytes) {
    return "حجم الصورة أكبر من الحد المسموح وهو 5 ميجابايت.";
  }

  return null;
}

export function CoverImageManager({
  article,
  successMessage,
  onArticleChange,
  onUnauthorized
}: CoverImageManagerProps) {
  const existingCover = article.coverImage;
  const [alt, setAlt] = useState(existingCover?.alt ?? "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [operation, setOperation] = useState<MediaOperation>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const isPending = operation !== null;
  const normalizedAlt = normalizeAlt(alt);
  const altIsDirty = Boolean(existingCover && normalizedAlt !== existingCover.alt);
  const currentImageUrl = selectedFile && previewUrl
    ? previewUrl
    : existingCover
      ? resolveBackendAssetUrl(existingCover.url)
      : null;
  const imageAlt = selectedFile
    ? normalizedAlt || "معاينة الصورة المحددة قبل الرفع"
    : existingCover?.alt ?? "";

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setErrorMessage(null);
    setStatusMessage(null);

    if (!file) {
      clearSelection();
      return;
    }

    const clientError = getClientFileError(file);
    if (clientError) {
      clearSelection();
      setErrorMessage(clientError);
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUnauthorizedError = (error: unknown): boolean => {
    if (error instanceof ApiError && error.status === 401) {
      onUnauthorized();
      return true;
    }

    return false;
  };

  const validateAlt = (): boolean => {
    if (!normalizedAlt) {
      setErrorMessage("النص الوصفي للصورة مطلوب.");
      return false;
    }

    if (normalizedAlt.length > maxAltLength) {
      setErrorMessage(`الحد الأقصى للنص الوصفي هو ${maxAltLength} حرفًا.`);
      return false;
    }

    return true;
  };

  const handleUpload = async () => {
    if (!selectedFile || isPending || !validateAlt()) {
      return;
    }

    setOperation("upload");
    setErrorMessage(null);

    try {
      const updatedArticle = await uploadArticleCover(article.id, selectedFile, normalizedAlt);
      clearSelection();
      onArticleChange(updatedArticle, existingCover ? "تم استبدال صورة الغلاف." : "تم رفع صورة الغلاف.");
    } catch (error) {
      if (!handleUnauthorizedError(error)) {
        setErrorMessage(getMediaError(error));
      }
    } finally {
      setOperation(null);
    }
  };

  const handleAltUpdate = async () => {
    if (!existingCover || isPending) {
      return;
    }

    if (!altIsDirty) {
      setErrorMessage(null);
      setStatusMessage("لا توجد تغييرات للحفظ.");
      return;
    }

    if (!validateAlt()) {
      return;
    }

    setOperation("alt");
    setErrorMessage(null);

    try {
      const updatedArticle = await updateArticleCoverAlt(article.id, normalizedAlt);
      onArticleChange(updatedArticle, "تم تحديث النص الوصفي للصورة.");
    } catch (error) {
      if (!handleUnauthorizedError(error)) {
        setErrorMessage(getMediaError(error));
      }
    } finally {
      setOperation(null);
    }
  };

  const handleRemove = async () => {
    if (!existingCover || isPending) {
      return;
    }

    const confirmed = window.confirm("هل تريد إزالة صورة الغلاف؟ لا يمكن التراجع عن هذه العملية.");
    if (!confirmed) {
      return;
    }

    setOperation("remove");
    setErrorMessage(null);

    try {
      const updatedArticle = await removeArticleCover(article.id);
      clearSelection();
      onArticleChange(updatedArticle, "تمت إزالة صورة الغلاف.");
    } catch (error) {
      if (!handleUnauthorizedError(error)) {
        setErrorMessage(getMediaError(error));
      }
    } finally {
      setOperation(null);
    }
  };

  return (
    <section className={styles.manager} aria-labelledby="cover-image-heading">
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>صورة الغلاف</p>
          <h2 id="cover-image-heading">إدارة صورة الغلاف</h2>
          <p>يمكن رفع صورة JPEG أو PNG أو WebP بحجم يصل إلى 5 ميجابايت.</p>
        </div>
      </div>

      {successMessage ? (
        <p className={styles.successMessage} role="status">
          {successMessage}
        </p>
      ) : statusMessage ? (
        <p className={styles.successMessage} role="status">
          {statusMessage}
        </p>
      ) : null}
      {errorMessage ? (
        <p className={styles.errorMessage} role="alert">
          {errorMessage}
        </p>
      ) : null}

      {currentImageUrl ? (
        <div className={styles.previewFrame}>
          {/* eslint-disable-next-line @next/next/no-img-element -- Backend media URLs are runtime-configured. */}
          <img className={styles.previewImage} src={currentImageUrl} alt={imageAlt} />
          {selectedFile ? <p className={styles.pendingLabel}>هذه معاينة محلية لم تُرفع بعد.</p> : null}
        </div>
      ) : (
        <div className={styles.emptyCover}>
          <p>لا توجد صورة غلاف لهذا المقال.</p>
        </div>
      )}

      <div className={styles.field}>
        <label htmlFor={`cover-image-file-${article.id}`}>اختيار صورة جديدة</label>
        <input
          ref={fileInputRef}
          id={`cover-image-file-${article.id}`}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          disabled={isPending}
        />
        <p className={styles.hint}>التحقق في المتصفح إرشادي فقط؛ يتحقق الخادم من الصورة الفعلية قبل حفظها.</p>
      </div>

      <div className={styles.field}>
        <div className={styles.labelRow}>
          <label htmlFor={`cover-image-alt-${article.id}`}>النص الوصفي للصورة</label>
          <span className={styles.counter}>{alt.length}/{maxAltLength}</span>
        </div>
        <input
          id={`cover-image-alt-${article.id}`}
          value={alt}
          maxLength={maxAltLength}
          aria-describedby={`cover-image-alt-hint-${article.id}`}
          onChange={(event) => {
            setAlt(event.target.value);
            setErrorMessage(null);
            setStatusMessage(null);
          }}
          disabled={isPending}
          required={Boolean(selectedFile)}
        />
        <p id={`cover-image-alt-hint-${article.id}`} className={styles.hint}>
          اكتب وصفًا واضحًا يشرح ما يظهر في صورة الغلاف.
        </p>
      </div>

      <div className={styles.actions}>
        {selectedFile ? (
          <>
            <button type="button" className={styles.primaryAction} onClick={() => void handleUpload()} disabled={isPending} aria-busy={operation === "upload"}>
              {operation === "upload" ? "جارٍ الرفع…" : existingCover ? "استبدال الصورة" : "رفع الصورة"}
            </button>
            <button type="button" className={styles.secondaryAction} onClick={clearSelection} disabled={isPending}>
              إلغاء اختيار الصورة
            </button>
          </>
        ) : null}

        {existingCover ? (
          <>
            <button
              type="button"
              className={styles.secondaryAction}
              onClick={() => void handleAltUpdate()}
              disabled={isPending || Boolean(selectedFile)}
              aria-busy={operation === "alt"}
            >
              {operation === "alt" ? "جارٍ الحفظ…" : "حفظ النص الوصفي"}
            </button>
            <button type="button" className={styles.dangerAction} onClick={() => void handleRemove()} disabled={isPending} aria-busy={operation === "remove"}>
              {operation === "remove" ? "جارٍ الإزالة…" : "إزالة صورة الغلاف"}
            </button>
          </>
        ) : null}
      </div>
    </section>
  );
}
