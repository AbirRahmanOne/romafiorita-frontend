import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Pill, Skeleton, EmptyState, type PillStatus } from '@rf/ui';
import { usePaymentRequests, usePaymentRequestAction } from '@/lib/hooks';
import { formatMoney } from '@/lib/status';
import { PaymentRequestForm } from '@/components/PaymentRequestForm';
import type { PaymentRequest, PaymentRequestStatus } from '@rf/mocks';

const STOREFRONT = import.meta.env.VITE_STOREFRONT_URL ?? 'http://localhost:3000';
const STATUSES = ['all', 'sent', 'viewed', 'paid', 'expired', 'cancelled'];
const PILL: Record<PaymentRequestStatus, PillStatus> = {
  sent: 'awaiting',
  viewed: 'photo-sent',
  paid: 'delivered',
  expired: 'refunded',
  cancelled: 'declined',
};

function hoursLeft(iso: string) {
  return Math.max(0, Math.round((new Date(iso).getTime() - Date.now()) / 3600e3));
}

export function PaymentRequests() {
  const [params, setParams] = useSearchParams();
  const [status, setStatus] = useState('all');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<PaymentRequest | null>(null);
  const { data, isLoading } = usePaymentRequests(status);
  const action = usePaymentRequestAction();

  useEffect(() => {
    if (params.get('new') === '1') {
      setCreating(true);
      setParams({});
    }
  }, [params, setParams]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex overflow-hidden rounded-lg border border-card">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`border-r border-card px-3.5 py-2 text-[13px] font-medium capitalize ${
                status === s ? 'bg-primary-100 text-[#1d4ed8]' : 'bg-surface text-[#374151]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setCreating(true)}>
          New custom order
        </button>
      </div>

      <div className="card overflow-hidden">
        {isLoading || !data ? (
          <div className="p-4">
            <Skeleton className="h-48" />
          </div>
        ) : data.items.length === 0 ? (
          <EmptyState title="No payment requests yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-[#f9fafb] text-left text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-5 py-3 font-semibold">Order</th>
                  <th className="px-3 py-3 font-semibold">Customer</th>
                  <th className="px-3 py-3 text-right font-semibold">Amount</th>
                  <th className="px-3 py-3 font-semibold">Status</th>
                  <th className="px-3 py-3 font-semibold">Expires</th>
                  <th className="px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((pr) => (
                  <tr key={pr.id} className="border-t border-[#eef0f4]">
                    <td className="px-5 py-3 tabular-nums">{pr.order_number}</td>
                    <td className="px-3 py-3">
                      {pr.customer}
                      <div className="text-xs text-muted">{pr.email}</div>
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">{formatMoney(pr.amount_cents)}</td>
                    <td className="px-3 py-3">
                      <Pill status={PILL[pr.status]}>{pr.status}</Pill>
                    </td>
                    <td className="px-3 py-3 tabular-nums text-muted">
                      {pr.status === 'paid' ? '—' : `${hoursLeft(pr.expires_at)}h`}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-2 text-xs">
                        <button
                          type="button"
                          className="font-semibold text-primary"
                          onClick={() => void navigator.clipboard?.writeText(`${STOREFRONT}/en/pay/${pr.token}`)}
                        >
                          Copy link
                        </button>
                        <button
                          type="button"
                          className="font-semibold text-primary"
                          onClick={() => action.mutate({ id: pr.id, action: 'duplicate' })}
                        >
                          Duplicate
                        </button>
                        {pr.status !== 'paid' && pr.status !== 'cancelled' ? (
                          <>
                            <button
                              type="button"
                              className="font-semibold text-primary"
                              onClick={() => setEditing(pr)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="font-semibold text-primary"
                              onClick={() => action.mutate({ id: pr.id, action: 'resend' })}
                            >
                              Resend
                            </button>
                            <button
                              type="button"
                              className="font-semibold text-[#b91c1c]"
                              onClick={() => action.mutate({ id: pr.id, action: 'cancel' })}
                            >
                              Cancel
                            </button>
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {creating ? <PaymentRequestForm onClose={() => setCreating(false)} /> : null}
      {editing ? <PaymentRequestForm editing={editing} onClose={() => setEditing(null)} /> : null}
    </div>
  );
}
