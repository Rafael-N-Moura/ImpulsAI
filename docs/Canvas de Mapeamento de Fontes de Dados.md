# **Canvas de Mapeamento de Fontes de Dados**

Este documento mapeia as fontes de dados essenciais para o funcionamento do MVP da plataforma "Impulso".

## **Fonte de Dados 1: Currículo do Usuário**

| Seção | Detalhes |
| :---- | :---- |
| **1\. Nome da Fonte** | Currículo do Usuário (CV) |
| **2\. Descrição** | Documento pessoal contendo o histórico profissional, educacional e as competências do usuário. É a entrada primária para a análise de perfil. |
| **3\. Origem** | Upload direto pelo usuário na plataforma. |
| **4\. Tipo de Dados** | Predominantemente textual (descrições, títulos), com dados categóricos (nomes de empresas) e temporais (datas). |
| **5\. Formato** | Arquivos não estruturados, como PDF e DOCX. |
| **6\. Frequência** | Sob demanda (sempre que o usuário inicia uma nova análise). |
| **7\. Qualidade** | Variável. Pode ser bem estruturado ou mal formatado, com informações faltantes. A IA precisa ser robusta para lidar com essa variabilidade. |
| **8\. Métodos de Coleta** | Upload de arquivo via formulário na aplicação web. |
| **9\. Acesso** | Acesso temporário no backend para processamento. O arquivo não é armazenado permanentemente para garantir a privacidade. |
| **10\. Proprietário** | O próprio usuário. |
| **11\. Restrições** | **Dados Pessoais Sensíveis (LGPD):** Requer consentimento explícito para processamento. A transmissão deve ser criptografada (HTTPS) e os dados devem ser excluídos após a análise. |
| **12\. Integração** | Necessidade de uma biblioteca no backend (ex: pdf-parse) para extrair o texto bruto dos arquivos. O texto extraído é então enviado para a IA. |

## **Fonte de Dados 2: Base de Dados de Vagas de Emprego (MVP)**

| Seção | Detalhes |
| :---- | :---- |
| **1\. Nome da Fonte** | Base de Dados de Vagas (Estática) |
| **2\. Descrição** | Arquivo estático contendo descrições de vagas de emprego reais, coletadas e tratadas para servir como uma representação do mercado de trabalho para o MVP. |
| **3\. Origem** | Externa. Dados coletados de portais de vagas públicos (ex: LinkedIn, Indeed). |
| **4\. Tipo de Dados** | Textual (títulos, descrições, requisitos), categórico (nome da empresa, localização). |
| **5\. Formato** | Arquivo JSON estruturado (vagas.json). |
| **6\. Frequência** | Nenhuma (estática para o MVP). Em versões futuras, poderia ser atualizada periodicamente. |
| **7\. Qualidade** | Controlada. Os dados foram pré-processados para garantir um formato consistente. |
| **8\. Métodos de Coleta** | Web scraping (executado uma vez para criar o arquivo do MVP). |
| **9\. Acesso** | Leitura direta do arquivo vagas.json pelo sistema de backend. |
| **10\. Proprietário** | Os dados são públicos, mas foram agregados e estruturados pela equipe do projeto. |
| **11\. Restrições** | Baixas. Os dados são públicos e não contêm informações pessoais. Deve-se respeitar os termos de serviço dos sites de origem. |
| **12\. Integração** | O backend precisa apenas ler e fazer o parse do arquivo JSON local. Nenhuma transformação complexa é necessária. |

## **Fonte de Dados 3: Base de Dados de Cursos (MVP)**

| Seção | Detalhes |
| :---- | :---- |
| **1\. Nome da Fonte** | Base de Dados de Cursos Curados |
| **2\. Descrição** | Arquivo estático com uma lista curada de cursos online de alta qualidade, mapeados para competências técnicas específicas, para serem recomendados no plano de ação. |
| **3\. Origem** | Interna. Criada e mantida pela equipe do projeto. |
| **4\. Tipo de Dados** | Textual (nome do curso, plataforma), categórico (competência associada), URL (link para o curso). |
| **5\. Formato** | Arquivo JSON estruturado (cursos.json). |
| **6\. Frequência** | Sob demanda (quando a equipe decide adicionar ou atualizar os cursos). |
| **7\. Qualidade** | Alta. Os dados são inseridos manualmente e validados pela equipe. |
| **8\. Métodos de Coleta** | Pesquisa manual e curadoria pela equipe. |
| **9\. Acesso** | Leitura direta do arquivo cursos.json pelo sistema de backend. |
| **10\. Proprietário** | Equipe do Projeto Impulso. |
| **11\. Restrições** | Nenhuma. Todos os dados são públicos e de referência. |
| **12\. Integração** | O backend precisa ler o arquivo JSON e usá-lo como um dicionário para mapear as competências identificadas como "lacunas" às sugestões de cursos. |

