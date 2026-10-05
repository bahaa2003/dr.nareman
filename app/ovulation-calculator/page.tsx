import type { Metadata } from "next";

import { OvulationCalculator } from "@/components/ovulation-calculator/OvulationCalculator";
import { SiteFooter } from "@/components/footer/SiteFooter";
import { Header } from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "حاسبة التبويض التقديرية | د. ناريمان الطريري",
  description: "أداة معلوماتية لتقدير نافذة الخصوبة وموعد التبويض والدورة التالية عند انتظام الدورة غالبًا."
};

export default function OvulationCalculatorPage() {
  return (
    <>
      <Header />
      <main>
        <OvulationCalculator />
      </main>
      <SiteFooter />
    </>
  );
}
