# **Canvas de Estratégia e Ação do Projeto**

### **1\. Objetivo Estratégico Geral**

* **Objetivo:** Tornar-se a principal ferramenta de planejamento de carreira para estudantes e profissionais no Brasil, transformando a incerteza profissional em um plano de ação claro, personalizado e baseado em dados reais do mercado de trabalho.

### **2\. Objetivos Estratégicos Secundários**

* **Objetivos:**  
  * Reduzir a ansiedade e a paralisia decisória associadas à escolha de uma carreira ou à necessidade de requalificação.  
  * Otimizar o investimento de tempo e recursos do usuário, direcionando-o para as competências com maior demanda.  
  * Aumentar a empregabilidade dos usuários, diminuindo o tempo necessário para que se qualifiquem para os cargos que almejam.

### **3\. Resultados-Chave Esperados (Quantitativos)**

* **Resultados-Chave:**  
  * Entregar um MVP funcional capaz de gerar um relatório de "gap analysis" e um roadmap de cursos para pelo menos um cargo-alvo.  
  * Atingir a marca de 50 roadmaps gerados por usuários-beta durante a fase de testes (últimas 2 semanas do projeto).  
  * Obter uma nota média de 4/5 na pesquisa de satisfação sobre a clareza e utilidade do relatório gerado pelo MVP.

### **4\. Indicadores-Chave de Sucesso (KPIs)**

* **KPIs:**  
  * **Número de Roadmaps Gerados:** Total de análises completas realizadas pela plataforma.  
  * **Índice de Qualidade do Plano (IQP):** Nota média (1-5) dada pelos usuários sobre a relevância do plano de ação.  
  * **Taxa de Conclusão do Fluxo:** Percentual de usuários que iniciam o processo (upload do CV) e chegam até a visualização do resultado final.

### **5\. Requisitos Estratégicos e Restrições**

* **Requisitos e Restrições:**  
  * **Restrição Crítica de Acesso a Dados:** A maior restrição é a dificuldade de obter acesso a dados de vagas em tempo real. O MVP **deve** usar uma base de dados estática (vagas.json) para mitigar este risco.  
  * **Privacidade de Dados (LGPD):** O tratamento de dados curriculares do usuário deve seguir estritamente a LGPD, exigindo consentimento explícito e garantindo a segurança das informações.  
  * **Tecnologia:** A solução deve obrigatoriamente utilizar uma IA Generativa como núcleo do seu motor de análise.

### **6\. Priorização de Objetivos**

* **Priorização:**  
  * **Alta Prioridade:** Desenvolver o motor de "Gap Analysis" e geração de roadmap com a base de dados estática. Esta é a prova de conceito que valida toda a solução.  
  * **Média Prioridade:** Criar uma interface de usuário (UI) intuitiva e clara para o fluxo de upload e visualização de resultados.  
  * **Baixa Prioridade:** Implementar a funcionalidade de otimização de escrita do currículo. (Pode ser um "stretch goal" se o desenvolvimento do núcleo for rápido).

### **7\. Ações e Recursos Necessários**

* **Ações:**  
  * **Ação 1:** Finalizar a coleta e estruturação da base de dados estática de vagas (vagas.json) e da base curada de cursos (cursos.json).  
  * **Ação 2:** Desenvolver o backend (Node.js/Express) com o endpoint /analyze que orquestra as chamadas à API do Gemini para extração e análise.  
  * **Ação 3:** Desenvolver o frontend (React/Tailwind) com os três fluxos de tela (Upload, Carregamento, Resultados).  
* **Recursos:**  
  * **Equipe de Desenvolvimento:** 3 membros (Maria Eduarda, Ithalo, Rafael) com papéis definidos.  
  * **Recursos Tecnológicos:** Chave de acesso para a API do Google Gemini. Contas em serviços de deploy (Vercel, Render).  
  * **Dados:** Arquivos vagas.json e cursos.json criados e mantidos pela equipe.