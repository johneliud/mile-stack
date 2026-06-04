import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { WalletProvider } from "@/contexts/WalletContext";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "MileStack - Milestone-Based Escrow for Global Talent",
  description:
    "Connect with global employers through milestone-based XLM escrow payments on Stellar. Built for developers and digital professionals in the Global South.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
