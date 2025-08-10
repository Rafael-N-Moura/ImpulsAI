## C4 Diagram - ImpulsAI

### Contexto
---
```mermaid
C4Context
    title Diagrama de Contexto do Sistema (Nível 1)
    Person(candidate, "Candidato", "Profissional em busca de emprego")
    System(impulsa_ai, "ImpulsAI", "Plataforma de otimização de currículos")
    System_Ext(gemini_api, "API do Gemini", "Serviço de inteligência artificial")

    Rel(candidate, impulsa_ai, "Utiliza a plataforma para otimizar currículo e obter guias")
    Rel(impulsa_ai, gemini_api, "Solicita análise semântica e otimização", "HTTPS")
```

#### Descrição:

O Candidato é o usuário principal, que interage com o ImpulsAI. O ImpulsAI é o sistema que coordena as informações e fornece a solução. A API do Gemini é um sistema externo essencial que fornece a inteligência artificial para o processamento dos dados.

### Contêiners
---
Este diagrama amplia a visão do sistema ImpulsAI, dividindo-o em seus principais contêineres tecnológicos. Ele detalha a arquitetura monolítica, mostrando como os componentes principais interagem.
```mermaid
C4Container
    title Diagrama de Contêineres (Nível 2 - Arquitetura Monolítica)
    Person(candidate, "Candidato", "Profissional em busca de emprego")

    System_Boundary(impulsa_ai, "ImpulsAI") {
        Container(webapp, "Aplicação Web", "React", "Interface do usuário que interage via navegador")
        Container(backend, "Backend Monolítico", "Node.js, Express", "Servidor único com todos os endpoints e serviços")
        ContainerDb(db_json, "Dados Estáticos", "Arquivos JSON", "Armazena informações de vagas e cursos")
    }

    System_Ext(gemini_api, "API do Gemini", "Serviço de IA do Google")

    Rel(candidate, webapp, "Interage através do navegador")
    Rel(webapp, backend, "Chamadas de API REST", "JSON/HTTP")
    Rel(backend, db_json, "Lê dados estáticos")
    Rel(backend, gemini_api, "Solicita processamento de IA (Prompts)")
```

Descrição:

* Aplicação Web (Frontend): O contêiner de apresentação, executado no navegador do usuário, responsável pela interface.

* Backend Monolítico: O contêiner que centraliza toda a lógica de negócio, autenticação e orquestração dos serviços.

* Dados Estáticos (Arquivos JSON): O contêiner de persistência, que armazena os dados de referência para o sistema.

* API do Gemini: O contêiner externo que fornece a inteligência artificial.

### Componentes
---
Este diagrama detalha o contêiner Backend Monolítico, exibindo os principais componentes de software, suas responsabilidades e as interações entre eles.
```mermaid
C4Component
    title Diagrama de Componentes (Nível 3 - Backend Monolítico)

    Container(webapp, "Aplicação Web", "React", "Interface do usuário")
    ContainerDb(db_json, "Dados Estáticos", "Arquivos JSON", "Catálogo de vagas e cursos")

    System_Boundary(backend, "Backend Monolítico") {
        Component(server, "server.js", "Express.js", "Ponto de entrada da API")
        Component(analysis_service, "analysisService.js", "Node.js", "Orquestrador do processo de análise")
        Component(cv_parser, "cvParser.js", "Node.js", "Extração de texto de currículos")
        Component(gemini_client, "geminiClient.js", "Node.js", "Cliente da API do Gemini")
        Component(jsearch_service, "jsearchService.js", "Node.js", "Busca de vagas")
        Component(linkedin_service, "linkedinService.js", "Node.js", "Serviços relacionados ao LinkedIn")
    }

    System_Ext(gemini_api, "API do Gemini", "Serviço de IA do Google")

    Rel(webapp, server, "Faz chamadas de API", "HTTP")

    Rel(server, analysis_service, "Coordena a análise de currículo e vaga")
    Rel(server, jsearch_service, "Busca de vagas (opcional)")
    Rel(server, linkedin_service, "Serviços do LinkedIn (opcional)")

    Rel(analysis_service, cv_parser, "Utiliza para extrair texto")
    Rel(analysis_service, gemini_client, "Faz requisições para IA")
    Rel(analysis_service, db_json, "Lê dados para benchmarking")

    Rel(gemini_client, gemini_api, "Faz chamadas para a API do Gemini", "HTTP")

    Rel(server, db_json, "Lê dados de configuração")
```

#### Descrição:

* O componente `server.js` é a interface do backend, recebendo as requisições da Aplicação Web.
* O `analysisService.js` orquestra o fluxo de análise, utilizando o `cvParser.js` para extrair o texto do currículo e o `geminiClient.js` para interagir com a inteligência artificial.

* O `geminiClient.js` é um componente-chave que encapsula a comunicação com a API do Gemini externa.

* Os componentes `jsearchService.js` e `linkedinService.js` representam outros serviços modulares que podem ser utilizados pelo servidor principal.

* O `db_json` é acessado internamente pelos serviços para consultar os dados estáticos de vagas e cursos.