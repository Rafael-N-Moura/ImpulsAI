import { useLocation, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Star, CheckCircle, Target, BookOpen, Search, Edit3 } from 'lucide-react';

const Results = () => {
  const location = useLocation();
  const resultado = location.state?.resultado;
  const cargoAlmejado = location.state?.cargoAlmejado || 'Desenvolvedor';

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
    title: item.competencia,
    priority: item.importancia || 'Importante',
    priorityColor: 'default',
    cursos: item.cursos_sugeridos || []
  })) || [
      { title: 'Cloud Computing (AWS/Azure)', priority: 'Urgente', priorityColor: 'destructive', cursos: [] },
      { title: 'Arquitetura de Microsserviços', priority: 'Importante', priorityColor: 'default', cursos: [] },
      { title: 'Ferramentas de CI/CD (Jenkins, GitLab)', priority: 'Recomendado', priorityColor: 'secondary', cursos: [] },
      { title: 'Containerização com Docker & Kubernetes', priority: 'Importante', priorityColor: 'default', cursos: [] }
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
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="roadmap" className="gap-2">
              <Target className="h-4 w-4" />
              Roadmap de Carreira
            </TabsTrigger>
            <TabsTrigger value="optimization" className="gap-2">
              <Edit3 className="h-4 w-4" />
              Otimização de Currículo
            </TabsTrigger>
          </TabsList>
          {/* Career Roadmap Tab */}
          <TabsContent value="roadmap" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Strengths */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-400 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Seus Pontos Fortes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {strengths.map((strength: string, index: number) => (
                      <div key={index} className="flex items-center gap-3">
                        <Star className="h-4 w-4 text-green-400 fill-current" />
                        <span className="text-foreground">{strength}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                {/* Development Opportunities */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-yellow-400 flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      Oportunidades de Desenvolvimento
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {opportunities.map((opp, index) => (
                      <div key={index} className="flex flex-col gap-2 border-b pb-2 mb-2">
                        <div className="flex items-center justify-between">
                          <span className="text-foreground">{opp.title}</span>
                          <Badge variant={opp.priorityColor as any}>{opp.priority}</Badge>
                        </div>
                        {opp.cursos && opp.cursos.length > 0 && (
                          <div className="pl-4 mt-1 space-y-1">
                            {opp.cursos.map((curso: any, i: number) => (
                              <a key={i} href={curso.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm">
                                {curso.nome}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
              {/* Right Column */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-primary flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Plano de Ação Sugerido
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {actionPlan.length > 0 ? actionPlan.map((plan, index) => (
                      <div key={index} className="space-y-3 border-l-2 border-primary pl-4">
                        <h4 className="font-semibold text-foreground">{plan.title}</h4>
                        <p className="text-sm text-muted-foreground">{plan.description}</p>
                        {plan.cursos.map((curso: any, i: number) => (
                          <Button key={i} asChild variant="outline" size="sm" className="gap-2">
                            <a href={curso.url} target="_blank" rel="noopener noreferrer">
                              <BookOpen className="h-4 w-4" />
                              {curso.nome}
                            </a>
                          </Button>
                        ))}
                      </div>
                    )) : <p className="text-muted-foreground">Nenhum plano de ação sugerido disponível.</p>}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          {/* Resume Optimization Tab (agora real) */}
          <TabsContent value="optimization" className="space-y-6">
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
                      <div className="space-y-3">
                        {sugestoes.map((s, i) => (
                          <div key={i} className="space-y-2 p-4 rounded-lg bg-muted/30">
                            <h4 className="font-semibold text-primary">{s.title}</h4>
                            <div className="space-y-1">
                              <div>
                                <span className="text-sm text-muted-foreground">Original: </span>
                                <span className="text-sm text-red-400">{s.original}</span>
                              </div>
                              <div>
                                <span className="text-sm text-muted-foreground">Sugestão: </span>
                                <span className="text-sm text-green-400">{s.suggestion}</span>
                              </div>
                            </div>
                          </div>
                        ))}
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