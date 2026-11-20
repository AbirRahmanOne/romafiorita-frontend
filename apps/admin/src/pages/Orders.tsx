import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Pill, Skeleton, EmptyState } from '@rf/ui';
import { useOrders } from '@/lib/hooks';
import { formatMoney, STATUS_LABEL, STATUS_TABS } from '@/lib/status';
import { NewOrdersInbox } from '@/components/NewOrdersInbox';
import { OrderDrawer } from '@/components/OrderDrawer';
import type { AdminStatus } from '@rf/mocks';

const TABS: (AdminStatus | 'all')[] = ['all', ...STATUS_TABS];

export function Orders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') ?? '';
  const [status, setStatus] = useState<AdminStatus | 'all'>('all');
  const [openId, setOpenId] = useState<string | null>(null);
  const { data, isLoading } = useOrders(status, q);

  return (
    <div className="flex flex-col gap-5">
      <NewOrdersInbox />

      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-card p-4">
          <span className="font-semibold">{data ? `${data.items.length} orders` : 'Orders'}</span>
          <div className="flex flex-wrap overflow-hidden rounded-lg border border-card">
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatus(tab)}
                className={`border-r border-card px-3.5 py-2 text-[13px] font-medium ${
                  status === tab ? 'bg-primary-100 text-[#1d4ed8]' : 'bg-surface text-[#374151]'
                }`}
              >
                {tab === 'all' ? 'All' : STATUS_LABEL[tab]}{' '}
                <span className="tabular-nums opacity-70">{data?.counts[tab] ?? 0}</span>
              </button>
            ))}
          </div>
        </div>

        {q ? (
          <div className="flex items-center gap-2 border-b border-card px-4 py-2 text-sm text-muted">
            Filtering by “{q}”
            <button
              type="button"
              className="text-primary underline"
              onClick={() => setSearchParams({})}
            >
              clear
            </button>
          </div>
        ) : null}

        {isLoading ? (
          <div className="p-4">
            <Skeleton className="h-64" />
          </div>
        ) : !data || data.items.length === 0 ? (
          <EmptyState title="No orders match." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse text-sm">
              <thead>
                <tr className="bg-[#f9fafb] text-left text-xs uppercase tracking-wider text-muted">
                  <th className="px-5 py-3 font-semibold">Order</th>
                  <th className="px-3 py-3 font-semibold">Sender</th>
                  <th className="px-3 py-3 font-semibold">Recipient</th>
                  <th className="px-3 py-3 font-semibold">Bouquet</th>
                  <th className="px-3 py-3 font-semibold">Slot</th>
                  <th className="px-3 py-3 text-right font-semibold">Total</th>
                  <th className="px-3 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {data.items.map((o) => (
                  <tr
                    key={o.id}
                    onClick={() => setOpenId(o.id)}
                    className="cursor-pointer border-t border-[#eef0f4] hover:bg-[#f5f8ff]"
                  >
                    <td className="px-5 py-3 tabular-nums">
                      <strong className="font-semibold">{o.id}</strong>
                      <div className="text-xs text-muted">{o.placed}</div>
                    </td>
                    <td className="px-3 py-3">
                      {o.sender}
                      <div className="text-xs text-muted">{o.country}</div>
                    </td>
                    <td className="px-3 py-3">
                      {o.recipient}
                      <div className="text-xs text-muted">{o.area}</div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="flex items-center gap-2.5">
                        <img src={o.thumb} alt="" className="h-9 w-9 rounded-lg object-cover" />
                        {o.product}
                      </span>
                    </td>
                    <td className="px-3 py-3 tabular-nums">
                      {o.slot}
                      <div className="text-xs text-muted">{o.rider}</div>
                    </td>
                    <td className="px-3 py-3 text-right font-semibold tabular-nums">
                      {formatMoney(o.total_cents)}
                    </td>
                    <td className="px-3 py-3">
                      <Pill status={o.status}>{STATUS_LABEL[o.status]}</Pill>
                    </td>
                    <td className="px-5 py-3 text-right text-primary">→</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <OrderDrawer orderId={openId} onClose={() => setOpenId(null)} />
    </div>
  );
}
