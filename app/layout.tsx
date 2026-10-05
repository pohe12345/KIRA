import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export const metadata: Metadata = {
  title: "救世主キラ伝説",
  description: "世界の犯罪者が次々と——。",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") ?? "";
  const isAndroid = /Android/i.test(userAgent);

  return (
    <html
      lang="ja"
      className={`h-full antialiased${isAndroid ? " android" : ""}`}
    >
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
