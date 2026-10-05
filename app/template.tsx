import { PublicPageEntry } from "@/components/layout/PublicPageEntry";

export default function Template({ children }: Readonly<{ children: React.ReactNode }>) {
  return <PublicPageEntry>{children}</PublicPageEntry>;
}
