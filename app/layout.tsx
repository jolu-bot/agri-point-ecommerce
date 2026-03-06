import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SiteConfigProvider } from "@/contexts/SiteConfigContext";
import { PreviewModeProvider } from "@/contexts/PreviewModeContext";
import { Toaster } from "react-hot-toast";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PartnersSection from "@/components/shared/PartnersSection";
import BackToTop from '@/components/layout/BackToTop';
import { ClientComponents } from "./ClientComponents";
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://agri-ps.com'),
  title: "AGRI POINT SERVICE - Produire plus, Gagner plus, Mieux vivre",
  description: "Distributeur de biofertilisants de qualité au Cameroun. Solutions complètes agricoles.",
  keywords: ["biofertilisant", "agriculture", "Cameroun"],
  authors: [{ name: "AGRI POINT SERVICE" }],
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.png',
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: '/',
    title: "AGRI POINT SERVICE",
    description: "Solutions agricoles complètes",
    images: [{ url: '/images/logo.png', width: 1200, height: 630 }],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Use system fonts - NO GOOGLE FONTS */}
        <style>{`
          :root {
            --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          }
          html { scroll-behavior: smooth; line-height: 1.5; }
          body { margin: 0; padding: 0; font-family: var(--font-sans); background: #fff; color: #111827; -webkit-font-smoothing: antialiased; }
          * { box-sizing: border-box; }
          .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; }
        `}</style>
      </head>
      <body>
        <SiteConfigProvider>
          <PreviewModeProvider>
            <ThemeProvider>
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-grow">
                  {children}
                </main>
                <PartnersSection variant="light" showTitle={true} />
                <Footer />
                <Toaster position="top-right" />
                <BackToTop />
              </div>
              <ClientComponents />
            </ThemeProvider>
          </PreviewModeProvider>
        </SiteConfigProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
