import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "工具箱 - 在线多功能工具站",
  description: "提供PDF转换、图片处理、二维码生成、文本工具、密码生成等多种在线工具",
  keywords: "PDF转换,图片处理,二维码生成,文本工具,密码生成,在线工具",
  authors: [{ name: "Toolbox Team" }],
  robots: "index, follow",
};

export const viewport = {
  width: "device-width",
  initialScale: 1.0,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.className} bg-background text-foreground`}>
        {children}
      </body>
    </html>
  );
}
