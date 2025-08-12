import NodeCache from 'node-cache';
import { EXTERNAL_API_CONFIG } from '../config/externalAPI.js';

class CacheService {
    constructor() {
        this.cache = new NodeCache({
            stdTTL: 300, // 5 minutos padrão
            checkperiod: 60,
            useClones: false // Melhor performance para objetos grandes
        });

        console.log('🗄️ Cache service inicializado');
    }

    // Gerar chave única para cache
    generateKey(prefix, params) {
        const sortedParams = Object.keys(params)
            .sort()
            .map(key => `${key}:${params[key]}`)
            .join('|');
        return `${prefix}:${sortedParams}`;
    }

    // Buscar vagas com cache
    getJobs(query, location, limit) {
        const key = this.generateKey('jobs', { query, location, limit });
        return this.cache.get(key);
    }

    // Armazenar vagas no cache
    setJobs(query, location, limit, data) {
        const key = this.generateKey('jobs', { query, location, limit });
        this.cache.set(key, data, EXTERNAL_API_CONFIG.CACHE.JOBS_TTL);
        console.log(`💾 Cache: vagas armazenadas para "${query}" em "${location}"`);
    }

    // Buscar detalhes de vaga com cache
    getJobDetails(jobId) {
        const key = `job_details:${jobId}`;
        return this.cache.get(key);
    }

    // Armazenar detalhes de vaga no cache
    setJobDetails(jobId, data) {
        const key = `job_details:${jobId}`;
        this.cache.set(key, data, EXTERNAL_API_CONFIG.CACHE.JOB_DETAILS_TTL);
        console.log(`💾 Cache: detalhes da vaga ${jobId} armazenados`);
    }

    // Health check com cache
    getHealth() {
        return this.cache.get('health');
    }

    // Armazenar health check no cache
    setHealth(data) {
        this.cache.set('health', data, EXTERNAL_API_CONFIG.CACHE.HEALTH_TTL);
    }

    // Buscar cursos com cache
    getCourses(query, platform, limit, language) {
        const key = this.generateKey('courses', { query, platform, limit, language });
        return this.cache.get(key);
    }

    // Armazenar cursos no cache
    setCourses(query, platform, limit, language, data) {
        const key = this.generateKey('courses', { query, platform, limit, language });
        this.cache.set(key, data, EXTERNAL_API_CONFIG.CACHE.COURSES_TTL);
        console.log(`💾 Cache: cursos armazenados para "${query}" em "${platform}"`);
    }

    // Buscar detalhes de curso com cache
    getCourseDetails(courseId) {
        const key = `course_details:${courseId}`;
        return this.cache.get(key);
    }

    // Armazenar detalhes de curso no cache
    setCourseDetails(courseId, data) {
        const key = `course_details:${courseId}`;
        this.cache.set(key, data, EXTERNAL_API_CONFIG.CACHE.COURSE_DETAILS_TTL);
        console.log(`💾 Cache: detalhes do curso ${courseId} armazenados`);
    }

    // Limpar cache específico
    clearJobsCache() {
        const keys = this.cache.keys().filter(key => key.startsWith('jobs:'));
        keys.forEach(key => this.cache.del(key));
        console.log(`🗑️ Cache de vagas limpo (${keys.length} itens)`);
    }

    // Limpar cache de detalhes
    clearJobDetailsCache() {
        const keys = this.cache.keys().filter(key => key.startsWith('job_details:'));
        keys.forEach(key => this.cache.del(key));
        console.log(`🗑️ Cache de detalhes limpo (${keys.length} itens)`);
    }

    // Limpar todo o cache
    clearAll() {
        this.cache.flushAll();
        console.log('🗑️ Todo o cache foi limpo');
    }

    // Obter estatísticas do cache
    getStats() {
        return {
            keys: this.cache.keys().length,
            hits: this.cache.getStats().hits,
            misses: this.cache.getStats().misses,
            keys_list: this.cache.keys()
        };
    }

    // Verificar se uma chave existe
    has(key) {
        return this.cache.has(key);
    }

    // Remover item específico do cache
    delete(key) {
        return this.cache.del(key);
    }
}

// Instância singleton do cache
const cacheService = new CacheService();

export default cacheService; 