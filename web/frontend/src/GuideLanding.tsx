import { ArrowUpRight, BookOpen, BriefcaseBusiness, Code, Mail, MessageSquare, Newspaper, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AboutGuide } from './UserGuide';
import { CommunityMetrics } from './CommunityMetrics';
import { Maintainers } from './Maintainers';
import { Community } from './Community';

const paths = [
  { label: 'Quero estudar', description: 'Plataformas de cursos, livros e caminhos de estudo.', href: '/plataformas', icon: BookOpen },
  { label: 'Quero me informar', description: 'Notícias e publicações para acompanhar tecnologia.', href: '/noticias', icon: Newspaper },
  { label: 'Quero encontrar pessoas', description: 'Comunidades para conversar e trocar experiências.', href: '/comunidades', icon: Users },
  { label: 'Quero praticar', description: 'Desafios e projetos para aplicar o que aprendi.', href: '/desafios', icon: Code },
  { label: 'Quero crescer na carreira', description: 'Sites de vagas e oportunidades de mentoria.', href: '/vagas', icon: BriefcaseBusiness },
  { label: 'Quero trocar uma ideia', description: 'O fórum do Guia para perguntar e compartilhar.', href: '/', icon: MessageSquare },
];

export function GuideLanding({ dark }: { dark: boolean }) {
  return <article className="mx-auto w-full max-w-5xl space-y-12 sm:space-y-16">
    <section aria-labelledby="por-onde-comecar" className="space-y-6">
      <div className="max-w-2xl space-y-2">
        <p className="text-xs font-medium uppercase tracking-widest text-primary">Seu próximo passo</p>
        <h2 id="por-onde-comecar" className="scroll-mt-28 text-2xl font-semibold tracking-tight sm:text-3xl">Por onde você quer começar?</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">Está começando na área ou procura algo para o trabalho? Escolha um caminho para seguir agora.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {paths.map(({ label, description, href, icon: Icon }) => <a key={href} href={href} className="group rounded-2xl border bg-card p-5 transition-colors hover:border-primary/50 hover:bg-accent/30 focus-visible:outline-2 focus-visible:outline-ring">
          <div className="mb-5 flex items-center justify-between"><span className="flex size-10 items-center justify-center rounded-xl border border-primary/20 bg-accent/50 text-primary"><Icon className="size-5" /></span><ArrowUpRight aria-hidden="true" className="size-4 text-muted-foreground group-hover:text-primary" /></div>
          <h3 className="mb-2 font-semibold">{label}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        </a>)}
      </div>
    </section>

    <section id="conheca-o-guia" aria-labelledby="como-o-guia-funciona" className="scroll-mt-28 space-y-6">
      <div className="max-w-2xl space-y-2">
        <p className="text-xs font-medium uppercase tracking-widest text-primary">Conheça o projeto</p>
        <h2 id="como-o-guia-funciona" className="text-2xl font-semibold tracking-tight sm:text-3xl">Links para descobrir. Um fórum para conversar.</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">Veja o que você encontra no Guia e como suas indicações ajudam outras pessoas.</p>
      </div>
      <AboutGuide dark={dark} />
    </section>

    <CommunityMetrics />

    <section className="space-y-12">
      <section aria-labelledby="mantenedores-heading" className="space-y-5">
        <header className="max-w-2xl space-y-2">
          <p className="text-xs font-medium uppercase tracking-widest text-primary">A comunidade</p>
          <h2 id="mantenedores-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">Mantenedores</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">Pessoas que ajudam a construir o Guia e cuidar do catálogo.</p>
        </header>
        <Maintainers embedded />
      </section>
      <section aria-labelledby="apoiadores-heading" className="space-y-5">
        <header className="max-w-2xl space-y-2">
          <p className="text-xs font-medium uppercase tracking-widest text-primary">Apoio ao projeto</p>
          <h2 id="apoiadores-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">Empresas apoiadoras</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">Empresas que apoiam a continuidade do Guia da TI.</p>
        </header>
        <Community area="supporters" embedded />
      </section>
    </section>

    <section aria-labelledby="fale-com-o-guia" className="rounded-3xl border bg-card p-6 sm:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl space-y-2">
          <h2 id="fale-com-o-guia" className="text-2xl font-semibold tracking-tight">Fale com a gente</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">Peça a remoção de um conteúdo, relate um bug ou converse sobre uma parceria.</p>
          <div className="flex flex-col items-start gap-2 pt-1">
            <a href="mailto:devlucaspedro@gmail.com" className="text-sm font-medium text-foreground underline underline-offset-4 hover:text-primary">devlucaspedro@gmail.com</a>
            <a href="/divulgue" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground underline underline-offset-4 transition-colors hover:text-primary">Divulgue um projeto ou conteúdo no Guia<ArrowUpRight aria-hidden="true" className="size-4 shrink-0" /></a>
          </div>
        </div>
        <Button asChild className="shrink-0"><a href="mailto:devlucaspedro@gmail.com"><Mail />Enviar e-mail</a></Button>
      </div>
    </section>

  </article>;
}
