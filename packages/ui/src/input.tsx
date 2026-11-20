import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from './cn';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          'w-full min-h-11 rounded-md border border-current/20 bg-transparent px-3 text-base',
          'outline-none focus-visible:ring-2 focus-visible:ring-current/40',
          'disabled:opacity-50',
          className,
        )}
        {...props}
      />
    );
  },
);
