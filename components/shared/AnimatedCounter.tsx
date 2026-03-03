'use client';

import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect } from 'react';

interface AnimatedCounterProps {
  from?: number;
  to: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  format?: (value: number) => string;
}

export default function AnimatedCounter({
  from = 0,
  to,
  duration = 2.5,
  prefix = '',
  suffix = '',
  decimals = 0,
  format,
}: AnimatedCounterProps) {
  const count = useMotionValue(from);
  const rounded = useTransform(count, (latest) => {
    if (format) return format(latest);
    
    const isRoundNumber = latest % 1 === 0;
    return isRoundNumber ? Math.round(latest).toString() : latest.toFixed(decimals);
  });

  useEffect(() => {
    const animation = animate(count, to, {
      duration,
      ease: 'easeOut',
    });

    return animation.stop;
  }, [count, to, duration]);

  return (
    <motion.span>
      {prefix}
      <motion.span>{rounded}</motion.span>
      {suffix}
    </motion.span>
  );
}
