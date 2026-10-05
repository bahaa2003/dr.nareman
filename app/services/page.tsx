import { Header } from "@/components/layout/Header";
import { AllServices } from "@/components/services/AllServices";
import { ServicesBookingFinale } from "@/components/services/ServicesBookingFinale";
import { ServicesHero } from "@/components/services/ServicesHero";
import { SiteFooter } from "@/components/footer/SiteFooter";

export default function ServicesPage() {
  return (
    <>
      <Header />
      <main>
        <ServicesHero />
        <AllServices />
        <ServicesBookingFinale />
      </main>
      <SiteFooter />
    </>
  );
}
