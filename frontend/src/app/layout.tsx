import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PP Plus - ร้านขายสีครบวงจร",
  description: "ร้านขายสีครบวงจรในกรุงเทพ สีทาบ้าน สีสเปรย์ สีรถยนต์ อุปกรณ์ทาสี ทุกแบรนด์ชั้นนำ",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
