import type { Metadata } from "next";
import { Poppins, Fraunces } from "next/font/google";
import { NotificationProvider } from "@/components/Notification";
import { WalletProvider } from "@/contexts/WalletContext";
import { RoleProvider } from "@/contexts/RoleContext";
import { RoleSelector } from "@/components/RoleSelector";
import { LenisProvider } from "@/contexts/LenisContext";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "MileStack",
  description:
    "Connect with global employers through milestone-based XLM escrow payments on Stellar. Built for developers and digital professionals in the Global South.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} ${fraunces.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <NotificationProvider>
          <WalletProvider>
            <RoleProvider>
              <LenisProvider>
                <RoleSelector />
                {children}
              </LenisProvider>
            </RoleProvider>
          </WalletProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}
