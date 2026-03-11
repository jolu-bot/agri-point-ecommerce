'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { LazyMotion, domAnimation } from 'framer-motion';
import { ReactNode } from 'react';

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <LazyMotion features={domAnimation} strict>
        {children}
      </LazyMotion>
    </NextThemesProvider>
  );
}
