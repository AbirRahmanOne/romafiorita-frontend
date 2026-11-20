import { useState } from 'react';
import type { Tier, Variant } from '@rf/mocks';
import { adminApi, type ProductRow } from '@/lib/api';
import { usePatchProduct } from '@/lib/hooks';

const TIER_ORDER: Tier[] = ['STANDARD', 'PREMIUM', 'LUXURY'];

/** Create/edit form with the fixed 3-tier section (Standard/Premium/Luxury). */
export function ProductForm({ product, onClose }: { product: ProductRow; onClose: () => void }) {
  const patch = usePatchProduct();
  const [name, setName] = useState(product.name);
  const [occasion, setOccasion] = useState(product.occasion);
  const [sameDay, setSameDay] = useState(product.same_day);
  const [exactTime, setExactTime] = useState(product.exact_time);
  const [seoTitle, setSeoTitle] = useState(product.seo_title);
  const [seoDesc, setSeoDesc] = useState(product.seo_description);
  const [variants, setVariants] = useState<Variant[]>(
    TIER_ORDER.map(
      (tier) =>
        product.variants.find((v) => v.tier === tier) ?? {
          id: `${product.slug}-${tier.toLowerCase()}`,
          tier,
          price_cents: 0,
          description_it: '',
          description_en: '',
          images: [],
          active: false,
          is_default: tier === 'PREMIUM',
          same_day: true,
          exact_time: true,
        },
    ),
  );

  function update(tier: Tier, patchV: Partial<Variant>) {
    setVariants((cur) => cur.map((v) => (v.tier === tier ? { ...v, ...patchV } : v)));
  }
  function setDefault(tier: Tier) {
    setVariants((cur) => cur.map((v) => ({ ...v, is_default: v.tier === tier })));
  }
  async function uploadImage(tier: Tier) {
    const { public_url } = await adminApi.signUpload();
    update(tier, { images: [public_url] });
  }

  const activeVariants = variants.filter((v) => v.active);
  const hasActive = activeVariants.length > 0;
  const activePrices = activeVariants.map((v) => v.price_cents);
  const ascending = activePrices.every((p, i) => i === 0 || p >= activePrices[i - 1]!);

  function save() {
    patch.mutate(
      {
        slug: product.slug,
        patch: {
          name,
          occasion,
          same_day: sameDay,
          exact_time: exactTime,
          seo_title: seoTitle,
          seo_description: seoDesc,
          variants,
        },
      },
      { onSuccess: onClose },
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[rgba(17,24,39,0.55)]" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-2xl flex-col gap-5 overflow-auto bg-surface p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Edit {product.name}</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="h-9 w-9 rounded-lg border border-card">
            ✕
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Name" value={name} onChange={setName} />
          <Field label="Occasion tag" value={occasion} onChange={setOccasion} />
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={sameDay} onChange={(e) => setSameDay(e.target.checked)} /> Same-day
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={exactTime} onChange={(e) => setExactTime(e.target.checked)} /> Exact time
          </label>
        </div>

        <fieldset className="flex flex-col gap-3">
          <legend className="font-semibold">Tiers</legend>
          {!hasActive ? <p className="text-sm text-[#b45309]">At least one tier must be active.</p> : null}
          {!ascending ? (
            <p className="text-sm text-[#b45309]">
              Tier prices should ascend Standard &lt; Premium &lt; Luxury.
            </p>
          ) : null}
          {variants.map((v) => (
            <div key={v.tier} className="rounded-card border border-card p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-semibold">{v.tier}</span>
                <div className="flex items-center gap-3 text-sm">
                  <label className="flex items-center gap-1.5">
                    <input
                      type="radio"
                      name="default-tier"
                      checked={v.is_default}
                      onChange={() => setDefault(v.tier)}
                    />
                    Default
                  </label>
                  <label className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={v.active}
                      onChange={(e) => update(v.tier, { active: e.target.checked })}
                    />
                    Active
                  </label>
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm font-medium">
                  Price (€)
                  <input
                    type="number"
                    value={v.price_cents / 100}
                    onChange={(e) => update(v.tier, { price_cents: Math.round(Number(e.target.value) * 100) })}
                    className="h-11 rounded-lg border border-card px-3 tabular-nums"
                  />
                </label>
                <button type="button" className="btn btn-secondary mt-6 h-11" onClick={() => void uploadImage(v.tier)}>
                  {v.images[0] ? 'Replace image' : 'Upload image'}
                </button>
                <Field label="Description (EN)" value={v.description_en} onChange={(x) => update(v.tier, { description_en: x })} />
                <Field label="Descrizione (IT)" value={v.description_it} onChange={(x) => update(v.tier, { description_it: x })} />
              </div>
            </div>
          ))}
        </fieldset>

        <fieldset className="grid gap-3">
          <legend className="font-semibold">SEO</legend>
          <Field label="SEO title" value={seoTitle} onChange={setSeoTitle} />
          <Field label="SEO description" value={seoDesc} onChange={setSeoDesc} />
        </fieldset>

        <div className="mt-auto flex justify-end gap-2.5 border-t border-card pt-4">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" disabled={!hasActive || patch.isPending} onClick={save}>
            Save product
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium">
      {label}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 rounded-lg border border-card px-3"
      />
    </label>
  );
}
