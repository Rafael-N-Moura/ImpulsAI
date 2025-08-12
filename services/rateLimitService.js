import { EXTERNAL_API_CONFIG } from '../config/externalAPI.js';

class RateLimitService {
    constructor() {
        this.requestCounts = new Map(); // Contador por minuto
        this.dailyCounts = new Map(); // Contador diário
        this.lastReset = new Date();

        // Limpar contadores a cada minuto
        setInterval(() => this.resetMinuteCounters(), 60000);

        // Limpar contadores diários à meia-noite
        setInterval(() => this.resetDailyCounters(), 24 * 60 * 60 * 1000);

        console.log('⏱️ Rate limit service inicializado');
    }

    // Verificar se pode fazer requisição para vagas
    canMakeJobRequest() {
        const now = new Date();
        const minuteKey = this.getMinuteKey(now);
        const dailyKey = this.getDailyKey(now);

        const minuteCount = this.requestCounts.get(minuteKey) || 0;
        const dailyCount = this.dailyCounts.get(dailyKey) || 0;

        const canMakeMinute = minuteCount < EXTERNAL_API_CONFIG.RATE_LIMITS.JOBS_PER_MINUTE;
        const canMakeDaily = dailyCount < EXTERNAL_API_CONFIG.RATE_LIMITS.REQUESTS_PER_DAY;

        if (!canMakeMinute) {
            console.log(`⚠️ Rate limit por minuto atingido: ${minuteCount}/${EXTERNAL_API_CONFIG.RATE_LIMITS.JOBS_PER_MINUTE}`);
        }

        if (!canMakeDaily) {
            console.log(`⚠️ Rate limit diário atingido: ${dailyCount}/${EXTERNAL_API_CONFIG.RATE_LIMITS.REQUESTS_PER_DAY}`);
        }

        return canMakeMinute && canMakeDaily;
    }

    // Registrar requisição de vaga
    recordJobRequest() {
        const now = new Date();
        const minuteKey = this.getMinuteKey(now);
        const dailyKey = this.getDailyKey(now);

        // Incrementar contador por minuto
        const minuteCount = (this.requestCounts.get(minuteKey) || 0) + 1;
        this.requestCounts.set(minuteKey, minuteCount);

        // Incrementar contador diário
        const dailyCount = (this.dailyCounts.get(dailyKey) || 0) + 1;
        this.dailyCounts.set(dailyKey, dailyCount);

        console.log(`📊 Rate limit: ${minuteCount}/${EXTERNAL_API_CONFIG.RATE_LIMITS.JOBS_PER_MINUTE} por minuto, ${dailyCount}/${EXTERNAL_API_CONFIG.RATE_LIMITS.REQUESTS_PER_DAY} por dia`);
    }

    // Verificar se pode fazer requisição para detalhes de vaga
    canMakeJobDetailsRequest() {
        // Detalhes têm limite mais alto, usar limite global
        return this.canMakeJobRequest();
    }

    // Registrar requisição de detalhes de vaga
    recordJobDetailsRequest() {
        this.recordJobRequest();
    }

    // Verificar se pode fazer health check
    canMakeHealthRequest() {
        // Health check tem limite mais alto
        return this.canMakeJobRequest();
    }

    // Registrar health check
    recordHealthRequest() {
        this.recordJobRequest();
    }

    // Verificar se pode fazer requisição para cursos
    canMakeCoursesRequest() {
        return this.canMakeJobRequest();
    }

    // Registrar requisição de cursos
    recordCoursesRequest() {
        this.recordJobRequest();
    }

    // Verificar se pode fazer requisição para detalhes de curso
    canMakeCourseDetailsRequest() {
        return this.canMakeJobRequest();
    }

    // Registrar requisição de detalhes de curso
    recordCourseDetailsRequest() {
        this.recordJobRequest();
    }

    // Obter chave para contador por minuto
    getMinuteKey(date) {
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}`;
    }

    // Obter chave para contador diário
    getDailyKey(date) {
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    }

    // Resetar contadores por minuto
    resetMinuteCounters() {
        const now = new Date();
        const currentMinuteKey = this.getMinuteKey(now);

        // Remover contadores antigos (mais de 1 minuto)
        for (const [key] of this.requestCounts) {
            if (key !== currentMinuteKey) {
                this.requestCounts.delete(key);
            }
        }
    }

    // Resetar contadores diários
    resetDailyCounters() {
        const now = new Date();
        const currentDailyKey = this.getDailyKey(now);

        // Remover contadores antigos (mais de 1 dia)
        for (const [key] of this.dailyCounts) {
            if (key !== currentDailyKey) {
                this.dailyCounts.delete(key);
            }
        }

        this.lastReset = now;
        console.log('🔄 Contadores diários resetados');
    }

    // Obter estatísticas de rate limiting
    getStats() {
        const now = new Date();
        const minuteKey = this.getMinuteKey(now);
        const dailyKey = this.getDailyKey(now);

        return {
            minute: {
                current: this.requestCounts.get(minuteKey) || 0,
                limit: EXTERNAL_API_CONFIG.RATE_LIMITS.JOBS_PER_MINUTE,
                remaining: Math.max(0, EXTERNAL_API_CONFIG.RATE_LIMITS.JOBS_PER_MINUTE - (this.requestCounts.get(minuteKey) || 0))
            },
            daily: {
                current: this.dailyCounts.get(dailyKey) || 0,
                limit: EXTERNAL_API_CONFIG.RATE_LIMITS.REQUESTS_PER_DAY,
                remaining: Math.max(0, EXTERNAL_API_CONFIG.RATE_LIMITS.REQUESTS_PER_DAY - (this.dailyCounts.get(dailyKey) || 0))
            },
            lastReset: this.lastReset,
            canMakeRequest: this.canMakeJobRequest()
        };
    }

    // Resetar todos os contadores (para desenvolvimento/testes)
    resetAll() {
        this.requestCounts.clear();
        this.dailyCounts.clear();
        this.lastReset = new Date();
        console.log('🔄 Todos os contadores de rate limit foram resetados');
    }

    // Verificar tempo até próximo reset
    getTimeUntilReset() {
        const now = new Date();
        const nextMinute = new Date(now.getTime() + 60000);
        const nextDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

        return {
            nextMinute: nextMinute,
            nextDay: nextDay,
            minutesUntilReset: Math.ceil((nextMinute - now) / 60000),
            hoursUntilDailyReset: Math.ceil((nextDay - now) / (1000 * 60 * 60))
        };
    }
}

// Instância singleton do rate limiting
const rateLimitService = new RateLimitService();

export default rateLimitService; 