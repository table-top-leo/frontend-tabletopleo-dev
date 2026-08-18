import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { CurrencyProvider } from "./context/CurrencyContext";
import { LanguageProvider } from "./context/LanguageContext";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Table Top Leo",
  description: "Table Top Leo",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        {/* ── STRIPE SDK - Load before interactive ── */}
        <Script
          src="https://js.stripe.com/v3/"
          strategy="afterInteractive"
        />
        
        {/* ── RAZORPAY SDK ── */}
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
      </head>
      
      <body className="min-h-full flex flex-col">
        <LanguageProvider>
          <CurrencyProvider>
            {children}
          </CurrencyProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}