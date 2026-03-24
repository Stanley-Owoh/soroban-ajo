/**
 * PageTransition Component
 * Wrapper for page transitions using Framer Motion
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { prefersReducedMotion, pageTransitionVariants } from '../utils/animations';

export interface PageTransitionProps {
  /**
   * Child components
   */
  children: React.ReactNode;
  /**
   * Additional class names
   */
  className?: string;
  /**
   * Custom animation variants
   */
  variants?: typeof pageTransitionVariants;
  /**
   * Whether to enable page transitions
   */
  enabled?: boolean;
}

/**
 * Page transition wrapper with route animations
 */
export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className,
  variants = pageTransitionVariants,
  enabled = true,
}) => {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const reducedMotion = mounted ? prefersReducedMotion() : false;
  const shouldAnimate = enabled && !reducedMotion;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={shouldAnimate ? 'initial' : undefined}
        animate={shouldAnimate ? 'animate' : undefined}
        exit={shouldAnimate ? 'exit' : undefined}
        variants={shouldAnimate ? variants : undefined}
        transition={{ 
          duration: shouldAnimate ? 0.3 : 0,
          ease: 'easeOut'
        }}
        className={clsx('w-full', className)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * Fade in on mount wrapper
 */
export interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  className,
  delay = 0,
  duration = 0.3,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const reducedMotion = mounted ? prefersReducedMotion() : false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={mounted && !reducedMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0 : duration, delay: reducedMotion ? 0 : delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * Staggered list wrapper
 */
export interface StaggeredListProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

export const StaggeredList: React.FC<StaggeredListProps> = ({
  children,
  className,
  staggerDelay = 0.05,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const reducedMotion = mounted ? prefersReducedMotion() : false;

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate={mounted ? 'visible' : 'hidden'}
      variants={reducedMotion ? undefined : {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: reducedMotion ? 0 : staggerDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
};

/**
 * Staggered list item
 */
export interface StaggeredItemProps {
  children: React.ReactNode;
  className?: string;
}

export const StaggeredItem: React.FC<StaggeredItemProps> = ({
  children,
  className,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const reducedMotion = mounted ? prefersReducedMotion() : false;

  return (
    <motion.div
      className={className}
      variants={reducedMotion ? undefined : {
        hidden: { opacity: 0, y: 10 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: { duration: 0.2 }
        },
      }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
