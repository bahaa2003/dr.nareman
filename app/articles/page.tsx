import { FeaturedArticle } from "@/components/articles/FeaturedArticle";
import { ArticlesIndex } from "@/components/articles/ArticlesIndex";
import { ArticlesHero } from "@/components/articles/ArticlesHero";
import { SiteFooter } from "@/components/footer/SiteFooter";
import { Header } from "@/components/layout/Header";
import { PublicArticlesState } from "@/components/articles/PublicArticlesState";
import { getPublishedArticles, toArticlePreview } from "@/lib/public-api/articles";
import type { ArticlePreview } from "@/types/public-articles";

export const dynamic = "force-dynamic";

export default async function ArticlesPage() {
  let articles: ArticlePreview[] = [];
  let articlesState: "empty" | "error" | undefined;

  try {
    const response = await getPublishedArticles({ limit: 50 });
    articles = response.items.map(toArticlePreview);
    articlesState = articles.length === 0 ? "empty" : undefined;
  } catch {
    articlesState = "error";
  }

  const [featuredArticle, ...remainingArticles] = articles;

  return (
    <>
      <Header />
      <main>
        <ArticlesHero />
        {articlesState ? <PublicArticlesState state={articlesState} /> : null}
        {!articlesState && featuredArticle ? <FeaturedArticle article={featuredArticle} /> : null}
        {!articlesState ? <ArticlesIndex articles={remainingArticles} /> : null}
      </main>
      <SiteFooter />
    </>
  );
}
