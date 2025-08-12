// Configurações da API Externa de Web Scraping
export const EXTERNAL_API_CONFIG = {
    DEV_URL: 'https://api-jobs-courses-impulseai-develop.up.railway.app',
    PROD_URL: 'https://api-jobs-courses-impulseai-production.up.railway.app',
    API_KEY: '1e6a8d8f-9b0c-4c7e-8a3d-5f2b1c9d8e7a',
    ENDPOINTS: {
        JOBS: '/api/v1/jobs/',
        JOB_DETAILS: '/api/v1/jobs/',
        COURSES: '/api/v1/courses/',
        COURSE_DETAILS: '/api/v1/courses/',
        HEALTH: '/health'
    },
    RATE_LIMITS: {
        JOBS_PER_MINUTE: 10,
        REQUESTS_PER_DAY: 200
    },
    CACHE: {
        JOBS_TTL: 300, // 5 minutos para vagas
        JOB_DETAILS_TTL: 600, // 10 minutos para detalhes
        COURSES_TTL: 600, // 10 minutos para cursos
        COURSE_DETAILS_TTL: 900, // 15 minutos para detalhes de cursos
        HEALTH_TTL: 60 // 1 minuto para health check
    },
    TIMEOUT: 10000, // 10 segundos
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000 // 1 segundo
};

// Função para obter URL base baseada no ambiente
export function getBaseURL() {
    const env = process.env.NODE_ENV || 'development';
    return env === 'production' ? EXTERNAL_API_CONFIG.PROD_URL : EXTERNAL_API_CONFIG.DEV_URL;
}

// Função para validar configuração
export function validateExternalAPIConfig() {
    const errors = [];

    if (!EXTERNAL_API_CONFIG.API_KEY) {
        errors.push('EXTERNAL_API_KEY não configurada');
    }

    if (!EXTERNAL_API_CONFIG.DEV_URL || !EXTERNAL_API_CONFIG.PROD_URL) {
        errors.push('URLs da API externa não configuradas');
    }

    if (errors.length > 0) {
        console.error('❌ Erros na configuração da API externa:', errors);
        return false;
    }

    console.log('✅ Configuração da API externa validada com sucesso');
    return true;
} 