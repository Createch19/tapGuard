import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "TapGenie — Smart NFC Business Profile & Review Growth Platform",
  description:
    "B2B SaaS platform for managing NFC and QR-code-based Google Review cards and Smart Business Profiles with TapGenie Smart Rating Gate, private feedback interception, and multi-tenant analytics.",
  icons: {
    icon: [
      { url: "/icon.png" },
      { url: "/icon.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/icon.png",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#F8F9FA] text-slate-900 font-sans">
        {children}
      </body>
    </html>
  );
}
