import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, EyeOff, Info, Megaphone, MoreHorizontal } from 'lucide-react';
import { adsHiddenKey, hideAdsTemporarily, readAdsHiddenUntil } from './ad-preferences';
import { Button } from '@/components/ui/button';
import { LoadingImage } from './LoadingImage';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

type Creative = { id: string; company: string; title: string; description: string; imageUrl: string | null; clickUrl: string; ticket: string };
type AdPlacement = 'site-top-banner' | 'forum-feed' | 'forum-topic' | 'study-topic';
const previewCreatives: Record<AdPlacement, Creative> = {
  'site-top-banner': { id: 'preview-top', company: 'Projeto de exemplo', title: 'Uma trilha para sua próxima etapa', description: 'Explore cursos e conteúdos de tecnologia.', imageUrl: null, clickUrl: '/divulgue', ticket: '' },
  'forum-feed': { id: 'preview-feed', company: 'Projeto de exemplo', title: 'Conheça uma ferramenta para estudar', description: 'Veja como ela pode ajudar no seu próximo projeto.', imageUrl: null, clickUrl: '/divulgue', ticket: '' },
  'forum-topic': { id: 'preview-topic', company: 'Projeto de exemplo', title: 'Uma solução para quem desenvolve', description: 'Conheça recursos que podem apoiar seu trabalho.', imageUrl: null, clickUrl: '/divulgue', ticket: '' },
  'study-topic': { id: 'preview-study', company: 'Projeto de exemplo', title: 'Continue aprendendo', description: 'Explore materiais para aprofundar seus estudos.', imageUrl: null, clickUrl: '/divulgue', ticket: '' },
};
export function Advertisement({ placement = 'forum-feed', preview = false, listItem = false }: { placement?: AdPlacement; preview?: boolean; listItem?: boolean }) {
  const [hiddenUntil, setHiddenUntil] = useState(0);
  const [ad, setAd] = useState<Creative | null>(() => preview ? previewCreatives[placement] : null);
  const [enabled, setEnabled] = useState(true);
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    if (preview) return;
    setHiddenUntil(readAdsHiddenUntil());
    function sync(event: Event) {
      if (event instanceof StorageEvent && event.key !== adsHiddenKey && event.key !== null) return;
      setHiddenUntil(event instanceof CustomEvent ? event.detail : readAdsHiddenUntil());
    }
    window.addEventListener('storage', sync);
    window.addEventListener('guia:ads-hidden', sync);
    return () => { window.removeEventListener('storage', sync); window.removeEventListener('guia:ads-hidden', sync); };
  }, [preview]);
  useEffect(() => {
    if (!hiddenUntil) return;
    const timer = window.setTimeout(() => setHiddenUntil(0), Math.max(0, hiddenUntil - Date.now()));
    return () => window.clearTimeout(timer);
  }, [hiddenUntil]);
  useEffect(() => {
    if (preview || hiddenUntil || (enabled && !root.current && placement !== 'site-top-banner')) return;
    const controller = new AbortController();
    let timer: number | undefined;
    let visible = placement === 'site-top-banner';
    let busy = false;
    let previous: string | undefined;
    let interval = 45;
    async function load() {
      if (busy || controller.signal.aborted || (enabled && !visible) || document.hidden) return;
      busy = true;
      try {
        const query = new URLSearchParams({ placement, ...(previous ? { previous } : {}) });
        const response = await fetch(`/api/ads/select?${query}`, { signal: controller.signal, cache: 'no-store' });
        if (!response.ok) throw Error();
        const data: { rotationSeconds: number; ad: Creative | null; enabled: boolean } = await response.json();
        if (controller.signal.aborted) return;
        setEnabled(data.enabled); setAd(data.ad); previous = data.ad?.id; interval = data.rotationSeconds;
      } catch { if (!controller.signal.aborted) setAd(null); }
      finally { busy = false; if (!controller.signal.aborted) timer = window.setTimeout(() => { void load(); }, interval * 1000); }
    }
    const observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      if (visible) { window.clearTimeout(timer); void load(); }
    });
    if (root.current && placement !== 'site-top-banner') observer.observe(root.current);
    if (placement === 'site-top-banner') void load();
    if (!enabled) timer = window.setTimeout(() => { void load(); }, interval * 1000);
    function focused() { if (!document.hidden && (visible || !enabled)) { window.clearTimeout(timer); void load(); } }
    document.addEventListener('visibilitychange', focused);
    return () => { controller.abort(); window.clearTimeout(timer); observer.disconnect(); document.removeEventListener('visibilitychange', focused); };
  }, [placement, preview, hiddenUntil, enabled]);
  useEffect(() => {
    if (!ad || !root.current || preview || hiddenUntil) return;
    let timer: number | undefined;
    let recorded = false;
    let visible = false;
    function check() {
      window.clearTimeout(timer);
      if (!recorded && visible && !document.hidden) timer = window.setTimeout(() => {
        recorded = true;
        void fetch('/api/ads/impression', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ticket: ad!.ticket }) }).catch(() => {});
      }, 1000);
    }
    const observer = new IntersectionObserver(entries => { visible = entries[0].intersectionRatio >= 0.5; check(); }, { threshold: [0, 0.5] });
    observer.observe(root.current);
    document.addEventListener('visibilitychange', check);
    return () => { observer.disconnect(); window.clearTimeout(timer); document.removeEventListener('visibilitychange', check); };
  }, [ad, preview, hiddenUntil]);
  if ((hiddenUntil || !enabled) && !preview) return null;
  const imageOnly = ad?.imageUrl && !ad.title.trim() && !ad.description.trim();
  const menu = preview ? null : <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon-xs" className={ad ? 'absolute right-2 top-2 z-10 bg-background/90 hover:bg-background' : 'ml-auto'} aria-label="Opções da publicidade"><MoreHorizontal /></Button></DropdownMenuTrigger><DropdownMenuContent align="end">
    <DropdownMenuItem asChild><a href="/divulgue"><Info />Sobre este espaço</a></DropdownMenuItem>
    {!preview && <DropdownMenuItem onSelect={() => { setAd(null); setHiddenUntil(hideAdsTemporarily()); }}><EyeOff />Ocultar anúncios por 4 horas</DropdownMenuItem>}
  </DropdownMenuContent></DropdownMenu>;
  if (placement === 'site-top-banner') {
    if (!ad && !preview) return null;
    const banner = <aside ref={root} data-motion aria-label="Publicidade no topo do site" className={`relative isolate w-full overflow-hidden border-b bg-background shadow-sm ${preview ? '' : 'sticky top-0 z-[100]'}`}>
      {!ad ? <div className="mx-auto flex min-h-8 max-w-7xl items-center px-4 text-xs text-muted-foreground">Espaço reservado</div> : imageOnly ? <a key={ad.id} href={ad.clickUrl} target="_blank" rel="noopener noreferrer" aria-label={`Publicidade: abrir site de ${ad.company}`} className="block w-full"><LoadingImage src={ad.imageUrl!} alt={ad.company} referrerPolicy="no-referrer" className="mx-auto min-h-8 w-full max-w-7xl" imageClassName="h-auto max-h-12 w-full object-contain" fallback={<span className="flex min-h-8 items-center justify-center text-sm font-medium">{ad.company}</span>} /></a> : <a key={ad.id} href={ad.clickUrl} target="_blank" rel="noopener noreferrer" aria-label={`Publicidade: abrir site de ${ad.company}`} className="mx-auto flex min-h-11 max-w-7xl items-center gap-3 px-4 py-0.5">
      {ad.imageUrl && <LoadingImage src={ad.imageUrl} alt="" aria-hidden="true" referrerPolicy="no-referrer" className="hidden h-8 w-24 shrink-0 sm:block" imageClassName="object-contain" />}
      <span className="min-w-0 flex-1 truncate text-xs"><strong className="font-semibold">{ad.title}</strong><span className="ml-2 text-muted-foreground">{ad.description}</span></span><span className="shrink-0 text-xs font-semibold text-primary">Saiba mais</span>
    </a>}
    </aside>;
    return listItem ? <li>{banner}</li> : banner;
  }
  const content = <aside ref={root} data-motion aria-label="Publicidade" className={`relative my-2 overflow-hidden rounded-lg bg-muted/30 ${imageOnly ? '' : 'min-h-28 space-y-3 px-4 py-3'}`}>
    {!ad && <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span className="flex size-7 items-center justify-center rounded-full bg-muted"><Megaphone className="size-3.5" aria-hidden="true" /></span>
      <span className="font-medium">Publicidade</span><span aria-hidden="true">·</span><span>Espaço reservado</span>
      {menu}
    </div>}
    {ad && menu}
    {ad && imageOnly ? <a key={ad.id} href={ad.clickUrl} target="_blank" rel="noopener noreferrer" aria-label={`Publicidade: abrir site de ${ad.company}`} className="block w-full motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300"><LoadingImage src={ad.imageUrl!} alt={`Anúncio de ${ad.company}`} referrerPolicy="no-referrer" className="aspect-[4/1] w-full bg-muted" imageClassName="object-cover" /></a> : ad ? <div key={ad.id} className="flex flex-col gap-3 pr-8 sm:flex-row sm:items-center sm:gap-4 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300">
      {ad.imageUrl && <a href={ad.clickUrl} target="_blank" rel="noopener noreferrer" aria-label={`Abrir site de ${ad.company}`} className="block h-24 w-full shrink-0 sm:aspect-video sm:h-auto sm:w-40"><LoadingImage src={ad.imageUrl} alt={ad.company} referrerPolicy="no-referrer" className="h-full w-full rounded-md bg-muted" imageClassName="object-contain" /></a>}
      <div className="min-w-0 flex-1 space-y-2"><p className="text-base font-semibold">{ad.title}</p><p className="text-sm leading-relaxed text-muted-foreground">{ad.description}</p><Button asChild size="sm"><a href={ad.clickUrl} target="_blank" rel="noopener noreferrer">Abrir site<ArrowUpRight /></a></Button></div>
    </div> : <p className="pl-9 text-sm text-muted-foreground">Espaço para publicidade</p>}
  </aside>;
  return listItem ? <li>{content}</li> : content;
}
