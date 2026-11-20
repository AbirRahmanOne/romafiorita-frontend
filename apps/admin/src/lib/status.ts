import type { AdminStatus } from '@rf/mocks';

export const STATUS_LABEL: Record<AdminStatus, string> = {
  new: 'New',
  awaiting: 'Awaiting photo',
  'photo-sent': 'Photo sent',
  approved: 'Approved',
  'out-for-delivery': 'Out for delivery',
  delivered: 'Delivered',
  declined: 'Declined',
  refunded: 'Refunded',
};

/** The single "next action" offered for each status (order detail + inbox). */
export const NEXT_ACTION: Partial<Record<AdminStatus, { action: string; label: string }>> = {
  new: { action: 'accept', label: 'Accept order' },
  awaiting: { action: 'send-photo', label: 'Send photo to sender' },
  'photo-sent': { action: 'approve', label: 'Mark approved' },
  approved: { action: 'dispatch', label: 'Hand to rider' },
  'out-for-delivery': { action: 'deliver', label: 'Mark delivered' },
};

/** The happy-path lifecycle shown as a timeline. */
export const LIFECYCLE: AdminStatus[] = [
  'awaiting',
  'photo-sent',
  'approved',
  'out-for-delivery',
  'delivered',
];

export const STATUS_TABS: AdminStatus[] = [
  'new',
  'awaiting',
  'photo-sent',
  'out-for-delivery',
  'delivered',
];

export const formatMoney = (cents: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR' }).format(cents / 100);
