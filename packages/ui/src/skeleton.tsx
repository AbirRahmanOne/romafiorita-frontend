import type { HTMLAttributes } from 'react';
import { cn } from './cn';

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-current/10 motion-reduce:animate-none', className)}
      aria-hidden
      {...props}
    />
  );
}
