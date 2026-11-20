import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

/** Call once at app startup when mocks are enabled. */
export async function startMocks(): Promise<void> {
  await worker.start({ onUnhandledRequest: 'bypass' });
}
