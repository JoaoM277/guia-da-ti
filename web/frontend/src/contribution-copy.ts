const subjects: Record<string, string> = {
  courses: 'do curso', platforms: 'da plataforma de cursos', universities: 'da faculdade', bootcamps: 'do bootcamp',
  roadmaps: 'do site de roadmaps', books: 'do livro', certifications: 'da certificação', news: 'do site de notícias',
  blogs: 'do blog', newsletters: 'da newsletter', podcasts: 'do podcast', youtube: 'do canal no YouTube',
  creators: 'do criador', articles: 'do site de artigos', tutorials: 'do site de tutoriais', studies: 'do site de estudos',
  'case-studies': 'do site de estudos de caso', reports: 'do site de relatórios', communities: 'da comunidade',
  events: 'do site de eventos', meetups: 'do site de encontros', conferences: 'do site de conferências',
  hackathons: 'do site de hackathons', tools: 'da ferramenta', 'open-source': 'do projeto', challenges: 'do site de desafios',
  labs: 'do laboratório', jobs: 'do site de vagas', scholarships: 'do programa de bolsas',
  mentoring: 'do programa de mentoria', volunteering: 'do programa de voluntariado',
};

export function contributionCopy(type: string) {
  const subject = subjects[type] || 'da indicação';
  const profile = type === 'creators' || type === 'youtube';
  return {
    name: `Nome ${subject}`,
    url: profile ? `Link do ${type === 'youtube' ? 'canal no YouTube' : 'perfil do criador'}` : `Link principal ${subject}`,
    summary: `Apresentação ${subject}`,
    description: `Detalhes ${subject}`,
    urlHelp: profile ? 'Cole o endereço do perfil que você quer indicar.' : type === 'communities'
      ? 'Informe o site da comunidade ou seu principal link de entrada. Os links das outras plataformas ficam na etapa Plataformas da comunidade.'
      : 'Cole o link oficial para a pessoa acessar essa indicação.',
    summaryHelp: type === 'communities' ? 'Em uma frase, conte para quem é a comunidade e o que as pessoas encontram nela.'
      : profile ? 'Em uma frase, conte sobre o conteúdo desse perfil.' : 'Em uma frase, diga o que a pessoa encontra nesse site.',
    descriptionHelp: type === 'communities' ? 'Conte o que a comunidade faz e como participar.'
      : profile ? 'Conte que tipo de conteúdo o perfil publica e para quem ele pode ser útil.'
      : 'Diga para quem essa indicação pode ser útil e informe se há custo ou inscrição.',
  };
}
