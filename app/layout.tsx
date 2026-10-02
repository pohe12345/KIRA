import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "救世主キラ伝説",
  description: "世界の犯罪者が次々と——。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
