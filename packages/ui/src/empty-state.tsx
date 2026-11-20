import type { ReactNode } from 'react';
import { cn } from './cn';

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center gap-3 px-6 py-12 text-center', className)}>
      <p className="text-base font-semibold">{title}</p>
      {description ? <p className="max-w-sm text-sm opacity-70">{description}</p> : null}
      {action}
    </div>
  );
}
