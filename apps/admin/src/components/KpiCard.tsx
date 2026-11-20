export function KpiCard({
  label,
  value,
  delta,
  tone = 'muted',
}: {
  label: string;
  value: string;
  delta: string;
  tone?: 'good' | 'warn' | 'muted';
}) {
  const color = tone === 'good' ? 'text-[#16a34a]' : tone === 'warn' ? 'text-[#b45309]' : 'text-muted';
  return (
    <div className="card flex flex-col gap-2 p-5">
      <span className="text-sm font-medium text-muted">{label}</span>
      <span className="text-3xl font-bold tabular-nums leading-none">{value}</span>
      <span className={`text-xs ${color}`}>{delta}</span>
    </div>
  );
}
