import {useState} from 'react';
import {Dialog} from 'radix-ui';
import {SlidersHorizontal} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {CommunityLocationFilter} from './CommunityLocationFilter';
import {emptyLocationSelection,type LocationSelection} from './community-location';

export function CommunityFiltersDialog({value,onChange}:{value:LocationSelection;onChange:(next:LocationSelection)=>void}) {
  const [open,setOpen]=useState(false);
  const [draft,setDraft]=useState(value);
  const count=Number(!!value.scope);
  return <div className="flex flex-wrap items-center gap-3">
    <Dialog.Root open={open} onOpenChange={next=>{if(next)setDraft(value);setOpen(next);}}>
      <Dialog.Trigger asChild><Button variant="outline"><SlidersHorizontal />Filtrar comunidades{count>0?' ('+count+')':''}</Button></Dialog.Trigger>
      <Dialog.Portal><Dialog.Overlay data-slot="dialog-overlay" className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content data-slot="dialog-content" className="fixed left-1/2 top-1/2 z-50 flex h-[min(90dvh,48rem)] w-[calc(100%-2rem)] max-w-4xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border bg-background shadow-xl">
          <div className="shrink-0 border-b px-4 py-4 sm:px-6"><Dialog.Title className="text-xl font-semibold">Filtrar comunidades</Dialog.Title><Dialog.Description className="mt-1 text-sm text-muted-foreground">Filtre por estado, região ou alcance da comunidade.</Dialog.Description></div>
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
            <CommunityLocationFilter value={draft} onChange={next=>setDraft(current=>({...current,...next}))} />
          </div>
          <div className="flex shrink-0 flex-wrap justify-between gap-2 border-t px-4 py-3 sm:px-6">
            <Button variant="ghost" onClick={()=>setDraft(emptyLocationSelection())}>Limpar filtros</Button>
            <div className="flex gap-2"><Dialog.Close asChild><Button variant="outline">Cancelar</Button></Dialog.Close><Button onClick={()=>{onChange(draft);setOpen(false);}}>Aplicar filtros</Button></div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
    {count>0&&<Button variant="ghost" size="sm" onClick={()=>onChange(emptyLocationSelection())}>Limpar filtros</Button>}
  </div>;
}
