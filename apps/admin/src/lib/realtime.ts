import type { DecoratedOrder } from './api';

const BASE = import.meta.env.VITE_API_BASE_URL ?? '';
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const IMG = 'https://images.unsplash.com/photo-1589095181425-c038b3871b6a?w=120&h=120&fit=crop&q=75';
const POOL: Omit<DecoratedOrder, 'id' | 'placed'>[] = [
  { sender: 'Lucas Silva', country: 'Brazil', email: 'lucas@mail.com', recipient: 'Aurora Romano', area: 'Centro Storico', address: 'Via del Governo Vecchio 5, 00186', product: 'Rosa Classica', tier: 'PREMIUM', imageKey: 'redroses', slot: '18:15', rider: 'Marco', total_cents: 6900, status: 'new', card_message: 'Pensando a te.', bouquet_photo: null, thumb: IMG, image: IMG },
  { sender: 'Mei Chen', country: 'Singapore', email: 'mei@mail.com', recipient: 'Beatrice Lombardi', area: 'Parioli', address: 'Viale Parioli 30, 00197', product: 'Peonia Rosa', tier: 'LUXURY', imageKey: 'peony', slot: '20:30', rider: 'Sara', total_cents: 9100, status: 'new', card_message: 'Happy anniversary!', bouquet_photo: null, thumb: IMG, image: IMG },
];

/**
 * Subscribe to new orders. On mocks, synthesize one periodically (MSW can't mock
 * EventSource). In production, this opens the real SSE stream.
 */
export function subscribeNewOrders(onOrder: (order: DecoratedOrder) => void): () => void {
  if (USE_MOCKS) {
    let n = 0;
    const id = setInterval(() => {
      const base = POOL[n % POOL.length]!;
      n += 1;
      const now = new Date();
      onOrder({
        ...base,
        id: `RF-2026-${String(24900 + n).padStart(5, '0')}`,
        placed: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      });
    }, 25000);
    return () => clearInterval(id);
  }

  const es = new EventSource(`${BASE}/v1/admin/orders/stream`, { withCredentials: true });
  es.onmessage = (e) => onOrder(JSON.parse(e.data) as DecoratedOrder);
  return () => es.close();
}

/** Short notification beep via WebAudio (no audio asset to ship). */
export function playChime() {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch {
    /* audio not available */
  }
}
