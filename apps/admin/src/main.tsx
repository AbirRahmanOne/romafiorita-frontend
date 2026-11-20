import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './index.css';

async function bootstrap() {
  if (import.meta.env.VITE_USE_MOCKS === 'true') {
    try {
      const { startMocks } = await import('@rf/mocks/browser');
      await startMocks();
    } catch (err) {
      console.warn('MSW not started (run `pnpm --filter admin exec msw init public`):', err);
    }
  }
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void bootstrap();
