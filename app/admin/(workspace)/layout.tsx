import { AdminShell } from "@/components/admin/AdminShell";
import { AdminSessionGate } from "@/components/admin/AdminSessionGate";

export default function AdminWorkspaceLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <AdminSessionGate>
      <AdminShell>{children}</AdminShell>
    </AdminSessionGate>
  );
}
