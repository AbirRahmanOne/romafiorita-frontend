import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pill, Skeleton, EmptyState, Input, type PillStatus } from '@rf/ui';
import { usePayments, usePayouts, useDisputes, usePaymentAction, useRefundPayment } from '@/lib/hooks';
import { adminApi } from '@/lib/api';
import { formatMoney } from '@/lib/status';
import { canSeeMoney } from '@/lib/role';
import { KpiCard } from '@/components/KpiCard';
import type { Payment, PaymentStatus } from '@rf/mocks';

const PILL: Record<PaymentStatus, PillStatus> = {
  held: 'awaiting',
  captured: 'delivered',
  failed: 'declined',
  refunded: 'refunded',
  disputed: 'declined',
};
const METHOD: Record<string, string> = {
  card: 'Card',
  apple_pay: 'Apple Pay',
  google_pay: 'Google Pay',
  paypal: 'PayPal',
  klarna: 'Klarna',
};
const SOURCES = ['all', 'website', 'phone', 'custom'];
const STATUSES = ['all', 'held', 'captured', 'refunded', 'disputed'];

function daysLeft(iso: string) {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 864e5));
}

function download(filename: string, text: string, type: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = filename;
  a.click();
}

function exportCsv(items: Payment[]) {
  const header = 'date,order,source,customer,country,method,amount,fee,net,status';
  const rows = items.map((p) =>
    [p.date, p.order_number, p.source, p.customer, p.country, p.method, p.amount_cents / 100, p.fee_cents / 100, p.net_cents / 100, p.status].join(','),
  );
  download('payments.csv', [header, ...rows].join('\n'), 'text/csv');
}

/** Full/partial refund with a reason (OWNER/MANAGER only — gated by canSeeMoney). */
function RefundDialog({ payment, onClose }: { payment: Payment; onClose: () => void }) {
  const refund = useRefundPayment();
  const [euros, setEuros] = useState((payment.amount_cents / 100).toFixed(2));
  const [reason, setReason] = useState('');
  const amount = Math.round(Number(euros) * 100);
  const valid = amount > 0 && amount <= payment.amount_cents;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(17,24,39,0.55)]" onClick={onClose}>
      <div
        className="flex w-full max-w-md flex-col gap-4 rounded-xl bg-surface p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Refund {payment.order_number}</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="h-9 w-9 rounded-lg border border-card">
            ✕
          </button>
        </div>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Amount (EUR) · max {formatMoney(payment.amount_cents)}
          <Input type="number" min="0" step="0.01" value={euros} onChange={(e) => setEuros(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Reason
          <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. customer request" />
        </label>
        <button
          type="button"
          className="btn btn-primary self-end disabled:opacity-50"
          disabled={!valid || refund.isPending}
          onClick={() => refund.mutate({ id: payment.id, amount_cents: amount, reason }, { onSuccess: onClose })}
        >
          {amount < payment.amount_cents ? 'Partial refund' : 'Full refund'}
        </button>
      </div>
    </div>
  );
}

export function Payments() {
  const [source, setSource] = useState('all');
  const [status, setStatus] = useState('all');
  const [q, setQ] = useState('');
  const [refunding, setRefunding] = useState<Payment | null>(null);
  const { data, isLoading } = usePayments(source, status);
  const payouts = usePayouts();
  const disputes = useDisputes();
  const action = usePaymentAction();

  if (!canSeeMoney()) return <EmptyState title="You don't have access to payments." />;
  if (isLoading || !data) return <Skeleton className="h-96" />;

  const held = data.items.filter((p) => p.status === 'held');
  const needle = q.trim().toLowerCase();
  const rows = needle
    ? data.items.filter(
        (p) =>
          p.order_number.toLowerCase().includes(needle) || p.customer.toLowerCase().includes(needle),
      )
    : data.items;

  async function downloadReport() {
    const report = await adminApi.monthlyReport();
    download(report.filename, report.csv, 'text/csv');
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Gross sales" value={formatMoney(data.kpis.gross_cents)} delta="Selected range" />
        <KpiCard label="Stripe fees" value={formatMoney(data.kpis.fees_cents)} delta="Deducted" />
        <KpiCard label="Refunds" value={formatMoney(data.kpis.refunds_cents)} delta="This range" tone="warn" />
        <KpiCard label="Net" value={formatMoney(data.kpis.net_cents)} delta="After fees" tone="good" />
      </div>

      {held.length ? (
        <div className="card p-5">
          <h2 className="mb-3 font-semibold">Held payments · authorised, not yet captured</h2>
          <div className="flex flex-col gap-2">
            {held.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eef0f4] py-2 text-sm">
                <span>
                  <strong>{p.order_number}</strong> · {p.customer} · {METHOD[p.method]}
                </span>
                <span className="tabular-nums text-muted">
                  {formatMoney(p.amount_cents)} · hold expires in {daysLeft(p.hold_expires_at ?? '')} days
                </span>
                <span className="flex gap-2">
                  <button type="button" className="btn btn-primary h-9 text-xs" onClick={() => action.mutate({ id: p.id, action: 'capture' })}>
                    Capture
                  </button>
                  <button type="button" className="btn btn-secondary h-9 text-xs" onClick={() => action.mutate({ id: p.id, action: 'cancel-hold' })}>
                    Cancel hold
                  </button>
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-card p-4">
          <span className="font-semibold">Payments</span>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search order or customer"
              className="h-10 w-56"
            />
            <select value={source} onChange={(e) => setSource(e.target.value)} className="h-10 rounded-lg border border-card px-2 text-sm">
              {SOURCES.map((s) => (
                <option key={s} value={s}>
                  {s === 'all' ? 'All sources' : s}
                </option>
              ))}
            </select>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 rounded-lg border border-card px-2 text-sm">
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s === 'all' ? 'All statuses' : s}
                </option>
              ))}
            </select>
            <button type="button" className="btn btn-secondary h-10 text-xs" onClick={() => exportCsv(rows)}>
              Export CSV
            </button>
            <button type="button" className="btn btn-secondary h-10 text-xs" onClick={downloadReport}>
              Monthly report
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] border-collapse text-sm">
            <thead>
              <tr className="bg-[#f9fafb] text-left text-xs uppercase tracking-wider text-muted">
                <th className="px-5 py-3 font-semibold">Date</th>
                <th className="px-3 py-3 font-semibold">Order</th>
                <th className="px-3 py-3 font-semibold">Source</th>
                <th className="px-3 py-3 font-semibold">Customer</th>
                <th className="px-3 py-3 font-semibold">Method</th>
                <th className="px-3 py-3 text-right font-semibold">Amount</th>
                <th className="px-3 py-3 text-right font-semibold">Net</th>
                <th className="px-3 py-3 font-semibold">Status</th>
                <th className="px-3 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="border-t border-[#eef0f4]">
                  <td className="px-5 py-3 tabular-nums">{p.date}</td>
                  <td className="px-3 py-3 tabular-nums">
                    <Link to={`/orders?q=${encodeURIComponent(p.order_number)}`} className="text-primary hover:underline">
                      {p.order_number}
                    </Link>
                  </td>
                  <td className="px-3 py-3 capitalize">{p.source}</td>
                  <td className="px-3 py-3">
                    {p.customer}
                    <div className="text-xs text-muted">{p.country}</div>
                  </td>
                  <td className="px-3 py-3">{METHOD[p.method]}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{formatMoney(p.amount_cents)}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{formatMoney(p.net_cents)}</td>
                  <td className="px-3 py-3">
                    <Pill status={PILL[p.status]}>{p.status}</Pill>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex justify-end gap-3 text-xs">
                      {p.status === 'captured' ? (
                        <button type="button" className="text-primary hover:underline" onClick={() => setRefunding(p)}>
                          Refund
                        </button>
                      ) : null}
                      <a
                        href={`https://dashboard.stripe.com/payments/${p.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-muted hover:underline"
                      >
                        Open in Stripe
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="mb-3 font-semibold">Payouts &amp; balance</h2>
          {payouts.data ? (
            <>
              <div className="mb-3 flex gap-6 text-sm">
                <span>
                  Available
                  <div className="text-lg font-bold tabular-nums">{formatMoney(payouts.data.balance.available_cents)}</div>
                </span>
                <span>
                  Pending
                  <div className="text-lg font-bold tabular-nums text-muted">{formatMoney(payouts.data.balance.pending_cents)}</div>
                </span>
              </div>
              {payouts.data.items.map((po) => (
                <div key={po.id} className="flex justify-between border-b border-[#eef0f4] py-2 text-sm">
                  <span>{po.date}</span>
                  <span className="tabular-nums">{formatMoney(po.amount_cents)}</span>
                  <Pill status={po.status === 'paid' ? 'delivered' : 'awaiting'}>{po.status}</Pill>
                </div>
              ))}
            </>
          ) : (
            <Skeleton className="h-24" />
          )}
        </div>

        <div className="card p-5">
          <h2 className="mb-3 font-semibold">Disputes</h2>
          {disputes.data?.items.length ? (
            disputes.data.items.map((d) => (
              <div key={d.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-[#eef0f4] py-2 text-sm">
                <span>
                  <strong>{d.order_number}</strong> · {d.reason.replace(/_/g, ' ')}
                </span>
                <span className="tabular-nums text-[#b45309]">Respond in {daysLeft(d.deadline)} days</span>
                <span className="tabular-nums">{formatMoney(d.amount_cents)}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted">No open disputes.</p>
          )}
        </div>
      </div>

      {refunding ? <RefundDialog payment={refunding} onClose={() => setRefunding(null)} /> : null}
    </div>
  );
}
