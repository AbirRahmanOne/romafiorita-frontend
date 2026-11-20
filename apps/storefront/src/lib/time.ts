/** Timezone helpers. Europe/Rome is the source of truth; we also show local time. */

function parts(tz: string): { h: number; m: number; s: number } {
  const o: Record<string, string> = {};
  new Intl.DateTimeFormat('en-GB', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
    .formatToParts(new Date())
    .forEach((p) => (o[p.type] = p.value));
  return { h: +(o.hour ?? 0) % 24, m: +(o.minute ?? 0), s: +(o.second ?? 0) };
}

/** Convert an HH:MM wall-clock time in Rome to the wall-clock time in `tz`. */
export function convertFromRome(hhmm: string, tz: string): string {
  const rome = parts('Europe/Rome');
  const local = parts(tz);
  let delta = (local.h * 60 + local.m - (rome.h * 60 + rome.m) + 2880) % 1440;
  if (delta > 720) delta -= 1440;
  const [h, m] = hhmm.split(':').map(Number);
  let mins = (h ?? 0) * 60 + (m ?? 0) + delta;
  const shift = mins >= 1440 ? ' (+1)' : mins < 0 ? ' (−1)' : '';
  mins = (mins + 1440) % 1440;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(Math.floor(mins / 60))}:${pad(mins % 60)}${shift}`;
}

/** The visitor's IANA timezone + a short label, falling back off Rome. */
export function visitorZone(): { zone: string; label: string } {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (tz === 'Europe/Rome') return { zone: 'Europe/London', label: 'London' };
  return { zone: tz, label: tz.split('/').pop()?.replace(/_/g, ' ') ?? tz };
}

/** Seconds until today's Rome cut-off hour (or 0 once passed). */
export function secondsToCutoff(cutoffHour: number): number {
  const t = parts('Europe/Rome');
  const left = cutoffHour * 3600 - (t.h * 3600 + t.m * 60 + t.s);
  return Math.max(left, 0);
}

export function formatCountdown(totalSeconds: number): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(Math.floor(totalSeconds / 3600))}:${pad(Math.floor((totalSeconds % 3600) / 60))}:${pad(
    totalSeconds % 60,
  )}`;
}
