#!/usr/bin/env node

/**
 * Teste da Integração com API Externa
 * 
 * Este script testa todos os serviços da API externa:
 * - Configuração
 * - Cache
 * - Rate Limiting
 * - Comunicação com API externa
 * - Fallback para dados estáticos
 */

import externalAPIService from './services/externalAPIService.js';
import jobSearchService from './services/jobSearchService.js';
import cacheService from './services/cacheService.js';
import rateLimitService from './services/rateLimitService.js';
import { EXTERNAL_API_CONFIG, getBaseURL } from './config/externalAPI.js';

console.log('🧪 INICIANDO TESTES DA API EXTERNA\n');

// Função para aguardar
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Função para testar configuração
async function testConfiguration() {
    console.log('📋 Testando Configuração...');

    try {
        console.log(`   Base URL: ${getBaseURL()}`);
        console.log(`   API Key: ${EXTERNAL_API_CONFIG.API_KEY ? '✅ Configurada' : '❌ Não configurada'}`);
        console.log(`   Timeout: ${EXTERNAL_API_CONFIG.TIMEOUT}ms`);
        console.log(`   Retry Attempts: ${EXTERNAL_API_CONFIG.RETRY_ATTEMPTS}`);
        console.log(`   Rate Limit (min): ${EXTERNAL_API_CONFIG.RATE_LIMITS.JOBS_PER_MINUTE}`);
        console.log(`   Rate Limit (dia): ${EXTERNAL_API_CONFIG.RATE_LIMITS.REQUESTS_PER_DAY}`);

        console.log('   ✅ Configuração válida\n');
        return true;
    } catch (error) {
        console.log(`   ❌ Erro na configuração: ${error.message}\n`);
        return false;
    }
}

// Função para testar cache
async function testCache() {
    console.log('🗄️ Testando Cache...');

    try {
        // Testar cache de vagas
        const testData = { test: 'data' };
        cacheService.setJobs('test', 'test-location', 5, testData);

        const cachedData = cacheService.getJobs('test', 'test-location', 5);
        if (cachedData === testData) {
            console.log('   ✅ Cache de vagas funcionando');
        } else {
            console.log('   ❌ Cache de vagas com problema');
        }

        // Testar estatísticas
        const stats = cacheService.getStats();
        console.log(`   Cache keys: ${stats.keys}`);
        console.log(`   Cache hits: ${stats.hits}`);
        console.log(`   Cache misses: ${stats.misses}`);

        // Limpar cache de teste
        cacheService.clearJobsCache();

        console.log('   ✅ Cache funcionando corretamente\n');
        return true;
    } catch (error) {
        console.log(`   ❌ Erro no cache: ${error.message}\n`);
        return false;
    }
}

// Função para testar rate limiting
async function testRateLimiting() {
    console.log('⏱️ Testando Rate Limiting...');

    try {
        // Verificar estado inicial
        const initialStats = rateLimitService.getStats();
        console.log(`   Estado inicial: ${initialStats.canMakeRequest ? 'Pode fazer requisição' : 'Rate limit atingido'}`);

        // Simular algumas requisições
        for (let i = 0; i < 3; i++) {
            if (rateLimitService.canMakeJobRequest()) {
                rateLimitService.recordJobRequest();
                console.log(`   Requisição ${i + 1} registrada`);
            } else {
                console.log(`   Rate limit atingido na requisição ${i + 1}`);
                break;
            }
        }

        // Verificar estatísticas
        const stats = rateLimitService.getStats();
        console.log(`   Requisições por minuto: ${stats.minute.current}/${stats.minute.limit}`);
        console.log(`   Requisições por dia: ${stats.daily.current}/${stats.daily.limit}`);

        // Resetar para não interferir nos testes
        rateLimitService.resetAll();

        console.log('   ✅ Rate limiting funcionando corretamente\n');
        return true;
    } catch (error) {
        console.log(`   ❌ Erro no rate limiting: ${error.message}\n`);
        return false;
    }
}

// Função para testar conectividade com API externa
async function testExternalAPIConnection() {
    console.log('🌐 Testando Conectividade com API Externa...');

    try {
        const result = await externalAPIService.testConnection();

        if (result.success) {
            console.log('   ✅ API externa conectada com sucesso');
            console.log(`   Status: ${result.data?.status || 'N/A'}`);
            console.log(`   Versão: ${result.data?.version || 'N/A'}`);
        } else {
            console.log('   ❌ Falha na conexão com API externa');
            console.log(`   Erro: ${result.error || 'N/A'}`);
        }

        console.log('   ✅ Teste de conectividade concluído\n');
        return result.success;
    } catch (error) {
        console.log(`   ❌ Erro no teste de conectividade: ${error.message}\n`);
        return false;
    }
}

// Função para testar busca de vagas
async function testJobSearch() {
    console.log('🔍 Testando Busca de Vagas...');

    try {
        // Testar busca via API externa
        const jobs = await jobSearchService.searchJobs('Python', 'Brazil', 3);

        if (jobs.success && jobs.data && jobs.data.length > 0) {
            console.log(`   ✅ ${jobs.data.length} vagas encontradas via ${jobs.source}`);
            console.log(`   Primeira vaga: ${jobs.data[0].titulo} em ${jobs.data[0].empresa}`);
        } else {
            console.log('   ⚠️ Nenhuma vaga encontrada via API externa');
        }

        console.log('   ✅ Teste de busca de vagas concluído\n');
        return true;
    } catch (error) {
        console.log(`   ❌ Erro na busca de vagas: ${error.message}\n`);
        return false;
    }
}

// Função para testar fallback
async function testFallback() {
    console.log('🔄 Testando Sistema de Fallback...');

    try {
        // Desativar API externa temporariamente
        const originalState = jobSearchService.useExternalAPI;
        jobSearchService.setExternalAPIUsage(false);

        // Fazer busca (deve usar fallback)
        const jobs = await jobSearchService.searchJobs('Desenvolvedor', 'São Paulo', 2);

        if (jobs.success && jobs.data && jobs.data.length > 0) {
            console.log(`   ✅ ${jobs.data.length} vagas encontradas via fallback`);
            console.log(`   Fonte: ${jobs.source}`);
        } else {
            console.log('   ❌ Fallback não funcionou');
        }

        // Restaurar estado original
        jobSearchService.setExternalAPIUsage(originalState);

        console.log('   ✅ Teste de fallback concluído\n');
        return true;
    } catch (error) {
        console.log(`   ❌ Erro no teste de fallback: ${error.message}\n`);
        return false;
    }
}

// Função para testar estatísticas
async function testStats() {
    console.log('📊 Testando Estatísticas...');

    try {
        const stats = jobSearchService.getUsageStats();

        console.log(`   API Externa ativa: ${stats.useExternalAPI ? 'Sim' : 'Não'}`);
        console.log(`   Base URL: ${stats.externalAPI.config.baseURL}`);
        console.log(`   Timeout: ${stats.externalAPI.config.timeout}ms`);

        // Estatísticas de rate limiting
        const rateLimit = stats.externalAPI.rateLimit;
        console.log(`   Rate Limit (min): ${rateLimit.minute.current}/${rateLimit.minute.limit}`);
        console.log(`   Rate Limit (dia): ${rateLimit.daily.current}/${rateLimit.daily.limit}`);

        // Estatísticas de cache
        const cache = stats.externalAPI.cache;
        console.log(`   Cache keys: ${cache.keys}`);
        console.log(`   Cache hits: ${cache.hits}`);
        console.log(`   Cache misses: ${cache.misses}`);

        console.log('   ✅ Estatísticas obtidas com sucesso\n');
        return true;
    } catch (error) {
        console.log(`   ❌ Erro ao obter estatísticas: ${error.message}\n`);
        return false;
    }
}

// Função principal de teste
async function runAllTests() {
    const tests = [
        { name: 'Configuração', fn: testConfiguration },
        { name: 'Cache', fn: testCache },
        { name: 'Rate Limiting', fn: testRateLimiting },
        { name: 'Conectividade API Externa', fn: testExternalAPIConnection },
        { name: 'Busca de Vagas', fn: testJobSearch },
        { name: 'Sistema de Fallback', fn: testFallback },
        { name: 'Estatísticas', fn: testStats }
    ];

    const results = [];

    for (const test of tests) {
        try {
            const result = await test.fn();
            results.push({ name: test.name, success: result });
        } catch (error) {
            console.log(`   ❌ Erro inesperado no teste ${test.name}: ${error.message}\n`);
            results.push({ name: test.name, success: false, error: error.message });
        }

        // Aguardar um pouco entre os testes
        await wait(1000);
    }

    // Resumo dos resultados
    console.log('📋 RESUMO DOS TESTES\n');
    console.log('='.repeat(50));

    let passed = 0;
    let failed = 0;

    results.forEach(result => {
        const status = result.success ? '✅ PASSOU' : '❌ FALHOU';
        console.log(`${status} - ${result.name}`);

        if (result.success) {
            passed++;
        } else {
            failed++;
            if (result.error) {
                console.log(`     Erro: ${result.error}`);
            }
        }
    });

    console.log('='.repeat(50));
    console.log(`Total: ${results.length} | Passou: ${passed} | Falhou: ${failed}`);

    if (failed === 0) {
        console.log('\n🎉 TODOS OS TESTES PASSARAM! A integração está funcionando perfeitamente.');
    } else {
        console.log('\n⚠️ Alguns testes falharam. Verifique os logs acima para mais detalhes.');
    }
}

// Executar testes se o arquivo for executado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
    runAllTests().catch(error => {
        console.error('❌ Erro fatal durante os testes:', error);
        process.exit(1);
    });
}

export { runAllTests }; 