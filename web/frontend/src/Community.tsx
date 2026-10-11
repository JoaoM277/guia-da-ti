import community from './generated/community.json';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Maintainers } from './Maintainers';
import { ArrowUpRight } from 'lucide-react';

export function Community({ area, preview = false, embedded = false }: { area: 'supporters' | 'contributors'; preview?: boolean; embedded?: boolean }) {
  const [page, setPage] = useState(0);
  const supporting = area === 'supporters';
  const title = 'Empresas apoiadoras';
  const entries = community.supporters;
  const pageSize = preview ? 4 : 12;
  const shown = entries.slice(page * pageSize, (page + 1) * pageSize);
  const Heading = preview || embedded ? 'h2' : 'h1';
  if (!supporting) return <Maintainers compact={preview} />;
  if (embedded || preview) return <section id="apoiadores" aria-label={title} className="space-y-5">
    {preview && <p className="text-xs font-medium uppercase tracking-widest text-primary">Parceiros do Guia</p>}
    {entries.length ? <ul className="flex flex-wrap items-center justify-start gap-x-10 gap-y-5">{shown.map(entry => <li key={entry.url}><a href={entry.url} target="_blank" rel="noopener noreferrer" className="text-2xl font-semibold tracking-tight text-muted-foreground transition-colors hover:text-foreground focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-ring sm:text-3xl" aria-label={`Visitar ${entry.name}`}>{entry.name}</a></li>)}</ul> : <p className="text-sm text-muted-foreground">Os primeiros apoiadores serão apresentados aqui.</p>}
    {entries.length > pageSize && <nav aria-label="Páginas de empresas apoiadoras" className="flex items-center justify-start gap-3 text-sm"><span className="text-muted-foreground">{page * pageSize + 1}–{Math.min((page + 1) * pageSize, entries.length)} de {entries.length}</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(value => value - 1)}>Anterior</Button><Button variant="outline" size="sm" disabled={(page + 1) * pageSize >= entries.length} onClick={() => setPage(value => value + 1)}>Próxima</Button></div></nav>}
  </section>;
  if (supporting) return <section id="apoiadores" aria-label={title} className="mx-auto w-full max-w-4xl space-y-6">
    <div className="space-y-3">
      <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">Parceiros do Guia</p>
      <Heading className={preview ? 'sr-only' : 'text-2xl font-semibold uppercase tracking-wide sm:text-3xl'}>{title}</Heading>
    </div>
    {entries.length ? <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {shown.map(entry => <li key={entry.url}>
        <a href={entry.url} target="_blank" rel="noopener noreferrer" className="flex min-h-16 items-center justify-between gap-4 rounded-xl border px-4 py-3 text-foreground transition-colors hover:border-primary/40 hover:bg-muted/30 focus-visible:outline-2 focus-visible:outline-ring" aria-label={`Visitar ${entry.name}`}>
          <span className="font-medium">{entry.name}</span><ArrowUpRight className="size-4 shrink-0 text-muted-foreground" />
        </a>
      </li>)}
    </ul> : <p className="border p-5 text-sm text-muted-foreground">Os primeiros apoiadores serão apresentados aqui.</p>}
    {!preview && entries.length > pageSize && <nav aria-label="Páginas de empresas apoiadoras" className="flex items-center justify-between gap-3 text-sm"><span className="text-muted-foreground">{page * pageSize + 1}–{Math.min((page + 1) * pageSize, entries.length)} de {entries.length}</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(value => value - 1)}>Anterior</Button><Button variant="outline" size="sm" disabled={(page + 1) * pageSize >= entries.length} onClick={() => setPage(value => value + 1)}>Próxima</Button></div></nav>}
  </section>;
}
