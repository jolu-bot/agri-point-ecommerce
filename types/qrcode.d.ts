// Déclaration de type minimale pour le module qrcode (v1.5.4)
// (pas de paquet @types/qrcode installé séparément)
declare module 'qrcode' {
  interface QRCodeToDataURLOptions {
    width?: number;
    margin?: number;
    color?: { dark?: string; light?: string };
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
    type?: string;
  }
  function toDataURL(text: string, options?: QRCodeToDataURLOptions): Promise<string>;
  function toString(text: string, options?: QRCodeToDataURLOptions): Promise<string>;
}
