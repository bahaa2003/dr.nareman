export interface PublicArticleCoverImage {
  url: string;
  alt: string;
}

export interface PublicArticleListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  status: "published";
  publishedAt: string;
  readingTime: number;
  coverImage: PublicArticleCoverImage | null;
  seoTitle: string | null;
  seoDescription: string | null;
}

export interface PublicPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PublicArticleListResponse {
  success: true;
  items: PublicArticleListItem[];
  pagination: PublicPagination;
}

export interface PublicArticleDetail extends Omit<PublicArticleListItem, "publishedAt"> {
  content: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PublicArticleDetailResponse {
  success: true;
  article: PublicArticleDetail;
}

export interface ArticlePreview {
  id: string;
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  image: string | null;
  imageAlt: string;
  readingTime: string;
}
