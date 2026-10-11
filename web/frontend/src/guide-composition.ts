import { gsap } from 'gsap';
import './guide-composition.css';
import { animationGuideSteps } from './guide-steps';
import runtimeUrl from '../node_modules/@hyperframes/core/dist/hyperframe.runtime.iife.js?url';
import { macCursorSvg } from './mac-cursor';

const parameters = new URLSearchParams(location.search);
const step = animationGuideSteps.find(item => item.id === parameters.get('secao')) ?? animationGuideSteps[0];
document.documentElement.classList.toggle('dark', parameters.get('tema') === 'escuro');
const root = document.getElementById('guide-scene')!;

const row = (title: string, detail: string, icon: string) => `<div class="result"><span class="result-icon">${icon}</span><div><strong>${title}</strong><small>${detail}</small></div><span class="row-arrow">↗</span></div>`;
const search = (text: string) => `<div class="search"><span>⌕</span><span class="query">${text}</span><span class="search-hint">Pesquisar</span></div>`;
const tabs = (items: string[]) => `<div class="tabs">${items.map((label, index) => `<span class="tab ${index === 1 ? 'target' : ''}">${label}</span>`).join('')}</div>`;
const completion = (text: string) => `<div class="completion"><span>✓</span>${text}</div>`;

const scenes: Partial<Record<typeof step.id, string>> = {
  explore: `<div class="scene-title"><span>Explore o Guia</span><small>Links para o seu próximo passo</small></div>
    ${tabs(['Estudar', 'Se informar', 'Praticar', 'Carreira'])}${search('Roadmaps')}
    <div class="results">${row('roadmap.sh', 'Trilhas para orientar seus estudos', '↗')}${row('Livros', 'Referências para aprender e consultar', '▤')}</div>${completion('Encontre um link pelo nome ou assunto')}`,
  communities: `<div class="scene-title"><span>Comunidades</span><small>Encontre pessoas perto de você</small></div>
    ${tabs(['Geral', 'WhatsApp', 'Discord', 'LinkedIn'])}<div class="filter-panel"><div><small>LOCALIZAÇÃO</small><div class="regions"><span>Estados</span><span class="target">Brasil inteiro</span><span>Internacional</span></div></div><div class="map-dots"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
    <div class="results">${row('FullDev', 'Comunidade nacional · Várias plataformas', 'F')}</div>${completion('Abra a comunidade e escolha um grupo')}`,
  creators: `<div class="scene-title"><span>Criadores</span><small>Encontre conteúdo para acompanhar</small></div>
    ${tabs(['YouTube', 'Instagram', 'LinkedIn', 'TikTok'])}${search('Carreira')}
    <div class="results"><div class="profile result"><div class="avatar">LP</div><div><strong>devlucaspedro</strong><small>Conteúdo de tecnologia</small><span class="chip">Carreira</span></div><span class="profile-link target">Ver perfil ↗</span></div></div>${completion('Acompanhe o perfil na rede do criador')}`,
  study: `<div class="scene-title"><span>Plataformas de cursos</span><small>Compare antes de escolher</small></div>
    <div class="study-toolbar"><span class="target">Mais hypado⌄</span><span>▦ Cards</span><span>☷ Lista</span></div><div class="study-cards results"><div class="study-card"><div class="cover">freeCodeCamp</div><strong>freeCodeCamp</strong><small>Cursos e prática em programação</small><div class="stars">★★★★★</div></div><div class="study-card"><div class="cover cover-alt">MIT</div><strong>OpenCourseWare</strong><small>Conteúdo de cursos do MIT</small><div class="stars">★★★★★</div></div></div>
    ${completion('Leia os detalhes e use Abrir site')}`,
  inform: `<div class="scene-title"><span>Se informar</span><small>Acompanhe tecnologia na fonte</small></div>${tabs(['Notícias', 'Blogs', 'Newsletters', 'Podcasts'])}${search('Tecnologia')}
    <div class="results">${row('Portais de notícias', 'Leia as publicações no site de origem', '▤')}${row('Artigos e tutoriais', 'Encontre referências para consultar', '↗')}</div>${completion('Escolha uma fonte para ler ou ouvir')}`,
  networking: `<div class="scene-title"><span>Networking</span><small>Conheça pessoas e troque experiências</small></div>${tabs(['Eventos', 'Meetups', 'Conferências', 'Hackathons'])}${search('Encontros de tecnologia')}
    <div class="results">${row('Encontros da comunidade', 'Veja os detalhes e a programação', '◷')}${row('Hackathons', 'Conheça os desafios e as inscrições', '⌘')}</div>${completion('Confirme a inscrição no site do evento')}`,
  practice: `<div class="scene-title"><span>Praticar</span><small>Transforme estudo em experiência</small></div>${tabs(['Ferramentas', 'Open source', 'Desafios', 'Laboratórios'])}${search('Projetos')}
    <div class="results">${row('Projetos de código aberto', 'Encontre projetos para explorar', '⌘')}${row('Desafios e laboratórios', 'Pratique com os recursos disponíveis', '↗')}</div>${completion('Acesse o recurso para começar a praticar')}`,
  career: `<div class="scene-title"><span>Carreira</span><small>Encontre seu próximo passo</small></div>${tabs(['Sites de vagas', 'Bolsas', 'Mentoria', 'Voluntariado'])}${search('Sites e programas')}
    <div class="results">${row('Sites de vagas', 'Consulte as oportunidades na fonte', '▣')}${row('Programas de bolsas e mentoria', 'Confira as condições e os prazos', '↗')}</div>${completion('Participe pela página de origem')}`,
  forum: `<div class="scene-title"><span>Fórum</span><small>Converse sobre tecnologia</small></div>${search('Como começar a programar?')}
    <div class="conversation results"><div class="comment"><div class="small-avatar">?</div><div><strong>Por onde começar?</strong><small>Compartilhe uma dúvida com a comunidade</small></div></div><div class="reply"><div class="small-avatar">↳</div><div><strong>Troque experiências</strong><small>Leia, responda e participe da conversa</small></div></div><div class="comment-input"><span>Escreva seu comentário…</span><span class="target">Comentar</span></div></div>${completion('Entre com GitHub para participar')}`,
  contribute: `<div class="scene-title"><span>Sugerir recurso</span><small>Uma indicação sua pode ajudar alguém</small></div><div class="wizard"><div class="wizard-form"><div class="wizard-progress"><i></i><i></i><i></i></div><small>CONTE SOBRE SUA INDICAÇÃO</small><strong>Qual é o nome?</strong><div class="fake-input">Minha indicação</div><span class="target">Continuar →</span></div><div class="preview results"><div class="preview-cover">↗</div><span class="chip">Prévia</span><strong>Minha indicação</strong><small>A prévia atualiza enquanto você preenche</small></div></div>${completion('Confira a prévia e envie para revisão')}`,
  about: `<div class="scene-title"><span>Sobre o Guia da TI</span><small>Feito pela comunidade</small></div>${tabs(['Catálogo', 'Fórum', 'Mantenedores'])}${search('Links de tecnologia')}
    <div class="results">${row('Conteúdo no site de origem', 'Explore o catálogo e encontre uma referência', '↗')}${row('Trocas no fórum', 'Converse com a comunidade aqui no Guia', '↳')}</div>${completion('Explore sem precisar criar uma conta')}`,
  transparency: `<div class="scene-title"><span>Aberto e colaborativo</span><small>Acompanhe o catálogo no GitHub</small></div>${tabs(['Cadastros', 'Histórico', 'Mantenedores'])}
    <div class="results">${row('Comunidade sugere', 'Pessoas indicam recursos e correções', '+')}${row('Mantenedores revisam', 'As indicações são revisadas antes de entrar no catálogo', '✓')}${row('Catálogo público', 'Consulte o histórico das mudanças', '↗')}</div>${completion('Confira também a data de atualização de cada item')}`,
  'github-account': `<div class="scene-title"><span>Criar conta no GitHub</span><small>Não precisa saber programar</small></div><div class="wizard"><div class="wizard-form"><small>CRIE SUA CONTA</small><div class="fake-input">Seu e-mail</div><div class="fake-input">Escolha uma senha</div><span class="target">Continuar →</span></div><div class="preview results"><div class="preview-cover">✉</div><strong>Confirme seu e-mail</strong><small>Siga as instruções do GitHub para confirmar a conta</small></div></div>${completion('Depois, volte ao Guia para entrar')}`,
  'github-login': `<div class="scene-title"><span>Entre para participar</span><small>Entre com o GitHub</small></div>${tabs(['Guia da TI', 'Entrar com GitHub'])}
    <div class="results">${row('A janela do GitHub abre', 'Entre com a conta que você criou', '↗')}${row('Revise a autorização', 'Confira as permissões antes de continuar', '✓')}${row('Volte para o Guia', 'Seu perfil aparece depois do login', '↳')}</div>${completion('A senha é informada na página do GitHub')}`,
  'github-participate': `<div class="scene-title"><span>Você entrou no Guia</span><small>Participe com sua conta</small></div>${tabs(['Ler conversas', 'Responder', 'Sugerir recurso'])}${search('Uma dúvida sobre tecnologia')}
    <div class="results">${row('Participe do fórum', 'Abra tópicos e responda às conversas', '↳')}${row('Indique um recurso', 'Envie uma sugestão para revisão', '+')}</div>${completion('Seu nome acompanha suas publicações')}`,
};

type SectionDemo = { items: string[]; benefits: string[]; filters: string[]; useTitle: string; useDetail: string; useAction: string };
const sectionDemos: Partial<Record<typeof step.id, SectionDemo>> = {
  communities: { items: ['Grupos para conversar', 'Encontros e trocas', 'Comunidades de várias regiões'], benefits: ['Tire dúvidas com outras pessoas', 'Compartilhe experiências'], filters: ['Plataforma', 'Localização', 'Público'], useTitle: 'Entre no grupo da comunidade', useDetail: 'Leia as regras e escolha onde participar', useAction: 'Abrir comunidade' },
  creators: { items: ['Perfis em redes sociais', 'Tutoriais e experiências', 'Conteúdo para acompanhar'], benefits: ['Conheça outras perspectivas', 'Encontre referências para estudar'], filters: ['Rede social', 'Tipo de conteúdo', 'Assunto'], useTitle: 'Perfil de criador', useDetail: 'Conteúdos sobre tecnologia e carreira', useAction: 'Ver perfil na rede' },
  study: { items: ['Plataformas e faculdades', 'Bootcamps e roadmaps', 'Livros e certificações'], benefits: ['Planeje o que estudar', 'Compare fontes antes de escolher'], filters: ['Objetivo', 'Nível atual', 'Idioma'], useTitle: 'Detalhes do recurso de estudo', useDetail: 'Confira o programa, o formato e as condições na fonte', useAction: 'Abrir site' },
  inform: { items: ['Notícias e blogs', 'Newsletters e podcasts', 'Artigos e pesquisas'], benefits: ['Entenda mudanças em tecnologia', 'Compare fontes e contextos'], filters: ['Assunto', 'Fonte', 'Data da publicação'], useTitle: 'Publicação na fonte', useDetail: 'Confira autoria, data e referências', useAction: 'Ler conteúdo' },
  networking: { items: ['Eventos e meetups', 'Conferências', 'Hackathons'], benefits: ['Troque experiências com pessoas da área', 'Conheça novas perspectivas'], filters: ['Tema', 'Público', 'Formato do encontro'], useTitle: 'Detalhes do encontro', useDetail: 'Confira programação, local e inscrição', useAction: 'Ver programação' },
  practice: { items: ['Ferramentas', 'Projetos de código aberto', 'Desafios e laboratórios'], benefits: ['Aplique o que você está estudando', 'Descubra o que precisa aprofundar'], filters: ['Seu conhecimento', 'Requisitos', 'Tamanho da tarefa'], useTitle: 'Comece uma atividade prática', useDetail: 'Leia os requisitos e siga as instruções do projeto', useAction: 'Acessar recurso' },
  career: { items: ['Sites de vagas', 'Sites e programas de bolsas', 'Mentoria e voluntariado'], benefits: ['Conheça os caminhos da área', 'Planeje seu próximo passo'], filters: ['Requisitos', 'Local de trabalho', 'Prazo'], useTitle: 'Oportunidade e requisitos', useDetail: 'Confira as condições e o prazo na página oficial', useAction: 'Consultar oportunidade' },
  forum: { items: ['Tópicos da comunidade', 'Comentários e respostas', 'Dúvidas e experiências'], benefits: ['Aprenda com outras experiências', 'Compartilhe o que descobriu'], filters: ['Assunto', 'Conversas existentes', 'Sua dúvida'], useTitle: 'Conversa da comunidade', useDetail: 'Leia as respostas ou compartilhe sua experiência', useAction: 'Responder' },
  tutorials: { items: ['Guia: primeiros passos em React', 'Exemplo: criar um componente', 'Referência: estado e eventos'], benefits: ['Acompanhe uma tarefa do início ao fim', 'Teste o exemplo enquanto aprende'], filters: ['Tecnologia', 'Nível', 'Pré-requisitos'], useTitle: 'Tutorial: crie seu primeiro componente', useDetail: '1. Prepare o ambiente  ·  2. Escreva o componente  ·  3. Teste no navegador', useAction: 'Abrir tutorial' },
  platforms: { items: ['Cursos de desenvolvimento web', 'Trilhas de dados e IA', 'Aulas gratuitas para iniciantes'], benefits: ['Compare formatos e catálogos', 'Encontre cursos no seu ritmo'], filters: ['Assunto', 'Preço', 'Idioma'], useTitle: 'Catálogo de cursos', useDetail: 'Compare aulas, duração e condições de acesso', useAction: 'Ver cursos' },
  universities: { items: ['Bacharelado em Computação', 'Tecnólogo em Sistemas', 'Graduação a distância'], benefits: ['Compare caminhos de formação', 'Entenda modalidades e requisitos'], filters: ['Curso', 'Modalidade', 'Localização'], useTitle: 'Graduação em tecnologia', useDetail: 'Consulte grade, modalidade e processo seletivo', useAction: 'Ver instituição' },
  bootcamps: { items: ['Desenvolvimento web intensivo', 'Formação em análise de dados', 'Bootcamp de cloud'], benefits: ['Avalie uma formação concentrada', 'Planeje carga horária e investimento'], filters: ['Área', 'Duração', 'Custo'], useTitle: 'Programa do bootcamp', useDetail: 'Confira módulos, rotina, suporte e regras de pagamento', useAction: 'Ver programa' },
  roadmaps: { items: ['Fundamentos de front-end', 'Trilha de back-end', 'Caminho para ciência de dados'], benefits: ['Visualize uma sequência de estudos', 'Escolha o próximo assunto'], filters: ['Área', 'Nível', 'Objetivo'], useTitle: 'Etapas do roadmap', useDetail: 'Fundamentos  →  Prática  →  Projeto', useAction: 'Abrir roadmap' },
  books: { items: ['Lógica de programação', 'Arquitetura de software', 'Bancos de dados'], benefits: ['Consulte conceitos no seu ritmo', 'Use o livro como referência em projetos'], filters: ['Assunto', 'Nível', 'Idioma'], useTitle: 'Ficha do livro', useDetail: 'Confira edição, idioma, autoria e opções de acesso', useAction: 'Consultar livro' },
  certifications: { items: ['Certificação de cloud', 'Certificação de redes', 'Fundamentos de segurança'], benefits: ['Conheça conhecimentos cobrados', 'Organize sua preparação'], filters: ['Área', 'Nível', 'Instituição'], useTitle: 'Guia oficial da certificação', useDetail: 'Consulte tópicos da prova, pré-requisitos e validade', useAction: 'Ver certificação' },
  news: { items: ['Últimas notícias de tecnologia', 'Atualizações de produtos', 'Notícias sobre o mercado'], benefits: ['Acompanhe novidades da área', 'Compare cobertura e fontes'], filters: ['Assunto', 'Fonte', 'Data'], useTitle: 'Notícia na fonte', useDetail: 'Confira a data e as fontes citadas na matéria', useAction: 'Ler notícia' },
  blogs: { items: ['Relatos de desenvolvimento', 'Boas práticas de engenharia', 'Tutoriais de programação'], benefits: ['Conheça experiências de quem atua na área', 'Explore explicações e exemplos'], filters: ['Autor', 'Assunto', 'Data'], useTitle: 'Artigo do blog', useDetail: 'Veja autoria, publicação e exemplos usados', useAction: 'Ler artigo' },
  newsletters: { items: ['Resumo semanal de tecnologia', 'Curadoria de segurança', 'Novidades de desenvolvimento'], benefits: ['Receba links sobre temas de interesse', 'Acompanhe edições anteriores'], filters: ['Frequência', 'Assunto', 'Idioma'], useTitle: 'Edições da newsletter', useDetail: 'Leia uma edição de exemplo antes de assinar', useAction: 'Ver edições' },
  podcasts: { items: ['Carreira em tecnologia', 'Conversas sobre software', 'Histórias de quem trabalha na área'], benefits: ['Ouça conversas e entrevistas', 'Encontre episódios por assunto'], filters: ['Tema', 'Duração', 'Plataforma'], useTitle: 'Episódio do podcast', useDetail: '▶  18:42  ·  Carreira e primeiros projetos', useAction: 'Ouvir episódio' },
  articles: { items: ['Como funciona uma API', 'Escolhas de arquitetura', 'Acessibilidade na web'], benefits: ['Aprofunde um conceito específico', 'Compare abordagens e referências'], filters: ['Tema', 'Autoria', 'Data'], useTitle: 'Leitura do artigo', useDetail: 'Resumo, autoria e referências para continuar pesquisando', useAction: 'Ler na fonte' },
  studies: { items: ['Pesquisa sobre IA generativa', 'Estudo de acessibilidade digital', 'Dados sobre o mercado de tecnologia'], benefits: ['Consulte métodos e resultados', 'Entenda os limites dos dados'], filters: ['Tema', 'Ano', 'Instituição'], useTitle: 'Publicação de pesquisa', useDetail: 'Resumo  ·  Método  ·  Resultados  ·  Limitações', useAction: 'Consultar publicação' },
  'case-studies': { items: ['Migração para arquitetura em nuvem', 'Redução de falhas em produção', 'Modernização de sistemas'], benefits: ['Veja decisões em um contexto real', 'Compare desafios e resultados'], filters: ['Área', 'Problema', 'Setor'], useTitle: 'Estudo de caso', useDetail: 'Contexto  →  Decisões  →  Resultados', useAction: 'Ler o caso' },
  reports: { items: ['Panorama de vagas em tecnologia', 'Relatório de segurança', 'Tendências de desenvolvimento'], benefits: ['Consulte dados e tendências', 'Compare períodos e cenários'], filters: ['Instituição', 'Ano', 'Assunto'], useTitle: 'Relatório e indicadores', useDetail: 'Confira período analisado, metodologia e notas dos gráficos', useAction: 'Abrir relatório' },
  events: { items: ['Encontro de tecnologia em São Paulo', 'Evento online de dados', 'Semana de inovação'], benefits: ['Conheça temas e participantes', 'Planeje sua participação'], filters: ['Tema', 'Formato', 'Data'], useTitle: 'Página do evento', useDetail: 'Programação  ·  Local  ·  Inscrições', useAction: 'Ver evento' },
  meetups: { items: ['Grupo local de JavaScript', 'Encontro de pessoas de dados', 'Comunidade de UX'], benefits: ['Participe de conversas menores', 'Encontre grupos com interesses em comum'], filters: ['Tema', 'Cidade', 'Formato'], useTitle: 'Próximo meetup', useDetail: 'Data, local e orientações para participar', useAction: 'Ver encontro' },
  conferences: { items: ['Conferência de desenvolvimento', 'Encontro de segurança', 'Congresso de computação'], benefits: ['Compare palestras e oficinas', 'Escolha uma programação relevante'], filters: ['Área', 'Data', 'Formato'], useTitle: 'Programação da conferência', useDetail: 'Palestras  ·  Oficinas  ·  Local  ·  Ingressos', useAction: 'Consultar programação' },
  hackathons: { items: ['Desafio de soluções abertas', 'Hackathon de impacto social', 'Maratona de programação'], benefits: ['Crie uma solução com prazo definido', 'Pratique em equipe a partir de um problema'], filters: ['Tema', 'Formato', 'Inscrição'], useTitle: 'Desafio do hackathon', useDetail: 'Leia as regras, forme uma equipe e envie seu projeto', useAction: 'Ver regulamento' },
  tools: { items: ['Editor de código', 'Cliente para APIs', 'Ferramenta de prototipação'], benefits: ['Encontre recursos para seu fluxo de trabalho', 'Compare licenças e compatibilidade'], filters: ['Finalidade', 'Sistema', 'Licença'], useTitle: 'Detalhes da ferramenta', useDetail: 'Recursos  ·  Compatibilidade  ·  Documentação oficial', useAction: 'Abrir documentação' },
  'open-source': { items: ['Projeto para primeira contribuição', 'Biblioteca de componentes', 'Ferramenta comunitária'], benefits: ['Aprenda lendo código real', 'Colabore com projetos públicos'], filters: ['Linguagem', 'Atividade', 'Nível'], useTitle: 'Repositório do projeto', useDetail: 'Leia a apresentação, as issues e as regras de contribuição', useAction: 'Ver repositório' },
  challenges: { items: ['Exercício de lógica', 'Desafio de interface web', 'Problema de algoritmos'], benefits: ['Teste o que você aprendeu', 'Identifique assuntos para revisar'], filters: ['Assunto', 'Nível', 'Tempo'], useTitle: 'Enunciado do desafio', useDetail: 'Leia o problema, tente resolver e consulte dicas depois', useAction: 'Começar desafio' },
  labs: { items: ['Laboratório de redes', 'Ambiente de cloud', 'Prática de segurança'], benefits: ['Experimente em um ambiente guiado', 'Pratique sem configurar tudo do zero'], filters: ['Área', 'Duração', 'Pré-requisitos'], useTitle: 'Instruções do laboratório', useDetail: 'Pré-requisitos  ·  Etapas  ·  Tempo estimado', useAction: 'Iniciar laboratório' },
  jobs: { items: ['Pessoa desenvolvedora júnior', 'Analista de dados', 'Estágio em tecnologia'], benefits: ['Compare funções e requisitos', 'Conheça o que as empresas procuram'], filters: ['Função', 'Localidade', 'Modalidade'], useTitle: 'Detalhes da vaga', useDetail: 'Atividades, requisitos e data de publicação', useAction: 'Ver candidatura' },
  scholarships: { items: ['Bolsa para curso de programação', 'Programa de formação em dados', 'Apoio para certificação'], benefits: ['Encontre apoio para seus estudos', 'Planeje documentos e prazos'], filters: ['Área', 'Público', 'Prazo'], useTitle: 'Inscrição para bolsa', useDetail: 'Confira elegibilidade, cobertura e documentos necessários', useAction: 'Ver programa' },
  mentoring: { items: ['Mentoria para início de carreira', 'Orientação em desenvolvimento', 'Programa para mulheres em tecnologia'], benefits: ['Converse sobre objetivos e próximos passos', 'Receba orientação de alguém experiente'], filters: ['Área', 'Público', 'Formato'], useTitle: 'Programa de mentoria', useDetail: 'Veja critérios, duração e compromisso esperado', useAction: 'Consultar programa' },
  volunteering: { items: ['Apoio a projeto de inclusão digital', 'Colaboração em iniciativa aberta', 'Mentoria voluntária'], benefits: ['Colabore com uma iniciativa', 'Pratique habilidades enquanto ajuda'], filters: ['Causa', 'Atividade', 'Disponibilidade'], useTitle: 'Oportunidade voluntária', useDetail: 'Conheça a missão, as tarefas e o tempo esperado', useAction: 'Ver como participar' },
};
const demo = sectionDemos[step.id] ?? { items: ['Links por categoria', 'Detalhes das indicações', 'Conteúdo na fonte'], benefits: ['Encontre referências', 'Compare opções'], filters: ['Objetivo', 'Assunto', 'Detalhes'], useTitle: step.category, useDetail: 'Consulte os detalhes desta seção na página de origem', useAction: 'Abrir página' };
const phase = parameters.get('etapa');
let scene = scenes[step.id] ?? scenes.explore!;
if (step.id === 'advertising') {
  const positions: Record<string, { title: string; detail: string; context: string }> = {
    'site-top-banner': { title: 'Faixa no topo', detail: 'A faixa inteira abre o site anunciado.', context: 'Acima do menu principal' },
    'forum-feed': { title: 'Anúncio no fórum', detail: 'Aparece entre os tópicos da página.', context: 'Lista de conversas' },
    'forum-topic': { title: 'Anúncio na conversa', detail: 'Fica entre o tópico e os comentários.', context: 'Página de uma conversa' },
    'study-topic': { title: 'Anúncio em Estudar', detail: 'Aparece nas conversas de recursos de estudo.', context: 'Discussões sobre cursos e livros' },
    'sponsored-list': { title: 'Indicação patrocinada', detail: 'Um recurso em destaque na lista da categoria.', context: 'Listas do Guia' },
  };
  const position = positions[parameters.get('posicao') || 'site-top-banner'] || positions['site-top-banner'];
  scene = `<div class="scene-title"><span>Onde divulgar</span><small>${position.context}</small></div><div class="results"><div class="detail-card"><span class="chip">${position.context}</span><h3>${position.title}</h3><p>${position.detail}</p><span class="target">Saiba mais ↗</span></div></div>${completion('Veja os formatos disponíveis no Guia')}`;
}
if (phase === 'what') {
  scene = `<div class="scene-title"><span>${step.category}</span><small>O que você encontra aqui</small></div>${tabs(['Conheça a seção', step.category])}<div class="results">${demo.items.map((item, i) => row(item, 'Explore as indicações da comunidade', String(i + 1))).join('')}</div>${completion('O Guia ajuda você a encontrar um ponto de partida')}`;
} else if (phase === 'why') {
  scene = `<div class="scene-title"><span>Por que vale a pena</span><small>${step.category}</small></div><div class="benefit-path"><span class="target">Seu objetivo</span><span class="path-arrow">→</span><span>${step.category}</span></div><div class="results">${demo.benefits.map(item => row(item, 'Uma referência para seu próximo passo', '✓')).join('')}</div>${completion('Explore de acordo com o que faz sentido para você')}`;
} else if (phase === 'choose') {
  scene = `<div class="scene-title"><span>Como escolher</span><small>${step.category}</small></div>${tabs(demo.filters)}<div class="results">${row('Compare com seu momento', 'Comece pelo que você procura agora', '⌕')}${row('Confira os detalhes', 'Leia as informações antes de decidir', '↗')}</div><div class="choice-checks"><span>✓ Seu objetivo</span><span>✓ Informações na fonte</span></div>${completion('Escolha pelos detalhes, além da popularidade')}`;
} else if (phase === 'use') {
  scene = `<div class="scene-title"><span>${demo.useTitle}</span><small>${step.category}</small></div><div class="results"><div class="detail-card"><span class="chip">${step.category}</span><h3>${demo.useTitle}</h3><p>${demo.useDetail}</p><span class="target">${demo.useAction} ↗</span></div></div>${completion('Confira as informações atualizadas no site de origem')}`;
}

// Only fixed, authored scenes reach innerHTML. Query parameters select an existing scene.
root.innerHTML = `<div class="browser"><div class="browser-bar"><div class="window-dots"><i></i><i></i><i></i></div><span>Guia da TI</span><span class="demo-label">Demonstração</span></div><div class="browser-body">${scene}</div></div><div class="cursor" aria-hidden="true">${macCursorSvg}<span></span></div>`;

const target = root.querySelector<HTMLElement>('.target')!;
const bounds = target.getBoundingClientRect();
const targetX = bounds.left + bounds.width * 0.65;
const targetY = bounds.top + bounds.height * 0.6;
const colors = getComputedStyle(root);
const timeline = gsap.timeline({ paused: true });
timeline.from('.browser', { opacity: 0, y: 18, duration: 0.65, ease: 'power2.out' }, 0);
timeline.from('.scene-title', { opacity: 0, y: 8, duration: 0.4 }, 0.3);
timeline.fromTo('.cursor', { x: 670, y: 340, opacity: 0 }, { x: targetX, y: targetY, opacity: 1, duration: 1.1, ease: 'power2.inOut' }, 0.7);
timeline.to('.cursor', { scale: 0.88, duration: 0.12 }, 1.85);
timeline.to('.cursor', { scale: 1, duration: 0.15 }, 1.97);
timeline.to('.target', { backgroundColor: colors.getPropertyValue('--accent').trim(), color: colors.getPropertyValue('--on-accent').trim(), borderColor: colors.getPropertyValue('--accent').trim(), duration: 0.25 }, 1.9);
timeline.fromTo('.cursor span', { scale: 0.2, opacity: 0.65 }, { scale: 2.4, opacity: 0, duration: 0.55 }, 1.9);
if (root.querySelector('.query')) timeline.from('.query', { width: 0, duration: 0.9, ease: 'none' }, 2.1);
timeline.from('.results', { opacity: 0, y: 12, duration: 0.5, ease: 'power2.out' }, 3);
if (root.querySelector('.path-arrow')) timeline.from('.path-arrow', { opacity: 0, x: -12, duration: 0.5 }, 2.3);
if (root.querySelector('.choice-checks')) timeline.from('.choice-checks span', { opacity: 0, y: 7, stagger: 0.25, duration: 0.4 }, 3.5);
if (root.querySelector('.result, .study-card, .reply')) timeline.from('.result, .study-card, .reply', { opacity: 0, y: 8, stagger: 0.15, duration: 0.4 }, 3.1);
timeline.to('.cursor', { opacity: 0, duration: 0.3 }, 4.2);
timeline.from('.completion', { opacity: 0, y: 10, duration: 0.5, ease: 'power2.out' }, 4.6);
timeline.set({}, {}, 8);
(window as Window & { __timelines?: Record<string, gsap.core.Timeline> }).__timelines = { guide: timeline };

// Load the bridge ourselves: URL-based players otherwise inject their CDN runtime.
// Awaiting it keeps the iframe load event behind runtime initialization.
await new Promise<void>(resolve => {
  const runtime = document.createElement('script');
  runtime.src = runtimeUrl;
  runtime.onload = () => resolve();
  runtime.onerror = () => resolve(); // The player can still use the registered GSAP timeline.
  document.head.appendChild(runtime);
});
