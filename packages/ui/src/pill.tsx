import type { HTMLAttributes } from 'react';
import { cn } from './cn';

/** Admin order/product statuses. Always text + colour, never colour-only. */
export type PillStatus =
  | 'new'
  | 'awaiting'
  | 'photo-sent'
  | 'approved'
  | 'out-for-delivery'
  | 'delivered'
  | 'declined'
  | 'refunded'
  | 'neutral';

const STYLES: Record<PillStatus, string> = {
  new: 'bg-[#fff4e5] text-[#b45309]',
  awaiting: 'bg-[#fff4e5] text-[#b45309]',
  'photo-sent': 'bg-[#eaf1fe] text-[#1d4ed8]',
  approved: 'bg-[#ede9fe] text-[#6d28d9]',
  'out-for-delivery': 'bg-[#e0f2fe] text-[#0369a1]',
  delivered: 'bg-[#dcfce7] text-[#15803d]',
  declined: 'bg-[#fee2e2] text-[#b91c1c]',
  refunded: 'bg-[#f1f5f9] text-[#475569]',
  neutral: 'bg-[#f3f4f6] text-[#374151]',
};

export interface PillProps extends HTMLAttributes<HTMLSpanElement> {
  status: PillStatus;
}

export function Pill({ status, className, children, ...props }: PillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold',
        STYLES[status],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
