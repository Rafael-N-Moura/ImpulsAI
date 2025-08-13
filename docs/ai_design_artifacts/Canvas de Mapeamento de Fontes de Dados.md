## Canvas de Mapeamento de Fontes de Dados

Este documento mapeia as fontes de dados essenciais para o funcionamento do MVP da plataforma Impuls**AI**.

### Fonte de Dados 1: Currículo do Usuário
---

| Seção | Detalhes |
| :---- | :---- |
| **Nome da Fonte** | Currículo do Usuário (CV) |
| **Descrição** | Documento pessoal contendo o histórico profissional, educacional e as competências do usuário. É a entrada primária para a análise de perfil. |
| **Origem** | Upload direto pelo usuário na plataforma. |
| **Tipo de Dados** | Predominantemente textual (descrições, títulos), com dados categóricos (nomes de empresas) e temporais (datas). |
| **Formato** | Arquivos não estruturados, como PDF e DOCX. |
| **Frequência** | Sob demanda (sempre que o usuário inicia uma nova análise). |
| **Qualidade** | Variável. Pode ser bem estruturado ou mal formatado, com informações faltantes. A IA precisa ser robusta para lidar com essa variabilidade. |
| **Métodos de Coleta** | Upload de arquivo via formulário na aplicação web. |
| **Acesso** | Acesso temporário no backend para processamento. O arquivo não é armazenado permanentemente para garantir a privacidade. |
| **Proprietário** | O próprio usuário. |
| **Restrições** | **Dados Pessoais Sensíveis (LGPD):** Requer consentimento explícito para processamento. A transmissão deve ser criptografada (HTTPS) e os dados devem ser excluídos após a análise. |
| **Integração** | Necessidade de uma biblioteca no backend (ex: pdf-parse) para extrair o texto bruto dos arquivos. O texto extraído é então enviado para a IA. |

### Fonte de Dados 2: Base de Dados de Vagas de Emprego (MVP)
---

| Seção | Detalhes |
| :---- | :---- |
| **Nome da Fonte** | Base de Dados de Vagas (Estática) |
| **Descrição** | Arquivo estático contendo descrições de vagas de emprego reais, coletadas e tratadas para servir como uma representação do mercado de trabalho para o MVP. |
| **Origem** | Externa. Dados coletados de portais de vagas públicos a partir de web-scrapping (ex: LinkedIn, Indeed). |
| **Tipo de Dados** | Textual (títulos, descrições, requisitos), categórico (nome da empresa, localização). |
| **Formato** | Arquivo JSON estruturado (vagas.json). |
| **Frequência** | Nenhuma (estática para o MVP). Em versões futuras, poderia ser atualizada periodicamente. |
| **Qualidade** | Controlada. Os dados foram pré-processados para garantir um formato consistente. |
| **Métodos de Coleta** | Web scraping (executado uma vez para criar o arquivo do MVP). |
| **Acesso** | Leitura direta do arquivo vagas.json pelo sistema de backend. |
| **roprietário** | Os dados são públicos, mas foram agregados e estruturados pela equipe do projeto. |
| **Restrições** | Baixas. Os dados são públicos e não contêm informações pessoais. Deve-se respeitar os termos de serviço dos sites de origem. |
| **Integração** | O backend precisa apenas ler e fazer o parse do arquivo JSON local. Nenhuma transformação complexa é necessária. |

### Fonte de Dados 3: Base de Dados de Cursos (MVP)
---

| Seção | Detalhes |
| :---- | :---- |
| **Nome da Fonte** | Base de Dados de Cursos Curados |
| **Descrição** | Arquivo estático com uma lista curada de cursos online de alta qualidade, mapeados para competências técnicas específicas, para serem recomendados no plano de ação. |
| **Origem** | Interna. Criada e mantida pela equipe do projeto. |
| **Tipo de Dados** | Textual (nome do curso, plataforma), categórico (competência associada), URL (link para o curso). |
| **Formato** | Arquivo JSON estruturado (cursos.json). |
| **Frequência** | Sob demanda (quando a equipe decide adicionar ou atualizar os cursos). |
| **Qualidade** | Alta. Os dados são inseridos manualmente e validados pela equipe. |
| **Métodos de Coleta** | Pesquisa manual e curadoria pela equipe. |
| **Acesso** | Leitura direta do arquivo cursos.json pelo sistema de backend. |
| **Proprietário** | Equipe do Projeto Impulso. |
| **Restrições** | Nenhuma. Todos os dados são públicos e de referência. |
| **Integração** | O backend precisa ler o arquivo JSON e usá-lo como um dicionário para mapear as competências identificadas como "lacunas" às sugestões de cursos. |

