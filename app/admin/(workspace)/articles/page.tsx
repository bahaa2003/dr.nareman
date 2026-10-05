import { Suspense } from "react";

import { AdminArticleList } from "@/components/admin/articles/AdminArticleList";

export default function AdminArticlesPage() {
  return (
    <Suspense fallback={<section aria-live="polite">جارٍ تحميل المقالات…</section>}>
      <AdminArticleList />
    </Suspense>
  );
}
