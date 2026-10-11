import { BookOpen, ArrowUpRight } from 'lucide-react';
import { categories, labels } from './catalog';
import { LoadingImage } from './LoadingImage';

const fields = ['Categoria do guia', 'Link', 'Assuntos', 'Tecnologias', 'Idiomas', 'Localização', 'Tipo de instituição', 'Modalidade', 'Plataformas'];

export function DiscussionBody({ body, title }: { body: string; title: string }) {
  const suggestion = /^\s*(?:\*\*)?Categoria do guia:/m.test(body);
  const details: { label: string; value: string }[] = [];
  const imageMatch = body.match(/(?:\*\*)?Imagem:\**\s*(\S+)/i);
  const imageCandidate = imageMatch?.[1].trim().replace(/[.,)]+$/, '');
  const imageUrl = imageCandidate && (/^\/api\/contributions\/images\/[a-f0-9]{32}\.(png|jpg|webp)$/.test(imageCandidate)
    || URL.canParse(imageCandidate) && new URL(imageCandidate).protocol === 'https:' && !new URL(imageCandidate).username && !new URL(imageCandidate).password)
    ? imageCandidate : null;
  const paragraphs = body.split('\n').filter(line => {
    if (/^\s*(?:\*\*)?Imagem:\**\s*\S+/i.test(line)) return false;
    if (!suggestion) return true;
    const match = line.trim().match(/^(?:\*\*)?([^:]+):(?:\*\*)?\s*(.+)$/);
    if (!match || !fields.includes(match[1])) return true;
    details.push({ label: match[1], value: match[2] });
    return false;
  });
  if (suggestion && paragraphs[0]?.replace(/^#+\s*/, '').trim() === title.replace(/^Sugestão:\s*/, '').trim()) paragraphs.shift();
  const content = paragraphs.join('\n').trim();
  return <div className="space-y-5">
    {imageUrl && <LoadingImage src={imageUrl} alt={`Imagem de ${title}`} loading="eager" className="max-h-[32rem] w-full overflow-hidden rounded-lg bg-muted" imageClassName="max-h-[32rem] w-full object-contain" />}
    {details.length > 0 && <section aria-label="Detalhes da indicação" className="overflow-hidden rounded-lg border bg-muted/20">
      <h3 className="flex items-center gap-2 border-b px-4 py-3 text-sm font-medium"><BookOpen className="size-4 text-muted-foreground" />Detalhes da indicação</h3>
      <dl className="grid gap-x-6 gap-y-3 p-4 text-sm sm:grid-cols-2">{details.map(detail => {
        const isLink = detail.label === 'Link' && URL.canParse(detail.value) && ['https:', 'http:'].includes(new URL(detail.value).protocol);
        const value = detail.label === 'Categoria do guia' ? categories.find(c => c.id === detail.value)?.name ?? detail.value : ['Assuntos', 'Tecnologias'].includes(detail.label) ? detail.value.split(',').map(v => labels[v.trim()] ?? v.trim()).join(', ') : detail.value;
        return <div key={detail.label} className="min-w-0 space-y-1"><dt className="text-xs text-muted-foreground">{detail.label}</dt><dd className="break-words [overflow-wrap:anywhere]">{isLink ? <a href={detail.value} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary underline underline-offset-4">Abrir site<ArrowUpRight className="size-3.5" /></a> : value}</dd></div>;
      })}</dl>
    </section>}
    {content && <div className="space-y-3">{content.split(/\n\s*\n/).map((paragraph, index) => <p key={index} className="whitespace-pre-wrap break-words text-sm leading-7 [overflow-wrap:anywhere]">{paragraph}</p>)}</div>}
  </div>;
}
