import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/hero/Hero";
import { AboutDoctor } from "@/components/about/AboutDoctor";
import { Services } from "@/components/services/Services";
import { ArticlesSection } from "@/components/articles/ArticlesSection";
import { BookingFinale } from "@/components/booking/BookingFinale";
import { WeeklyLiveHomeCta } from "@/components/weekly-live/WeeklyLiveHomeCta";
import { TestimonialsSection } from "@/components/testimonials/TestimonialsSection";
import { OvulationCalculatorHomeCta } from "@/components/ovulation-calculator/OvulationCalculatorHomeCta";
import { SiteFooter } from "@/components/footer/SiteFooter";
import { getPublishedArticles, toArticlePreview } from "@/lib/public-api/articles";
import { getPublicTestimonials } from "@/lib/public-api/testimonials";
import { getCurrentWeeklyLive } from "@/lib/public-api/weekly-live";
import { buildCalculatorAttributionSearch } from "@/lib/marketing-attribution";
import type { PublicWeeklyLive } from "@/types/public-weekly-live";
import type { ArticlePreview } from "@/types/public-articles";
import type { PublicTestimonial } from "@/types/public-testimonials";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const homepageSearchParams = await searchParams;
  const calculatorAttributionSearch = buildCalculatorAttributionSearch(homepageSearchParams);
  const weeklyLiveAttributionSearch = buildCalculatorAttributionSearch(homepageSearchParams);
  let articles: ArticlePreview[] = [];
  let articlesState: "empty" | "error" | undefined;
  let testimonials: PublicTestimonial[] = [];
  let weeklyLive: PublicWeeklyLive | null = null;

  try {
    const response = await getPublishedArticles({ limit: 3 });
    articles = response.items.map(toArticlePreview);
    articlesState = articles.length === 0 ? "empty" : undefined;
  } catch {
    articlesState = "error";
  }

  try {
    testimonials = (await getPublicTestimonials({ limit: 6 })).items;
  } catch {
    testimonials = [];
  }

  try {
    weeklyLive = (await getCurrentWeeklyLive()).live;
  } catch {
    weeklyLive = null;
  }

  return (
    <>
      <Header />
      <main id="home">
        {weeklyLive ? <WeeklyLiveHomeCta live={weeklyLive} attributionSearch={weeklyLiveAttributionSearch} /> : null}
        <Hero />
        <AboutDoctor />
        <Services />
        <OvulationCalculatorHomeCta attributionSearch={calculatorAttributionSearch} />
        <ArticlesSection articles={articles} state={articlesState} />
        <TestimonialsSection testimonials={testimonials} />
        <BookingFinale />
      </main>
      <SiteFooter />
    </>
  );
}
