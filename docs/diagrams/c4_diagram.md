## C4 Diagram - ImpulsAI
Este documento apresenta a arquitetura do ImpulsAI utilizando a notação do Modelo C4, que descreve o sistema em diferentes níveis de abstração. O foco está nos níveis de Contexto, Contêineres e Componentes para fornecer uma visão clara da estrutura e das interações do sistema.

### Nível 1: Diagrama de Contexto do Sistema
---
Este diagrama mostra o ImpulsAI como uma caixa única, ilustrando sua interação com o principal usuário (Candidato) e com os sistemas externos dos quais depende.

```mermaid
C4Context
    title Diagrama de Contexto do Sistema (Nível 1)
    Person(candidate, "Candidato", "Profissional em busca de emprego")
    System(impulsa_ai, "ImpulsAI", "Plataforma de otimização de currículos")
    System_Ext(gemini_api, "API do Gemini", "Serviço de inteligência artificial")
    System_Ext(web_scraping_api, "API de Web Scraping", "Serviço de coleta de dados de vagas e cursos")

    Rel(candidate, impulsa_ai, "Utiliza a plataforma para otimizar currículo e obter guias")

    Rel(impulsa_ai, gemini_api, "Solicita análise semântica e otimização", "HTTPS")
    Rel(impulsa_ai, web_scraping_api, "Solicita dados de vagas e cursos", "HTTPS")
```

#### Descrição
* O Candidato é o usuário principal, que interage com o ImpulsAI.
* O ImpulsAI é o sistema que coordena as informações e fornece a solução.
* A API do Gemini é um sistema externo essencial que fornece a inteligência artificial para o processamento dos dados.
* A API de Web Scraping é um novo sistema externo, implementado em Flask, responsável por coletar dados de vagas e cursos de fontes como LinkedIn, Udemy, Coursera, etc.

### Nível 2: Diagrama de Contêineres
---
Este diagrama amplia a visão do sistema ImpulsAI, dividindo-o em seus principais contêineres tecnológicos. Ele detalha a arquitetura Cliente-Serviço, mostrando como os componentes principais interagem.

```mermaid
C4Container
    title Diagrama de Contêineres (Nível 2 - Arquitetura Cliente-Serviço)
    Person(candidate, "Candidato", "Profissional em busca de emprego")

    System_Boundary(impulsa_ai, "ImpulsAI") {
        Container(webapp, "Aplicação Web", "React", "Interface do usuário que interage via navegador")
        Container(backend, "Backend Monolítico", "Node.js, Express", "Servidor único com todos os endpoints e serviços")
    }

    System_Ext(gemini_api, "API do Gemini", "Serviço de IA do Google")
    System_Ext(web_scraping_api, "API de Web Scraping", "API Flask com Pandas, Cloudscraper, Docker")

    Rel(candidate, webapp, "Interage através do navegador")
    Rel(webapp, backend, "Chamadas de API REST", "JSON/HTTP")
    Rel(backend, gemini_api, "Solicita processamento de IA (Prompts)")
    Rel(backend, web_scraping_api, "Solicita dados de vagas e cursos", "HTTPS")
```

#### Descrição
* Aplicação Web (Frontend): O contêiner de apresentação, desacoplado do backend, executado no navegador do usuário e responsável pela interface.
* Backend Monolítico: O contêiner que centraliza a lógica de negócio, autenticação e orquestração dos serviços. Ele é desacoplado do frontend e se comunica com os serviços externos para obter dados.
* API do Gemini: O contêiner externo que fornece a inteligência artificial.
* API de Web Scraping: Um novo contêiner externo, responsável pela coleta de dados. Sua implementação em Flask, com Docker, Nginx e SSL, garante segurança e controle de acesso via API keys.

### Nível 3: Diagrama de Componentes
---
Este diagrama detalha o contêiner Backend Monolítico, exibindo os principais componentes de software, suas responsabilidades e as interações entre eles.

```mermaid
C4Component
    title Diagrama de Componentes (Nível 3 - Backend Monolítico)

    Container(webapp, "Aplicação Web", "React", "Interface do usuário")
    Container(backend_monolith, "Backend Monolítico", "Node.js, Express", "Servidor principal")

    System_Ext(gemini_api, "API do Gemini", "Serviço de IA")
    System_Ext(web_scraping_api, "API de Web Scraping", "API Flask")

    System_Boundary(backend_monolith, "Backend Monolítico") {
        Component(server, "server.js", "Express.js", "Ponto de entrada da API")
        Component(analysis_service, "analysisService.js", "Node.js", "Orquestrador do processo de análise")
        Component(cv_parser, "cvParser.js", "Node.js", "Extração de texto de currículos")
        Component(gemini_client, "geminiClient.js", "Node.js", "Cliente da API do Gemini")
    }

    Rel(webapp, server, "Faz chamadas de API", "HTTP")
    Rel(server, analysis_service, "Coordena a análise de currículo e vaga")
    Rel(analysis_service, cv_parser, "Utiliza para extrair texto")
    Rel(analysis_service, gemini_client, "Faz requisições para IA")
    Rel(analysis_service, web_scraping_api, "Faz requisição de dados", "HTTPS")
    Rel(gemini_client, gemini_api, "Faz chamadas para a API do Gemini", "HTTP")
```

#### Descrição:
* O componente `server.js` é a interface do backend, recebendo as requisições da Aplicação Web.
* O `analysisService.js` orquestra o fluxo de análise, utilizando o `cvParser.js` para extrair o texto do currículo, e faz requisições para a API de Web Scraping para obter dados de vagas e cursos.
* O `gemini_client.js` é um componente-chave que encapsula a comunicação com a API do Gemini externa.