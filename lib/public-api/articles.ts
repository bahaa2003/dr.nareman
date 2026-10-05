import { cache } from "react";
import { resolveBackendAssetUrl, getBackendUrl } from "@/lib/backend-origin";
import type {
  ArticlePreview,
  PublicArticleDetail,
  PublicArticleDetailResponse,
  PublicArticleListItem,
  PublicArticleListResponse
} from "@/types/public-articles";

const arabicNumberFormatter = new Intl.NumberFormat("ar-EG");

export interface PublicArticleListParams {
  page?: number;
  limit?: number;
  category?: string;
}

export class PublicArticleApiError extends Error {
  constructor(public readonly status: number) {
    super("Public article request failed");
    this.name = "PublicArticleApiError";
  }
}

function appendPositiveInteger(query: URLSearchParams, name: "page" | "limit", value: number | undefined): void {
  const maximum = name === "limit" ? 50 : Number.MAX_SAFE_INTEGER;

  if (value !== undefined && Number.isSafeInteger(value) && value >= 1 && value <= maximum) {
    query.set(name, String(value));
  }
}

export async function getPublishedArticles(
  params: PublicArticleListParams = {}
): Promise<PublicArticleListResponse> {
  const query = new URLSearchParams();

  appendPositiveInteger(query, "page", params.page);
  appendPositiveInteger(query, "limit", params.limit);

  const category = params.category?.trim();
  if (category && category.length <= 80) {
    query.set("category", category);
  }

  const suffix = query.size > 0 ? `?${query.toString()}` : "";
  const response = await fetch(getBackendUrl(`/api/articles${suffix}`), {
    headers: { Accept: "application/json" },
    credentials: "omit",
    cache: "no-store"
  });

  if (!response.ok) {
    throw new PublicArticleApiError(response.status);
  }

  const payload = (await response.json()) as PublicArticleListResponse;

  if (!payload || payload.success !== true || !Array.isArray(payload.items) || !payload.pagination) {
    throw new Error("Public article response is invalid");
  }

  return payload;
}

export const getPublicArticleBySlug = cache(async (slug: string): Promise<PublicArticleDetail> => {
  const normalizedSlug = slug.trim();

  if (!normalizedSlug) {
    throw new PublicArticleApiError(400);
  }

  const response = await fetch(getBackendUrl(`/api/articles/${encodeURIComponent(normalizedSlug)}`), {
    headers: { Accept: "application/json" },
    credentials: "omit",
    cache: "no-store"
  });

  if (!response.ok) {
    throw new PublicArticleApiError(response.status);
  }

  const payload = (await response.json()) as PublicArticleDetailResponse;

  if (!payload || payload.success !== true || !payload.article) {
    throw new Error("Public article response is invalid");
  }

  return payload.article;
});

export function toArticlePreview(article: PublicArticleListItem): ArticlePreview {
  return {
    id: article.id,
    slug: article.slug,
    category: article.category,
    title: article.title,
    excerpt: article.excerpt,
    image: article.coverImage ? resolveBackendAssetUrl(article.coverImage.url) : null,
    imageAlt: article.coverImage?.alt ?? "",
    readingTime: `${arabicNumberFormatter.format(article.readingTime)} دقائق قراءة`
  };
}
