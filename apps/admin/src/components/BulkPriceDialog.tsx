import { useState } from 'react';
import type { Tier } from '@rf/mocks';
import { useBulkPrice } from '@/lib/hooks';
import { formatMoney } from '@/lib/status';

const TIERS: Tier[] = ['STANDARD', 'PREMIUM', 'LUXURY'];

/** Bulk price edit (e.g. +10% on Luxury before Valentine's) with a preview before saving. */
export function BulkPriceDialog({ onClose }: { onClose: () => void }) {
  const [tier, setTier] = useState<Tier>('LUXURY');
  const [pct, setPct] = useState(10);
  const bulk = useBulkPrice();
  const preview = bulk.data?.preview;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[rgba(17,24,39,0.55)] p-4" onClick={onClose}>
      <div
        className="flex w-full max-w-lg flex-col gap-4 rounded-2xl bg-surface p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Bulk price edit</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="h-9 w-9 rounded-lg border border-card">
            ✕
          </button>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-sm font-medium">
            Tier
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value as Tier)}
              className="h-11 rounded-lg border border-card px-3"
            >
              {TIERS.map((ti) => (
                <option key={ti}>{ti}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Change %
            <input
              type="number"
              value={pct}
              onChange={(e) => setPct(Number(e.target.value))}
              className="h-11 w-24 rounded-lg border border-card px-3 tabular-nums"
            />
          </label>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => bulk.mutate({ tier, pct, apply: false })}
          >
            Preview
          </button>
        </div>

        {preview ? (
          <div className="max-h-64 overflow-auto rounded-lg border border-card">
            <table className="w-full text-sm">
              <thead className="bg-[#f9fafb] text-left text-xs uppercase text-muted">
                <tr>
                  <th className="px-3 py-2 font-semibold">Product</th>
                  <th className="px-3 py-2 text-right font-semibold">Now</th>
                  <th className="px-3 py-2 text-right font-semibold">New</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((r) => (
                  <tr key={r.slug} className="border-t border-[#eef0f4]">
                    <td className="px-3 py-2">{r.name}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-muted">{formatMoney(r.old_cents)}</td>
                    <td className="px-3 py-2 text-right font-semibold tabular-nums">{formatMoney(r.new_cents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        <div className="flex justify-end gap-2.5">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!preview || bulk.isPending}
            onClick={() => bulk.mutate({ tier, pct, apply: true }, { onSuccess: onClose })}
          >
            Apply to all
          </button>
        </div>
      </div>
    </div>
  );
}
