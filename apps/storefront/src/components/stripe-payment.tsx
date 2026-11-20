'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';

const PK = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';

let stripePromise: Promise<Stripe | null> | null = null;
function getStripe() {
  if (!stripePromise && PK.startsWith('pk_')) stripePromise = loadStripe(PK);
  return stripePromise;
}

/** Real Payment Element form — confirms the backend-created intent. */
function PaymentForm({ onPaid }: { onPaid: () => void }) {
  const t = useTranslations('checkout');
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!stripe || !elements) return;
    setBusy(true);
    setError(null);
    const { error: err } = await stripe.confirmPayment({ elements, redirect: 'if_required' });
    setBusy(false);
    if (err) setError(err.message ?? 'Payment failed');
    else onPaid();
  }

  return (
    <div className="flex flex-col gap-4">
      <PaymentElement />
      {error ? <p className="text-sm text-accent-700">{error}</p> : null}
      <p className="text-xs text-muted">{t('payWithStripe')}</p>
      <button type="button" className="btn btn-primary" disabled={busy} onClick={submit}>
        {t('placeOrder')}
      </button>
    </div>
  );
}

/**
 * Mounts the real Payment Element when a publishable key and a live PaymentIntent
 * exist; otherwise falls back to a clearly-labelled simulated payment (mock mode).
 */
export function StripePayment({
  clientSecret,
  onPaid,
}: {
  clientSecret: string;
  onPaid: () => void;
}) {
  const t = useTranslations('checkout');
  const isMock = clientSecret.startsWith('pi_mock');
  const stripe = getStripe();

  if (!isMock && stripe) {
    return (
      <Elements stripe={stripe} options={{ clientSecret }}>
        <PaymentForm onPaid={onPaid} />
      </Elements>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="rounded-md bg-accent-soft p-3 text-sm text-accent-700">{t('testMode')}</p>
      <p className="text-xs text-muted">{t('payWithStripe')}</p>
      <button type="button" className="btn btn-primary" onClick={onPaid}>
        {t('simulatePay')}
      </button>
    </div>
  );
}
