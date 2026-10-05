import { AboutBookingFinale } from "@/components/about/AboutBookingFinale";
import { AboutHero } from "@/components/about/AboutHero";
import { CareerTimeline } from "@/components/about/CareerTimeline";
import { DoctorStory } from "@/components/about/DoctorStory";
import { Qualifications } from "@/components/about/Qualifications";
import { RecognitionStrip } from "@/components/about/RecognitionStrip";
import { SiteFooter } from "@/components/footer/SiteFooter";
import { Header } from "@/components/layout/Header";

export default function AboutPage() {
  return (
    <>
      <Header />
      <main>
        <AboutHero />
        <DoctorStory />
        <CareerTimeline />
        <Qualifications />
        <RecognitionStrip />
        <AboutBookingFinale />
      </main>
      <SiteFooter />
    </>
  );
}
