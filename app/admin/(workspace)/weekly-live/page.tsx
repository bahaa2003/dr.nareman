import { Suspense } from "react";

import { WeeklyLiveList } from "@/components/admin/weekly-live/WeeklyLiveManager";

export default function AdminWeeklyLivePage() { return <Suspense fallback={<section aria-live="polite">جارٍ تحميل اللقاءات…</section>}><WeeklyLiveList /></Suspense>; }
