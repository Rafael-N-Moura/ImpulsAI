// Configurações das APIs
export const API_CONFIG = {
    // JSearch API (RapidAPI)
    JSEARCH: {
        RAPIDAPI_KEY: '018cbb9a68msh34c31e859765f18p134817jsn66ab406920b9',
        RAPIDAPI_HOST: 'jsearch.p.rapidapi.com',
        BASE_URL: 'https://jsearch.p.rapidapi.com',
        MAX_REQUESTS: 200, // Cota mensal
        CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 horas
        DEFAULT_LIMIT: 3, // Limite padrão de vagas para economizar cota
        TEST_QUERY: 'software developer',
        TEST_COUNTRY: 'us'
    },

    // Google Gemini API
    GEMINI: {
        API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
        API_KEY: 'AIzaSyBGcK7Z77a4OYKbiTyt-vxotcIVPg5L7_s'
    },

    // Configurações do servidor
    SERVER: {
        PORT: 4000,
        CORS_ORIGIN: '*'
    },

    // Configurações de cache e otimização
    OPTIMIZATION: {
        MAX_VAGAS_PARA_ANALISE: 3, // Máximo de vagas para análise de competências
        MAX_DESCRICOES_PARA_IA: 3, // Máximo de descrições para enviar para IA
        MIN_DESCRICAO_LENGTH: 50, // Tamanho mínimo para descrição ser considerada válida
        CACHE_ENABLED: true
    }
};

// Função para validar configurações
export function validateConfig() {
    const errors = [];

    if (!API_CONFIG.JSEARCH.RAPIDAPI_KEY) {
        errors.push('JSEARCH_RAPIDAPI_KEY não configurada');
    }

    if (!API_CONFIG.GEMINI.API_KEY) {
        errors.push('GEMINI_API_KEY não configurada');
    }

    if (errors.length > 0) {
        console.error('❌ Erros de configuração:', errors);
        return false;
    }

    console.log('✅ Configurações validadas com sucesso');
    return true;
}

// Função para validar configurações da API externa
export async function validateExternalAPIConfig() {
    try {
        const { validateExternalAPIConfig } = await import('./externalAPI.js');
        return validateExternalAPIConfig();
    } catch (error) {
        console.error('❌ Erro ao validar configuração da API externa:', error);
        return false;
    }
}

// Função para obter configuração específica
export function getConfig(section, key) {
    return API_CONFIG[section]?.[key];
}

// Função para obter configuração completa de uma seção
export function getSectionConfig(section) {
    return API_CONFIG[section];
} 