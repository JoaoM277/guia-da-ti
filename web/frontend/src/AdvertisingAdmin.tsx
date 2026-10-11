import { useContext, useEffect, useState, type FormEvent } from 'react';
import { ArrowUpRight, ImagePlus, Megaphone, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { SessionContext } from './Participation';
import { AdvertisingHelp } from './AdvertisingHelp';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type Placement = { id: string; name: string; capacity: number };
type Settings = { maxCampaigns: number; rotationSeconds: number; placements: Placement[] };
type Draft = { company: string; title: string; description: string; url: string; imageUrl: string | null; placements: string[]; weight: number; enabled: boolean; startsAt: string; endsAt: string | null };
type Campaign = { id: string; content: Draft; impressions: number; clicks: number };
type Snapshot = { settings: Settings; campaigns: Campaign[]; enabled: boolean };
const emptyDraft = (): Draft => ({ company: '', title: '', description: '', url: '', imageUrl: null, placements: ['forum-feed'], weight: 1, enabled: false, startsAt: new Date().toISOString(), endsAt: null });
function localDate(value: string | null) {
  if (!value) return '';
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}
function status(draft: Draft) {
  if (!draft.enabled) return 'Pausado';
  if (new Date(draft.startsAt).getTime() > Date.now()) return 'Agendado';
  if (draft.endsAt && new Date(draft.endsAt).getTime() <= Date.now()) return 'Encerrado';
  return 'Em exibição';
}
const format = (count: number) => count.toLocaleString('pt-BR');

export function AdvertisingAdmin() {
  const auth = useContext(SessionContext);
  const [data, setData] = useState<Snapshot | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editing, setEditing] = useState<string | null>(null);
  const [imageOnly, setImageOnly] = useState(false);
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState<Campaign | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function load(signal?: AbortSignal) {
    const response = await fetch('/api/admin/ads', { cache: 'no-store', signal });
    if (!response.ok) throw Error(response.status === 403 ? 'Sua conta não tem acesso à administração.' : response.status === 401 ? 'Entre novamente com sua conta do GitHub.' : 'Não foi possível carregar os anúncios. Tente novamente.');
    const next: Snapshot = await response.json();
    setData(next); setSettings(next.settings);
  }
  useEffect(() => {
    if (!auth?.session?.canManageAds) { setData(null); return; }
    const controller = new AbortController();
    void load(controller.signal).catch(error => { if (!controller.signal.aborted) setError(error.message); });
    return () => controller.abort();
  }, [auth?.session?.canManageAds]);

  async function request(path: string, method: string, body?: unknown) {
    const response = await fetch(`/api/admin/ads${path}`, { method, headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': auth!.session!.csrfToken }, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) });
    if (!response.ok) {
      const problem = await response.json().catch(() => null);
      throw Error(problem?.error || (response.status === 403 ? 'Sua conta não tem acesso à administração.' : response.status === 401 ? 'Entre novamente com sua conta do GitHub.' : 'Não foi possível salvar. Tente novamente.'));
    }
  }
  async function run(action: () => Promise<void>, message: string) {
    if (busy) return;
    setBusy(true); setError(''); setNotice('');
    try { await action(); setNotice(message); await load(); }
    catch (error) { setError(error instanceof Error ? error.message : 'Não foi possível concluir. Tente novamente.'); }
    finally { setBusy(false); }
  }
  function change<K extends keyof Draft>(key: K, value: Draft[K]) { setDraft(current => ({ ...current, [key]: value })); }
  function edit(campaign?: Campaign) { setEditing(campaign?.id || null); setImageOnly(!!campaign && !campaign.content.title.trim() && !campaign.content.description.trim()); setDraft(campaign ? { ...campaign.content, placements: [...campaign.content.placements] } : emptyDraft()); setError(''); setOpen(true); }
  async function save(event: FormEvent) {
    event.preventDefault();
    if (imageOnly && !draft.imageUrl?.trim()) { setError('Adicione uma imagem para usar o formato somente imagem e link.'); return; }
    await run(async () => { await request(editing ? `/campaigns/${editing}` : '/campaigns', editing ? 'PUT' : 'POST', draft); setOpen(false); }, 'Anúncio salvo.');
  }
  async function upload(file: File | undefined) {
    if (!file || uploading) return;
    if (file.size > 2 * 1024 * 1024 || !['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) { setError('Escolha uma imagem PNG, JPG ou WebP de até 2 MB.'); return; }
    setUploading(true); setError('');
    try {
      const body = new FormData(); body.append('image', file);
      const response = await fetch('/api/contributions/images', { method: 'POST', headers: { 'X-CSRF-Token': auth!.session!.csrfToken }, body });
      const result = await response.json();
      if (!response.ok) throw Error(result.error || 'Não foi possível enviar a imagem. Tente novamente.');
      change('imageUrl', `/api/contributions/images/${result.id}`);
    } catch (error) { setError(error instanceof Error ? error.message : 'Não foi possível enviar a imagem.'); }
    finally { setUploading(false); }
  }

  if (auth?.loading) return <p role="status" className="mx-auto max-w-4xl">Verificando seu acesso…</p>;
  if (!auth?.session?.canManageAds) return <section className="mx-auto w-full max-w-4xl space-y-4 rounded-xl border bg-card p-6"><h1 className="text-2xl font-semibold">Administração de anúncios</h1><p className="text-sm text-muted-foreground">Só a conta administradora do Guia pode acessar este painel.</p>{!auth?.session?.login && <Button onClick={() => auth?.startLogin()} disabled={auth?.pending || auth?.session?.enabled === false}>Entrar com GitHub</Button>}</section>;
  return <article className="mx-auto w-full max-w-5xl space-y-6">
    <header className="flex flex-wrap items-center justify-between gap-4"><div className="space-y-2"><h1 className="text-3xl font-semibold tracking-tight">Administração de anúncios</h1><p className="text-sm text-muted-foreground">Crie anúncios, escolha onde aparecem e acompanhe os resultados.</p></div><div className="flex flex-wrap gap-2"><AdvertisingHelp /><Button variant="outline" disabled={busy} onClick={() => { setError(''); void load().catch(error => setError(error.message)); }} aria-label="Atualizar anúncios"><RefreshCw /></Button><Button disabled={busy || !data || data.campaigns.length >= data.settings.maxCampaigns} onClick={() => edit()}><Plus />Novo anúncio</Button></div></header>
    {error && <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}
    {notice && <p role="status" className="rounded-lg border bg-muted/30 p-3 text-sm">{notice}</p>}
    {!data || !settings ? <div className="rounded-xl border p-6"><p role="status">{error ? 'A lista está indisponível. Use o botão de atualizar para tentar novamente.' : 'Carregando campanhas…'}</p></div> : <>
      <section aria-label="Controle geral da publicidade" className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-5"><div className="space-y-2"><h2 className="font-semibold">Publicidade no site</h2><Badge variant={data.enabled ? 'default' : 'secondary'}>{data.enabled ? 'Ativa' : 'Desativada'}</Badge><p className="text-sm text-muted-foreground">Este botão ativa ou desativa os anúncios nos quatro espaços. Os cadastros, as datas e as pausas de cada campanha continuam salvos.</p></div><Button variant={data.enabled ? 'outline' : 'default'} disabled={busy} onClick={() => { void run(() => request('/enabled', 'PUT', { enabled: !data.enabled }), data.enabled ? 'Todos os anúncios foram desativados.' : 'Publicidade ativada. As campanhas seguem suas datas e pausas.'); }}>{data.enabled ? 'Desativar todos os anúncios' : 'Ativar todos os anúncios'}</Button></section>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{settings.placements.map(placement => {
        const active = data.campaigns.filter(c => status(c.content) === 'Em exibição' && c.content.placements.includes(placement.id)).length;
        return <Card key={placement.id} className="gap-3 shadow-none"><CardHeader><CardTitle className="text-base">{placement.name}</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{active} <span className="text-sm font-normal text-muted-foreground">de {data.settings.placements.find(p => p.id === placement.id)?.capacity} vagas em uso agora</span></p><p className="mt-2 text-xs text-muted-foreground">Os agendamentos também respeitam esse limite.</p></CardContent></Card>;
      })}</div>
      <Card className="shadow-none"><CardHeader><CardTitle>Limites e rotação</CardTitle></CardHeader><CardContent><form className="space-y-4" onSubmit={event => { event.preventDefault(); void run(() => request('/settings', 'PUT', settings), 'Configurações salvas.'); }}><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6"><div className="space-y-2"><Label htmlFor="ads-max">Máximo de cadastros</Label><Input id="ads-max" type="number" min={1} max={500} required value={settings.maxCampaigns} onChange={event => setSettings({ ...settings, maxCampaigns: Number(event.target.value) })} /></div><div className="space-y-2"><Label htmlFor="ads-interval">Rotação em segundos</Label><Input id="ads-interval" type="number" min={15} max={300} required value={settings.rotationSeconds} onChange={event => setSettings({ ...settings, rotationSeconds: Number(event.target.value) })} /></div>{settings.placements.map(placement => <div key={placement.id} className="space-y-2"><Label htmlFor={`capacity-${placement.id}`}>{placement.name}</Label><Input id={`capacity-${placement.id}`} type="number" min={1} max={20} required value={placement.capacity} onChange={event => setSettings({ ...settings, placements: settings.placements.map(p => p.id === placement.id ? { ...p, capacity: Number(event.target.value) } : p) })} /></div>)}</div><p className="text-xs leading-relaxed text-muted-foreground">Cada espaço mostra um anúncio por vez. As vagas limitam quantas campanhas podem participar da rotação no mesmo período.</p><Button variant="outline" disabled={busy} type="submit">Salvar configurações</Button></form></CardContent></Card>
      <section className="overflow-hidden rounded-xl border bg-card" aria-label="Campanhas"><div className="flex items-center justify-between border-b px-4 py-3"><h2 className="font-semibold">Campanhas</h2><span className="text-xs text-muted-foreground">{data.campaigns.length} de {data.settings.maxCampaigns} cadastros</span></div>{!data.campaigns.length ? <div className="space-y-3 p-6 text-sm"><Megaphone className="size-6 text-primary" /><p>Nenhum anúncio cadastrado. Crie um e escolha onde exibi-lo.</p></div> : <ul className="divide-y">{data.campaigns.map(campaign => <li key={campaign.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center"><div className="min-w-0 flex-1 space-y-2"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{campaign.content.title || campaign.content.company}</h3><Badge variant={status(campaign.content) === 'Em exibição' ? 'default' : 'secondary'}>{status(campaign.content)}</Badge></div><p className="text-xs text-muted-foreground">{campaign.content.company} · {campaign.content.placements.map(id => settings.placements.find(p => p.id === id)?.name).join(', ')} · Prioridade {campaign.content.weight}</p><p className="text-xs text-muted-foreground">{new Date(campaign.content.startsAt).toLocaleString('pt-BR')} até {campaign.content.endsAt ? new Date(campaign.content.endsAt).toLocaleString('pt-BR') : 'sem data de término'}</p><p className="text-xs">{format(campaign.impressions)} exibições · {format(campaign.clicks)} cliques</p></div><div className="flex flex-wrap gap-2"><Button variant="outline" size="sm" disabled={busy} onClick={() => { void run(() => request(`/campaigns/${campaign.id}`, 'PUT', { ...campaign.content, enabled: !campaign.content.enabled }), campaign.content.enabled ? 'Anúncio pausado.' : 'Anúncio habilitado.'); }}>{campaign.content.enabled ? 'Pausar' : 'Habilitar'}</Button><Button variant="outline" size="icon-sm" aria-label={`Editar ${campaign.content.title || campaign.content.company}`} disabled={busy} onClick={() => edit(campaign)}><Pencil /></Button><Button variant="ghost" size="icon-sm" aria-label={`Excluir ${campaign.content.title || campaign.content.company}`} disabled={busy} onClick={() => setDeleting(campaign)}><Trash2 /></Button></div></li>)}</ul>}</section>
      <p className="text-xs leading-relaxed text-muted-foreground">Contamos uma exibição quando metade do anúncio fica visível por pelo menos um segundo e a aba está aberta. Os totais não representam pessoas únicas. Duas campanhas se alternam. Com três ou mais, a prioridade influencia a escolha. Quando há outra opção, o mesmo anúncio não aparece em trocas seguidas.</p>
    </>}

    <Dialog open={open} onOpenChange={value => { if (!busy && !uploading) setOpen(value); }}><DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-4xl"><DialogHeader><DialogTitle>{editing ? 'Editar anúncio' : 'Novo anúncio'}</DialogTitle><DialogDescription>Escolha a mensagem, os espaços e o período de exibição.</DialogDescription></DialogHeader><form onSubmit={save} className="space-y-5"><div className="grid gap-6 md:grid-cols-2"><div className="space-y-4">
      <div className="space-y-2"><Label htmlFor="ad-format">Formato do anúncio</Label><Select value={imageOnly ? 'image' : 'text'} onValueChange={value => { setImageOnly(value === 'image'); if (value === 'image') setDraft(current => ({ ...current, title: '', description: '' })); }}><SelectTrigger id="ad-format"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="text">Imagem e texto</SelectItem><SelectItem value="image">Somente imagem e link</SelectItem></SelectContent></Select><p className="text-xs text-muted-foreground">{imageOnly ? draft.placements.includes('site-top-banner') ? 'No topo, use uma arte panorâmica para ocupar a faixa acima do menu.' : 'A imagem preenche o anúncio. Clique nela para abrir o site. Use uma imagem horizontal na proporção 4:1.' : 'A imagem aparece ao lado do título e da descrição.'}</p></div>
      <div className="space-y-2"><Label htmlFor="ad-company">{imageOnly ? 'Empresa (opcional, para identificar no painel)' : 'Empresa'}</Label><Input id="ad-company" required={!imageOnly} maxLength={80} value={draft.company} onChange={event => change('company', event.target.value)} /></div>
      {!imageOnly && <><div className="space-y-2"><Label htmlFor="ad-title">Título</Label><Input id="ad-title" required maxLength={120} value={draft.title} onChange={event => change('title', event.target.value)} /></div>
      <div className="space-y-2"><Label htmlFor="ad-description">Descrição</Label><Textarea id="ad-description" required maxLength={500} value={draft.description} onChange={event => change('description', event.target.value)} /></div></>}
      <div className="space-y-2"><Label htmlFor="ad-url">Site de destino</Label><Input id="ad-url" type="url" required maxLength={1000} placeholder="https://exemplo.com.br" value={draft.url} onChange={event => change('url', event.target.value)} /></div>
      <div className="space-y-2"><Label htmlFor="ad-image">Link da imagem</Label><Input id="ad-image" maxLength={1000} placeholder="https://exemplo.com.br/imagem.png" value={draft.imageUrl || ''} onChange={event => change('imageUrl', event.target.value || null)} /></div>
      <div className="space-y-2"><Label htmlFor="ad-file"><ImagePlus className="size-4" />Ou envie uma imagem</Label><Input id="ad-file" type="file" accept="image/png,image/jpeg,image/webp" disabled={uploading} onChange={event => { void upload(event.target.files?.[0]); }} /><p className="text-xs text-muted-foreground">{uploading ? 'Enviando imagem…' : 'PNG, JPG ou WebP de até 2 MB. O arquivo substitui o link da imagem.'}</p></div>
    </div><div className="space-y-5"><section className={`overflow-hidden rounded-xl border bg-muted/30 ${imageOnly ? '' : 'space-y-3 p-4'}`} aria-label="Prévia do anúncio">{imageOnly ? draft.imageUrl ? <img src={draft.imageUrl} alt="Prévia do anúncio com imagem completa" className={draft.placements.includes('site-top-banner') ? 'mx-auto h-auto max-h-12 w-full object-contain' : 'aspect-[4/1] w-full object-cover'} /> : <p className="p-5 text-sm text-muted-foreground">Adicione uma imagem para ver a prévia.</p> : <>{draft.imageUrl && <img src={draft.imageUrl} alt="Prévia da imagem" className="aspect-video w-40 rounded-lg bg-muted object-contain" />}<h3 className="font-semibold">{draft.title || 'Título do anúncio'}</h3><p className="break-words text-sm text-muted-foreground">{draft.description || 'A descrição aparece aqui.'}</p><Button type="button" size="sm" disabled>Abrir site<ArrowUpRight /></Button></>}</section>
      <fieldset className="space-y-3"><legend className="mb-3 text-sm font-medium">Onde exibir</legend>{data?.settings.placements.map(placement => <div key={placement.id} className="flex items-center gap-2"><Checkbox id={`ad-${placement.id}`} checked={draft.placements.includes(placement.id)} onCheckedChange={checked => change('placements', checked ? [...draft.placements, placement.id] : draft.placements.filter(id => id !== placement.id))} /><Label htmlFor={`ad-${placement.id}`}>{placement.name}</Label></div>)}</fieldset>
      <div className="space-y-2"><Label htmlFor="ad-weight">Prioridade de rotação</Label><Input id="ad-weight" type="number" required min={1} max={10} value={draft.weight} onChange={event => change('weight', Number(event.target.value))} /><p className="text-xs text-muted-foreground">De 1 a 10. Anúncios com maior prioridade têm mais chances na seleção.</p></div>
      <div className="space-y-2"><Label htmlFor="ad-start">Início</Label><Input id="ad-start" type="datetime-local" required value={localDate(draft.startsAt)} onChange={event => { if (event.target.value) change('startsAt', new Date(event.target.value).toISOString()); }} /></div>
      <div className="space-y-2"><Label htmlFor="ad-end">Término (opcional)</Label><Input id="ad-end" type="datetime-local" value={localDate(draft.endsAt)} onChange={event => change('endsAt', event.target.value ? new Date(event.target.value).toISOString() : null)} /></div>
      <div className="flex items-center gap-2"><Checkbox id="ad-enabled" checked={draft.enabled} onCheckedChange={checked => change('enabled', checked === true)} /><Label htmlFor="ad-enabled">Habilitar campanha no período escolhido</Label></div>
    </div></div>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}<DialogFooter><Button variant="outline" type="button" disabled={busy || uploading} onClick={() => setOpen(false)}>Cancelar</Button><Button type="submit" disabled={busy || uploading || draft.placements.length === 0}>{busy ? 'Salvando…' : 'Salvar anúncio'}</Button></DialogFooter></form></DialogContent></Dialog>
    <Dialog open={!!deleting} onOpenChange={value => { if (!value && !busy) setDeleting(null); }}><DialogContent><DialogHeader><DialogTitle>Excluir anúncio?</DialogTitle><DialogDescription>O anúncio {deleting?.content.title || deleting?.content.company} e os contadores desta campanha serão excluídos. Não é possível desfazer essa ação.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" disabled={busy} onClick={() => setDeleting(null)}>Cancelar</Button><Button variant="destructive" disabled={busy} onClick={() => { if (deleting) void run(async () => { await request(`/campaigns/${deleting.id}`, 'DELETE'); setDeleting(null); }, 'Anúncio excluído.'); }}>Excluir anúncio</Button></DialogFooter></DialogContent></Dialog>
  </article>;
}
