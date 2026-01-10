import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IPLP 내부 포털",
  description: "아이피링크파트너스 내부용 사이트 모음",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
