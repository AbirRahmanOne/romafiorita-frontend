import type { ReactNode } from 'react';
import { Skeleton } from '@rf/ui';
import { useOrder, useTransition } from '@/lib/hooks';
import { formatMoney, LIFECYCLE, NEXT_ACTION, STATUS_LABEL } from '@/lib/status';

export function OrderDrawer({ orderId, onClose }: { orderId: string | null; onClose: () => void }) {
  const { data: order, isLoading } = useOrder(orderId);
  const transition = useTransition();

  if (!orderId) return null;

  const next = order ? NEXT_ACTION[order.status] : undefined;
  const idx = order ? LIFECYCLE.indexOf(order.status) : -1;

  function act(action: string, body?: unknown) {
    if (order) transition.mutate({ id: order.id, action, body });
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[rgba(17,24,39,0.55)] p-4" onClick={onClose}>
      <div
        className="flex max-h-[90vh] w-full max-w-3xl flex-col gap-5 overflow-auto rounded-2xl bg-surface p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal
      >
        {isLoading || !order ? (
          <Skeleton className="h-96" />
        ) : (
          <>
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-sm font-medium text-muted">
                  Order {order.id} · placed {order.placed}
                </span>
                <h2 className="mt-1 text-xl font-bold">
                  {order.product} for {order.recipient}
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="h-9 w-9 rounded-lg border border-card"
              >
                ✕
              </button>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <figure className="m-0 flex flex-col gap-2">
                <img
                  src={order.bouquet_photo ?? order.image}
                  alt=""
                  className="aspect-square w-full rounded-xl object-cover"
                />
                <figcaption className="text-xs text-muted">
                  {order.bouquet_photo ? 'Workshop photo uploaded' : 'No photo uploaded yet'}
                </figcaption>
                {order.status === 'awaiting' || order.status === 'new' ? (
                  <label className="btn btn-secondary h-9 cursor-pointer text-xs">
                    Upload workshop photo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={() => act('photo')}
                    />
                  </label>
                ) : null}
              </figure>

              <div className="flex flex-col gap-3 text-sm">
                <Detail label="Sender">
                  {order.sender} · {order.country}
                  <div className="text-xs text-muted">{order.email}</div>
                </Detail>
                <Detail label="Deliver to">
                  {order.recipient}
                  <div className="text-xs text-muted">{order.address}</div>
                </Detail>
                <Detail label="Slot">
                  <span className="tabular-nums">
                    {order.slot} · exact ±15 min · {order.rider}
                  </span>
                </Detail>
                <Detail label="Card message">
                  <span className="italic">“{order.card_message}”</span>
                </Detail>
                <div className="flex items-center justify-between border-t border-[#eef0f4] pt-3">
                  <span>Total paid</span>
                  <span className="font-bold tabular-nums">{formatMoney(order.total_cents)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Payment</span>
                  <span className="text-xs text-muted">
                    {order.status === 'new' ? 'Authorised (held)' : 'Captured'}
                  </span>
                </div>
              </div>
            </div>

            {/* Status timeline */}
            <div className="flex flex-wrap gap-1.5 text-xs">
              {LIFECYCLE.map((s, i) => (
                <span
                  key={s}
                  className={`flex-1 border-t-[3px] pt-2 font-medium ${
                    i <= idx ? 'border-primary text-primary' : 'border-card text-muted'
                  }`}
                >
                  {STATUS_LABEL[s]}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap justify-end gap-2.5">
              <button type="button" className="btn btn-secondary" onClick={() => window.print()}>
                Print card / note
              </button>
              {order.status !== 'refunded' && order.status !== 'new' ? (
                <button type="button" className="btn btn-secondary" onClick={() => act('refund')}>
                  Refund
                </button>
              ) : null}
              {order.status === 'new' ? (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => act('decline')}
                  disabled={transition.isPending}
                >
                  Decline
                </button>
              ) : null}
              {next ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={transition.isPending}
                  onClick={() => act(next.action, next.action === 'dispatch' ? { rider: order.rider } : undefined)}
                >
                  {next.label}
                </button>
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <span className="text-xs font-medium text-muted">{label}</span>
      <div className="font-medium">{children}</div>
    </div>
  );
}
