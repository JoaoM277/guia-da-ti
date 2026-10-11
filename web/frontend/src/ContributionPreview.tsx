import { ImageIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function ContributionPreview({ name, summary, description, category, area, languages, image, url, details = [] }: {
  name: string; summary: string; description: string; category: string; area: string; languages: string[]; image: string; url: string; details?: [string, string][];
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [image]);
  return <aside aria-label="Como a sugestão aparecerá no Guia" className="min-w-0 md:sticky md:top-0">
    <Card className="gap-0 overflow-hidden py-0">
      <div className="flex aspect-video items-center justify-center bg-muted">{image && !failed ? <img src={image} alt="Imagem da sugestão" className="h-full w-full object-cover" onError={() => setFailed(true)} /> : <div className="grid justify-items-center gap-2 text-muted-foreground"><ImageIcon aria-hidden="true" /><span className="text-xs">{failed ? 'Não foi possível carregar a imagem' : 'Adicione uma imagem'}</span></div>}</div>
      <CardHeader className="gap-3 p-4">{category && <Badge variant="secondary" className="w-fit">{category}</Badge>}<CardTitle className="break-words">{name || 'Nome do recurso'}</CardTitle><p className="break-words text-sm text-muted-foreground">{summary || 'O resumo aparece aqui'}</p></CardHeader>
      <CardContent className="space-y-3 p-4 pt-0"><p className="line-clamp-6 whitespace-pre-wrap break-words text-sm">{description}</p>{area && <Badge variant="outline">{area}</Badge>}<p className="text-xs text-muted-foreground">{languages.join(', ')}</p><dl className="space-y-2 text-xs">{details.filter(([,value]) => value).map(([label,value]) => <div key={label}><dt className="text-muted-foreground">{label}</dt><dd className="break-words">{value}</dd></div>)}</dl>{url && <p className="break-all text-xs text-muted-foreground">{url}</p>}</CardContent>
    </Card>
  </aside>;
}
