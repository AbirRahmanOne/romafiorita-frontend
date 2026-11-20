import { useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Skeleton } from '@rf/ui';
import { useInsights } from '@/lib/hooks';
import { KpiCard } from '@/components/KpiCard';

const TABS = ['SEO', 'Sales', 'Marketing'] as const;
const RANGES = ['7 days', '28 days', '90 days'];

/** Tiny sparkline path from a position + recent change. */
function sparkPath(pos: number, change: number) {
  const pts = Array.from({ length: 12 }, (_, i) => pos + change * (1 - i / 11) + (((i * 29) % 7) - 3) * 0.15);
  const min = Math.min(...pts);
  const max = Math.max(...pts);
  return pts
    .map((v, i) => `${i ? 'L' : 'M'}${((i / 11) * 100).toFixed(1)} ${(3 + ((v - min) / (max - min || 1)) * 22).toFixed(1)}`)
    .join(' ');
}

export function Insights() {
  const [tab, setTab] = useState<(typeof TABS)[number]>('SEO');
  const [range, setRange] = useState('28 days');
  const { data, isLoading } = useInsights();

  const chartData = data
    ? data.clicks.map((c, i) => ({ day: i + 1, clicks: c, impressions: data.impressions[i] }))
    : [];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 border-b border-card">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold ${
                tab === t ? 'border-primary text-primary' : 'border-transparent text-muted'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex overflow-hidden rounded-lg border border-card">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`border-r border-card px-3.5 py-2 text-xs font-medium ${
                range === r ? 'bg-primary-100 text-[#1d4ed8]' : 'bg-surface text-[#374151]'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {tab !== 'SEO' ? (
        <div className="card p-12 text-center text-sm text-muted">{tab} insights are not connected yet.</div>
      ) : isLoading || !data ? (
        <Skeleton className="h-96" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {data.kpis.map((k) => (
              <KpiCard key={k.label} label={k.label} value={k.value} delta={k.delta} tone="good" />
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
            <div className="card p-5">
              <span className="font-semibold">Search performance</span>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={chartData} margin={{ top: 16, right: 8, left: -8, bottom: 0 }}>
                  <CartesianGrid stroke="#eef0f4" vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={11} stroke="#9ca3af" />
                  <YAxis yAxisId="l" tickLine={false} axisLine={false} fontSize={11} stroke="#9ca3af" width={32} />
                  <YAxis yAxisId="r" orientation="right" tickLine={false} axisLine={false} fontSize={11} stroke="#9ca3af" width={40} />
                  <Tooltip />
                  <Line yAxisId="l" type="monotone" dataKey="clicks" stroke="#2563eb" strokeWidth={2.5} dot={false} />
                  <Line yAxisId="r" type="monotone" dataKey="impressions" stroke="#a9c6fb" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="card flex flex-col gap-2 p-5">
              <span className="font-semibold">Site health</span>
              <Row label="Indexed pages" value={`${data.health.indexed} / ${data.health.total}`} good />
              <Row label="Crawl errors" value={String(data.health.crawl_errors)} warn />
              {data.health.vitals.map((v) => (
                <Row key={v.k} label={`${v.k} ${v.v}`} value={v.ok ? 'Good' : 'Needs work'} good={v.ok} warn={!v.ok} />
              ))}
              <Row label="Sitemap" value={data.health.sitemap} good />
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="card overflow-hidden">
              <div className="border-b border-card p-4 font-semibold">Top search queries</div>
              <table className="w-full text-sm">
                <thead className="bg-[#f9fafb] text-left text-xs uppercase text-muted">
                  <tr>
                    <th className="px-4 py-2 font-semibold">Query</th>
                    <th className="px-3 py-2 text-right font-semibold">Clicks</th>
                    <th className="px-3 py-2 text-right font-semibold">CTR</th>
                    <th className="px-4 py-2 text-right font-semibold">Pos.</th>
                  </tr>
                </thead>
                <tbody>
                  {data.queries.map((q) => (
                    <tr key={q.q} className="border-t border-[#eef0f4]">
                      <td className="px-4 py-2 font-medium">{q.q}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{q.c}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{q.ctr}</td>
                      <td className="px-4 py-2 text-right tabular-nums">{q.p}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card overflow-hidden">
              <div className="border-b border-card p-4 font-semibold">Top landing pages</div>
              <table className="w-full text-sm">
                <thead className="bg-[#f9fafb] text-left text-xs uppercase text-muted">
                  <tr>
                    <th className="px-4 py-2 font-semibold">Page</th>
                    <th className="px-3 py-2 text-right font-semibold">Visitors</th>
                    <th className="px-3 py-2 text-right font-semibold">Orders</th>
                    <th className="px-4 py-2 text-right font-semibold">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {data.landing.map((l) => (
                    <tr key={l.p} className="border-t border-[#eef0f4]">
                      <td className="px-4 py-2 text-[#1d4ed8]">
                        {l.p} <span className="text-muted">{l.note}</span>
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">{l.v}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{l.o}</td>
                      <td className="px-4 py-2 text-right tabular-nums">{l.r}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-card p-4">
              <span className="font-semibold">Tracked keywords</span>
              <button type="button" className="btn btn-primary h-9 text-xs">
                + Add keyword
              </button>
            </div>
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-[#f9fafb] text-left text-xs uppercase text-muted">
                <tr>
                  <th className="px-4 py-2 font-semibold">Keyword</th>
                  <th className="px-3 py-2 font-semibold">Lang</th>
                  <th className="px-3 py-2 text-right font-semibold">Position</th>
                  <th className="px-3 py-2 text-right font-semibold">Change</th>
                  <th className="px-3 py-2 font-semibold">28-day</th>
                </tr>
              </thead>
              <tbody>
                {data.keywords.map((k) => {
                  const up = k.change > 0;
                  const color = up ? '#16a34a' : '#dc2626';
                  return (
                    <tr key={k.kw} className="border-t border-[#eef0f4]">
                      <td className="px-4 py-2 font-medium">{k.kw}</td>
                      <td className="px-3 py-2">{k.lang}</td>
                      <td className="px-3 py-2 text-right font-bold tabular-nums">{k.pos.toFixed(1)}</td>
                      <td className="px-3 py-2 text-right font-semibold tabular-nums" style={{ color }}>
                        {up ? '▲' : '▼'} {Math.abs(k.change).toFixed(1)}
                      </td>
                      <td className="px-3 py-2">
                        <svg width="110" height="28" viewBox="0 0 100 28" preserveAspectRatio="none">
                          <path d={sparkPath(k.pos, k.change)} fill="none" stroke={color} strokeWidth="1.6" />
                        </svg>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function Row({ label, value, good, warn }: { label: string; value: string; good?: boolean; warn?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-[#eef0f4] py-2 text-sm">
      <span className="text-[#374151]">{label}</span>
      <span className={`font-semibold ${warn ? 'text-[#b45309]' : good ? 'text-[#16a34a]' : ''}`}>{value}</span>
    </div>
  );
}
