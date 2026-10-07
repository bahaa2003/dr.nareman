import type { AdminArticleResponse, ArticleDetail } from "@/types/admin";

import { ApiError, apiRequest, getBackendUrl } from "./client";

function getArticleFromResponse(response: AdminArticleResponse | undefined): ArticleDetail {
  if (!response) {
    throw new ApiError(500, "تعذر إكمال طلب صورة الغلاف. حاول مرة أخرى.");
  }

  return response.article;
}

export async function uploadArticleCover(articleId: string, file: File, alt: string): Promise<ArticleDetail> {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("alt", alt);

  const response = await apiRequest<AdminArticleResponse>(
    `/api/admin/articles/${encodeURIComponent(articleId)}/cover-image`,
    {
      method: "PUT",
      body: formData
    }
  );

  return getArticleFromResponse(response);
}

export async function updateArticleCoverAlt(articleId: string, alt: string): Promise<ArticleDetail> {
  const response = await apiRequest<AdminArticleResponse>(
    `/api/admin/articles/${encodeURIComponent(articleId)}/cover-image`,
    {
      method: "PATCH",
      body: { alt }
    }
  );

  return getArticleFromResponse(response);
}

export async function removeArticleCover(articleId: string): Promise<ArticleDetail> {
  const response = await apiRequest<AdminArticleResponse>(
    `/api/admin/articles/${encodeURIComponent(articleId)}/cover-image`,
    {
      method: "DELETE"
    }
  );

  return getArticleFromResponse(response);
}

export function uploadArticleVideo(
  articleId: string,
  file: File,
  onProgress: (percentage: number) => void
): Promise<ArticleDetail> {
  const formData = new FormData();
  formData.append("video", file);

  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", getBackendUrl(`/api/admin/articles/${encodeURIComponent(articleId)}/videos`));
    request.withCredentials = true;
    request.setRequestHeader("Accept", "application/json");

    request.upload.onprogress = (event) => {
      if (!event.lengthComputable || event.total <= 0) {
        return;
      }

      onProgress(Math.round((event.loaded / event.total) * 100));
    };

    request.onerror = () => reject(new ApiError(0, "تعذر الاتصال بالخادم أثناء رفع الفيديو."));
    request.onabort = () => reject(new ApiError(0, "تم إلغاء رفع الفيديو."));
    request.onload = () => {
      const payload = parseXhrJson(request.responseText);

      if (request.status < 200 || request.status >= 300) {
        reject(new ApiError(request.status, getXhrErrorMessage(payload)));
        return;
      }

      const response = payload as AdminArticleResponse | undefined;
      try {
        resolve(getArticleFromResponse(response));
      } catch (error) {
        reject(error);
      }
    };

    request.send(formData);
  });
}

export async function removeArticleVideo(articleId: string, videoId: string): Promise<ArticleDetail> {
  const response = await apiRequest<AdminArticleResponse>(
    `/api/admin/articles/${encodeURIComponent(articleId)}/videos/${encodeURIComponent(videoId)}`,
    { method: "DELETE" }
  );

  return getArticleFromResponse(response);
}

function parseXhrJson(value: string): unknown {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return undefined;
  }
}

function getXhrErrorMessage(payload: unknown): string {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "success" in payload &&
    payload.success === false &&
    "error" in payload &&
    typeof payload.error === "object" &&
    payload.error !== null &&
    "message" in payload.error &&
    typeof payload.error.message === "string"
  ) {
    return payload.error.message;
  }

  return "تعذر رفع الفيديو. يرجى المحاولة مرة أخرى.";
}
