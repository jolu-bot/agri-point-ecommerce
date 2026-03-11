import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SiteConfigProvider } from "@/contexts/SiteConfigContext";
import { PreviewModeProvider } from "@/contexts/PreviewModeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Toaster } from "react-hot-toast";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PartnersSection from "@/components/shared/PartnersSection";
import BackToTop from '@/components/layout/BackToTop';
import { ClientComponents } from "./ClientComponents";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://agri-ps.com'),
  title: "AGRIPOINT SERVICES SAS - Produire plus, Gagner plus, Mieux vivre",
  description: "Facilitateur agropastoral au Cameroun. Interface entre l'offre et la demande pour les acteurs agricoles, d'élevage, de pisciculture et de sylviculture.",
  keywords: ["facilitation agricole", "agropastoral", "Cameroun", "agriculture", "élevage", "pisciculture"],
  authors: [{ name: "AGRIPOINT SERVICES" }],
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.png',
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: '/',
    title: "AGRIPOINT SERVICES",
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
        {/* Preconnect pour ressources externes critiques */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        {/* Use system fonts - NO GOOGLE FONTS */}
        <style>{`
          :root {
            --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          }
          html { line-height: 1.5; }
          @media (prefers-reduced-motion: no-preference) { html { scroll-behavior: smooth; } }
          body { margin: 0; padding: 0; font-family: var(--font-sans); background: #fff; color: #111827; -webkit-font-smoothing: antialiased; }
          * { box-sizing: border-box; }
          .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; }
        `}</style>
      </head>
      <body>
        <LanguageProvider>
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
        </LanguageProvider>
      </body>
    </html>
  );
}
