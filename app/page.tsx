import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/hero/Hero";
import { AboutDoctor } from "@/components/about/AboutDoctor";
import { Services } from "@/components/services/Services";
import { ArticlesSection } from "@/components/articles/ArticlesSection";
import { BookingFinale } from "@/components/booking/BookingFinale";
import { SiteFooter } from "@/components/footer/SiteFooter";
import { mockArticles } from "@/data/mockArticles";

export default function Home() {
  return (
    <>
      <Header />
      <main id="home">
        <Hero />
        <AboutDoctor />
        <Services />
        <ArticlesSection articles={mockArticles} />
        <BookingFinale />
      </main>
      <SiteFooter />
    </>
  );
}
