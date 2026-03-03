import type { Metadata, Viewport } from "next";
import { Inter, Montserrat } from "next/font/google";
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

// ── Optimized fonts with minimal weights ────────────────────────────────────
const inter = Inter({
  subsets: ["latin"],
  weight: ['400', '600'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
});

const montserrat = Montserrat({ 
  subsets: ["latin"],
  weight: ['600', '700'],
  display: 'swap',
  variable: '--font-montserrat',
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://agri-ps.com'),
  title: "AGRI POINT SERVICE - Produire plus, Gagner plus, Mieux vivre",
  description: "Distributeur de biofertilisants de qualité au Cameroun. Solutions complètes pour l'agriculture moderne et urbaine.",
  keywords: ["biofertilisant", "agriculture", "Cameroun", "engrais", "agriculture urbaine"],
  authors: [{ name: "AGRI POINT SERVICE" }],
  alternates: {
    canonical: '/',
    languages: {
      'fr-FR': 'https://agri-ps.com',
    },
  },
  icons: {
    icon: [{ url: '/favicon.ico', sizes: 'any' }],
    apple: [{ url: '/favicon.png', sizes: '180x180' }],
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: '/',
    title: "AGRI POINT SERVICE",
    description: "Produire plus, Gagner plus, Mieux vivre",
    images: [{ url: '/images/logo.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AGRI POINT SERVICE',
    description: 'Produire plus, Gagner plus, Mieux vivre',
  },
  manifest: '/manifest.json',
  robots: {
    index: true,
    follow: true,
  },
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
        {/* DNS & Preconnect for external resources */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Critical CSS inline */}
        <style dangerouslySetInnerHTML={{__html: `*{margin:0;padding:0;box-sizing:border-box}html{scroll-behavior:smooth}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#fff;color:#111827;line-height:1.5}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border-width:0}`}} />
      </head>
      <body className={`${inter.variable} ${montserrat.variable} font-sans antialiased`}>
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
              {/* Client-side components loaded after hydration */}
              <ClientComponents />
            </ThemeProvider>
          </PreviewModeProvider>
        </SiteConfigProvider>
      </body>
    </html>
  );
}
