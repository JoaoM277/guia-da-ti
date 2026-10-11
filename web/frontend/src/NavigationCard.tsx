import { BookOpen, GraduationCap, Newspaper, Headphones, Video, Users, CalendarDays, Code, Wrench, BriefcaseBusiness, FlaskConical, FileText, Mail, Map, Award, HeartHandshake, Info, type LucideIcon } from 'lucide-react';

const details: Record<string, { icon: LucideIcon; description: string }> = {
  courses: { icon: GraduationCap, description: 'Encontre cursos em outros sites.' },
  platforms: { icon: BookOpen, description: 'Descubra plataformas de estudo.' },
  universities: { icon: GraduationCap, description: 'Consulte instituições e cursos de TI.' },
  bootcamps: { icon: Code, description: 'Encontre programas de formação intensiva.' },
  roadmaps: { icon: Map, description: 'Links para roteiros de estudo.' },
  books: { icon: BookOpen, description: 'Encontre livros sobre tecnologia.' },
  certifications: { icon: Award, description: 'Consulte programas de certificação.' },
  news: { icon: Newspaper, description: 'Encontre sites de notícias de tecnologia.' },
  blogs: { icon: FileText, description: 'Descubra blogs sobre tecnologia.' },
  newsletters: { icon: Mail, description: 'Encontre newsletters para acompanhar.' },
  podcasts: { icon: Headphones, description: 'Links para podcasts de tecnologia.' },
  youtube: { icon: Video, description: 'Descubra canais de tecnologia no YouTube.' },
  creators: { icon: Users, description: 'Encontre perfis de criadores de conteúdo.' },
  articles: { icon: FileText, description: 'Links para artigos em outros sites.' },
  tutorials: { icon: Code, description: 'Encontre tutoriais em outros sites.' },
  studies: { icon: FlaskConical, description: 'Links para pesquisas e publicações.' },
  'case-studies': { icon: BriefcaseBusiness, description: 'Encontre estudos de caso publicados.' },
  reports: { icon: FileText, description: 'Links para relatórios de tecnologia.' },
  communities: { icon: Users, description: 'Descubra outras comunidades de tecnologia.' },
  events: { icon: CalendarDays, description: 'Encontre eventos e seus sites oficiais.' },
  meetups: { icon: Users, description: 'Descubra grupos e encontros locais.' },
  conferences: { icon: CalendarDays, description: 'Consulte conferências de tecnologia.' },
  hackathons: { icon: Code, description: 'Encontre hackathons e suas inscrições.' },
  tools: { icon: Wrench, description: 'Descubra ferramentas e seus sites.' },
  'open-source': { icon: Code, description: 'Links para projetos de código aberto.' },
  challenges: { icon: Award, description: 'Encontre sites com desafios de tecnologia.' },
  labs: { icon: FlaskConical, description: 'Descubra plataformas com laboratórios práticos.' },
  jobs: { icon: BriefcaseBusiness, description: 'Encontre sites para consultar vagas de trabalho e estágio.' },
  scholarships: { icon: BookOpen, description: 'Consulte sites e programas de bolsas de estudo.' },
  mentoring: { icon: Users, description: 'Encontre programas de mentoria.' },
  volunteering: { icon: HeartHandshake, description: 'Encontre programas e plataformas de voluntariado.' },
  about: { icon: Info, description: 'Conheça o Guia e seus mantenedores.' },
  supporters: { icon: HeartHandshake, description: 'Quem apoia o Guia.' },
};

export function NavigationCard({ id, name }: { id: string; name: string }) {
  const { icon: Icon, description } = details[id] || { icon: BookOpen, description: 'Encontre links nesta categoria.' };
  return <>
    <span className="navigation-card-icon"><Icon className="size-5" aria-hidden="true" /></span>
    <span className="min-w-0 space-y-1"><span className="block text-sm font-medium">{name}</span><span className="block text-xs leading-relaxed text-muted-foreground">{description}</span></span>
  </>;
}
