import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Adaptive 5K Running System",
  description: "MVP ที่ช่วยพากลับมาวิ่งแบบไม่กดดัน"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
