import dynamic, { DynamicOptions } from 'next/dynamic';
import { ComponentType } from 'react';

/**
 * Lazy load a component with a skeleton fallback and no SSR.
 * Use for heavy client-only components (charts, analytics, wallets, etc.)
 */
export function lazyLoad<T extends object>(
  loader: () => Promise<{ default: ComponentType<T> }>,
  options?: DynamicOptions<T>
) {
  return dynamic(loader, { ssr: false, ...options });
}
