import { useEffect, useRef, useState } from 'react';
import { formatMoney } from '@/lib/status';
import { playChime, subscribeNewOrders } from '@/lib/realtime';
import type { DecoratedOrder } from '@/lib/api';

/**
 * Real-time inbox for incoming orders. New orders arrive over SSE (synthesized on
 * mocks), trigger a browser notification + chime, and offer Accept / Accept with
 * change / Decline. Mobile-friendly single column.
 */
export function NewOrdersInbox() {
  const [orders, setOrders] = useState<DecoratedOrder[]>([]);
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      void Notification.requestPermission();
    }
    const unsub = subscribeNewOrders((order) => {
      setOrders((cur) => (cur.some((o) => o.id === order.id) ? cur : [order, ...cur]));
      if (!mutedRef.current) {
        playChime();
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('New order', { body: `${order.id} · ${order.product} → ${order.recipient}` });
        }
      }
    });
    return unsub;
  }, []);

  function resolve(id: string) {
    setOrders((cur) => cur.filter((o) => o.id !== id));
  }

  function decline(id: string) {
    const reason = window.prompt('Decline reason (released to the customer):');
    if (reason !== null) resolve(id); // backend releases the Stripe hold
  }

  return (
    <section className="card p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <span className="font-semibold">New orders</span>
          <p className="text-sm text-muted">
            Live inbox · auto-accept off · {orders.length} waiting
          </p>
        </div>
        <button
          type="button"
          className="btn btn-secondary h-9 text-xs"
          aria-pressed={muted}
          onClick={() => setMuted((m) => !m)}
        >
          {muted ? 'Unmute' : 'Mute'} sound
        </button>
      </div>

      {orders.length === 0 ? (
        <p className="text-sm text-muted">Waiting for new orders… they appear here instantly.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {orders.map((o) => (
            <div key={o.id} className="flex gap-3 rounded-card border border-primary/30 bg-primary-100/40 p-3">
              <img src={o.thumb} alt="" className="h-16 w-16 rounded-lg object-cover" />
              <div className="flex flex-1 flex-col gap-2">
                <div className="text-sm leading-tight">
                  <strong className="font-semibold">{o.id}</strong> · {o.product}
                  <br />
                  <span className="text-xs text-muted">
                    {o.sender} ({o.country}) → {o.recipient}, {o.area}
                  </span>
                  <br />
                  <span className="text-xs tabular-nums text-muted">
                    {o.slot} · {formatMoney(o.total_cents)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button type="button" className="btn btn-primary h-9 flex-1 text-xs" onClick={() => resolve(o.id)}>
                    Accept
                  </button>
                  <button type="button" className="btn btn-secondary h-9 text-xs" onClick={() => resolve(o.id)}>
                    With change
                  </button>
                  <button type="button" className="btn btn-secondary h-9 text-xs" onClick={() => decline(o.id)}>
                    Decline
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
