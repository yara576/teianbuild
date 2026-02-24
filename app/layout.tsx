import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://teianbuild.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "teianbuild | AI提案書ジェネレーター for フリーランスエンジニア",
    template: "%s | teianbuild",
  },
  description:
    "案件情報を入力するだけでAIがプロ品質の提案書・見積書を30秒で自動生成。フリーランスエンジニアの提案書作成を革命的に効率化します。無料で3件まで使えます。",
  keywords: [
    "提案書",
    "見積書",
    "フリーランス",
    "エンジニア",
    "AI",
    "自動生成",
    "提案書作成",
    "見積もり",
    "副業",
  ],
  authors: [{ name: "teianbuild" }],
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: siteUrl,
    siteName: "teianbuild",
    title: "teianbuild | AI提案書ジェネレーター for フリーランスエンジニア",
    description:
      "案件情報を入力するだけでAIがプロ品質の提案書・見積書を30秒で自動生成。フリーランスエンジニアの提案書作成を革命的に効率化します。",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "teianbuild - AI提案書ジェネレーター",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "teianbuild | AI提案書ジェネレーター for フリーランスエンジニア",
    description:
      "案件情報を入力するだけでAIがプロ品質の提案書・見積書を30秒で自動生成。無料で3件まで使えます。",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
