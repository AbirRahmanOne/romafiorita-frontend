import { useEffect, useState, type ReactNode } from 'react';
import { Pill, Skeleton, EmptyState } from '@rf/ui';
import { useSettings, usePatchSettings } from '@/lib/hooks';
import { canSeeMoney } from '@/lib/role';
import type { Settings as SettingsType } from '@/lib/api';

export function Settings() {
  const { data } = useSettings();
  const patch = usePatchSettings();
  const [form, setForm] = useState<SettingsType | null>(null);

  useEffect(() => {
    if (data && !form) setForm(structuredClone(data));
  }, [data, form]);

  if (!canSeeMoney()) return <EmptyState title="You don't have access to settings." />;
  if (!form) return <Skeleton className="h-96" />;

  const set = (patchV: Partial<SettingsType>) => setForm((f) => ({ ...(f as SettingsType), ...patchV }));

  return (
    <div className="flex max-w-3xl flex-col gap-5">
      <Section title="Delivery zones">
        {form.zones.map((z) => (
          <div key={z.type} className="flex items-center justify-between border-b border-[#eef0f4] py-2 text-sm">
            <span>{z.name}</span>
            <Pill status="neutral">{z.type}</Pill>
          </div>
        ))}
      </Section>

      <Section title="Fees &amp; cut-offs">
        <div className="grid gap-3 sm:grid-cols-2">
          <NumberField
            label="2-hour window fee (€)"
            value={form.slot_pricing.window_cents / 100}
            onChange={(v) => set({ slot_pricing: { ...form.slot_pricing, window_cents: Math.round(v * 100) } })}
          />
          <NumberField
            label="Exact-time fee (€)"
            value={form.slot_pricing.exact_cents / 100}
            onChange={(v) => set({ slot_pricing: { ...form.slot_pricing, exact_cents: Math.round(v * 100) } })}
          />
          <NumberField
            label="Rome same-day cut-off (hour)"
            value={form.cutoffs.rome_hour}
            onChange={(v) => set({ cutoffs: { ...form.cutoffs, rome_hour: v } })}
          />
          <NumberField
            label="Suburbs cut-off (hour)"
            value={form.cutoffs.suburbs_hour}
            onChange={(v) => set({ cutoffs: { ...form.cutoffs, suburbs_hour: v } })}
          />
          <NumberField
            label="Daily capacity"
            value={form.daily_capacity}
            onChange={(v) => set({ daily_capacity: v })}
          />
        </div>
      </Section>

      <Section title="Blocked dates">
        <ChipList
          items={form.blocked_dates}
          placeholder="YYYY-MM-DD"
          onChange={(blocked_dates) => set({ blocked_dates })}
        />
      </Section>

      <Section title="Notification recipients">
        <ChipList
          items={form.notification_recipients}
          placeholder="name@romafiorita.com"
          onChange={(notification_recipients) => set({ notification_recipients })}
        />
      </Section>

      <Section title="Staff &amp; roles">
        <p className="mb-2 text-xs text-muted">Florist and Rider never see payments or settings.</p>
        {form.staff.map((s) => (
          <div key={s.role} className="flex items-center justify-between border-b border-[#eef0f4] py-2 text-sm">
            <span>{s.name}</span>
            <Pill status={s.role === 'OWNER' || s.role === 'MANAGER' ? 'approved' : 'neutral'}>{s.role}</Pill>
          </div>
        ))}
      </Section>

      <div className="flex justify-end">
        <button
          type="button"
          className="btn btn-primary"
          disabled={patch.isPending}
          onClick={() => patch.mutate(form)}
        >
          {patch.isSuccess ? 'Saved ✓' : 'Save settings'}
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="card p-5">
      <h2 className="mb-3 font-semibold" dangerouslySetInnerHTML={{ __html: title }} />
      {children}
    </section>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium">
      {label}
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-11 rounded-lg border border-card px-3 tabular-nums"
      />
    </label>
  );
}

function ChipList({
  items,
  placeholder,
  onChange,
}: {
  items: string[];
  placeholder: string;
  onChange: (items: string[]) => void;
}) {
  const [value, setValue] = useState('');
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {items.map((it) => (
          <span key={it} className="flex items-center gap-2 rounded-full bg-bg px-3 py-1 text-sm">
            {it}
            <button type="button" aria-label={`Remove ${it}`} onClick={() => onChange(items.filter((x) => x !== it))}>
              ✕
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={value}
          placeholder={placeholder}
          onChange={(e) => setValue(e.target.value)}
          className="h-11 flex-1 rounded-lg border border-card px-3 text-sm"
        />
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            if (value.trim()) {
              onChange([...items, value.trim()]);
              setValue('');
            }
          }}
        >
          Add
        </button>
      </div>
    </div>
  );
}
