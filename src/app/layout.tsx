import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NER-LOGIX · SIH26002",
  description:
    "AI-based Smart Logistics and Accessibility Intelligence Platform for the North Eastern Region (MDoNER)",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
