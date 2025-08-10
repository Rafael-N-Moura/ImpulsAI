# **C4 Model para o Projeto "ImpulsAI"**

Este documento descreve a arquitetura da plataforma "ImpulsAI" utilizando os três principais níveis do C4 Model, conforme os requisitos do projeto.

## **Nível 1: Diagrama de Contexto**

**Descrição**: Este diagrama mostra a visão mais ampla do sistema. Ele ilustra como o "Impulso" se encaixa em seu ambiente, quem são seus usuários e com quais sistemas externos ele interage.

```mermaid
graph TD  
    A\[\<div style='font-weight: bold'\>Usuário\</div\>\<br\>Estudante ou Profissional\<br\>em busca de orientação de carreira.\] \-- "1. Faz upload do CV e define o cargo-alvo" \--\> B{\<div style='font-size: 1.5rem; font-weight: bold'\>Plataforma Impulso\</div\>\<br\>Sistema de Análise de Carreira com IA};  
    B \-- "2. Envia textos para análise e extração" \--\> C\[\<div style='font-weight: bold'\>Google Gemini API\</div\>\<br\>Sistema externo de IA Generativa.\];  
    C \-- "3. Retorna dados estruturados (JSON)" \--\> B;  
    B \-- "4. Apresenta o roadmap de carreira personalizado" \--\> A;

    style A fill:\#0f172a,stroke:\#22d3ee,stroke-width:2px,color:\#fff  
    style B fill:\#1e293b,stroke:\#22d3ee,stroke-width:4px,color:\#fff  
    style C fill:\#334155,stroke:\#fff,stroke-width:2px,color:\#fff
```

## **Nível 2: Diagrama de Contêiner**

**Descrição**: Este diagrama "dá um zoom" no sistema "Impulso", mostrando os principais blocos de construção (contêineres) que o compõem. Ele detalha a arquitetura de alto nível e as tecnologias utilizadas em cada parte.
```mermaid
graph TD  
    subgraph "Sistema Impulso"  
        direction LR  
          
        A\[\<div style='font-weight: bold'\>Frontend Web App\</div\>\<br\>\<b\>Tecnologia:\</b\> React com Vite\<br\>\<br\>Interface onde o usuário faz o upload e visualiza seu roadmap.\]  
          
        B\[\<div style='font-weight: bold'\>Backend API\</div\>\<br\>\<b\>Tecnologia:\</b\> Node.js com Express\<br\>\<br\>Orquestra a análise, processa os arquivos e se comunica com a IA.\]  
          
        subgraph "Bases de Dados (Estáticas para o MVP)"  
            C\[\<div style='font-weight: bold'\>Vagas DB\</div\>\<br\>\<b\>Tecnologia:\</b\> Arquivo JSON\<br\>\<br\>Contém descrições de vagas pré-coletadas.\]  
            D\[\<div style='font-weight: bold'\>Cursos DB\</div\>\<br\>\<b\>Tecnologia:\</b\> Arquivo JSON\<br\>\<br\>Contém uma lista curada de cursos.\]  
        end  
    end

    Usuario\[\<div style='font-weight: bold'\>Usuário\</div\>\] \-- "Usa (HTTPS)" \--\> A;  
    A \-- "Chama API (/analyze) com CV e cargo (HTTPS)" \--\> B;  
    B \-- "Lê dados" \--\> C;  
    B \-- "Lê dados" \--\> D;  
    B \-- "Envia prompts para análise (API Call)" \--\> Gemini{\<div style='font-weight: bold'\>Google Gemini API\</div\>};  
    Gemini \-- "Retorna JSON" \--\> B;

    style A fill:\#1e293b,stroke:\#22d3ee,stroke-width:2px,color:\#fff  
    style B fill:\#1e293b,stroke:\#22d3ee,stroke-width:2px,color:\#fff  
    style C fill:\#334155,stroke:\#fff,stroke-width:1px,color:\#fff  
    style D fill:\#334155,stroke:\#fff,stroke-width:1px,color:\#fff  
    style Usuario fill:\#0f172a,stroke:\#22d3ee,stroke-width:2px,color:\#fff  
    style Gemini fill:\#334155,stroke:\#fff,stroke-width:2px,color:\#fff
```

## **Nível 3: Diagrama de Componentes**

**Descrição**: Este diagrama detalha os componentes internos do contêiner mais complexo, o **Backend API**. Ele mostra como as responsabilidades são divididas dentro do nosso serviço principal.
```mermaid
graph TD  
    subgraph "Contêiner: Backend API (Node.js/Express)"  
        direction TB  
          
        A\[\<div style='font-weight: bold'\>Controller da API\</div\>\<b\>Componente:\</b\> analyze.controller.js\<br\>\<br\>Recebe as requisições HTTP do endpoint /analyze.\]  
          
        B\[\<div style='font-weight: bold'\>Orquestrador de Análise\</div\>\<b\>Componente:\</b\> analysis.service.js\<br\>\<br\>O coração da lógica. Orquestra o fluxo da análise.\]  
          
        C\[\<div style='font-weight: bold'\>Módulo de Processamento de CV\</div\>\<b\>Componente:\</b\> cv.parser.js\<br\>\<br\>Usa 'pdf-parse' para extrair texto bruto do currículo.\]  
          
        D\[\<div style='font-weight: bold'\>Módulo de Acesso a Dados\</div\>\<b\>Componente:\</b\> data.loader.js\<br\>\<br\>Lê e faz o parse dos arquivos vagas.json e cursos.json.\]

        E\[\<div style='font-weight: bold'\>Cliente da IA (Gemini)\</div\>\<b\>Componente:\</b\> gemini.client.js\<br\>\<br\>Responsável por formatar os prompts e se comunicar com a API do Gemini.\]  
    end  
      
    A \-- "Chama o serviço com os dados da requisição" \--\> B;  
    B \-- "Solicita extração do texto do CV" \--\> C;  
    B \-- "Solicita dados do mercado e de cursos" \--\> D;  
    B \-- "Envia prompts para extração e análise" \--\> E;  
    C \-- "Retorna texto bruto" \--\> B;  
    D \-- "Retorna dados em JSON" \--\> B;  
    E \-- "Retorna JSON analisado" \--\> B;  
    B \-- "Retorna o resultado final" \--\> A;

    style A fill:\#1e293b,stroke:\#22d3ee,stroke-width:2px,color:\#fff  
    style B fill:\#1e293b,stroke:\#22d3ee,stroke-width:2px,color:\#fff  
    style C fill:\#334155,stroke:\#fff,stroke-width:1px,color:\#fff  
    style D fill:\#334155,stroke:\#fff,stroke-width:1px,color:\#fff  
    style E fill:\#334155,stroke:\#fff,stroke-width:1px,color:\#fff  
```