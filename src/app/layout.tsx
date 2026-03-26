import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StockTerminal — Market Intelligence Platform",
  description: "Professional stock screening, heatmaps, and market analysis",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#e0e5ec] text-[#2d3436] antialiased">
        {children}
      </body>
    </html>
  );
}
