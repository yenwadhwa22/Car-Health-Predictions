import { useEffect, useState } from 'react';
import { useMotionValue, useTransform, animate } from 'framer-motion';

export const useReducedMotion = () => {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mediaQuery.matches);

    const listener = (e) => setPrefersReduced(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  return prefersReduced;
};

// Hook for animating numbers from 0 to value
export const useAnimatedNumber = (value, duration = 1, delay = 0) => {
  const motionValue = useMotionValue(0);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (prefersReduced) {
      motionValue.set(value);
      return;
    }

    const timer = setTimeout(() => {
      animate(motionValue, value, {
        duration,
        ease: 'easeOut',
      });
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [value, duration, prefersReduced, delay, motionValue]);

  return motionValue;
};

export const standardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};
