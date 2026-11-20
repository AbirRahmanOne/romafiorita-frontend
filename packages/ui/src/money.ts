/** Format integer cents (EUR) for a locale. Money always arrives as cents. */
export function formatMoney(cents: number, locale: string, currency = 'EUR'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(cents / 100);
}
