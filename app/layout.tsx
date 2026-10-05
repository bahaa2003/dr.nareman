import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "د. ناريمان الطريري | علاج العقم وأطفال الأنابيب",
  description: "واجهة عربية لعيادة د. ناريمان الطريري، استشارية علاج العقم وأطفال الأنابيب."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
