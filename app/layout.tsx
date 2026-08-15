import type { Metadata } from "next";
import { Noto_Sans_TC } from "next/font/google";
import "./globals.css";

const notoSansTC = Noto_Sans_TC({
  variable: "--font-noto-sans-tc",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  preload: false,
  display: "swap",
});

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_ORIGIN ??
  "https://form24-maker-catalog.robertolopolun.chatgpt.site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "ROBERT FORM｜3D 列印生活選品",
  description: "從燈具、飾品到酒具與家居，探索 3D 列印設計、透明參考售價與客製可能。",
  icons: {
    icon: `${basePath}/favicon.svg`,
    shortcut: `${basePath}/favicon.svg`,
  },
  openGraph: {
    url: siteUrl,
    title: "ROBERT FORM｜3D 列印生活選品",
    description: "97 件 3D 列印生活選品，附標準尺寸參考售價、預估耗材與列印時間。",
    images: [`${siteUrl}/og.png`],
  },
  twitter: {
    card: "summary_large_image",
    title: "ROBERT FORM｜3D 列印生活選品",
    description: "97 件 3D 列印生活選品，附標準尺寸參考售價、預估耗材與列印時間。",
    images: [`${siteUrl}/og.png`],
  },
};

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
