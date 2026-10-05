import Link from "next/link";
import { CalendarDays, ArrowLeft } from "lucide-react";

import styles from "./OvulationCalculatorHomeCta.module.css";

export function OvulationCalculatorHomeCta({ attributionSearch = "" }: { attributionSearch?: string }) {
  return (
    <section className={styles.section} aria-labelledby="ovulation-calculator-cta-title">
      <div className={styles.inner}>
        <div className={styles.iconWrap} aria-hidden="true">
          <CalendarDays size={25} />
        </div>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>أداة معلوماتية خاصة</p>
          <h2 id="ovulation-calculator-cta-title">حاسبة التبويض التقديرية</h2>
          <p>تقدير مبسط لنافذة الخصوبة عند انتظام الدورة غالبًا، دون حفظ أي بيانات.</p>
        </div>
        <Link className={styles.cta} href={"/ovulation-calculator" + attributionSearch}>
          <span>ابدئي الحساب</span>
          <ArrowLeft aria-hidden="true" size={19} />
        </Link>
      </div>
    </section>
  );
}
