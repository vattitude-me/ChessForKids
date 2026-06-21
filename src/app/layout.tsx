import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "Chess Quest - A Magical Chess Adventure",
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
      <body className="min-h-full flex flex-col">
        <main className="flex-1 pb-16 md:pb-0">
          {children}
        </main>
        <Navigation />
      </body>
    </html>
  );
}
