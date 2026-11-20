import type { ReactNode } from 'react';

/** Shared shell for info/legal pages: title + optional lead, then prose content. */
export function ProsePage({
  title,
  lead,
  children,
}: {
  title: string;
  lead?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-5xl leading-none lg:text-6xl">{title}</h1>
      {lead ? <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">{lead}</p> : null}
      <div className="mt-10 flex flex-col gap-8">{children}</div>
    </div>
  );
}

/** A titled section used by the info pages. */
export function ProseSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="font-heading text-2xl">{title}</h2>
      <div className="leading-relaxed text-text">{children}</div>
    </section>
  );
}
