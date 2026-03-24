/**
 * Button Component
 * Enhanced button with hover, click, and ripple feedback
 */

import React, { forwardRef, ButtonHTMLAttributes, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useRipple } from '../hooks/useRipple';
import { Ripple } from './animations/Ripple';
import { prefersReducedMotion } from '../utils/animations';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Button variant
   */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  /**
   * Button size
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Whether the button is loading
   */
  loading?: boolean;
  /**
   * Whether to show ripple effect
   */
  ripple?: boolean;
  /**
   * Full width button
   */
  fullWidth?: boolean;
  /**
   * Left icon
   */
  leftIcon?: React.ReactNode;
  /**
   * Right icon
   */
  rightIcon?: React.ReactNode;
}

/**
 * Animated spinner for loading state
 */
const LoadingSpinner: React.FC<{ className?: string }> = ({ className }) => (
  <motion.svg
    className={clsx('animate-spin', className)}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    initial={{ rotate: 0 }}
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </motion.svg>
);

const variantStyles = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 focus:ring-primary-500',
  secondary: 'bg-accent-600 text-white hover:bg-accent-700 active:bg-accent-800 focus:ring-accent-500',
  outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 active:bg-primary-100 focus:ring-primary-500',
  ghost: 'text-primary-600 hover:bg-primary-50 active:bg-primary-100 focus:ring-primary-500',
  danger: 'bg-error-600 text-white hover:bg-error-700 active:bg-error-800 focus:ring-error-500',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

const spinnerSizes = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

/**
 * Button component with animations
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      ripple = true,
      fullWidth = false,
      leftIcon,
      rightIcon,
      className,
      disabled,
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const [mounted, setMounted] = useState(false);
    const { ripples, createRipple } = useRipple({ disabled: disabled || loading || !ripple });

    useEffect(() => {
      setMounted(true);
    }, []);

    const reducedMotion = mounted ? prefersReducedMotion() : false;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) return;
      createRipple(e);
      onClick?.(e);
    };

    const isDisabled = disabled || loading;

    // Extract non-conflicting props for motion.button
    const { type = 'button', ...restProps } = props;

    return (
      <motion.button
        ref={ref}
        type={type}
        className={clsx(
          // Base styles
          'relative inline-flex items-center justify-center font-medium rounded-lg',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'transition-transform duration-150',
          // Disabled state
          isDisabled && 'opacity-60 cursor-not-allowed',
          !isDisabled && !reducedMotion && 'active:scale-95',
          // Variant
          variantStyles[variant],
          // Size
          sizeStyles[size],
          // Full width
          fullWidth && 'w-full',
          // Override ripple overflow for non-outline variants
          ripple && variant !== 'outline' && 'overflow-hidden',
          className
        )}
        disabled={isDisabled}
        onClick={handleClick}
        whileHover={!isDisabled && !reducedMotion ? { scale: 1.02 } : undefined}
        whileTap={!isDisabled && !reducedMotion ? { scale: 0.98 } : undefined}
        aria-disabled={isDisabled}
        aria-busy={loading}
      >
        {/* Ripple Effect */}
        {ripple && !reducedMotion && <Ripple ripples={ripples} />}

        {/* Button Content */}
        <span className={clsx('flex items-center gap-2', loading && 'opacity-0')}>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </span>

        {/* Loading Spinner */}
        <AnimatePresence>
          {loading && (
            <motion.span
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.15 }}
            >
              <LoadingSpinner className={spinnerSizes[size]} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
