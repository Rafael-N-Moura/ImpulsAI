## Registro de Design de Prompt: EXTRACAO-CV-MVP-01
## 1\. Metadados
---
* **Propósito:** Extrair de forma estruturada as competências (hard skills e soft skills), experiências e formação de um texto de currículo não estruturado.  
* **Modelo(s) Alvo:** Google Gemini 1.5 Pro (otimizado para seguir instruções de formato JSON).  
* **Versão do Registro:** 1.0

## 2\. Estrutura do Prompt
---
* **Contexto de Entrada Necessário:** Texto completo e bruto do currículo do usuário.  
* **Template do Prompt (com variáveis):**  
  \# PERSONA  
  Você é um especialista em recrutamento técnico (Tech Recruiter) com alta capacidade de análise de currículos.

  \# TAREFA  
  Analise o texto do currículo a seguir e extraia as competências técnicas (hard skills), competências interpessoais (soft skills) e as experiências profissionais mais relevantes. Seja conciso e foque em termos-chave.

  \# CONTEÚDO DO CURRÍCULO  
  {texto\_completo\_cv}

  \# FORMATO DE SAÍDA (Obrigatório)  
  Responda APENAS com um objeto JSON válido, sem nenhum texto adicional antes ou depois. O JSON deve conter as chaves: "hard\_skills" (um array de strings), "soft\_skills" (um array de strings).

## 3\. Estrutura da Resposta
---
* **Intenção da Resposta:** Um objeto JSON estruturado contendo as listas de competências extraídas. A resposta não deve conter nenhum texto fora do JSON.  
* **Exemplo de Saída Ideal:**  
  {  
    "hard\_skills": \["Node.js", "Express", "JavaScript", "TypeScript", "PostgreSQL", "MongoDB", "Git", "Docker", "React.js"\],  
    "soft\_skills": \["Comunicação", "Trabalho em Equipe", "Resolução de Problemas", "Proatividade"\]  
  }

## 4\. Teste e Qualidade
---
* **Critérios de Aceite / Métricas de Qualidade:**  
  1. A saída DEVE ser um JSON válido.  
  2. DEVE conter as chaves hard\_skills e soft\_skills.  
  3. As competências listadas DEVEM estar presentes ou ser inferíveis a partir do texto do currículo.  
  4. NÃO DEVE incluir informações pessoais como nome, telefone ou e-mail.  
* **Parâmetros Recomendados (Opcional):** Temperatura: 0.1 (para máxima precisão na extração).

## 5\. Notas Adicionais
---
* **Notas:** A qualidade da extração pode variar com a formatação do currículo. Considerar a implementação de uma lógica de "retry" ou de validação do JSON de saída no backend.