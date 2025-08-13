// app/layout.tsx
import "./globals.css"; // ✅ CSS dosyasını dahil ettik
import { ReactNode } from "react";

export const metadata = {
  title: "Financial Reports QA",
  description: "Ask questions about financial reports",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans bg-white text-black">
        <div className="max-w-3xl mx-auto p-6">{children}</div>
      </body>
    </html>
  );
}
