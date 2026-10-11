import { useId, useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

export function ComboboxField({ label, name, value, onChange, options, disabled }: {
  label: string; name: string; value: string; onChange: (value: string) => void;
  options: { id: string; name: string }[]; disabled?: boolean;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  return <div className="space-y-2">
    <Label htmlFor={id}>{label}</Label>
    <input type="hidden" name={name} value={value} />
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild><Button id={id} type="button" variant="outline" role="combobox" aria-expanded={open} disabled={disabled} className="w-full justify-between font-normal">
        {options.find(option => option.id === value)?.name || 'Escolha uma categoria'}<ChevronsUpDown className="size-4 opacity-50" />
      </Button></PopoverTrigger>
      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command><CommandInput aria-label="Pesquisar categoria da comunidade" placeholder="Pesquisar categoria" />
          <CommandList><CommandEmpty>Nenhuma categoria encontrada</CommandEmpty><CommandGroup>
            {options.map(option => <CommandItem key={option.id} value={option.name} keywords={[option.id]} onSelect={() => { onChange(option.id); setOpen(false); }}>
              <Check className={`size-4 ${value === option.id ? 'opacity-100' : 'opacity-0'}`} />{option.name}
            </CommandItem>)}
          </CommandGroup></CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  </div>;
}
