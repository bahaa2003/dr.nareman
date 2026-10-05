import { WeeklyLiveWorkspace } from "@/components/admin/weekly-live/WeeklyLiveManager";

export default async function WeeklyLiveWorkspacePage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <WeeklyLiveWorkspace key={id} liveId={id} />; }
