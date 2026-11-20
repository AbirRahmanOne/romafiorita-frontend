import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { LocaleSwitcher } from './locale-switcher';

const iconProps = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const SearchIcon = () => (
  <svg {...iconProps}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-4-4" />
  </svg>
);
const AccountIcon = () => (
  <svg {...iconProps}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c1-4 4.5-6 8-6s7 2 8 6" />
  </svg>
);
const CartIcon = () => (
  <svg {...iconProps}>
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <path d="M3 6h18" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

/** Sticky header. No "Admin" link on the public site (content/prompt rule). */
export async function SiteHeader() {
  const t = await getTranslations('nav');
  const h = await getTranslations('header');

  return (
    <header className="sticky top-0 z-20 border-b border-divider bg-bg">
      <div className="mx-auto flex max-w-shell flex-wrap items-center gap-7 px-4 py-3.5 sm:px-6 lg:px-12">
        <Link href="/" className="font-heading text-3xl leading-none text-text">
          Roma <em className="not-italic text-accent">Fiorita</em>
        </Link>
        <nav className="mr-auto flex flex-wrap gap-5 text-sm">
          <Link href="/" className="whitespace-nowrap hover:text-accent-700">
            {t('occasions')}
          </Link>
          <Link href="/bouquets" className="whitespace-nowrap hover:text-accent-700">
            {t('bouquets')}
          </Link>
          <Link href="/flower-delivery-rome" className="whitespace-nowrap text-accent-700">
            {t('sameDay')}
          </Link>
          <Link href="/delivery" className="whitespace-nowrap hover:text-accent-700">
            {t('delivery')}
          </Link>
        </nav>
        <div className="flex items-center gap-1.5">
          <LocaleSwitcher />
          <button type="button" className="btn btn-icon" aria-label={h('search')}>
            <SearchIcon />
          </button>
          <button type="button" className="btn btn-icon" aria-label={h('account')}>
            <AccountIcon />
          </button>
          <button type="button" className="btn btn-secondary ml-2 gap-2" aria-label={h('cart')}>
            <CartIcon />
            <span className="tabular-nums">{h('cartCount', { count: 0 })}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
