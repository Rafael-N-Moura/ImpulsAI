import { useLocation, Link } from 'react-router-dom';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel';
import { ArrowLeft, Star, CheckCircle, Target, BookOpen, Search, Edit3, ChevronLeft, ChevronRight } from 'lucide-react';

// Componente para card de oportunidade expansível
const OpportunityCard = ({ opportunity, index }: { opportunity: any; index: number }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Função para obter cor da prioridade
  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'alta':
      case 'urgente':
        return 'destructive';
      case 'média':
      case 'importante':
        return 'default';
      case 'baixa':
      case 'recomendado':
        return 'secondary';
      default:
        return 'default';
    }
  };

  // Função para obter texto da prioridade
  const getPriorityText = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'alta':
      case 'urgente':
        return 'Alta';
      case 'média':
      case 'importante':
        return 'Média';
      case 'baixa':
      case 'recomendado':
        return 'Baixa';
      default:
        return priority || 'Média';
    }
  };

  // Texto da análise específica para cada competência
  const getAnalysisText = (title: string, priority: string) => {
    const priorityText = getPriorityText(priority);

    switch (title.toLowerCase()) {
      case 'react':
      case 'react.js':
      case 'react.js (avançado)':
        return `React.js é amplamente utilizado no mercado e é essencial para desenvolvimento frontend moderno. Aprofundar o conhecimento em React, incluindo hooks (useState, useEffect, useContext), context API, Redux/Recoil para gerenciamento de estado, e testes com Jest e React Testing Library aumentará significativamente sua empregabilidade e permitirá trabalhar em projetos de grande escala.`;

      case 'node.js':
      case 'node.js (avançado)':
        return `Node.js é essencial para desenvolvimento backend e full-stack. Dominar Node.js com Express.js, criação de APIs RESTful, autenticação JWT, integração com bancos de dados (MongoDB, PostgreSQL), e arquitetura de microsserviços será crucial para vagas de backend developer e full-stack engineer.`;

      case 'typescript':
      case 'typescript (avançado)':
        return `TypeScript está se tornando padrão na indústria de desenvolvimento. Aprender TypeScript melhorará significativamente a qualidade do código, reduzirá bugs em produção, facilitará a manutenção de projetos grandes e aumentará a aceitação em projetos empresariais e startups de tecnologia.`;

      case 'python':
      case 'python (avançado)':
        return `Python é uma linguagem versátil e muito demandada no mercado atual. Focar em Python para web development com Django ou Flask, data science com pandas e scikit-learn, ou automação de processos abrirá portas em diversas áreas da tecnologia, desde startups até grandes corporações.`;

      case 'docker':
      case 'docker (avançado)':
        return `Docker é fundamental para DevOps e desenvolvimento moderno. Conhecer Docker, containers, e orquestração com Kubernetes será essencial para vagas de infraestrutura, DevOps engineer, e qualquer posição que trabalhe com deployment e escalabilidade de aplicações em ambientes de produção.`;

      case 'kubernetes':
        return `Kubernetes é a ferramenta padrão para orquestração de containers em produção. Aprender Kubernetes permitirá gerenciar aplicações distribuídas, implementar auto-scaling, e trabalhar com arquiteturas de microsserviços em ambientes cloud-native, abrindo portas para posições sênior em DevOps e arquitetura de sistemas.`;

      case 'vue.js':
        return `Vue.js é um framework moderno e crescente no mercado brasileiro e internacional. Aprender Vue.js com Composition API, Vuex para gerenciamento de estado, e Vue Router para navegação será valioso para projetos frontend e full-stack, especialmente em empresas que preferem frameworks mais leves e flexíveis.`;

      case 'css grid':
      case 'css grid & flexbox':
        return `CSS Grid e Flexbox são essenciais para layouts modernos e responsivos. Dominar essas tecnologias permitirá criar interfaces profissionais que se destacam no mercado, implementar designs complexos com facilidade, e trabalhar com sistemas de design consistentes em projetos de grande escala.`;

      case 'testes automatizados':
      case 'jest':
      case 'cypress':
      case 'mocha':
        return `Testes automatizados garantem a qualidade do código e reduzem significativamente bugs em produção. Familiaridade com Jest para testes unitários, Cypress para testes E2E, e Mocha para testes de integração é altamente valorizada por empresas que priorizam qualidade e confiabilidade em seus produtos.`;

      case 'ci/cd':
      case 'integração contínua':
      case 'entrega contínua':
        return `CI/CD é fundamental para desenvolvimento ágil e deployment automatizado. Conhecer ferramentas como Jenkins, GitLab CI, GitHub Actions, e conceitos de DevOps automatizará o processo de desenvolvimento, reduzirá tempo de entrega, e aumentará a confiabilidade das aplicações em produção.`;

      case 'microsserviços':
      case 'arquitetura de software':
      case 'serverless':
        return `Conhecimento de arquiteturas modernas como microsserviços e serverless é crucial para sistemas escaláveis. Entender padrões de comunicação entre serviços, gerenciamento de estado distribuído, e arquiteturas cloud-native abrirá portas para posições de arquiteto de software e engenheiro sênior.`;

      case 'aws':
      case 'azure':
      case 'google cloud':
      case 'cloud computing':
        return `Cloud Computing é essencial para o futuro do desenvolvimento. Conhecer AWS, Azure ou Google Cloud, incluindo serviços de computação, armazenamento, e banco de dados gerenciados, permitirá trabalhar com aplicações escaláveis e posicionar-se para vagas em empresas que utilizam infraestrutura cloud.`;

      case 'git':
      case 'controle de versão':
        return `Git é fundamental para desenvolvimento colaborativo e controle de versão. Dominar Git com workflows avançados, branching strategies, e integração com plataformas como GitHub/GitLab é essencial para qualquer desenvolvedor e será sempre valorizado no mercado de trabalho.`;

      default:
        return `${title} é uma competência importante para o cargo almejado. Desenvolver habilidades em ${title} aumentará significativamente suas chances de sucesso no mercado de trabalho e permitirá se destacar em processos seletivos competitivos.`;
    }
  };

  return (
    <div className="border rounded-lg border-border/50 hover:bg-muted/20 transition-all duration-300">
      {/* Header do card - sempre visível */}
      <div
        className="flex items-center justify-between p-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <span className="text-foreground font-medium">{opportunity.title}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Badge de prioridade próximo à seta */}
          <Badge
            variant={getPriorityColor(opportunity.priority) as any}
            className="text-xs font-semibold px-3 py-1"
          >
            {getPriorityText(opportunity.priority)}
          </Badge>

          {/* Seta indicativa */}
          <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
            <svg
              className="w-5 h-5 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Conteúdo expansível */}
      <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
        <div className="px-3 pb-3 space-y-4">
          {/* Análise da competência */}
          <div className="bg-muted/30 rounded-lg p-3">
            <h4 className="font-medium text-sm text-foreground mb-2">
              📊 Análise da Competência
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {getAnalysisText(opportunity.title, opportunity.priority)}
            </p>
          </div>

          {/* Cursos recomendados */}
          {opportunity.cursos && opportunity.cursos.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">📚 Cursos Recomendados</p>
                <Badge variant="outline" className="text-xs">
                  {opportunity.total_cursos || opportunity.cursos.length} cursos
                </Badge>
              </div>

              <div className="space-y-2">
                {opportunity.cursos.slice(0, 3).map((curso: any, i: number) => (
                  <div key={i} className="border rounded-lg p-2 hover:bg-muted/20 transition-colors">
                    <a
                      href={curso.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm block mb-1"
                    >
                      📚 {curso.nome}
                    </a>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{curso.plataforma}</span>
                      {curso.preco && <span>• {curso.preco}</span>}
                      {curso.avaliacao && <span>• ⭐ {curso.avaliacao}</span>}
                      {curso.duracao && <span>• ⏱️ {curso.duracao}</span>}
                    </div>
                  </div>
                ))}

                {opportunity.cursos.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{opportunity.cursos.length - 3} cursos adicionais
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Results = () => {
  const location = useLocation();
  const resultado = location.state?.resultado;
  const cargoAlmejado = location.state?.cargoAlmejado || 'Desenvolvedor';

  // Estado para controlar o carousel do roadmap
  const [currentSlide, setCurrentSlide] = useState(0);
  const [api, setApi] = useState<CarouselApi>();

  // Estado para controlar o carousel de sugestões da IA
  const [suggestionsApi, setSuggestionsApi] = useState<CarouselApi>();
  const [currentSuggestionsPage, setCurrentSuggestionsPage] = useState(0);

  console.log('🔍 Resultado recebido no frontend:', resultado);
  console.log('📄 Texto CV no resultado:', resultado?.texto_cv ? 'SIM' : 'NÃO');

  // Fallback para dados mockados se não houver resultado real
  const strengths = resultado?.pontos_fortes || [
    'Desenvolvimento Back-end (Node.js, Express)',
    'Bancos de Dados (SQL e NoSQL)',
    'Criação e Consumo de APIs RESTful',
    'Controle de Versão com Git'
  ];

  const opportunities = resultado?.pontos_a_desenvolver?.map((item: any) => ({
    title: item.competencia || item.skill,
    priority: item.importancia || 'Importante',
    cursos: item.cursos_sugeridos || item.cursos_disponiveis || [],
    total_cursos: item.total_cursos || 0,
    prioridade: item.prioridade || 50
  })) || [
      { title: 'Cloud Computing (AWS/Azure)', priority: 'Urgente', cursos: [] },
      { title: 'Arquitetura de Microsserviços', priority: 'Importante', cursos: [] },
      { title: 'Ferramentas de CI/CD (Jenkins, GitLab)', priority: 'Recomendado', cursos: [] },
      { title: 'Containerização com Docker & Kubernetes', priority: 'Importante', cursos: [] }
    ];



  const actionPlan = opportunities.filter(o => o.cursos && o.cursos.length > 0).map(o => ({
    title: o.title,
    description: `Aprimore-se em ${o.title} para avançar na sua carreira de ${cargoAlmejado}.`,
    cursos: o.cursos
  }));

  // --- Otimização de Currículo ---
  const [sugestoes, setSugestoes] = useState<any[]>([]);
  const [loadingOtimizacao, setLoadingOtimizacao] = useState(false);
  const [otimizacaoError, setOtimizacaoError] = useState<string | null>(null);
  const [textoCV, setTextoCV] = useState<string>('');
  const [textoOtimizado, setTextoOtimizado] = useState<string>('');

  // Função para aplicar as sugestões ao texto original
  const aplicarSugestoes = (textoOriginal: string, sugestoes: any[]) => {
    let textoOtimizado = textoOriginal;

    sugestoes.forEach(sugestao => {
      if (sugestao.original && sugestao.suggestion) {
        textoOtimizado = textoOtimizado.replace(
          new RegExp(sugestao.original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'),
          sugestao.suggestion
        );
      }
    });

    return textoOtimizado;
  };

  // Usar o texto do CV que vem do resultado da análise inicial
  useEffect(() => {
    console.log('🔄 useEffect - resultado?.texto_cv:', resultado?.texto_cv ? 'SIM' : 'NÃO');
    if (resultado?.texto_cv) {
      setTextoCV(resultado.texto_cv);
      console.log('✅ Texto CV definido no estado');
    }
  }, [resultado]);



  // Funções para navegar entre slides
  const goToNext = useCallback(() => {
    if (api) {
      api.scrollNext();
    }
  }, [api]);

  const goToPrevious = useCallback(() => {
    if (api) {
      api.scrollPrev();
    }
  }, [api]);

  const goToSlide = useCallback((index: number) => {
    if (api) {
      api.scrollTo(index);
    }
  }, [api]);



  // Efeito para sincronizar o estado quando o carousel do roadmap mudar naturalmente
  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrentSlide(api.selectedScrollSnap());
    };

    api.on("select", onSelect);

    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  // Efeito para sincronizar o estado quando o carousel de sugestões mudar naturalmente
  useEffect(() => {
    if (!suggestionsApi) return;

    const onSelect = () => {
      const currentIndex = suggestionsApi.selectedScrollSnap();
      const currentPage = Math.floor(currentIndex / 2);
      console.log('🔄 Carousel de sugestões mudou:', { currentIndex, currentPage });
      setCurrentSuggestionsPage(currentPage);
    };

    // Configurar o listener de eventos
    suggestionsApi.on("select", onSelect);

    // Inicializar o estado com a página atual
    const initialIndex = suggestionsApi.selectedScrollSnap();
    const initialPage = Math.floor(initialIndex / 2);
    setCurrentSuggestionsPage(initialPage);

    return () => {
      suggestionsApi.off("select", onSelect);
    };
  }, [suggestionsApi]);

  const handleOtimizar = async () => {
    console.log('🚀 Iniciando otimização com texto:', textoCV ? textoCV.substring(0, 100) + '...' : 'VAZIO');
    if (!textoCV.trim()) {
      setOtimizacaoError('Texto do currículo não disponível.');
      return;
    }

    setLoadingOtimizacao(true);
    setOtimizacaoError(null);
    setSugestoes([]);
    try {
      const response = await fetch('http://localhost:4000/optimize-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ textoCV }),
      });
      if (!response.ok) throw new Error('Erro ao otimizar currículo');
      const data = await response.json();
      console.log('✅ Sugestões recebidas:', data);
      setSugestoes(data);

      // Aplicar as sugestões ao texto original
      const textoOtimizado = aplicarSugestoes(textoCV, data);
      setTextoOtimizado(textoOtimizado);
    } catch (err: any) {
      console.error('❌ Erro na otimização:', err);
      setOtimizacaoError('Erro ao otimizar currículo.');
    } finally {
      setLoadingOtimizacao(false);
    }
  };

  // Otimizar automaticamente quando o texto do CV estiver disponível
  useEffect(() => {
    if (textoCV && !sugestoes.length && !loadingOtimizacao) {
      console.log('🔄 Otimização automática iniciada');
      handleOtimizar();
    }
  }, [textoCV]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-foreground">
              Seu Diagnóstico de Carreira
            </h1>
            <p className="text-lg text-muted-foreground">
              Análise para o cargo de: <span className="text-primary font-semibold">{cargoAlmejado}</span>
            </p>
          </div>
        </div>
        {/* Tabs */}
        <Tabs defaultValue="roadmap" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
            <TabsTrigger value="market">Análise de Mercado</TabsTrigger>
            <TabsTrigger value="vagas">Vagas do Mercado</TabsTrigger>
            <TabsTrigger value="cv">Otimização de Currículo</TabsTrigger>
          </TabsList>
          {/* Career Roadmap Tab */}
          <TabsContent value="roadmap" className="space-y-6">

            {/* Indicador de fonte dos dados */}
            {resultado?.cursos_metadata && (
              <div className="flex items-center justify-center">
                <Card className="w-full max-w-2xl">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Fonte dos Cursos:</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={resultado.cursos_metadata.fonte_cursos === 'external_api' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {resultado.cursos_metadata.fonte_cursos === 'external_api' ? '🌐 API Externa' : '📚 Dados Estáticos'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {resultado.cursos_metadata.total_cursos || 0} cursos mapeados
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="w-full">
              <Carousel
                setApi={setApi}
                className="w-full max-w-4xl mx-auto px-4"
                opts={{
                  align: "start",
                  loop: false,
                }}
              >
                <CarouselContent className="min-h-[500px] md:min-h-[600px]">
                  {/* Card 1: Seus Pontos Fortes */}
                  <CarouselItem className="md:basis-1/1">
                    <Card className="h-full shadow-lg hover:shadow-xl transition-all duration-300 border-green-200/50">
                      <CardHeader>
                        <CardTitle className="text-green-400 flex items-center gap-2">
                          <CheckCircle className="h-5 w-5" />
                          Seus Pontos Fortes
                        </CardTitle>
                        <CardDescription>
                          Competências que você já domina e pode destacar
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {strengths.map((strength: string, index: number) => (
                          <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                            <Star className="h-4 w-4 text-green-400 fill-current flex-shrink-0" />
                            <span className="text-foreground">{strength}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </CarouselItem>

                  {/* Card 2: Oportunidades de Desenvolvimento */}
                  <CarouselItem className="md:basis-1/1">
                    <Card className="h-full shadow-lg hover:shadow-xl transition-all duration-300 border-yellow-200/50">
                      <CardHeader>
                        <CardTitle className="text-yellow-400 flex items-center gap-2">
                          <Star className="h-5 w-5" />
                          Oportunidades de Desenvolvimento
                        </CardTitle>
                        <CardDescription>
                          Áreas para focar e desenvolver para avançar na carreira
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {opportunities.map((opp, index) => (
                          <OpportunityCard
                            key={index}
                            opportunity={opp}
                            index={index}
                          />
                        ))}
                      </CardContent>
                    </Card>
                  </CarouselItem>

                  {/* Card 3: Plano de Ação Sugerido */}
                  <CarouselItem className="md:basis-1/1">
                    <Card className="h-full shadow-lg hover:shadow-xl transition-all duration-300 border-primary/50">
                      <CardHeader>
                        <CardTitle className="text-primary flex items-center gap-2">
                          <Target className="h-5 w-5" />
                          Plano de Ação Sugerido
                        </CardTitle>
                        <CardDescription>
                          Passos concretos para implementar seu desenvolvimento
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {actionPlan.length > 0 ? actionPlan.map((plan, index) => (
                          <div key={index} className="space-y-4 p-4 rounded-lg border-l-4 border-primary bg-primary/5 hover:bg-primary/10 transition-colors">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold text-foreground text-lg">{plan.title}</h4>
                                <p className="text-sm text-muted-foreground">{plan.description}</p>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {plan.cursos.length} cursos
                              </Badge>
                            </div>

                            <div className="grid gap-3">
                              {plan.cursos.map((curso: any, i: number) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg border bg-background hover:bg-muted/30 transition-colors">
                                  <div className="flex-1 min-w-0">
                                    <a
                                      href={curso.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="font-medium text-foreground hover:text-primary transition-colors block truncate"
                                    >
                                      {curso.nome}
                                    </a>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                      <span className="flex items-center gap-1">
                                        <BookOpen className="h-3 w-3" />
                                        {curso.plataforma}
                                      </span>
                                      {curso.preco && (
                                        <span className="text-green-600 font-medium">{curso.preco}</span>
                                      )}
                                      {curso.avaliacao && (
                                        <span className="flex items-center gap-1">
                                          ⭐ {curso.avaliacao}
                                        </span>
                                      )}
                                      {curso.duracao && (
                                        <span>⏱️ {curso.duracao}</span>
                                      )}
                                      {curso.fonte && (
                                        <Badge
                                          variant={curso.fonte === 'external_api' ? 'default' : 'secondary'}
                                          className="text-xs"
                                        >
                                          {curso.fonte === 'external_api' ? '🌐 API' : '📚 Fallback'}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <Button asChild variant="outline" size="sm" className="ml-3 flex-shrink-0">
                                    <a href={curso.url} target="_blank" rel="noopener noreferrer">
                                      Acessar
                                    </a>
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )) : (
                          <div className="text-center py-8">
                            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                            <p className="text-muted-foreground">Nenhum plano de ação sugerido disponível.</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </CarouselItem>
                </CarouselContent>

                {/* Navegação do Carousel */}
                <div className="flex justify-center mt-6 space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPrevious}
                    disabled={!api?.canScrollPrev()}
                    className="hover:bg-primary hover:text-primary-foreground"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Anterior
                  </Button>

                  <span className="flex items-center px-4 text-sm text-muted-foreground">
                    {currentSlide + 1} de 3
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNext}
                    disabled={!api?.canScrollNext()}
                    className="hover:bg-primary hover:text-primary-foreground"
                  >
                    Próximo
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>

                {/* Indicadores de página clicáveis */}
                <div className="flex justify-center mt-4 space-x-2">
                  {[0, 1, 2].map((index) => (
                    <div
                      key={index}
                      className={`w-3 h-3 rounded-full cursor-pointer transition-all duration-300 ${index === currentSlide
                        ? 'bg-primary scale-110'
                        : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                        }`}
                      onClick={() => goToSlide(index)}
                    />
                  ))}
                </div>
              </Carousel>
            </div>
          </TabsContent>

          {/* LinkedIn Jobs Tab */}
          <TabsContent value="vagas" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Vagas do Mercado</CardTitle>
                <CardDescription>
                  Vagas encontradas via {resultado.fonte_dados === 'JSearch' ? 'JSearch' : 'dados estáticos'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {resultado.vagas_mercado && resultado.vagas_mercado.length > 0 ? (
                  <div className="space-y-4">
                    {resultado.vagas_mercado.map((vaga, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-2">
                        <h4 className="font-semibold text-lg">{vaga.titulo}</h4>
                        <p className="text-sm text-muted-foreground">{vaga.empresa}</p>
                        <p className="text-sm">{vaga.localizacao}</p>
                        {vaga.salario && (
                          <p className="text-sm font-medium text-green-600">{vaga.salario}</p>
                        )}
                        {vaga.url && (
                          <a
                            href={vaga.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            Ver vaga
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma vaga disponível no momento.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resume Optimization Tab (agora real) */}
          <TabsContent value="cv" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - AI Suggestions */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-primary flex items-center gap-2">
                      <Search className="h-5 w-5" />
                      Sugestões da IA
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {loadingOtimizacao && (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground">Analisando seu currículo...</p>
                      </div>
                    )}
                    {otimizacaoError && (
                      <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                        <p className="text-red-500">{otimizacaoError}</p>
                        <Button onClick={handleOtimizar} className="mt-2" size="sm">
                          Tentar Novamente
                        </Button>
                      </div>
                    )}
                    {sugestoes.length > 0 && (
                      <div className="w-full">
                        <Carousel
                          setApi={setSuggestionsApi}
                          className="w-full"
                          opts={{
                            align: "start",
                            loop: false,
                          }}
                        >
                          <CarouselContent className="min-h-[200px]">
                            {sugestoes.map((s, i) => (
                              <CarouselItem key={i} className="md:basis-1/2">
                                <div className="space-y-3 p-4 rounded-lg bg-gradient-to-br from-muted/30 to-muted/50 h-full border border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-300">
                                  <div className="flex items-center gap-2 mb-3">
                                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                                    <h4 className="font-semibold text-primary text-sm">{s.title}</h4>
                                  </div>

                                  <div className="space-y-3">
                                    <div>
                                      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Original:</span>
                                      <div className="mt-2 p-3 bg-red-50 rounded-lg border-l-4 border-red-300">
                                        <p className="text-xs text-red-700 leading-relaxed">
                                          {s.original}
                                        </p>
                                      </div>
                                    </div>

                                    <div>
                                      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Sugestão:</span>
                                      <div className="mt-2 p-3 bg-green-50 rounded-lg border-l-4 border-green-300">
                                        <p className="text-xs text-green-700 leading-relaxed">
                                          {s.suggestion}
                                        </p>
                                        <div className="mt-2 flex items-center gap-1">
                                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                                          <span className="text-xs text-green-600 font-medium">Melhorado</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </CarouselItem>
                            ))}
                          </CarouselContent>

                          {/* Navegação do Carousel de Sugestões */}
                          {sugestoes.length > 2 && (
                            <div className="flex flex-col items-center mt-4 space-y-3">
                              {/* Botões de Navegação */}
                              <div className="flex justify-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    if (suggestionsApi) {
                                      suggestionsApi.scrollPrev();
                                      // O estado será atualizado pelo useEffect quando o carousel mudar
                                    }
                                  }}
                                  disabled={!suggestionsApi?.canScrollPrev()}
                                  className="hover:bg-primary hover:text-primary-foreground transition-colors"
                                >
                                  <ChevronLeft className="h-4 w-4 mr-1" />
                                  Anterior
                                </Button>

                                <span className="flex items-center px-3 text-xs text-muted-foreground bg-muted/50 rounded-md">
                                  Página {currentSuggestionsPage + 1} de {Math.ceil(sugestoes.length / 2)}
                                  {/* Debug: {JSON.stringify({ currentSuggestionsPage, totalPages: Math.ceil(sugestoes.length / 2) })} */}
                                </span>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    if (suggestionsApi) {
                                      suggestionsApi.scrollNext();
                                      // O estado será atualizado pelo useEffect quando o carousel mudar
                                    }
                                  }}
                                  disabled={!suggestionsApi?.canScrollNext()}
                                  className="hover:bg-primary hover:text-primary-foreground transition-colors"
                                >
                                  Próximo
                                  <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                              </div>

                              {/* Indicadores de Página */}
                              <div className="flex justify-center space-x-2">
                                {Array.from({ length: Math.ceil(sugestoes.length / 2) }).map((_, index) => (
                                  <div
                                    key={index}
                                    className={`w-2 h-2 rounded-full cursor-pointer transition-all duration-300 ${index === currentSuggestionsPage
                                      ? 'bg-primary scale-125'
                                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                                      }`}
                                    onClick={() => {
                                      if (suggestionsApi) {
                                        suggestionsApi.scrollTo(index * 2);
                                        setCurrentSuggestionsPage(index);
                                      }
                                    }}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </Carousel>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              {/* Right Column - Resume Analysis */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center gap-2">
                      <Edit3 className="h-5 w-5" />
                      Currículo Otimizado
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 font-mono text-sm">
                    {textoOtimizado ? (
                      <div className="space-y-4">
                        <div className="border-t pt-4">
                          <h4 className="font-semibold mb-2 text-green-600">Versão Otimizada</h4>
                          <div className="bg-green-50 p-3 rounded text-xs max-h-60 overflow-y-auto border border-green-200">
                            <pre className="whitespace-pre-wrap text-green-800">{textoOtimizado}</pre>
                          </div>
                        </div>
                        {textoCV && (
                          <div className="border-t pt-4">
                            <h4 className="font-semibold mb-2 text-muted-foreground">Versão Original</h4>
                            <div className="bg-muted/30 p-3 rounded text-xs max-h-40 overflow-y-auto">
                              <pre className="whitespace-pre-wrap text-muted-foreground">{textoCV}</pre>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : textoCV ? (
                      <div className="space-y-4">
                        <div className="border-t pt-4">
                          <h4 className="font-semibold mb-2">Texto Extraído do Currículo</h4>
                          <div className="bg-muted/30 p-3 rounded text-xs max-h-60 overflow-y-auto">
                            <pre className="whitespace-pre-wrap text-muted-foreground">{textoCV}</pre>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground">Texto do currículo não disponível.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Results;