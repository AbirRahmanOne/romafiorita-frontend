import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { Pill, Skeleton } from '@rf/ui';
import { useDashboard, useTransition } from '@/lib/hooks';
import { formatMoney, STATUS_LABEL } from '@/lib/status';
import { KpiCard } from '@/components/KpiCard';
import { OrderDrawer } from '@/components/OrderDrawer';

export function Dashboard() {
  const { data, isLoading } = useDashboard();
  const transition = useTransition();
  const navigate = useNavigate();
  const [openId, setOpenId] = useState<string | null>(null);

  if (isLoading || !data) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    );
  }

  const { kpis, google, revenue_series, schedule, pending_photos } = data;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Revenue today" value={formatMoney(kpis.revenue_today_cents)} delta="▲ 12% vs last Saturday" tone="good" />
        <KpiCard label="Orders today" value={String(kpis.orders_today)} delta="31 from abroad · 14 countries" />
        <KpiCard label="On-time (±15 min)" value={`${kpis.on_time_pct}%`} delta="2 late this month · fees refunded" />
        <KpiCard
          label="Photos to send"
          value={String(kpis.photos_to_send)}
          delta={kpis.photos_to_send ? 'Action needed' : 'All clear'}
          tone={kpis.photos_to_send ? 'warn' : 'good'}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="card p-5">
            <div className="mb-3 flex items-baseline justify-between">
              <span className="text-sm font-medium text-muted">Revenue · last 14 days</span>
              <span className="text-xs text-muted">Hover a bar</span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revenue_series}>
                <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={11} stroke="#9ca3af" />
                <Tooltip
                  cursor={{ fill: '#eaf1fe' }}
                  formatter={(v: number) => [formatMoney(v), 'Revenue']}
                  labelFormatter={(d) => `${d} Oct`}
                />
                <Bar dataKey="revenue_cents" fill="#bfd3fb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <button
            type="button"
            onClick={() => navigate('/insights')}
            className="card flex items-center justify-between gap-3 p-4 text-left hover:bg-bg"
          >
            <span className="text-sm">
              <strong className="font-semibold">Google this week:</strong> {google.clicks.toLocaleString()} clicks{' '}
              <span className="font-semibold text-[#16a34a]">▲ {google.delta_pct}%</span> ·{' '}
              {google.orders_from_search} orders from search
            </span>
            <span className="whitespace-nowrap font-semibold text-primary">View insights →</span>
          </button>
        </div>

        <div className="card flex flex-col gap-2 p-5">
          <div className="flex items-baseline justify-between">
            <span className="font-semibold">Today's delivery slots</span>
            <span className="text-xs text-muted">{kpis.on_time_pct}% on time</span>
          </div>
          <div className="flex flex-col">
            {schedule.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setOpenId(o.id)}
                className="grid grid-cols-[58px_1fr_auto] items-center gap-3 border-b border-[#eef0f4] py-2.5 text-left hover:bg-bg"
              >
                <span className="font-bold tabular-nums text-primary">{o.slot}</span>
                <span className="flex flex-col text-sm leading-tight">
                  <span className="font-medium">
                    {o.product} → {o.recipient}
                  </span>
                  <span className="text-xs text-muted">
                    {o.area} · {o.rider}
                  </span>
                </span>
                <Pill status={o.status}>{STATUS_LABEL[o.status]}</Pill>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card flex flex-col gap-4 p-5">
        <div>
          <span className="font-semibold">Bouquet photos waiting to be sent</span>
          <p className="text-sm text-muted">Senders receive these on WhatsApp &amp; email before delivery.</p>
        </div>
        {pending_photos.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {pending_photos.map((o) => (
              <div key={o.id} className="flex flex-col overflow-hidden rounded-card border border-card">
                <img src={o.image} alt={o.product} className="aspect-[4/3] w-full object-cover" />
                <div className="flex flex-col gap-2.5 p-3">
                  <span className="text-sm leading-tight">
                    <strong className="font-semibold">{o.id}</strong> · {o.product}
                    <br />
                    <span className="text-xs text-muted">
                      for {o.recipient} · slot {o.slot}
                    </span>
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="btn btn-primary h-9 flex-1 text-xs"
                      onClick={() => transition.mutate({ id: o.id, action: 'send-photo' })}
                    >
                      Send photo
                    </button>
                    <button type="button" className="btn btn-secondary h-9 text-xs" onClick={() => setOpenId(o.id)}>
                      Open
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">All photos sent. Nicely done.</p>
        )}
      </div>

      <OrderDrawer orderId={openId} onClose={() => setOpenId(null)} />
    </div>
  );
}
