import { ContactCanvas } from "@/components/contact/ContactCanvas";
import { ContactHero } from "@/components/contact/ContactHero";
import { SocialRail } from "@/components/contact/SocialRail";
import { SiteFooter } from "@/components/footer/SiteFooter";
import { Header } from "@/components/layout/Header";

export default function ContactPage() {
  return (
    <>
      <Header />
      <main>
        <ContactHero />
        <ContactCanvas />
        <SocialRail />
      </main>
      <SiteFooter />
    </>
  );
}
