import type { Metadata, Viewport } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SiteConfigProvider } from "@/contexts/SiteConfigContext";
import { PreviewModeProvider } from "@/contexts/PreviewModeContext";
import { Toaster } from "react-hot-toast";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AgriBotWrapper from "@/components/AgriBotWrapper";
import PreviewModeBanner from "@/components/admin/PreviewModeBanner";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import SyncStatusPanel from "@/components/SyncStatusPanel";

// Polices modernes et attrayantes
const inter = Inter({
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-inter',
});

const montserrat = Montserrat({ 
  subsets: ["latin"],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-montserrat',
});

export const metadata: Metadata = {
  title: "AGRI POINT SERVICE - Produire plus, Gagner plus, Mieux vivre",
  description: "Distributeur de biofertilisants de qualité au Cameroun. Solutions complètes pour l'agriculture moderne et urbaine.",
  keywords: ["biofertilisant", "agriculture", "Cameroun", "engrais", "agriculture urbaine", "AGRI POINT"],
  authors: [{ name: "AGRI POINT SERVICE" }],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/images/logo.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/images/logo.svg', sizes: '180x180', type: 'image/svg+xml' },
    ],
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    title: "AGRI POINT SERVICE",
    description: "Produire plus, Gagner plus, Mieux vivre",
    siteName: "AGRI POINT SERVICE",
    images: ['/images/logo.svg'],
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
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#1B5E20', // Vert profond de la charte graphique
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* CSS Critique en-ligne pour améliorer FCP */}
        <style dangerouslySetInnerHTML={{__html: `*{margin:0;padding:0;box-sizing:border-box}html{scroll-behavior:smooth}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Roboto","Helvetica Neue",Arial,sans-serif;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;background:#fff;color:#111827}.animate-pulse{animation:pulse 2s cubic-bezier(.4,0,.6,1) infinite}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}} />
      </head>
      <body className={`${inter.variable} ${montserrat.variable} font-sans antialiased`}>
        <SiteConfigProvider>
          <PreviewModeProvider>
            <ThemeProvider>
              <PreviewModeBanner />
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-grow">
                  {children}
                </main>
                <Footer />
                <AgriBotWrapper />
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#1B5E20', // Vert profond
                      color: '#fff',
                    },
                    success: {
                      iconTheme: {
                        primary: '#22c55e',
                        secondary: '#fff',
                      },
                    },
                    error: {
                      iconTheme: {
                        primary: '#ef4444',
                        secondary: '#fff',
                      },
                    },
                  }}
                />
                <PWAInstallPrompt />
                <SyncStatusPanel />
              </div>
            </ThemeProvider>
          </PreviewModeProvider>
        </SiteConfigProvider>
      </body>
    </html>
  );
}
