import { useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function ResourceSearch({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const input = useRef<HTMLInputElement>(null);
  return <form role="search" aria-label="Pesquisa na listagem" onSubmit={event => event.preventDefault()} className="relative w-full sm:w-72">
    <label htmlFor="resource-search" className="sr-only">Pesquisar na lista</label>
    <Search aria-hidden="true" className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
    <Input ref={input} id="resource-search" type="search" placeholder="Pesquisar na lista" value={value} maxLength={200} onChange={event => onChange(event.target.value)} className="h-8 pl-8 pr-9 shadow-none [&::-webkit-search-cancel-button]:appearance-none" />
    {value && <Button type="button" size="icon-xs" variant="ghost" aria-label="Limpar pesquisa" className="absolute right-0.5 top-1/2 -translate-y-1/2" onClick={() => { onChange(''); input.current?.focus(); }}><X aria-hidden="true" /></Button>}
  </form>;
}
