import type { Metadata } from "next";
import { Jost } from "next/font/google";
import { NotificationProvider } from "@/components/Notification";
import { WalletProvider } from "@/contexts/WalletContext";
import { RoleProvider } from "@/contexts/RoleContext";
import { RoleSelector } from "@/components/RoleSelector";
import "./globals.css";

const jost = Jost({
  variable: "--font-jost",
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
    <html lang="en" className={`${jost.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <NotificationProvider>
          <WalletProvider>
            <RoleProvider>
              <RoleSelector />
              {children}
            </RoleProvider>
          </WalletProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}
