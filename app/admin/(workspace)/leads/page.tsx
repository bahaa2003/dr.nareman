import { Suspense } from "react";

import { AdminLeadsManager } from "@/components/admin/leads/AdminLeadsManager";

export default function AdminLeadsPage() {
  return <Suspense fallback={<section aria-live="polite">جارٍ تحميل العملاء المحتملين…</section>}><AdminLeadsManager /></Suspense>;
}
