'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 320);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          onClick={scrollToTop}
          key="back-to-top"
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          whileHover={{ scale: 1.1, y: -3 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Retour en haut de la page"
          className="
            fixed bottom-6 right-6 z-50
            w-12 h-12 rounded-full
            bg-[#B71C1C] hover:bg-[#8e1616]
            text-white shadow-[0_4px_24px_rgba(183,28,28,0.45)]
            flex items-center justify-center
            transition-colors duration-200
            ring-2 ring-white/20
          "
        >
          <ArrowUp className="w-5 h-5 stroke-[2.5]" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
