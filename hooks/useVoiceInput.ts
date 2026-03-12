import { useState, useRef, useCallback } from 'react';

/**
 * Hook wrapping the Web SpeechRecognition API.
 * Supports fr-FR and en-GB locales.
 *
 * @param onResult - callback called with the transcribed text
 * @param locale   - 'fr' | 'en', defaults to 'fr'
 */
export function useVoiceInput(
  onResult: (text: string) => void,
  locale: string = 'fr',
) {
  const [listening, setListening] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recRef = useRef<any>(null);

  const supported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const toggle = useCallback(() => {
    if (!supported) return;

    if (listening) {
      recRef.current?.stop();
      setListening(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = locale === 'en' ? 'en-GB' : 'fr-FR';
    rec.continuous = false;
    rec.interimResults = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => { onResult(e.results[0][0].transcript); };
    rec.onend   = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    rec.start();
    setListening(true);
  }, [listening, onResult, supported, locale]);

  return { listening, toggle, supported };
}
