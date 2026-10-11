import {Plus} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {openContribution} from './contribution-actions';
const nouns:Record<string,string>={courses:'curso',platforms:'plataforma',universities:'faculdade',bootcamps:'bootcamp',roadmaps:'roadmap',books:'livro',
  certifications:'certificação',news:'portal de notícias',blogs:'blog',newsletters:'newsletter',podcasts:'podcast',creators:'criador',youtube:'canal',
  articles:'artigo',tutorials:'tutorial',studies:'estudo','case-studies':'estudo de caso',reports:'relatório',communities:'comunidade',events:'evento',
  meetups:'meetup',conferences:'conferência',hackathons:'hackathon',tools:'ferramenta','open-source':'projeto de código aberto',challenges:'desafio',
  labs:'laboratório',jobs:'site de vagas',scholarships:'site ou programa de bolsas',mentoring:'programa de mentoria',volunteering:'programa de voluntariado'};
export function SuggestResource({type,iconOnlyOnMobile=false}:{type?:string;iconOnlyOnMobile?:boolean}) {
  const noun=type?nouns[type]:undefined;
  const label=noun?'Sugerir '+noun:'Contribuir com o guia';
  return <Button aria-label={label} variant="default" size="default" className={iconOnlyOnMobile?'size-9 px-0 sm:size-auto sm:px-4':undefined} onClick={() => openContribution(type)}><Plus className="size-4" strokeWidth={2} /><span className={iconOnlyOnMobile?'sr-only sm:not-sr-only':undefined}>{label}</span></Button>;
}
