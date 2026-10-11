import { ChevronLeft, ChevronRight, Instagram, Linkedin, Youtube } from 'lucide-react';
import { Tabs } from 'radix-ui';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';

function TikTokIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true"><path d="M14 3h3c0 3 2 5 5 5v3a9 9 0 0 1-5-2v8a5 5 0 1 1-5-5v3a2 2 0 1 0 2 2Z" /></svg>;
}
function XIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className} aria-hidden="true"><path d="m4 3 12 18h4L8 3H4Zm0 18L20 3" /></svg>;
}
export const creatorNetworks = [
  { id: 'youtube', name: 'YouTube', Icon: Youtube, domains: ['youtube.com', 'youtu.be'] },
  { id: 'instagram', name: 'Instagram', Icon: Instagram, domains: ['instagram.com'] },
  { id: 'tiktok', name: 'TikTok', Icon: TikTokIcon, domains: ['tiktok.com'] },
  { id: 'linkedin', name: 'LinkedIn', Icon: Linkedin, domains: ['linkedin.com'] },
  { id: 'twitter', name: 'Twitter / X', Icon: XIcon, domains: ['twitter.com', 'x.com'] },
];

export function CreatorTabs() {
  const listRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ overflow: false, left: false, right: false });
  const updateEdges = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    setEdges({ overflow: list.scrollWidth > list.clientWidth + 1, left: list.scrollLeft > 1, right: list.scrollLeft + list.clientWidth < list.scrollWidth - 1 });
  }, []);
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    updateEdges();
    list.addEventListener('scroll', updateEdges, { passive: true });
    const observer = new ResizeObserver(updateEdges);
    observer.observe(list);
    return () => { list.removeEventListener('scroll', updateEdges); observer.disconnect(); };
  }, [updateEdges]);
  function slide(direction: -1 | 1) {
    const list = listRef.current;
    if (!list) return;
    const bounds = list.getBoundingClientRect();
    const tabs = Array.from(list.querySelectorAll<HTMLElement>('[role="tab"]'));
    const visibleStart = tabs.findIndex(tab => tab.getBoundingClientRect().right > bounds.left + 1);
    let visibleEnd = -1;
    tabs.forEach((tab, index) => { if (tab.getBoundingClientRect().left < bounds.right - 1) visibleEnd = index; });
    const target = tabs[direction > 0 ? Math.min(tabs.length - 1, visibleEnd + 1) : Math.max(0, visibleStart - 1)];
    if (!target) return;
    list.scrollTo({ left: list.scrollLeft + target.getBoundingClientRect().left - bounds.left, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }
  return <div className="flex min-w-0 items-center gap-1 border-b">
    {edges.overflow && edges.left && <Button type="button" variant="outline" size="icon-xs" aria-label="Deslizar redes para a esquerda" className="shrink-0 bg-background shadow-sm sm:hidden" onClick={() => slide(-1)}><ChevronLeft aria-hidden="true" /></Button>}
    <Tabs.List ref={listRef} aria-label="Redes dos criadores" className="flex min-w-0 flex-1 flex-nowrap gap-1 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:w-full sm:flex-wrap sm:overflow-visible">
      {creatorNetworks.map(({ id, name, Icon }) => <Tabs.Trigger key={id} value={id} className="inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted/50 data-[state=active]:bg-accent data-[state=active]:font-medium data-[state=active]:text-accent-foreground focus-visible:outline-2 focus-visible:outline-ring"><Icon className="size-4 shrink-0" aria-hidden="true" />{name}</Tabs.Trigger>)}
    </Tabs.List>
    {edges.overflow && edges.right && <Button type="button" variant="outline" size="icon-xs" aria-label="Deslizar redes para a direita" className="shrink-0 bg-background shadow-sm sm:hidden" onClick={() => slide(1)}><ChevronRight aria-hidden="true" /></Button>}
  </div>;
}

export function PlatformTabsRoot({ enabled, value, onChange, children }: { enabled: boolean; value: string; onChange: (value: string) => void; children: ReactNode }) {
  return enabled ? <Tabs.Root value={value} onValueChange={onChange} asChild>{children}</Tabs.Root> : <>{children}</>;
}

export function PlatformTabPanel({ enabled, value, children }: { enabled: boolean; value: string; children: ReactNode }) {
  return enabled ? <Tabs.Content value={value} forceMount asChild>{children}</Tabs.Content> : <>{children}</>;
}
