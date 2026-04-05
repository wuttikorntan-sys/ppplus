import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PP Plus - ร้านขายสีครบวงจร",
  description: "ร้านขายสีครบวงจรในกรุงเทพ สีทาบ้าน สีสเปรย์ สีรถยนต์ อุปกรณ์ทาสี ทุกแบรนด์ชั้นนำ",
  manifest: "/manifest.json",
  themeColor: "#F5841F",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PP Plus",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
