import type { Metadata } from "next";
import { Oswald, Barlow } from "next/font/google";
import "./globals.css";
import Providers from "@/app/components/Providers";

const oswald = Oswald({
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  subsets: ["latin"],
});

const barlow = Barlow({
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Regan",
  description: "Forged in steel. Built to last.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${oswald.variable} ${barlow.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
