import axios from 'axios';

// Configuração da API JSearch (mais robusta que LinkedIn)
const RAPIDAPI_KEY = '018cbb9a68msh34c31e859765f18p134817jsn66ab406920b9';
const RAPIDAPI_HOST = 'jsearch.p.rapidapi.com';
const BASE_URL = 'https://jsearch.p.rapidapi.com';

// Função para testar a API JSearch
export async function testarAPIJSearch() {
    try {
        console.log('🔍 Testando API JSearch...');

        // Teste com busca simples para validar a API
        const response = await axios.get(`${BASE_URL}/search`, {
            headers: {
                'X-RapidAPI-Key': RAPIDAPI_KEY,
                'X-RapidAPI-Host': RAPIDAPI_HOST
            },
            params: {
                query: 'software developer brazil',
                country: 'br',
                num_pages: 1,
                page: 1
            }
        });

        console.log('✅ API JSearch funcionando!');
        console.log('📊 Status:', response.data.status);
        console.log('📊 Total de vagas:', response.data.data?.length || 0);

        return {
            success: true,
            data: response.data.data || [],
            total_vagas: response.data.data?.length || 0,
            status: response.data.status
        };
    } catch (error) {
        console.error('❌ Erro ao testar API JSearch:', error.response?.data || error.message);
        throw new Error('Falha ao testar API JSearch');
    }
}

// Função para buscar vagas usando JSearch
export async function buscarVagasJSearch(cargo, localizacao, limit = 5) {
    try {
        console.log(`🔍 Buscando vagas JSearch: ${cargo} (localização: ${localizacao})`);

        // Mapear cargos para termos de busca mais eficazes
        const termosBusca = {
            'Desenvolvedor': 'software developer',
            'Programador': 'software developer',
            'Analista': 'business analyst',
            'Gerente': 'manager',
            'Designer': 'ui designer',
            'DevOps': 'devops engineer',
            'Full Stack': 'full stack developer',
            'Frontend': 'frontend developer',
            'Backend': 'backend developer'
        };

        const termoBusca = termosBusca[cargo] || cargo;
        console.log(`🔍 Termo de busca mapeado: ${termoBusca}`);

        // Construir query de busca
        const query = `${termoBusca} ${localizacao}`;
        console.log(`🔍 Query de busca: ${query}`);

        // Buscar vagas com JSearch
        const response = await axios.get(`${BASE_URL}/search`, {
            headers: {
                'X-RapidAPI-Key': RAPIDAPI_KEY,
                'X-RapidAPI-Host': RAPIDAPI_HOST
            },
            params: {
                query: query,
                country: 'br', // Brasil
                num_pages: 1,
                page: 1,
                date_posted: 'week', // Vagas da última semana
                employment_types: 'FULLTIME,PARTTIME,CONTRACTOR'
            }
        });

        if (response.data.status !== 'OK') {
            throw new Error(`API retornou status: ${response.data.status}`);
        }

        const vagasProcessadas = processarVagasJSearch(response.data.data || []);
        console.log(`✅ Encontradas ${vagasProcessadas.length} vagas para ${termoBusca}`);

        return vagasProcessadas.slice(0, limit); // Limitar ao número solicitado
    } catch (error) {
        console.error('❌ Erro ao buscar vagas JSearch:', error.response?.data || error.message);
        throw new Error('Falha ao buscar vagas JSearch');
    }
}

// Função para processar os dados das vagas JSearch
export function processarVagasJSearch(dados) {
    if (!Array.isArray(dados)) {
        console.warn('⚠️ Dados recebidos não são um array:', typeof dados);
        return [];
    }

    return dados.map(vaga => ({
        id: vaga.job_id || `vaga-${Date.now()}-${Math.random()}`,
        titulo: vaga.job_title || 'Título não disponível',
        empresa: vaga.employer_name || 'Empresa não informada',
        localizacao: extrairLocalizacaoJSearch(vaga),
        descricao: vaga.job_description || 'Descrição não disponível',
        salario: vaga.job_salary || 'Salário não informado',
        tipo: vaga.job_employment_type || 'Tipo não informado',
        data_publicacao: vaga.job_posted_at_datetime_utc || new Date().toISOString(),
        url: vaga.job_apply_link || vaga.job_google_link || null,
        senioridade: extrairSenioridade(vaga.job_description || ''),
        remoto: vaga.job_is_remote || false,
        industria: vaga.employer_company_type || 'Não informado',
        tamanho_empresa: 'Não informado', // JSearch não fornece este dado
        competencias_extraidas: [], // Será preenchido pela IA
        publisher: vaga.job_publisher || 'Não informado'
    }));
}

// Função auxiliar para extrair localização das vagas JSearch
function extrairLocalizacaoJSearch(vaga) {
    const localizacoes = [];

    if (vaga.job_city) localizacoes.push(vaga.job_city);
    if (vaga.job_state) localizacoes.push(vaga.job_state);
    if (vaga.job_country) localizacoes.push(vaga.job_country);

    if (localizacoes.length > 0) {
        return localizacoes.join(', ');
    }

    return 'Localização não informada';
}

// Função auxiliar para extrair senioridade baseada na descrição
function extrairSenioridade(descricao) {
    if (!descricao) return 'Não informado';

    const descLower = descricao.toLowerCase();

    if (descLower.includes('senior') || descLower.includes('sênior')) return 'Senior';
    if (descLower.includes('pleno') || descLower.includes('mid-level')) return 'Pleno';
    if (descLower.includes('junior') || descLower.includes('júnior') || descLower.includes('entry level')) return 'Junior';
    if (descLower.includes('estagiário') || descLower.includes('intern')) return 'Estagiário';

    return 'Não informado';
}

// Função para extrair competências das descrições das vagas
export async function extrairCompetenciasVagas(vagas) {
    if (!vagas || vagas.length === 0) {
        return {
            competencias_principais: [],
            competencias_secundarias: [],
            tendencias_emergentes: []
        };
    }

    try {
        console.log('🤖 Extraindo competências das vagas JSearch...');

        // Combinar todas as descrições
        const descricoes = vagas
            .map(v => v.descricao)
            .filter(desc => desc && desc.length > 50) // Filtrar descrições muito curtas
            .slice(0, 10) // Limitar a 10 descrições para não sobrecarregar a IA
            .join('\n\n---\n\n');

        const prompt = `
# PERSONA
Você é um especialista em análise de mercado de tecnologia e recrutamento.

# TAREFA
Analise as seguintes descrições de vagas de tecnologia e extraia as competências técnicas mais mencionadas e relevantes.

# DESCRIÇÕES DAS VAGAS
${descricoes}

# FORMATO DE SAÍDA (Obrigatório)
Responda APENAS com um objeto JSON válido com as chaves:
- "competencias_principais" (array de strings): Competências mais mencionadas e essenciais
- "competencias_secundarias" (array de strings): Competências mencionadas mas menos frequentes
- "tendencias_emergentes" (array de strings): Tecnologias novas ou em crescimento
- "total_vagas_analisadas" (number): Número de vagas analisadas

# EXEMPLO DE RESPOSTA
{
  "competencias_principais": ["JavaScript", "React", "Node.js"],
  "competencias_secundarias": ["TypeScript", "MongoDB", "AWS"],
  "tendencias_emergentes": ["GraphQL", "Microservices"],
  "total_vagas_analisadas": 10
}
`;

        // Por enquanto, retornar um resultado baseado em análise simples
        return {
            competencias_principais: extrairCompetenciasBasicas(descricoes),
            competencias_secundarias: [],
            tendencias_emergentes: [],
            total_vagas_analisadas: vagas.length
        };

    } catch (error) {
        console.error('❌ Erro ao extrair competências:', error);
        return {
            competencias_principais: extrairCompetenciasBasicas(vagas.map(v => v.descricao).join(' ')),
            competencias_secundarias: [],
            tendencias_emergentes: [],
            total_vagas_analisadas: vagas.length
        };
    }
}

// Função auxiliar para extrair competências básicas
function extrairCompetenciasBasicas(texto) {
    const competenciasComuns = [
        'JavaScript', 'React', 'Node.js', 'TypeScript', 'Python', 'Java', 'C#',
        'Docker', 'Kubernetes', 'AWS', 'Azure', 'Git', 'SQL', 'MongoDB',
        'PostgreSQL', 'Redis', 'GraphQL', 'REST API', 'Microservices',
        'CI/CD', 'Jenkins', 'GitLab', 'Terraform', 'Ansible'
    ];

    const competenciasEncontradas = competenciasComuns.filter(comp =>
        texto.toLowerCase().includes(comp.toLowerCase())
    );

    return competenciasEncontradas.slice(0, 10); // Retornar até 10 competências
} 