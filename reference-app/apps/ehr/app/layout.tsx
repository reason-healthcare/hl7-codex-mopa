import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OGCA Reference EHR",
  description: "Oncology Guideline-Compliant Authorization — Reference EHR",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
