import { useEffect, useState, type FormEvent } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@rf/ui';
import { canSeeMoney } from '@/lib/role';

const NAV = [
  { to: '/', label: 'Dashboard', end: true, money: false },
  { to: '/orders', label: 'Orders', end: false, money: false },
  { to: '/payment-requests', label: 'Payment requests', end: false, money: false },
  { to: '/catalogue', label: 'Catalogue', end: false, money: false },
  { to: '/payments', label: 'Payments', end: false, money: true },
  { to: '/insights', label: 'Insights', end: false, money: false },
  { to: '/settings', label: 'Settings', end: false, money: true },
].filter((item) => !item.money || canSeeMoney());

const META: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard', subtitle: 'Buongiorno — here’s today at the workshop.' },
  '/orders': { title: 'Orders', subtitle: 'Track every bouquet from photo to doorstep.' },
  '/payment-requests': { title: 'Payment requests', subtitle: 'Custom orders and secure pay-by-link.' },
  '/catalogue': { title: 'Catalogue', subtitle: 'Manage bouquets, prices and cold-room stock.' },
  '/payments': { title: 'Payments', subtitle: 'Stripe payments, holds, refunds and payouts.' },
  '/insights': { title: 'Insights', subtitle: 'How customers find romafiorita.com online.' },
  '/settings': { title: 'Settings', subtitle: 'Zones, fees, slots, blocked dates and staff.' },
};

function useRomeClock() {
  const [now, setNow] = useState('');
  useEffect(() => {
    const tick = () =>
      setNow(
        new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Europe/Rome',
          hour: '2-digit',
          minute: '2-digit',
        }).format(new Date()),
      );
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export function AdminShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const clock = useRomeClock();
  const [q, setQ] = useState('');
  const meta = META[location.pathname] ?? { title: 'Roma Fiorita', subtitle: '' };
  const romeDate = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Rome',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  function onSearch(e: FormEvent) {
    e.preventDefault();
    navigate(`/orders?q=${encodeURIComponent(q)}`);
  }

  return (
    <div className="flex min-h-screen flex-wrap items-stretch">
      <aside className="sticky top-0 flex h-screen min-w-[220px] basis-[250px] flex-col bg-sidebar text-white">
        <div className="flex items-center gap-3 border-b border-white/10 p-4">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-base font-bold">
            RF
          </span>
          <div className="leading-none">
            <div className="text-xl font-bold">Roma Fiorita</div>
            <div className="text-[10.5px] uppercase tracking-[0.16em] text-neutral-400">
              Florist admin
            </div>
          </div>
        </div>
        <nav className="flex flex-col gap-1 p-2.5">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex min-h-11 items-center rounded-lg px-3.5 text-[15px] font-medium ${
                  isActive ? 'bg-primary text-white' : 'text-neutral-300 hover:bg-white/10'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <a
            href={import.meta.env.VITE_STOREFRONT_URL ?? 'http://localhost:3000'}
            className="flex min-h-11 items-center rounded-lg px-3.5 text-[15px] font-medium text-neutral-300 hover:bg-white/10"
          >
            View storefront
          </a>
        </nav>
        <div className="mt-auto flex items-center gap-2.5 border-t border-white/10 p-4">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-sm font-semibold">
            RF
          </span>
          <div className="text-sm leading-tight">
            <div className="font-semibold">Staff member</div>
            <div className="text-xs text-neutral-400">Signed in</div>
          </div>
        </div>
      </aside>

      <main className="flex min-w-0 flex-[999_1_640px] flex-col">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-card bg-surface px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{meta.title}</h1>
            <p className="mt-1 text-sm text-muted">{meta.subtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-right text-xs leading-tight text-muted">
              {romeDate}
              <br />
              <span className="tabular-nums">{clock}</span> · Roma
            </div>
            <form onSubmit={onSearch}>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search orders…"
                className="h-11 w-48 rounded-lg border border-card bg-surface px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </form>
            <Button variant="secondary">Export</Button>
            <Button variant="primary" onClick={() => navigate('/payment-requests?new=1')}>
              New phone order
            </Button>
          </div>
        </header>
        <div className="flex flex-col gap-5 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
