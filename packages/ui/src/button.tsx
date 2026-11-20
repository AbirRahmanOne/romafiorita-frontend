import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from './cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'icon';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

/**
 * Structural, accessible button. Colour comes from theme-local `.btn-*` classes
 * each app defines (storefront pink / admin blue), so one primitive fits both.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', type = 'button', className, ...props },
  ref,
) {
  return <button ref={ref} type={type} className={cn('btn', `btn-${variant}`, className)} {...props} />;
});
