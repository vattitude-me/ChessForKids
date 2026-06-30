import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import AppProviders from "@/components/AppProviders";
import AuthGate from "@/components/AuthGate";

export const metadata: Metadata = {
  title: "Chess for Kids - Learn & Play",
  description: "Learn and play chess in a magical fantasy world! Perfect for kids and adults alike.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="h-full flex flex-col overflow-hidden">
        <AppProviders>
          <AuthGate>
            <div className="flex-1 min-h-0 overflow-y-auto pb-16 md:pb-0">
              {children}
            </div>
            <Navigation />
          </AuthGate>
        </AppProviders>
      </body>
    </html>
  );
}
