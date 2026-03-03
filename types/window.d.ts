// Augmentation du type Window pour les scripts tiers
declare global {
  interface Window {
    // Google Analytics
    dataLayer?: IArguments[];
    gtag?: (...args: any[]) => void;
    
    // Facebook Pixel
    fbq?: (...args: any[]) => void;
    
    // Autres services tiers
    [key: string]: any;
  }
}

export {};
