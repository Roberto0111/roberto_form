import type { Metadata } from "next";
import { headers } from "next/headers";
import { Noto_Sans_TC } from "next/font/google";
import "./globals.css";

const notoSansTC = Noto_Sans_TC({
  variable: "--font-noto-sans-tc",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  preload: false,
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;

  return {
    title: "ROBERT FORM｜3D 列印生活選品",
    description: "從燈具、飾品到酒具與家居，探索 3D 列印設計與客製可能。",
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
    openGraph: {
      title: "ROBERT FORM｜3D 列印生活選品",
      description: "把想像，印成生活的形狀。",
      images: [`${origin}/og.png`],
    },
    twitter: {
      card: "summary_large_image",
      title: "ROBERT FORM｜3D 列印生活選品",
      description: "把想像，印成生活的形狀。",
      images: [`${origin}/og.png`],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body className={`${notoSansTC.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
