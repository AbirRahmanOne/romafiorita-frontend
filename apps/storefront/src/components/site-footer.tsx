import { getTranslations } from 'next-intl/server';
import { business } from '@rf/mocks';
import { Link } from '@/i18n/routing';

/** Static (non-parameterised) routes the footer links to. */
type StaticPath = '/bouquets' | '/delivery' | '/faq' | '/contact' | '/about' | '/journal' | '/terms' | '/privacy';

/**
 * Dark footer. Business identity and payment-method icons come from config — each
 * field is hidden until real data exists (content-rules). The P.IVA line stays
 * hidden while empty (no VAT number yet). No wine/alcohol links.
 */
export async function SiteFooter() {
  const t = await getTranslations('footer');

  // `track` has no landing page (needs a per-order token) → rendered as plain text.
  const columns: { title: string; links: { label: string; href?: StaticPath }[] }[] = [
    {
      title: t('shop'),
      links: [
        { label: t('links.occasions'), href: '/bouquets' },
        { label: t('links.bouquets'), href: '/bouquets' },
        { label: t('links.plants'), href: '/bouquets' },
      ],
    },
    {
      title: t('help'),
      links: [
        { label: t('links.deliveryInfo'), href: '/delivery' },
        { label: t('links.track') },
        { label: t('links.faq'), href: '/faq' },
        { label: t('links.contact'), href: '/contact' },
      ],
    },
    {
      title: t('company'),
      links: [
        { label: t('links.about'), href: '/about' },
        { label: t('links.journal'), href: '/journal' },
        { label: t('links.terms'), href: '/terms' },
        { label: t('links.privacy'), href: '/privacy' },
      ],
    },
  ];

  return (
    <footer className="mt-24 bg-ink text-neutral-400">
      <div className="mx-auto flex max-w-shell flex-col gap-14 px-4 py-20 sm:px-6 lg:px-12">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <span className="max-w-xl font-heading text-5xl leading-none text-neutral-100 lg:text-6xl">
            {t('reminderLead')} <em className="text-accent-300">{t('reminderAccent')}</em>
          </span>
          <form className="flex max-w-lg flex-1 basis-80 border-b border-neutral-300">
            <input
              type="email"
              placeholder={t('reminderPlaceholder')}
              aria-label={t('reminderPlaceholder')}
              className="min-h-14 flex-1 bg-transparent text-neutral-100 outline-none placeholder:text-neutral-500"
            />
            <button type="submit" className="pl-4 font-heading text-lg text-accent-300">
              {t('remind')}
            </button>
          </form>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {columns.map((col) => (
            <nav key={col.title} className="flex flex-col gap-2.5 text-sm">
              <span className="font-heading text-lg text-neutral-100">{col.title}</span>
              {col.links.map((link) =>
                link.href ? (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-neutral-400 hover:text-neutral-200"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <span key={link.label} className="text-neutral-500">
                    {link.label}
                  </span>
                ),
              )}
            </nav>
          ))}
          <address className="text-sm not-italic leading-7">
            {business.name ? (
              <span className="mb-1.5 block font-heading text-lg text-neutral-100">
                {business.name}
              </span>
            ) : null}
            {business.address ? <>{business.address}<br /></> : null}
            {business.piva ? <>P.IVA {business.piva}<br /></> : null}
            {business.pec ? <>{business.pec}</> : null}
          </address>
        </div>

        <div className="flex flex-wrap justify-between gap-4 border-t border-neutral-700 pt-6 text-xs tracking-wider">
          {business.payment_methods.length ? (
            <span>{business.payment_methods.join(' · ')}</span>
          ) : (
            <span />
          )}
          <span>
            © {new Date().getFullYear()} {t('rights')} · English / Italiano
          </span>
        </div>
      </div>
    </footer>
  );
}
