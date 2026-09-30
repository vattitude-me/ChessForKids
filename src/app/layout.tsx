import type { Metadata, Viewport } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import "./globals.css";
import Navigation, { MainArea } from "@/components/Navigation";
import AppProviders from "@/components/AppProviders";

const baloo = Baloo_2({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-baloo" });
const nunito = Nunito({ subsets: ["latin"], weight: ["500", "600", "700", "800", "900"], variable: "--font-nunito" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fff8ee",
};

export const metadata: Metadata = {
  title: "Little Knights · Chess for Kids",
  description:
    "Learn chess step by step with Coach Hoot: fun interactive lessons, puzzles that grow with you, and friendly computer opponents powered by Stockfish.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${baloo.variable} ${nunito.variable} antialiased`}>
      <body className="min-h-screen">
        <AppProviders>
          <Navigation />
          <MainArea>{children}</MainArea>
        </AppProviders>
      </body>
    </html>
  );
}
