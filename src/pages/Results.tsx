import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Star, CheckCircle, Target, BookOpen, Search, Edit3 } from 'lucide-react';

const Results = () => {
  const [searchParams] = useSearchParams();
  const targetPosition = searchParams.get('position') || 'Desenvolvedor';
  
  const strengths = [
    'Desenvolvimento Back-end (Node.js, Express)',
    'Bancos de Dados (SQL e NoSQL)',
    'Criação e Consumo de APIs RESTful',
    'Controle de Versão com Git'
  ];

  const opportunities = [
    { 
      title: 'Cloud Computing (AWS/Azure)', 
      priority: 'Urgente',
      priorityColor: 'destructive'
    },
    { 
      title: 'Arquitetura de Microsserviços', 
      priority: 'Importante',
      priorityColor: 'default'
    },
    { 
      title: 'Ferramentas de CI/CD (Jenkins, GitLab)', 
      priority: 'Recomendado',
      priorityColor: 'secondary'
    },
    { 
      title: 'Containerização com Docker & Kubernetes', 
      priority: 'Importante',
      priorityColor: 'default'
    }
  ];

  const actionPlan = [
    {
      title: 'Cloud Computing',
      description: 'Para se tornar competitivo, dominar a nuvem é essencial. A AWS é a líder de mercado.',
      course: 'Ver curso: Formação AWS Cloud Practitioner (Alura)'
    },
    {
      title: 'Microsserviços e Docker',
      description: 'Saber construir e escalar aplicações com microsserviços e containers é um grande diferencial para vagas sênior.',
      course: 'Ver curso: Docker for the Absolute Beginner (Udemy)'
    }
  ];

  const aiSuggestions = [
    {
      title: 'Use Verbos de Ação',
      original: 'Responsável pelo desenvolvimento de novas features.',
      suggestion: 'Desenvolvi e implementei novas features, resultando em...'
    },
    {
      title: 'Quantifique seus Resultados', 
      original: 'Fiz a manutenção de sistemas legados.',
      suggestion: 'Otimizei e realizei a manutenção de sistemas legados, melhorando a performance em 15%.'
    },
    {
      title: 'Seja Específico',
      original: 'Participei de reuniões de equipe.',
      suggestion: 'Colaborei ativamente em cerimônias ágeis (Scrum), contribuindo para o planejamento de sprints.'
    }
  ];

  const resumeData = {
    name: 'Lucas Silva',
    title: 'Desenvolvedor de Software',
    contact: '(81) 99999-8888 | lucas.silva@email.com | linkedin.com/in/lucassilva',
    summary: 'Profissional com experiência em desenvolvimento de aplicações web, focado em tecnologias de backend. Buscando uma oportunidade como Desenvolvedor Pleno para aplicar minhas habilidades e crescer profissionalmente.',
    experience: [
      {
        role: 'Desenvolvedor de Software Jr.',
        company: 'InovaTech Solutions',
        location: 'Recife, PE',
        period: '(Fev 2022 – Presente)',
        responsibilities: [
          'Responsável pelo desenvolvimento de novas features.',
          'Fiz a manutenção de sistemas legados.',
          'Participei de reuniões de equipe.'
        ]
      }
    ]
  };

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
              Análise para o cargo de: <span className="text-primary font-semibold">{targetPosition}</span>
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
                    {strengths.map((strength, index) => (
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
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-foreground">{opp.title}</span>
                        <Badge variant={opp.priorityColor as any}>{opp.priority}</Badge>
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
                    {actionPlan.map((plan, index) => (
                      <div key={index} className="space-y-3 border-l-2 border-primary pl-4">
                        <h4 className="font-semibold text-foreground">{plan.title}</h4>
                        <p className="text-sm text-muted-foreground">{plan.description}</p>
                        <Button variant="outline" size="sm" className="gap-2">
                          <BookOpen className="h-4 w-4" />
                          {plan.course}
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Resume Optimization Tab */}
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
                    {aiSuggestions.map((suggestion, index) => (
                      <div key={index} className="space-y-3 p-4 rounded-lg bg-muted/30">
                        <h4 className="font-semibold text-primary">{suggestion.title}</h4>
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm text-muted-foreground">Original: </span>
                            <span className="text-sm text-red-400">{suggestion.original}</span>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Sugestão: </span>
                            <span className="text-sm text-green-400">{suggestion.suggestion}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Resume Analysis */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-foreground">Seu Currículo Analisado</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 font-mono text-sm">
                    <div>
                      <h3 className="font-bold text-lg">{resumeData.name}</h3>
                      <p className="text-muted-foreground">{resumeData.title}</p>
                      <p className="text-muted-foreground">{resumeData.contact}</p>
                    </div>
                    
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-2">Resumo</h4>
                      <p className="text-muted-foreground">{resumeData.summary}</p>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-2">Experiência Profissional</h4>
                      {resumeData.experience.map((exp, index) => (
                        <div key={index} className="space-y-2">
                          <div>
                            <p className="font-medium">{exp.role} | {exp.company} | {exp.location}</p>
                            <p className="text-muted-foreground">{exp.period}</p>
                          </div>
                          <ul className="space-y-1 ml-4">
                            {exp.responsibilities.map((resp, respIndex) => (
                              <li key={respIndex} className="text-muted-foreground">- {resp}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
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