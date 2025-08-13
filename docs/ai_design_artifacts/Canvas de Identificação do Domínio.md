## Canvas de Identificação do Domínio
### 1\. Nome do Domínio
---
**Nome:** Assistente de Desenvolvimento de Carreira Personalizado com IA (Projeto Impuls**AI**)

### 2\. Descrição do Domínio
---
* **Descrição:** O domínio abrange o planejamento e desenvolvimento de carreira para estudantes e profissionais. O processo atual é manual, reativo e fragmentado. Indivíduos precisam navegar por múltiplos portais de vagas (LinkedIn, Glassdoor), identificar manualmente as competências mais pedidas, comparar com seu próprio currículo, pesquisar em diversas plataformas de cursos (Coursera, Udemy) e tentar montar um plano de estudos coerente por conta própria.

### 3\. Justificativa da Escolha
---
* **Justificativa:** A escolha é justificada pela ansiedade e incerteza generalizada que muitos enfrentam em suas carreiras. A capacidade de um LLM de processar e sintetizar grandes volumes de texto (currículos, vagas, cursos) oferece uma oportunidade única de criar uma solução hiper-personalizada. Este projeto ataca uma dor real e universal, com alto potencial de impacto na vida das pessoas, ao mesmo tempo em que explora a premissa técnica do curso: conectar e extrair valor de diferentes fontes de dados através da IA.

### 4\. Problemas/Desafios Atuais
---
* **Problemas/Desafios:**  
  * **Sobrecarga de Informação:** A quantidade de vagas, cursos e conselhos de carreira disponíveis online é esmagadora.  
  * **Dificuldade na Análise de Lacunas (Gap Analysis):** É extremamente difícil para um indivíduo identificar objetivamente quais são as competências (hard e soft skills) que lhe faltam para uma determinada vaga ou cargo.  
  * **Falta de um Plano de Ação Claro:** Mesmo que identifique as lacunas, o profissional muitas vezes não sabe *por onde começar* ou qual a melhor sequência de aprendizado.  
  * **Processo Lento e Desmotivador:** A pesquisa manual é demorada e pode levar à "paralisia pela análise", onde o excesso de opções impede a tomada de decisão.

### 5\. Oportunidades de IA Generativa
---
* **Oportunidades:**  
  * **Extração Semântica Automatizada:** Utilizar o LLM para ler o currículo do usuário e dezenas de descrições de vagas, extraindo e padronizando as competências relevantes.  
  * **Diagnóstico de Lacunas Inteligente:** A IA pode comparar as competências do usuário com as mais demandadas pelo mercado para o cargo almejado, gerando um relatório de "gap analysis" preciso.  
  * **Geração de Roadmap Personalizado:** O LLM pode sintetizar o diagnóstico em um plano de estudos passo a passo, recomendando uma sequência lógica de aprendizado.  
  * **Otimização de Currículo:** A IA pode analisar a escrita do currículo e sugerir melhorias (verbos de ação, quantificação de resultados) para torná-lo mais impactante para recrutadores.

### **6\. Benefícios Esperados (Qualitativos)**

* **Benefícios:**  
  * **Empoderar o profissional:** Dar ao indivíduo um sentimento de controle e agência sobre sua própria trajetória profissional.  
  * **Democratizar o acesso a mentoria de carreira:** Oferecer um serviço de aconselhamento personalizado, que hoje é caro e inacessível para a maioria.  
  * **Promover uma cultura de aprendizado contínuo:** Inspirar os usuários a se manterem atualizados e relevantes no mercado de trabalho.  
  * **Reduzir a ansiedade profissional:** Transformar a incerteza e o medo do futuro em um plano claro e motivador.

### **7\. Riscos e Considerações Iniciais**

* **Riscos e Considerações:**  
  * **Risco Técnico (Acesso a Dados):** A maior dificuldade é o acesso programático e em tempo real a dados de vagas de emprego (APIs restritas). **Mitigação do MVP:** Utilizar uma base de dados estática e pré-coletada para validar o motor de IA.  
  * **Risco de Privacidade (LGPD):** A plataforma lidará com dados pessoais sensíveis (currículos). É mandatório implementar políticas de privacidade robustas, obter consentimento explícito do usuário e garantir a segurança dos dados.  
  * **Risco de Qualidade e Vieses:** As recomendações da IA dependem da qualidade e da diversidade da base de dados de vagas. Uma base enviesada pode gerar recomendações que perpetuam desigualdades no mercado de trabalho.