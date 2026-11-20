import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useCreatePaymentRequest, useProducts, useUpdatePaymentRequest } from '@/lib/hooks';
import { adminApi } from '@/lib/api';
import { formatMoney } from '@/lib/status';
import type { PaymentRequest, Tier } from '@rf/mocks';

const STOREFRONT = import.meta.env.VITE_STOREFRONT_URL ?? 'http://localhost:3000';
const tierLabel = (t: Tier) => t[0]! + t.slice(1).toLowerCase();
const DELIVERY_TYPES = ['standard', 'window', 'exact', 'courier'] as const;

interface Item {
  title: string;
  price_euros: number;
}

/** New / edit custom order → secure payment request, with sharing (WhatsApp, email, QR, PDF). */
export function PaymentRequestForm({
  onClose,
  editing,
}: {
  onClose: () => void;
  editing?: PaymentRequest;
}) {
  const create = useCreatePaymentRequest();
  const update = useUpdatePaymentRequest();
  const products = useProducts();

  const [items, setItems] = useState<Item[]>(
    editing
      ? editing.items.map((it) => ({ title: it.title, price_euros: it.price_cents / 100 }))
      : [{ title: '', price_euros: 0 }],
  );
  const [customer, setCustomer] = useState({
    name: editing?.customer ?? '',
    email: editing?.email ?? '',
    whatsapp: editing?.whatsapp ?? '',
    language: 'en',
  });
  const [recipient, setRecipient] = useState(editing?.recipient ?? '');
  const [postcode, setPostcode] = useState('');
  const [date, setDate] = useState('');
  const [deliveryType, setDeliveryType] = useState<(typeof DELIVERY_TYPES)[number]>('standard');
  const [time, setTime] = useState('');
  const [message, setMessage] = useState(editing?.card_message ?? '');
  const [discount, setDiscount] = useState((editing?.discount_cents ?? 0) / 100);
  const [hideSender, setHideSender] = useState(editing?.hide_sender ?? false);
  const [expiry, setExpiry] = useState(48);
  const [created, setCreated] = useState<PaymentRequest | null>(null);

  // Catalogue picker
  const [pickSlug, setPickSlug] = useState('');
  const [pickTier, setPickTier] = useState<Tier>('PREMIUM');
  const picked = products.data?.items.find((p) => p.slug === pickSlug);

  const itemsCents = items.reduce((a, it) => a + Math.round(it.price_euros * 100), 0);
  const discountCents = Math.round(discount * 100);
  const total = Math.max(0, itemsCents - discountCents);

  const postcodeValid = /^\d{5}$/.test(postcode.trim());
  const zone = postcodeValid
    ? /^001\d{2}$/.test(postcode.trim())
      ? 'Rome · same-day'
      : 'National · courier'
    : '';

  function addFromCatalogue() {
    if (!picked) return;
    const variant = picked.variants.find((v) => v.tier === pickTier);
    if (!variant) return;
    setItems((cur) => [
      ...cur.filter((it) => it.title || it.price_euros),
      { title: `${picked.name} · ${tierLabel(pickTier)}`, price_euros: variant.price_cents / 100 },
    ]);
  }

  function submit() {
    const deliverySlot = [date, deliveryType, time].filter(Boolean).join(' · ');
    const body = {
      customer: customer.name,
      email: customer.email,
      whatsapp: customer.whatsapp,
      recipient: [recipient, postcode].filter(Boolean).join(' · '),
      delivery_slot: deliverySlot,
      card_message: message,
      items: items
        .filter((it) => it.title && it.price_euros > 0)
        .map((it) => ({ title: it.title, price_cents: Math.round(it.price_euros * 100) })),
      expiry_hours: expiry,
      discount_cents: discountCents,
      hide_sender: hideSender,
    };
    if (editing) update.mutate({ id: editing.id, body }, { onSuccess: setCreated });
    else create.mutate(body, { onSuccess: setCreated });
  }

  async function downloadPdf() {
    if (!created) return;
    const blob = await adminApi.paymentRequestPdf(created.id);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${created.order_number}.pdf`;
    a.click();
  }

  const payUrl = created ? `${STOREFRONT}/${customer.language}/pay/${created.token}` : '';
  const waText = created
    ? `Hi ${customer.name}, here is your Roma Fiorita order ${created.order_number} (${formatMoney(created.amount_cents)}). Pay securely here: ${payUrl} — the link is valid for ${expiry} hours.`
    : '';
  const pending = create.isPending || update.isPending;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[rgba(17,24,39,0.55)]" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-2xl flex-col gap-5 overflow-auto bg-surface p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">
            {created
              ? 'Payment request ready'
              : editing
                ? 'Edit payment request'
                : 'New custom order'}
          </h2>
          <button type="button" aria-label="Close" onClick={onClose} className="h-9 w-9 rounded-lg border border-card">
            ✕
          </button>
        </div>

        {created ? (
          <div className="flex flex-col gap-4">
            <div className="card p-4 text-sm">
              <div className="font-semibold">{created.order_number}</div>
              <div className="text-muted">
                {customer.name} · {formatMoney(created.amount_cents)} · expires in {expiry}h
              </div>
              <div className="mt-2 break-all rounded-lg bg-bg p-2 text-xs">{payUrl}</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-white p-2">
                <QRCodeSVG value={payUrl} size={120} />
              </div>
              <p className="text-xs text-muted">Scan to open the secure pay page, or share the link.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                className="btn btn-primary"
                href={`https://wa.me/${customer.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(waText)}`}
                target="_blank"
                rel="noreferrer"
              >
                Send via WhatsApp
              </a>
              <a
                className="btn btn-secondary"
                href={`mailto:${customer.email}?subject=${encodeURIComponent(`Roma Fiorita order ${created.order_number}`)}&body=${encodeURIComponent(waText)}`}
              >
                Send by email
              </a>
              <button type="button" className="btn btn-secondary" onClick={() => void navigator.clipboard?.writeText(payUrl)}>
                Copy link
              </button>
              <button type="button" className="btn btn-secondary" onClick={downloadPdf}>
                Download PDF
              </button>
            </div>
            <p className="text-xs text-muted">
              PDF title is “Order summary / Payment request” (not “Invoice” — no VAT number yet); configurable later.
            </p>
            <button type="button" className="btn btn-primary self-end" onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <fieldset className="flex flex-col gap-2">
              <legend className="font-semibold">Items</legend>

              <div className="flex flex-wrap items-end gap-2 rounded-lg bg-bg p-2">
                <select
                  value={pickSlug}
                  onChange={(e) => setPickSlug(e.target.value)}
                  className="h-10 flex-1 rounded-lg border border-card px-2 text-sm"
                >
                  <option value="">Add from catalogue…</option>
                  {products.data?.items.map((p) => (
                    <option key={p.slug} value={p.slug}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <select
                  value={pickTier}
                  onChange={(e) => setPickTier(e.target.value as Tier)}
                  className="h-10 rounded-lg border border-card px-2 text-sm"
                >
                  {(['STANDARD', 'PREMIUM', 'LUXURY'] as Tier[]).map((t) => (
                    <option key={t} value={t}>
                      {tierLabel(t)}
                    </option>
                  ))}
                </select>
                <button type="button" className="btn btn-secondary h-10 text-xs" disabled={!picked} onClick={addFromCatalogue}>
                  Add
                </button>
              </div>

              {items.map((it, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={it.title}
                    placeholder="Custom item (e.g. Bridal bouquet)"
                    onChange={(e) =>
                      setItems((cur) => cur.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))
                    }
                    className="h-11 flex-1 rounded-lg border border-card px-3 text-sm"
                  />
                  <input
                    type="number"
                    value={it.price_euros}
                    onChange={(e) =>
                      setItems((cur) => cur.map((x, j) => (j === i ? { ...x, price_euros: Number(e.target.value) } : x)))
                    }
                    className="h-11 w-28 rounded-lg border border-card px-3 text-sm tabular-nums"
                  />
                </div>
              ))}
              <button
                type="button"
                className="self-start text-sm font-semibold text-primary"
                onClick={() => setItems((cur) => [...cur, { title: '', price_euros: 0 }])}
              >
                + Add item
              </button>
            </fieldset>

            <fieldset className="grid gap-3 sm:grid-cols-2">
              <legend className="font-semibold">Recipient &amp; delivery</legend>
              <Field label="Recipient (name · area)" value={recipient} onChange={setRecipient} />
              <label className="flex flex-col gap-1 text-sm font-medium">
                Postcode
                <input
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  inputMode="numeric"
                  className="h-11 rounded-lg border border-card px-3"
                />
                {postcode && !postcodeValid ? (
                  <span className="text-xs text-[#b91c1c]">Enter a 5-digit Italian postcode.</span>
                ) : zone ? (
                  <span className="text-xs text-muted">{zone}</span>
                ) : null}
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium">
                Delivery date
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-11 rounded-lg border border-card px-3" />
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium">
                Time type
                <select
                  value={deliveryType}
                  onChange={(e) => setDeliveryType(e.target.value as (typeof DELIVERY_TYPES)[number])}
                  className="h-11 rounded-lg border border-card px-3"
                >
                  {DELIVERY_TYPES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </label>
              {deliveryType === 'window' || deliveryType === 'exact' ? (
                <Field label="Time (e.g. 11:00)" value={time} onChange={setTime} />
              ) : null}
            </fieldset>

            <Field label="Card message" value={message} onChange={setMessage} />
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={hideSender} onChange={(e) => setHideSender(e.target.checked)} />
              Hide sender name on the card
            </label>

            <fieldset className="grid gap-3 sm:grid-cols-2">
              <legend className="font-semibold">Customer</legend>
              <Field label="Name" value={customer.name} onChange={(v) => setCustomer((c) => ({ ...c, name: v }))} />
              <Field label="Email" value={customer.email} onChange={(v) => setCustomer((c) => ({ ...c, email: v }))} />
              <Field label="WhatsApp (+39…)" value={customer.whatsapp} onChange={(v) => setCustomer((c) => ({ ...c, whatsapp: v }))} />
              <label className="flex flex-col gap-1 text-sm font-medium">
                Language
                <select
                  value={customer.language}
                  onChange={(e) => setCustomer((c) => ({ ...c, language: e.target.value }))}
                  className="h-11 rounded-lg border border-card px-3"
                >
                  <option value="en">English</option>
                  <option value="it">Italiano</option>
                </select>
              </label>
            </fieldset>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm font-medium">
                Discount (EUR)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="h-11 rounded-lg border border-card px-3 tabular-nums"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium">
                Link expires (hours)
                <input
                  type="number"
                  value={expiry}
                  onChange={(e) => setExpiry(Number(e.target.value))}
                  className="h-11 rounded-lg border border-card px-3 tabular-nums"
                />
              </label>
            </div>

            <div className="flex items-center justify-between border-t border-card pt-3">
              {editing ? (
                <span className="text-xs text-[#b45309]">Saving regenerates the link — the old one stops working.</span>
              ) : (
                <span />
              )}
              <div className="text-right">
                <div className="text-sm text-muted">
                  Total{discountCents ? ` (−${formatMoney(discountCents)})` : ''}
                </div>
                <div className="text-xl font-bold tabular-nums">{formatMoney(total)}</div>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary self-end disabled:opacity-50"
              disabled={pending || total === 0 || !customer.name}
              onClick={submit}
            >
              {editing ? 'Save & regenerate link' : 'Create & get link'}
            </button>
          </div>
        )}
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
