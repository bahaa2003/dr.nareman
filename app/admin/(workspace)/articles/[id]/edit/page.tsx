import { AdminArticleEditEditor } from "@/components/admin/articles/AdminArticleEditor";

export default async function EditAdminArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <AdminArticleEditEditor key={id} articleId={id} />;
}
