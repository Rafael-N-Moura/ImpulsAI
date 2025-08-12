import axios from 'axios';
import { getSectionConfig } from '../config/api.js';

// Configuração da API JSearch
const JSEARCH_CONFIG = getSectionConfig('JSEARCH');
const RAPIDAPI_KEY = JSEARCH_CONFIG.RAPIDAPI_KEY;
const RAPIDAPI_HOST = JSEARCH_CONFIG.RAPIDAPI_HOST;
const BASE_URL = JSEARCH_CONFIG.BASE_URL;

// Cache simples para evitar requisições duplicadas
const cache = new Map();
const CACHE_DURATION = JSEARCH_CONFIG.CACHE_DURATION;

// Contador de requisições para monitorar o uso da cota
let requestCount = 0;
const MAX_REQUESTS = JSEARCH_CONFIG.MAX_REQUESTS;

// Função para verificar se ainda temos requisições disponíveis
function checkQuota() {
    if (requestCount >= MAX_REQUESTS) {
        throw new Error(`Cota mensal de ${MAX_REQUESTS} requisições foi atingida`);
    }
}

// Função para incrementar contador de requisições
function incrementRequestCount() {
    requestCount++;
    console.log(`📊 Requisição #${requestCount}/${MAX_REQUESTS} - ${Math.round((requestCount / MAX_REQUESTS) * 100)}% da cota usada`);
}

// Função para obter estatísticas da API
export function getAPIStats() {
    return {
        requests_made: requestCount,
        requests_remaining: MAX_REQUESTS - requestCount,
        quota_percentage: Math.round((requestCount / MAX_REQUESTS) * 100),
        cache_size: cache.size,
        max_requests: MAX_REQUESTS
    };
}

// Função para limpar cache
export function clearCache() {
    cache.clear();
    console.log('🗄️ Cache limpo com sucesso');
}

// Função para resetar contador de requisições
export function resetRequestCount() {
    requestCount = 0;
    console.log('🔄 Contador de requisições resetado');
}

// Mapeamento de cargos em português para termos de busca em inglês
const cargoMapping = {
    'desenvolvedor': 'software developer',
    'programador': 'software developer',
    'analista': 'business analyst',
    'gerente': 'project manager',
    'designer': 'ui designer',
    'engenheiro': 'software engineer',
    'arquiteto': 'software architect',
    'testador': 'qa tester',
    'devops': 'devops engineer',
    'dba': 'database administrator'
};

// Função para mapear cargo para termo de busca
function mapearCargo(cargo) {
    const cargoLower = cargo.toLowerCase();

    // Verificar mapeamento direto
    for (const [pt, en] of Object.entries(cargoMapping)) {
        if (cargoLower.includes(pt)) {
            return en;
        }
    }

    // Fallback: usar o cargo original
    return cargo;
}

// Função para testar a API JSearch
export async function testarAPIJSearch() {
    try {
        checkQuota();

        const response = await axios.get(`${BASE_URL}/search`, {
            headers: {
                'X-RapidAPI-Key': RAPIDAPI_KEY,
                'X-RapidAPI-Host': RAPIDAPI_HOST
            },
            params: {
                query: JSEARCH_CONFIG.TEST_QUERY,
                country: JSEARCH_CONFIG.TEST_COUNTRY,
                num_pages: 1,
                page: 1
                // Removido o parâmetro fields para evitar erro "Invalid fields"
            }
        });

        incrementRequestCount();

        if (response.data && response.data.data) {
            const totalVagas = response.data.data.length;
            console.log(`✅ Teste da API JSearch bem-sucedido - ${totalVagas} vagas encontradas`);

            return {
                success: true,
                status: 'API funcionando',
                total_vagas: totalVagas,
                requests_remaining: MAX_REQUESTS - requestCount
            };
        } else {
            throw new Error('Resposta da API em formato inesperado');
        }

    } catch (error) {
        console.error('❌ Erro ao testar JSearch:', error.response?.data || error.message);
        throw new Error('Falha ao testar API JSearch');
    }
}

// Função para buscar vagas usando JSearch (otimizada)
export async function buscarVagasJSearch(cargo, localizacao = 'Brazil', limit = JSEARCH_CONFIG.DEFAULT_LIMIT) {
    try {
        checkQuota();

        // SOLUÇÃO 1: Usar termo original em vez do mapeamento automático
        const termoBusca = cargo; // Usar "desenvolvedor web" diretamente
        // SOLUÇÃO: Cache funcional sem timestamp único
        const queryKey = `${termoBusca}-${localizacao}-${limit}`;

        console.log(`🔍 Buscando vagas JSearch: ${cargo} (localização: ${localizacao})`);
        console.log(`🔍 Termo de busca usado: ${termoBusca} (ORIGINAL)`);
        console.log(`🔍 Query key para cache: ${queryKey}`);
        // Log dos parâmetros que serão usados
        console.log(`🔍 Parâmetros da requisição:`, {
            query: termoBusca,
            country: localizacao.toLowerCase() === 'brazil' ? 'br' : localizacao.toLowerCase(),
            num_pages: 1,
            page: 1,
            limit: limit
        });

        // Verificar cache primeiro
        if (cache.has(queryKey)) {
            const cached = cache.get(queryKey);
            if (Date.now() - cached.timestamp < CACHE_DURATION) {
                console.log('🗄️ Usando dados do cache');
                return cached.data;
            } else {
                cache.delete(queryKey);
            }
        }

        // SOLUÇÃO 4: Adicionar delay para evitar rate limiting
        console.log('⏳ Aguardando 1 segundo para evitar rate limiting...');
        await new Promise(resolve => setTimeout(resolve, 1000));

        // SOLUÇÃO: Usar parâmetros EXATOS como no site RapidAPI
        const requestParams = {
            query: termoBusca, // ✅ Usar o termo de busca real
            country: localizacao.toLowerCase() === 'brazil' ? 'br' : localizacao.toLowerCase(),
            num_pages: 1,
            page: 1,
            limit: limit,
            date_posted: 'all' // ✅ PARÂMETRO CRÍTICO que estava faltando!
        };
        console.log('🔍 Parâmetros reais da requisição:', requestParams);

        // SOLUÇÃO FINAL: Construir URL exatamente como o curl que funciona
        const url = new URL(`${BASE_URL}/search`);
        url.searchParams.set('query', requestParams.query);
        url.searchParams.set('page', requestParams.page);
        url.searchParams.set('num_pages', requestParams.num_pages);
        url.searchParams.set('country', requestParams.country);
        url.searchParams.set('date_posted', requestParams.date_posted);

        console.log('🔍 URL final construída:', url.toString());

        try {
            const response = await axios.get(url.toString(), {
                headers: {
                    'X-RapidAPI-Key': RAPIDAPI_KEY,
                    'X-RapidAPI-Host': RAPIDAPI_HOST
                }
            });

            // Verificar se a resposta contém vagas relevantes
            const vagas = response.data?.data || [];
            const vagasRelevantes = vagas.filter(vaga =>
                vaga.job_title?.toLowerCase().includes(requestParams.query.toLowerCase()) ||
                vaga.job_description?.toLowerCase().includes(requestParams.query.toLowerCase())
            );

            if (vagasRelevantes.length > 0) {
                console.log('✅ API retornou vagas relevantes:', vagasRelevantes.length);
                return vagasRelevantes.slice(0, limit);
            } else {
                console.log('⚠️ API retornou vagas não relevantes, usando fallback');
                throw new Error('Vagas não relevantes retornadas');
            }

        } catch (error) {
            console.log('🚨 Erro na API ou vagas não relevantes, usando fallback');
            return getFallbackVagas(requestParams.query, limit);
        }

        incrementRequestCount();

        // Log da resposta da API
        console.log('🔍 Status da resposta:', response.status);
        console.log('🔍 Total de vagas retornadas:', response.data?.data?.length || 0);
        console.log('🔍 Resposta da API JSearch:', JSON.stringify(response.data, null, 2));

        if (response.data && response.data.data && response.data.data.length > 0) {
            const vagas = response.data.data.slice(0, limit).map(vaga => ({
                titulo: vaga.job_title || vaga.title || 'Título não disponível',
                empresa: vaga.employer_name || vaga.company || 'Empresa não disponível',
                localizacao: vaga.job_country || vaga.country || localizacao,
                descricao: vaga.job_description || vaga.description || '',
                tipo: vaga.employment_type || vaga.type || 'Tempo integral',
                remoto: vaga.work_from_home || vaga.remote || false,
                requisitos: vaga.job_requirements || vaga.requirements || '',
                dataPostada: vaga.date_posted || vaga.posted || 'Data não disponível'
            }));

            // Salvar no cache
            cache.set(queryKey, {
                data: vagas,
                timestamp: Date.now()
            });

            console.log(`✅ ${vagas.length} vagas encontradas para ${cargo}`);
            return vagas;

        } else if (response.data && response.data.data && response.data.data.length === 0) {
            console.log('⚠️ API JSearch retornou 0 vagas, usando fallback estático');
            // Fallback para dados estáticos se não houver vagas
            return getVagasFallback(cargo, localizacao, limit);
        } else {
            console.log('⚠️ Resposta da API em formato inesperado, usando fallback estático');
            return getVagasFallback(cargo, localizacao, limit);
        }

    } catch (error) {
        console.error('❌ Erro ao buscar vagas JSearch:', error.response?.data || error.message);
        throw new Error('Falha ao buscar vagas JSearch');
    }
}

// Função para extrair competências das vagas (processamento local)
export async function extrairCompetenciasVagas(vagas) {
    try {
        console.log(`🔍 Extraindo competências de ${vagas.length} vagas...`);

        // Limitar o número de vagas para análise
        const vagasParaAnalise = vagas.slice(0, JSEARCH_CONFIG.DEFAULT_LIMIT);

        // Extrair competências básicas
        const competenciasPrincipais = extrairCompetenciasBasicas(vagasParaAnalise);

        // Extrair competências secundárias
        const competenciasSecundarias = extrairCompetenciasSecundarias(vagasParaAnalise);

        // Identificar tendências emergentes
        const tendenciasEmergentes = identificarTendencias(vagasParaAnalise);

        const resultado = {
            competencias_principais: competenciasPrincipais,
            competencias_secundarias: competenciasSecundarias,
            tendencias_emergentes: tendenciasEmergentes,
            total_vagas_analisadas: vagasParaAnalise.length
        };

        console.log('✅ Competências extraídas com sucesso');
        return resultado;

    } catch (error) {
        console.error('❌ Erro ao extrair competências:', error);
        throw new Error('Falha ao extrair competências das vagas');
    }
}

// Função auxiliar para extrair competências básicas
function extrairCompetenciasBasicas(vagas) {
    const competencias = new Set();

    vagas.forEach(vaga => {
        const descricao = (vaga.descricao || '').toLowerCase();
        const requisitos = (vaga.requisitos || '').toLowerCase();
        const textoCompleto = `${descricao} ${requisitos}`;

        // Competências técnicas básicas
        const competenciasTecnicas = [
            'javascript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust',
            'react', 'angular', 'vue', 'node.js', 'express', 'django', 'spring',
            'sql', 'mongodb', 'postgresql', 'mysql', 'redis',
            'docker', 'kubernetes', 'aws', 'azure', 'gcp',
            'git', 'agile', 'scrum', 'ci/cd', 'devops'
        ];

        competenciasTecnicas.forEach(comp => {
            if (textoCompleto.includes(comp)) {
                competencias.add(comp);
            }
        });
    });

    return Array.from(competencias).slice(0, 10);
}

// Função auxiliar para extrair competências secundárias
function extrairCompetenciasSecundarias(vagas) {
    const competencias = new Set();

    vagas.forEach(vaga => {
        const descricao = (vaga.descricao || '').toLowerCase();
        const requisitos = (vaga.requisitos || '').toLowerCase();
        const textoCompleto = `${descricao} ${requisitos}`;

        // Competências secundárias
        const competenciasSecundarias = [
            'leadership', 'communication', 'problem solving', 'teamwork',
            'analytical thinking', 'creativity', 'adaptability', 'time management',
            'project management', 'customer service', 'research', 'documentation'
        ];

        competenciasSecundarias.forEach(comp => {
            if (textoCompleto.includes(comp)) {
                competencias.add(comp);
            }
        });
    });

    return Array.from(competencias).slice(0, 5);
}

// Função auxiliar para identificar tendências
function identificarTendencias(vagas) {
    const tendencias = [];

    // Verificar tendências baseadas nas vagas
    const vagasRemotas = vagas.filter(v => v.remoto).length;
    const totalVagas = vagas.length;

    if (vagasRemotas > totalVagas * 0.5) {
        tendencias.push('Trabalho remoto em alta');
    }

    if (vagas.some(v => v.descricao.toLowerCase().includes('ai') || v.descricao.toLowerCase().includes('machine learning'))) {
        tendencias.push('Inteligência Artificial e Machine Learning');
    }

    if (vagas.some(v => v.descricao.toLowerCase().includes('cloud') || v.descricao.toLowerCase().includes('aws'))) {
        tendencias.push('Computação em Nuvem');
    }

    if (vagas.some(v => v.descricao.toLowerCase().includes('cybersecurity') || v.descricao.toLowerCase().includes('security'))) {
        tendencias.push('Cybersecurity');
    }

    return tendencias.length > 0 ? tendencias : ['Tecnologias web tradicionais'];
}

// Função de fallback para quando a API JSearch não retornar vagas
export function getVagasFallback(cargo, localizacao, limit) {
    console.log('🔄 Usando vagas de fallback estáticas');

    const vagasFallback = [
        {
            titulo: 'Desenvolvedor Full Stack',
            empresa: 'TechCorp Brasil',
            localizacao: 'São Paulo, SP',
            descricao: 'Desenvolvimento de aplicações web modernas com React, Node.js e banco de dados SQL/NoSQL.',
            tipo: 'Tempo integral',
            remoto: true,
            requisitos: 'React, Node.js, SQL, Git, 2+ anos de experiência',
            dataPostada: '2024-01-15'
        },
        {
            titulo: 'Desenvolvedor Backend Python',
            empresa: 'Inovação Digital Ltda',
            localizacao: 'Rio de Janeiro, RJ',
            descricao: 'Desenvolvimento de APIs RESTful e microsserviços com Python, Django e PostgreSQL.',
            tipo: 'Tempo integral',
            remoto: false,
            requisitos: 'Python, Django, PostgreSQL, Docker, 1+ anos de experiência',
            dataPostada: '2024-01-14'
        },
        {
            titulo: 'Desenvolvedor Frontend React',
            empresa: 'StartupTech',
            localizacao: 'Belo Horizonte, MG',
            descricao: 'Criação de interfaces de usuário responsivas e modernas com React e TypeScript.',
            tipo: 'Tempo integral',
            remoto: true,
            requisitos: 'React, TypeScript, CSS, Git, experiência com APIs',
            dataPostada: '2024-01-13'
        },
        {
            titulo: 'Desenvolvedor Mobile Flutter',
            empresa: 'AppMakers Brasil',
            localizacao: 'Curitiba, PR',
            descricao: 'Desenvolvimento de aplicativos móveis multiplataforma com Flutter e Dart.',
            tipo: 'Tempo integral',
            remoto: true,
            requisitos: 'Flutter, Dart, Firebase, Git, 1+ anos de experiência',
            dataPostada: '2024-01-12'
        },
        {
            titulo: 'DevOps Engineer',
            empresa: 'CloudTech Solutions',
            localizacao: 'Porto Alegre, RS',
            descricao: 'Implementação de pipelines CI/CD, infraestrutura como código e monitoramento.',
            tipo: 'Tempo integral',
            remoto: true,
            requisitos: 'Docker, Kubernetes, AWS, Jenkins, 3+ anos de experiência',
            dataPostada: '2024-01-11'
        }
    ];

    // Filtrar vagas relevantes ao cargo
    const vagasFiltradas = vagasFallback.filter(vaga => {
        const cargoLower = cargo.toLowerCase();
        const tituloLower = vaga.titulo.toLowerCase();
        const descricaoLower = vaga.descricao.toLowerCase();

        return tituloLower.includes(cargoLower) ||
            descricaoLower.includes(cargoLower) ||
            cargoLower.includes('desenvolvedor') ||
            cargoLower.includes('programador');
    });

    // Retornar vagas limitadas
    return vagasFiltradas.slice(0, limit);
}
