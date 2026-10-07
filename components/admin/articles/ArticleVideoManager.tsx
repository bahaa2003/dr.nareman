"use client";

import { useRef, useState, type ChangeEvent } from "react";

import { removeArticleVideo, uploadArticleVideo } from "@/lib/admin-api/media";
import { ApiError, resolveBackendAssetUrl } from "@/lib/admin-api/client";
import type { ArticleDetail } from "@/types/admin";

import styles from "./ArticleVideoManager.module.css";

const maxVideoUploadBytes = 1_073_741_824;
const acceptedVideoTypes = new Set(["video/mp4", "video/webm"]);

type UploadState = "waiting" | "uploading" | "finalizing" | "success" | "failed";

interface ArticleVideoManagerProps {
  article: ArticleDetail;
  successMessage?: string | null;
  onArticleChange: (article: ArticleDetail, message: string) => void;
  onUnauthorized: () => void;
}

function getVideoError(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return "تعذر رفع الفيديو الآن. حاول مرة أخرى.";
  }

  switch (error.status) {
    case 400:
      return "تحقق من ملف الفيديو ثم حاول مرة أخرى.";
    case 403:
      return "غير مسموح بتنفيذ هذا الطلب.";
    case 404:
      return "المقال أو الفيديو غير موجود.";
    case 413:
      return "حجم الفيديو أكبر من الحد المسموح وهو 1 جيجابايت.";
    case 415:
      return "صيغة الفيديو غير مدعومة أو أن الملف ليس MP4 أو WebM صالحًا.";
    default:
      return "تعذر رفع الفيديو الآن. حاول مرة أخرى.";
  }
}

function getClientFileError(file: File): string | null {
  if (!acceptedVideoTypes.has(file.type)) {
    return "استخدم فيديو بصيغة MP4 أو WebM.";
  }

  if (file.size > maxVideoUploadBytes) {
    return "حجم الفيديو أكبر من الحد المسموح وهو 1 جيجابايت.";
  }

  return null;
}

function uploadStatusLabel(state: UploadState, percentage: number): string {
  switch (state) {
    case "waiting":
      return "بانتظار الرفع";
    case "uploading":
      return `جارٍ رفع الفيديو — ${percentage}%`;
    case "finalizing":
      return "اكتمل الإرسال — جارٍ حفظ الفيديو";
    case "success":
      return "تم رفع الفيديو بنجاح";
    case "failed":
      return "فشل رفع الفيديو";
  }
}

export function ArticleVideoManager({
  article,
  successMessage,
  onArticleChange,
  onUnauthorized
}: ArticleVideoManagerProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<UploadState | null>(null);
  const [uploadFilename, setUploadFilename] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [removingVideoId, setRemovingVideoId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isUploading = uploadState === "uploading" || uploadState === "finalizing";

  const clearSelection = () => {
    setSelectedFile(null);
    setUploadState(null);
    setUploadFilename(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setErrorMessage(null);

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
    setUploadFilename(file.name);
    setProgress(0);
    setUploadState("waiting");
  };

  const handleUpload = async () => {
    if (!selectedFile || isUploading) {
      return;
    }

    setErrorMessage(null);
    setProgress(0);
    setUploadState("uploading");

    try {
      const updatedArticle = await uploadArticleVideo(article.id, selectedFile, (percentage) => {
        setProgress(percentage);
        setUploadState(percentage === 100 ? "finalizing" : "uploading");
      });
      setProgress(100);
      setUploadState("success");
      const uploadedName = selectedFile.name;
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onArticleChange(updatedArticle, `تم رفع الفيديو «${uploadedName}».`);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        onUnauthorized();
        return;
      }
      setUploadState("failed");
      setErrorMessage(getVideoError(error));
    }
  };

  const handleRemove = async (videoId: string, filename: string) => {
    if (isUploading || removingVideoId) {
      return;
    }

    if (!window.confirm(`هل تريد حذف الفيديو «${filename}»؟ لا يمكن التراجع عن هذه العملية.`)) {
      return;
    }

    setRemovingVideoId(videoId);
    setErrorMessage(null);
    try {
      const updatedArticle = await removeArticleVideo(article.id, videoId);
      onArticleChange(updatedArticle, "تم حذف الفيديو.");
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        onUnauthorized();
        return;
      }
      setErrorMessage(getVideoError(error));
    } finally {
      setRemovingVideoId(null);
    }
  };

  return (
    <section className={styles.manager} aria-labelledby="article-videos-heading">
      <div className={styles.header}>
        <p className={styles.eyebrow}>وسائط إضافية</p>
        <h2 id="article-videos-heading">فيديوهات المقال</h2>
        <p>يمكن رفع فيديو MP4 أو WebM واحد في كل مرة، حتى 1 جيجابايت.</p>
      </div>

      {successMessage ? <p className={styles.successMessage} role="status">{successMessage}</p> : null}
      {errorMessage ? <p className={styles.errorMessage} role="alert">{errorMessage}</p> : null}

      <div className={styles.field}>
        <label htmlFor={`article-video-file-${article.id}`}>اختيار فيديو</label>
        <input
          ref={fileInputRef}
          id={`article-video-file-${article.id}`}
          type="file"
          accept="video/mp4,video/webm"
          onChange={handleFileChange}
          disabled={isUploading || Boolean(removingVideoId)}
        />
        <p className={styles.hint}>يتحقق الخادم من ترويسة الملف الفعلية قبل حفظه؛ لا يعتمد على امتداد الاسم فقط.</p>
      </div>

      {uploadFilename && uploadState ? (
        <div className={styles.uploadStatus} aria-live="polite">
          <div className={styles.uploadStatusHeader}>
            <strong>{uploadFilename}</strong>
            <span>{uploadStatusLabel(uploadState, progress)}</span>
          </div>
          <div className={styles.progressTrack} aria-label={`تقدم رفع ${uploadFilename}`}>
            <div className={styles.progressBar} style={{ width: `${progress}%` }} />
          </div>
          <span className={styles.percentage}>{progress}%</span>
        </div>
      ) : null}

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.primaryAction}
          onClick={() => void handleUpload()}
          disabled={!selectedFile || isUploading || Boolean(removingVideoId)}
          aria-busy={isUploading}
        >
          {isUploading ? "جارٍ الرفع…" : "رفع الفيديو"}
        </button>
        {selectedFile ? (
          <button type="button" className={styles.secondaryAction} onClick={clearSelection} disabled={isUploading}>
            إلغاء الاختيار
          </button>
        ) : null}
      </div>

      <div className={styles.videoList}>
        {article.videos.length === 0 ? <p className={styles.emptyState}>لا توجد فيديوهات مرفقة بهذا المقال.</p> : null}
        {article.videos.map((video) => (
          <article className={styles.videoCard} key={video.id}>
            <video controls preload="metadata" className={styles.video}>
              <source src={resolveBackendAssetUrl(video.url)} type={video.mimeType} />
              متصفحك لا يدعم تشغيل الفيديو.
            </video>
            <div className={styles.videoDetails}>
              <strong>{video.originalName}</strong>
              <span>{Math.ceil(video.sizeBytes / (1024 * 1024))} ميجابايت · {video.mimeType}</span>
            </div>
            <button
              type="button"
              className={styles.dangerAction}
              onClick={() => void handleRemove(video.id, video.originalName)}
              disabled={isUploading || Boolean(removingVideoId)}
              aria-busy={removingVideoId === video.id}
            >
              {removingVideoId === video.id ? "جارٍ الحذف…" : "حذف الفيديو"}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
