import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Управление задачами",
  description: "Task Management Service на Next.js и FastAPI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
