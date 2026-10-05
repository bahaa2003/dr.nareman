"use client";

import { useEffect, useRef } from "react";
import { CalendarDays, MessageCircle } from "lucide-react";
import Link from "next/link";

import { trackMarketingEvent } from "@/lib/marketing-events";
import { formatRiyadhDateTime } from "@/lib/riyadh-datetime";
import type { PublicWeeklyLive } from "@/types/public-weekly-live";

import styles from "./WeeklyLiveHomeCta.module.css";

export function WeeklyLiveHomeCta({ live, attributionSearch = "" }: { live: PublicWeeklyLive; attributionSearch?: string }) {
  const spotlightViewTracked = useRef(false);

  useEffect(() => {
    if (!spotlightViewTracked.current) {
      spotlightViewTracked.current = true;
      trackMarketingEvent("weekly_live_spotlight_view", { placement: "homepage", questionsOpen: live.acceptingQuestions });
    }
  }, [live.acceptingQuestions]);

  return (
    <section className={styles.section} aria-labelledby="weekly-live-home-title">
      <div className={styles.inner}>
        <div className={styles.content}>
          <p className={styles.eyebrow}><span className={styles.liveDot} aria-hidden="true" />لقاء تثقيفي أسبوعي</p>
          <h2 id="weekly-live-home-title">اللقاء الأسبوعي مع د. ناريمان</h2>
          <p className={styles.title}>{live.title}</p>
          <div className={styles.meta}>
            <p className={styles.time}><CalendarDays aria-hidden="true" size={17} />{formatRiyadhDateTime(live.scheduledAt, "بتوقيت السعودية")}</p>
            <p className={styles.status}>{live.acceptingQuestions ? "استقبال الأسئلة مفتوح الآن" : "استقبال الأسئلة مغلق حاليًا"}</p>
          </div>
        </div>
        <div className={styles.action}>
          <p>بتوقيت السعودية</p>
          <Link className={styles.cta} href={"/weekly-live" + attributionSearch}>
            <MessageCircle aria-hidden="true" size={19} />
            {live.acceptingQuestions ? "شارك سؤالك" : "تفاصيل اللقاء"}
          </Link>
        </div>
      </div>
    </section>
  );
}
