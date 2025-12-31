import type { Metadata, Viewport } from "next";
import { Kosugi_Maru } from "next/font/google";
import "./globals.css";

const kosugiMaru = Kosugi_Maru({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-kosugi-maru",
  display: "swap",
});

export const metadata: Metadata = {
  title: "旅行アプリ",
  description: "友人と一緒に使える旅行アプリ",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${kosugiMaru.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
