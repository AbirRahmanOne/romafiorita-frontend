let started: Promise<void> | null = null;

/** Start the MSW worker once (browser, mock mode). No-op on the server / when off. */
export function ensureMocks(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (process.env.NEXT_PUBLIC_USE_MOCKS !== 'true') return Promise.resolve();
  if (!started) started = import('@rf/mocks/browser').then((m) => m.startMocks());
  return started;
}
