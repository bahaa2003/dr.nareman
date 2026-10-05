import type {
  AdminArticleEditorInput,
  AdminArticleEditorUpdateInput,
  AdminArticleListResponse,
  AdminArticlePublicationInput,
  AdminArticleResponse,
  ArticleDetail,
  ArticleStatus
} from "@/types/admin";

import { ApiError, apiRequest } from "./client";

export interface AdminArticleListParams {
  page?: number;
  limit?: number;
  status?: ArticleStatus;
  category?: string;
  search?: string;
}

interface AdminArticleListRequestOptions {
  signal?: AbortSignal;
}

function appendPositiveInteger(query: URLSearchParams, name: "page" | "limit", value: number | undefined): void {
  const maximum = name === "limit" ? 100 : Number.MAX_SAFE_INTEGER;

  if (value !== undefined && Number.isSafeInteger(value) && value >= 1 && value <= maximum) {
    query.set(name, String(value));
  }
}

export async function getAdminArticles(
  params: AdminArticleListParams = {},
  options: AdminArticleListRequestOptions = {}
): Promise<AdminArticleListResponse> {
  const query = new URLSearchParams();
  appendPositiveInteger(query, "page", params.page);
  appendPositiveInteger(query, "limit", params.limit);

  if (params.status === "draft" || params.status === "published") {
    query.set("status", params.status);
  }

  const category = params.category?.trim();
  if (category && category.length <= 80) {
    query.set("category", category);
  }

  const search = params.search?.trim();
  if (search && search.length <= 100) {
    query.set("search", search);
  }

  const suffix = query.size > 0 ? `?${query.toString()}` : "";
  const response = await apiRequest<AdminArticleListResponse>(`/api/admin/articles${suffix}`, {
    method: "GET",
    signal: options.signal
  });

  if (!response) {
    throw new ApiError(500, "تعذر تحميل المقالات الآن. حاول مرة أخرى.");
  }

  return response;
}

function getArticleFromResponse(response: AdminArticleResponse | undefined): ArticleDetail {
  if (!response) {
    throw new ApiError(500, "تعذر إكمال طلب المقال. حاول مرة أخرى.");
  }

  return response.article;
}

export async function getAdminArticle(id: string, signal?: AbortSignal): Promise<ArticleDetail> {
  const response = await apiRequest<AdminArticleResponse>(`/api/admin/articles/${encodeURIComponent(id)}`, {
    method: "GET",
    signal
  });

  return getArticleFromResponse(response);
}

export async function createAdminArticle(input: AdminArticleEditorInput): Promise<ArticleDetail> {
  const response = await apiRequest<AdminArticleResponse>("/api/admin/articles", {
    method: "POST",
    body: input
  });

  return getArticleFromResponse(response);
}

export async function updateAdminArticle(
  id: string,
  input: AdminArticleEditorUpdateInput | AdminArticlePublicationInput
): Promise<ArticleDetail> {
  const response = await apiRequest<AdminArticleResponse>(`/api/admin/articles/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: input
  });

  return getArticleFromResponse(response);
}

export async function deleteAdminArticle(id: string): Promise<void> {
  await apiRequest(`/api/admin/articles/${encodeURIComponent(id)}`, {
    method: "DELETE"
  });
}
