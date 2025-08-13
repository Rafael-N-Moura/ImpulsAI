import { useLocation, Link } from 'react-router-dom';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel';
import { ArrowLeft, Star, CheckCircle, Target, BookOpen, Search, Edit3, ChevronLeft, ChevronRight } from 'lucide-react';

// Componente para card de oportunidade simplificado
const OpportunityCard = ({ opportunity, index }: { opportunity: any; index: number }) => {
  // Função para obter cor da prioridade
  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'alta':
      case 'urgente':
      case 'crítica':
      case 'máxima':
        return 'destructive';
      case 'média':
      case 'moderada':
      case 'importante':
      case 'intermediária':
        return 'default';
      case 'baixa':
      case 'recomendada':
      case 'opcional':
      case 'secundária':
        return 'secondary';
      default:
        return 'default';
    }
  };

  // Função para obter texto da prioridade (simplificada)
  const getPriorityText = (priority: string) => {
    if (!priority) return 'Média';

    // Normalizar a prioridade para o formato esperado
    const priorityLower = priority.toLowerCase();

    if (['alta', 'urgente', 'crítica', 'máxima'].includes(priorityLower)) {
      return 'Alta';
    } else if (['média', 'moderada', 'importante', 'intermediária'].includes(priorityLower)) {
      return 'Média';
    } else if (['baixa', 'recomendada', 'opcional', 'secundária'].includes(priorityLower)) {
      return 'Baixa';
    }

    return 'Média'; // padrão
  };

  return (
    <div className="border rounded-lg border-border/50 hover:bg-muted/20 transition-all duration-300 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-foreground font-medium">{opportunity.title}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Badge de prioridade */}
          <Badge
            variant={getPriorityColor(opportunity.priority) as any}
            className="text-xs font-semibold px-3 py-1"
          >
            {getPriorityText(opportunity.priority)}
          </Badge>
        </div>
      </div>

      {/* Cursos recomendados (se houver) */}
      {opportunity.cursos && opportunity.cursos.length > 0 && (
        <div className="mt-4 space-y-2">
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

  // Função para ordenar oportunidades por prioridade (Alta → Média → Baixa)
  const sortByPriority = (opps: any[]) => {
    const priorityOrder = { 'Alta': 3, 'Média': 2, 'Baixa': 1 };
    return opps.sort((a, b) => {
      const priorityA = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
      const priorityB = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
      return priorityB - priorityA; // Ordem decrescente (maior prioridade primeiro)
    });
  };

  const opportunities = sortByPriority(
    resultado?.pontos_a_desenvolver?.map((item: any) => ({
      title: item.competencia || item.skill,
      priority: item.importancia || 'Média',
      cursos: item.cursos_sugeridos || item.cursos_disponiveis || [],
      total_cursos: item.total_cursos || 0,
      prioridade: item.prioridade || 50
    })) || [
      { title: 'Cloud Computing (AWS/Azure)', priority: 'Alta', cursos: [] },
      { title: 'Arquitetura de Microsserviços', priority: 'Média', cursos: [] },
      { title: 'Ferramentas de CI/CD (Jenkins, GitLab)', priority: 'Baixa', cursos: [] },
      { title: 'Containerização com Docker & Kubernetes', priority: 'Média', cursos: [] }
    ]
  );



  // Roadmap Estratégico (Fase 4 da metodologia)
  const roadmapEstrategico = resultado?.roadmap_estrategico || [];

  // Action Plan baseado no roadmap estratégico se disponível, senão fallback para oportunidades
  const actionPlan = roadmapEstrategico.length > 0
    ? roadmapEstrategico.map((passo: any) => ({
      title: passo.competencia_foco,
      description: passo.justificativa,
      projeto: passo.projeto_sugerido,
      cursos: passo.cursos_recomendados || [],
      passo: passo.passo
    }))
    : opportunities.filter(o => o.cursos && o.cursos.length > 0).map(o => ({
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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
            <TabsTrigger value="cv">Otimização de Currículo</TabsTrigger>
          </TabsList>
          {/* Career Roadmap Tab */}
          <TabsContent value="roadmap" className="space-y-6">

            {/* Indicador de fonte dos dados */}
            {/* {resultado?.cursos_metadata && (
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
            )} */}

            <div className="w-full">
              <Carousel
                setApi={setApi}
                className="w-full max-w-4xl mx-auto px-4"
                opts={{
                  align: "start",
                  loop: false,
                }}
              >
                <CarouselContent className="h-[600px] md:h-[700px]">
                  {/* Card 1: Seus Pontos Fortes */}
                  <CarouselItem className="md:basis-1/1">
                    <Card className="h-full shadow-lg hover:shadow-xl transition-all duration-300 border-green-200/50 flex flex-col">
                      <CardHeader className="flex-shrink-0">
                        <CardTitle className="text-green-400 flex items-center gap-2">
                          <CheckCircle className="h-5 w-5" />
                          Seus Pontos Fortes
                        </CardTitle>
                        <CardDescription>
                          Competências que você já domina
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
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
                    <Card className="h-full shadow-lg hover:shadow-xl transition-all duration-300 border-yellow-200/50 flex flex-col">
                      <CardHeader className="flex-shrink-0">
                        <CardTitle className="text-yellow-400 flex items-center gap-2">
                          <Star className="h-5 w-5" />
                          Oportunidades de Desenvolvimento
                        </CardTitle>

                      </CardHeader>
                      <CardContent className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
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
                    <Card className="h-full shadow-lg hover:shadow-xl transition-all duration-300 border-primary/50 flex flex-col">
                      <CardHeader className="flex-shrink-0">
                        <CardTitle className="text-primary flex items-center gap-2">
                          <Target className="h-5 w-5" />
                          {roadmapEstrategico.length > 0 ? 'Trilha de Aprendizado' : 'Plano de Ação Sugerido'}
                        </CardTitle>
                        <CardDescription>
                          {roadmapEstrategico.length > 0
                            ? 'Roadmap estratégico passo a passo com projetos práticos e cursos recomendados'
                            : 'Passos concretos para implementar seu desenvolvimento'
                          }
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pr-2">
                        {actionPlan.length > 0 ? (
                          <div className="relative">
                            {/* Timeline Vertical */}
                            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-primary/30"></div>

                            {actionPlan.map((plan, index) => (
                              <div key={index} className="relative pl-16 pb-8">
                                {/* Ícone de Passo */}
                                <div className="absolute left-4 top-0 w-4 h-4 bg-primary rounded-full border-4 border-background shadow-lg flex items-center justify-center">
                                  <span className="text-xs font-bold text-primary-foreground">{plan.passo || index + 1}</span>
                                </div>

                                {/* Conteúdo do Passo */}
                                <div className="space-y-4 p-4 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all duration-300">
                                  {/* Título e Descrição */}
                                  <div className="space-y-3">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <h4 className="font-semibold text-foreground text-lg">{plan.title}</h4>
                                        <p className="text-sm text-muted-foreground leading-relaxed">{plan.description}</p>
                                      </div>
                                      <Badge variant="outline" className="text-xs flex-shrink-0">
                                        {plan.cursos.length} cursos
                                      </Badge>
                                    </div>
                                  </div>

                                  {/* Projeto Sugerido */}
                                  {plan.projeto && (
                                    <div className="bg-muted/30 rounded-lg p-3 border-l-4 border-blue-500">
                                      <div className="flex items-center gap-2 mb-2">
                                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                          <span className="text-white text-xs">⚡</span>
                                        </div>
                                        <h5 className="font-medium text-sm text-foreground">Projeto Sugerido</h5>
                                      </div>
                                      <p className="text-sm text-muted-foreground leading-relaxed">{plan.projeto}</p>
                                    </div>
                                  )}

                                  {/* Cursos Recomendados */}
                                  {plan.cursos.length > 0 && (
                                    <div className="bg-muted/30 rounded-lg p-3 border-l-4 border-green-500">
                                      <div className="flex items-center gap-2 mb-3">
                                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                          <span className="text-white text-xs">📚</span>
                                        </div>
                                        <h5 className="font-medium text-sm text-foreground">Cursos Recomendados</h5>
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
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
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

          {/* LinkedIn Jobs Tab - TEMPORARIAMENTE OCULTO */}
          {/* <TabsContent value="vagas" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Vagas do Mercado</CardTitle>
                <CardDescription>
                  Vagas encontradas via {resultado.fonte_dados === 'JSearch' ? 'JSearch' : 'dados estáticos'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {resultado.vagas_mercado && resultado.vagas_mercado.length > 0 ? (
                  <div className="space-4">
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
          </TabsContent> */}

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

// Estilos personalizados para scroll
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: hsl(var(--muted-foreground) / 0.3);
    border-radius: 3px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: hsl(var(--muted-foreground) / 0.5);
  }
`;

// Adicionar estilos ao head do documento
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = scrollbarStyles;
  document.head.appendChild(styleElement);
}

export default Results;