import type { Metadata } from "next";

import { SiteFooter } from "@/components/footer/SiteFooter";
import { Header } from "@/components/layout/Header";
import { WeeklyLiveExperience } from "@/components/weekly-live/WeeklyLiveExperience";
import { getCurrentWeeklyLive } from "@/lib/public-api/weekly-live";

export const metadata: Metadata = { title: "اللقاء الأسبوعي | د. ناريمان الطريري", description: "لقاء أسبوعي تثقيفي للإجابة عن الأسئلة العامة المتعلقة بالصحة الإنجابية." };
export const dynamic = "force-dynamic";

export default async function WeeklyLivePage() {
  let initialLive = null;
  let initialError = false;

  try {
    initialLive = (await getCurrentWeeklyLive()).live;
  } catch {
    initialError = true;
  }

  return <><Header /><main><WeeklyLiveExperience initialLive={initialLive} initialError={initialError} /></main><SiteFooter /></>;
}
