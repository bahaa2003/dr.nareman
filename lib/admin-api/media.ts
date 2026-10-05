import type { AdminArticleResponse, ArticleDetail } from "@/types/admin";

import { ApiError, apiRequest } from "./client";

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
