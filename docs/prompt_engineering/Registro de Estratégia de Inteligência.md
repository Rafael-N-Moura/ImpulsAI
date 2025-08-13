## Registro de Estratégia de Inteligência

### 1\. Objetivo da Inteligência
---
* **Objetivo:** A tarefa principal da IA é realizar uma "análise de lacunas" (gap analysis) de carreira. Isso envolve três ações principais:  
  1. Extrair competências estruturadas (skills) a partir do texto não estruturado de um currículo.  
  2. Comparar as competências do usuário com as competências mais demandadas para um cargo-alvo, identificando pontos fortes e lacunas.  
  3. Gerar um relatório estruturado (JSON) com o resultado da análise.

### 2\. Abordagem Técnica Principal
---
* **Estratégia:**  
  * \[ \] Treinamento de Modelo Customizado  
  * \[ \] Fine-Tuning de Modelo de Fundação  
  * \[ \] RAG (Retrieval-Augmented Generation)  
  * \[X\] **Engenharia de Prompt Avançada**  
  * \[ \] Outra: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_  
* **Justificativa:** A solução não depende de buscar informações em uma base de conhecimento para responder a uma pergunta (o que caracterizaria RAG), mas sim de orquestrar uma **cadeia de prompts** para realizar tarefas complexas de extração, análise e formatação de dados. A IA atua como um motor de processamento e raciocínio, guiado por instruções precisas que exigem saídas em formato JSON, caracterizando uma abordagem de engenharia de prompt avançada.

### 3\. Componentes Chave da Arquitetura
---
* **Componentes:**  
  * **Processador de Documentos:** Biblioteca pdf-parse (ou similar) para extrair o texto bruto do currículo do usuário.  
  * **Fontes de Dados Estruturados:** Módulos para ler os arquivos vagas.json e cursos.json.  
  * **Orquestrador de Prompts:** O serviço principal no backend que gerencia a cadeia de chamadas à IA.  
  * **Modelo de Geração (LLM):** **Google Gemini 1.5 Pro**, utilizado para as duas tarefas principais (extração e análise).

### 4\. Fonte de Dados / Conhecimento
---
* **Fontes:**  
  * **Currículo do Usuário:** Texto não estruturado extraído de arquivos PDF/DOCX.  
  * **Base de Dados de Vagas:** Arquivo vagas.json estático, contendo um corpus de \~40-60 descrições de vagas reais e tratadas.  
  * **Base de Dados de Cursos:** Arquivo cursos.json estático e curado, mapeando competências a cursos específicos.

### 5\. Estratégia de Avaliação
---
* **Métricas:**  
  * **Validação de Formato:** A resposta da IA DEVE ser sempre um JSON válido e aderente ao esquema definido nos prompts. (Métrica de Sucesso/Falha).  
  * **Acurácia da Extração:** Avaliação manual da qualidade da extração de competências do CV. A IA identificou as skills mais importantes? (Avaliação qualitativa).  
  * **Relevância da Análise:** O relatório de "pontos fortes" e "lacunas" é coerente e faz sentido para o cargo-alvo? (Avaliação qualitativa baseada nas personas "Lucas" e "Ana").  
  * **Consistência:** Executar a mesma análise múltiplas vezes para garantir que os resultados sejam consistentes.

### 6\. Ferramentas e Time
---
* **Ferramentas:** Node.js, Express, Google Gemini API, pdf-parse, axios.