'use client';

import { Turnstile } from '@marsidev/react-turnstile';
import { useEffect, useRef, useState } from 'react';

export interface TurnstileProps {
  onToken: (token: string) => void;
  onError?: (error: string) => void;
}

export function TurnstileCaptcha({ onToken, onError }: TurnstileProps) {
  const [, setIsLoading] = useState(false);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const hasWarnedRef = useRef(false);

  useEffect(() => {
    if (siteKey || hasWarnedRef.current) return;
    hasWarnedRef.current = true;
    console.warn('TURNSTILE_SITE_KEY not configured');
  }, [siteKey]);

  if (!siteKey) {
    return null;
  }

  return (
    <div className="w-full my-4">
      <Turnstile
        siteKey={siteKey}
        onSuccess={(token: string) => {
          setIsLoading(false);
          onToken(token);
        }}
        onError={() => {
          setIsLoading(false);
          onError?.('CAPTCHA verification failed');
        }}
        onExpire={() => {
          setIsLoading(false);
          onError?.('CAPTCHA expired, please retry');
        }}
        theme="light"
        options={{
          theme: 'light',
          responseFieldName: 'cf-turnstile-response',
        }}
      />
      <p className="text-xs text-gray-500 mt-2">
        This site is protected by Cloudflare Turnstile and is subject to the{' '}
        <a href="https://www.cloudflare.com/privacypolicy/" className="underline">
          Cloudflare Privacy Policy
        </a>
        {' '}and{' '}
        <a href="https://www.cloudflare.com/website-terms/" className="underline">
          Terms of Service
        </a>
        .
      </p>
    </div>
  );
}

export default TurnstileCaptcha;
