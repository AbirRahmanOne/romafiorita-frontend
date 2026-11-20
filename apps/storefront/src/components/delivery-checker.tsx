'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { api, type DeliveryCheck, type Slot } from '@/lib/api';
import type { DeliveryType } from '@/lib/cart';

export interface DeliverySelection {
  postcode: string;
  zone: 'ROME' | 'NATIONAL';
  type: DeliveryType;
  date: string;
  slot?: string;
}

const TYPE_LABEL: Record<DeliveryType, string> = {
  standard: 'typeStandard',
  window: 'typeWindow',
  exact: 'typeExact',
  courier: 'typeCourier',
};

export function DeliveryChecker({
  onChange,
  lockedPostcode,
}: {
  onChange?: (sel: DeliverySelection | null) => void;
  /** When set, the postcode input is hidden and this value is used (e.g. in checkout). */
  lockedPostcode?: string;
}) {
  const t = useTranslations('product');
  const td = useTranslations('delivery');
  const [postcode, setPostcode] = useState(lockedPostcode ?? '');
  const [check, setCheck] = useState<DeliveryCheck | null>(null);
  const [checking, setChecking] = useState(false);
  const [date, setDate] = useState('');
  const [type, setType] = useState<DeliveryType | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slot, setSlot] = useState<string | undefined>();

  useEffect(() => {
    if (lockedPostcode !== undefined) setPostcode(lockedPostcode);
  }, [lockedPostcode]);

  // Validate postcode → zone + available types.
  useEffect(() => {
    if (!/^\d{5}$/.test(postcode)) {
      setCheck(null);
      setType(null);
      return;
    }
    let active = true;
    setChecking(true);
    api
      .checkDelivery(postcode, date || undefined)
      .then((res) => {
        if (!active) return;
        setCheck(res);
        setType(res.types[0] ?? null);
      })
      .finally(() => active && setChecking(false));
    return () => {
      active = false;
    };
  }, [postcode, date]);

  // Exact time in Rome → load 15-min slots.
  useEffect(() => {
    if (check?.zone === 'ROME' && type === 'exact') {
      api.slots(postcode, date || undefined).then((res) => setSlots(res.slots));
    } else {
      setSlots([]);
      setSlot(undefined);
    }
  }, [check, type, postcode, date]);

  // Report selection upward.
  useEffect(() => {
    if (check && type) {
      onChange?.({ postcode, zone: check.zone, type, date, slot });
    } else {
      onChange?.(null);
    }
  }, [check, type, date, slot, postcode, onChange]);

  return (
    <div className="flex flex-col gap-4">
      {lockedPostcode === undefined ? (
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t('postcode')}
          <input
            inputMode="numeric"
            value={postcode}
            onChange={(e) => setPostcode(e.target.value.replace(/\D/g, '').slice(0, 5))}
            placeholder="001xx"
            className="min-h-11 rounded-md border border-divider bg-surface px-3 text-base"
          />
        </label>
      ) : null}

      {checking ? <p className="text-sm text-muted">{td('checking')}</p> : null}

      {check ? (
        <>
          <p className="text-sm text-success">
            {check.zone === 'ROME'
              ? td('zoneRome', { city: 'Roma' })
              : td('zoneNational')}
          </p>
          <label className="flex flex-col gap-1 text-sm font-medium">
            {t('date')}
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="min-h-11 rounded-md border border-divider bg-surface px-3 text-base"
            />
          </label>
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-sm font-medium">{t('timeType')}</legend>
            {check.types.map((ty) => (
              <label key={ty} className="flex min-h-11 items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="delivery-type"
                  checked={type === ty}
                  onChange={() => setType(ty)}
                />
                {td(TYPE_LABEL[ty])}
              </label>
            ))}
          </fieldset>

          {check.zone === 'ROME' && type === 'exact' ? (
            slots.length ? (
              <div>
                <p className="mb-2 text-sm font-medium">{t('slot')}</p>
                <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto">
                  {slots.map((s) => (
                    <button
                      key={s.time}
                      type="button"
                      disabled={!s.available}
                      aria-pressed={slot === s.time}
                      onClick={() => setSlot(s.time)}
                      className={`min-h-11 rounded-md border px-3 text-sm tabular-nums ${
                        !s.available
                          ? 'cursor-not-allowed border-dashed border-divider text-muted'
                          : slot === s.time
                            ? 'border-accent bg-accent text-white'
                            : 'border-divider hover:border-accent'
                      }`}
                    >
                      {s.time}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted">{td('noSlots')}</p>
            )
          ) : null}
        </>
      ) : null}
    </div>
  );
}
