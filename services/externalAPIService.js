import axios from 'axios';
import { EXTERNAL_API_CONFIG, getBaseURL } from '../config/externalAPI.js';
import cacheService from './cacheService.js';
import rateLimitService from './rateLimitService.js';

class ExternalAPIService {
    constructor() {
        this.baseURL = getBaseURL();
        this.apiKey = EXTERNAL_API_CONFIG.API_KEY;

        // Configurar axios com timeout e retry
        this.client = axios.create({
            baseURL: this.baseURL,
            timeout: EXTERNAL_API_CONFIG.TIMEOUT,
            headers: {
                'X-API-Key': this.apiKey,
                'Content-Type': 'application/json'
            }
        });

        console.log(`🌐 External API Service inicializado para: ${this.baseURL}`);
    }

    // Função para fazer requisição com retry
    async makeRequestWithRetry(method, endpoint, data = null, retryCount = 0) {
        try {
            const config = {
                method,
                url: endpoint,
                ...(data && { data })
            };

            const response = await this.client(config);
            return response.data;

        } catch (error) {
            if (retryCount < EXTERNAL_API_CONFIG.RETRY_ATTEMPTS && this.shouldRetry(error)) {
                console.log(`🔄 Tentativa ${retryCount + 1} falhou, tentando novamente em ${EXTERNAL_API_CONFIG.RETRY_DELAY}ms...`);

                await new Promise(resolve => setTimeout(resolve, EXTERNAL_API_CONFIG.RETRY_DELAY));
                return this.makeRequestWithRetry(method, endpoint, data, retryCount + 1);
            }

            throw this.formatError(error);
        }
    }

    // Verificar se deve fazer retry
    shouldRetry(error) {
        const retryableStatuses = [408, 429, 500, 502, 503, 504];
        const retryableErrors = ['ECONNRESET', 'ENOTFOUND', 'ETIMEDOUT'];

        return (
            (error.response && retryableStatuses.includes(error.response.status)) ||
            (error.code && retryableErrors.includes(error.code)) ||
            error.message.includes('timeout')
        );
    }

    // Formatar erro para resposta padronizada
    formatError(error) {
        if (error.response) {
            return {
                success: false,
                error: error.response.data?.error || 'Erro da API externa',
                message: error.response.data?.message || error.message,
                status: error.response.status,
                timestamp: new Date().toISOString()
            };
        }

        return {
            success: false,
            error: 'Erro de conexão',
            message: error.message,
            status: 0,
            timestamp: new Date().toISOString()
        };
    }

    // Health check da API externa
    async healthCheck() {
        try {
            // Verificar cache primeiro
            const cachedHealth = cacheService.getHealth();
            if (cachedHealth) {
                console.log('💾 Health check retornado do cache');
                return cachedHealth;
            }

            // Verificar rate limit
            if (!rateLimitService.canMakeHealthRequest()) {
                throw new Error('Rate limit atingido para health check');
            }

            const health = await this.makeRequestWithRetry('GET', EXTERNAL_API_CONFIG.ENDPOINTS.HEALTH);

            // Armazenar no cache
            cacheService.setHealth(health);

            // Registrar requisição
            rateLimitService.recordHealthRequest();

            return health;

        } catch (error) {
            console.error('❌ Erro no health check:', error);
            throw error;
        }
    }

    // Buscar vagas na API externa
    async searchJobs(query, location = '', limit = 10) {
        try {
            // Verificar cache primeiro
            const cachedJobs = cacheService.getJobs(query, location, limit);
            if (cachedJobs) {
                console.log('💾 Vagas retornadas do cache');
                return cachedJobs;
            }

            // Verificar rate limit
            if (!rateLimitService.canMakeJobRequest()) {
                throw new Error('Rate limit atingido para busca de vagas');
            }

            const requestData = {
                query,
                location: location || 'Brazil',
                limit
            };

            const jobs = await this.makeRequestWithRetry(
                'POST',
                EXTERNAL_API_CONFIG.ENDPOINTS.JOBS,
                requestData
            );

            // Armazenar no cache
            cacheService.setJobs(query, location, limit, jobs);

            // Registrar requisição
            rateLimitService.recordJobRequest();

            console.log(`✅ ${jobs.data?.length || 0} vagas encontradas para "${query}" em "${location}"`);
            return jobs;

        } catch (error) {
            console.error('❌ Erro na busca de vagas:', error);
            throw error;
        }
    }

    // Obter detalhes de uma vaga específica
    async getJobDetails(jobId) {
        try {
            // Verificar cache primeiro
            const cachedDetails = cacheService.getJobDetails(jobId);
            if (cachedDetails) {
                console.log('💾 Detalhes da vaga retornados do cache');
                return cachedDetails;
            }

            // Verificar rate limit
            if (!rateLimitService.canMakeJobDetailsRequest()) {
                throw new Error('Rate limit atingido para detalhes de vaga');
            }

            const details = await this.makeRequestWithRetry(
                'GET',
                `${EXTERNAL_API_CONFIG.ENDPOINTS.JOB_DETAILS}${jobId}`
            );

            // Armazenar no cache
            cacheService.setJobDetails(jobId, details);

            // Registrar requisição
            rateLimitService.recordJobDetailsRequest();

            console.log(`✅ Detalhes da vaga ${jobId} obtidos com sucesso`);
            return details;

        } catch (error) {
            console.error(`❌ Erro ao obter detalhes da vaga ${jobId}:`, error);
            throw error;
        }
    }

    // Buscar cursos na API externa
    async searchCourses(query, platform = 'all', limit = 10, language = 'pt') {
        try {
            // Verificar cache primeiro
            const cachedCourses = cacheService.getCourses(query, platform, limit, language);
            if (cachedCourses) {
                console.log('💾 Cursos retornados do cache');
                return cachedCourses;
            }

            // Verificar rate limit
            if (!rateLimitService.canMakeCoursesRequest()) {
                throw new Error('Rate limit atingido para busca de cursos');
            }

            const requestData = {
                query,
                platform,
                limit,
                language
            };

            const courses = await this.makeRequestWithRetry(
                'POST',
                EXTERNAL_API_CONFIG.ENDPOINTS.COURSES,
                requestData
            );

            // Armazenar no cache
            cacheService.setCourses(query, platform, limit, language, courses);

            // Registrar requisição
            rateLimitService.recordCoursesRequest();

            console.log(`✅ ${courses.data?.length || 0} cursos encontrados para "${query}" em "${platform}"`);
            return courses;

        } catch (error) {
            console.error('❌ Erro na busca de cursos:', error);
            throw error;
        }
    }

    // Obter detalhes de um curso específico
    async getCourseDetails(courseId) {
        try {
            // Verificar cache primeiro
            const cachedDetails = cacheService.getCourseDetails(courseId);
            if (cachedDetails) {
                console.log('💾 Detalhes do curso retornados do cache');
                return cachedDetails;
            }

            // Verificar rate limit
            if (!rateLimitService.canMakeCourseDetailsRequest()) {
                throw new Error('Rate limit atingido para detalhes de curso');
            }

            const details = await this.makeRequestWithRetry(
                'GET',
                `${EXTERNAL_API_CONFIG.ENDPOINTS.COURSE_DETAILS}${courseId}`
            );

            // Armazenar no cache
            cacheService.setCourseDetails(courseId, details);

            // Registrar requisição
            rateLimitService.recordCourseDetailsRequest();

            console.log(`✅ Detalhes do curso ${courseId} obtidos com sucesso`);
            return details;

        } catch (error) {
            console.error(`❌ Erro ao obter detalhes do curso ${courseId}:`, error);
            throw error;
        }
    }

    // Testar conectividade com a API externa
    async testConnection() {
        try {
            const health = await this.healthCheck();
            return {
                success: true,
                message: 'API externa conectada com sucesso',
                data: health,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                success: false,
                message: 'Falha na conexão com API externa',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    // Obter estatísticas de uso
    getUsageStats() {
        return {
            rateLimit: rateLimitService.getStats(),
            cache: cacheService.getStats(),
            config: {
                baseURL: this.baseURL,
                timeout: EXTERNAL_API_CONFIG.TIMEOUT,
                retryAttempts: EXTERNAL_API_CONFIG.RETRY_ATTEMPTS
            }
        };
    }
}

// Instância singleton do serviço
const externalAPIService = new ExternalAPIService();

export default externalAPIService; 