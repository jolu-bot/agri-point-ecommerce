'use client';

import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';

interface HeroSlideshowProps {
  images: string[];
  alt?: string;
  className?: string;
  objectFit?: 'contain' | 'cover';
  variant?: 'dark' | 'light';
  interval?: number;
  onIndexChange?: (index: number) => void;
}

export default function HeroSlideshow({
  images,
  alt = 'Image',
  className = '',
  objectFit = 'cover',
  variant = 'light',
  interval = 3500,
  onIndexChange,
}: HeroSlideshowProps) {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % images.length);
  }, [images.length]);

  // Notifier le parent quand l'index change
  useEffect(() => {
    onIndexChange?.(current);
  }, [current, onIndexChange]);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(next, interval);
    return () => clearInterval(timer);
  }, [images.length, interval, next]);

  if (!images.length) return null;

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${
        variant === 'dark' ? 'bg-[#0d1a0e]' : ''
      } ${className}`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <Image
            src={images[current]}
            alt={`${alt} ${current + 1}`}
            fill
            className={`object-${objectFit}`}
            priority={current === 0}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </motion.div>
      </AnimatePresence>

      {/* Indicateurs dots */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? 'bg-white w-6' : 'bg-white/40 w-2'
              }`}
              aria-label={`Image ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
