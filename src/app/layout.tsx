import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: "Cổng thông tin Sinh viên 5 tốt - ĐHBK Hà Nội",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={`${fontSans.className} bg-slate-50 text-slate-800`}>
        {children}
      </body>
    </html>
  );
}