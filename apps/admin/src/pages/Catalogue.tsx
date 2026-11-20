import { useState } from 'react';
import { Pill, Skeleton } from '@rf/ui';
import { useProducts, usePatchProduct } from '@/lib/hooks';
import { formatMoney } from '@/lib/status';
import { BulkPriceDialog } from '@/components/BulkPriceDialog';
import { ProductForm } from '@/components/ProductForm';
import type { ProductRow } from '@/lib/api';

export function Catalogue() {
  const { data, isLoading } = useProducts();
  const patch = usePatchProduct();
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [bulk, setBulk] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap justify-end gap-2.5">
        <button type="button" className="btn btn-secondary" onClick={() => setBulk(true)}>
          Bulk price edit
        </button>
      </div>

      {isLoading || !data ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-72" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.items.map((p) => {
            const [low, high] = p.price_range_cents;
            const lowStock = p.stock < 25;
            return (
              <div
                key={p.slug}
                className={`card flex flex-col overflow-hidden ${p.active ? '' : 'opacity-60'}`}
              >
                <img src={p.image} alt={p.name} className="aspect-[4/3] w-full object-cover" />
                <div className="flex flex-col gap-3 p-4">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-semibold">{p.name}</span>
                    <span className="font-bold tabular-nums text-primary">
                      {low === high ? formatMoney(low) : `${formatMoney(low)} – ${formatMoney(high)}`}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted">
                    <span>
                      Sold this week
                      <br />
                      <span className="text-base font-semibold text-text tabular-nums">{p.sold_this_week}</span>
                    </span>
                    <span>
                      Stems in cold room
                      <br />
                      <span
                        className={`text-base font-semibold tabular-nums ${lowStock ? 'text-[#b45309]' : 'text-text'}`}
                      >
                        {p.stock}
                      </span>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 text-xs">
                    {p.variants.map((v) => (
                      <Pill key={v.tier} status={v.active ? 'photo-sent' : 'neutral'}>
                        {v.tier[0]! + v.tier.slice(1).toLowerCase()}
                      </Pill>
                    ))}
                  </div>
                  <div className="flex items-center justify-between border-t border-[#eef0f4] pt-3">
                    <Pill status={!p.active ? 'neutral' : lowStock ? 'awaiting' : 'delivered'}>
                      {!p.active ? 'Hidden' : lowStock ? 'Low stock' : 'Live'}
                    </Pill>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="text-sm font-semibold text-primary"
                        onClick={() => patch.mutate({ slug: p.slug, patch: { active: !p.active } })}
                      >
                        {p.active ? 'Hide' : 'Publish'}
                      </button>
                      <button
                        type="button"
                        className="text-sm font-semibold text-primary"
                        onClick={() => setEditing(p)}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {bulk ? <BulkPriceDialog onClose={() => setBulk(false)} /> : null}
      {editing ? <ProductForm product={editing} onClose={() => setEditing(null)} /> : null}
    </div>
  );
}
