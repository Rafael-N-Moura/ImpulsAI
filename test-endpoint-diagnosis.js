#!/usr/bin/env node

/**
 * Diagnóstico de Endpoints da API Externa
 * 
 * Este script testa diferentes variações de endpoints para identificar
 * qual está funcionando na API externa.
 */

import axios from 'axios';
import { EXTERNAL_API_CONFIG, getBaseURL } from './config/externalAPI.js';

console.log('🔍 DIAGNÓSTICO DE ENDPOINTS DA API EXTERNA\n');

const baseURL = getBaseURL();
const apiKey = EXTERNAL_API_CONFIG.API_KEY;

console.log(`🌐 Base URL: ${baseURL}`);
console.log(`🔑 API Key: ${apiKey ? '✅ Configurada' : '❌ Não configurada'}\n`);

// Configurar cliente axios
const client = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
    }
});

// Função para testar endpoint
async function testEndpoint(method, endpoint, data = null, description = '') {
    try {
        console.log(`🧪 Testando: ${method} ${endpoint} ${description}`);

        const config = {
            method,
            url: endpoint,
            ...(data && { data })
        };

        const response = await client(config);

        console.log(`   ✅ Status: ${response.status}`);
        console.log(`   📊 Resposta: ${JSON.stringify(response.data, null, 2).substring(0, 200)}...`);
        console.log('');

        return { success: true, status: response.status, data: response.data };

    } catch (error) {
        const status = error.response?.status || 'N/A';
        const message = error.response?.data?.message || error.message || 'Erro desconhecido';

        console.log(`   ❌ Status: ${status}`);
        console.log(`   📝 Erro: ${message}`);
        console.log('');

        return { success: false, status, error: message };
    }
}

// Função para testar diferentes variações de endpoints
async function testAllEndpoints() {
    console.log('📋 TESTANDO DIFERENTES ENDPOINTS\n');

    const tests = [
        // Teste 1: Health check (deve funcionar)
        {
            method: 'GET',
            endpoint: '/health',
            description: '(Health Check)'
        },

        // Teste 2: Endpoint de vagas com versão v1
        {
            method: 'POST',
            endpoint: '/api/v1/jobs/',
            data: { query: 'Python Developer', location: 'Brazil', limit: 3 },
            description: '(Vagas v1)'
        },

        // Teste 3: Endpoint de vagas sem versão
        {
            method: 'POST',
            endpoint: '/api/jobs/',
            data: { query: 'Python Developer', location: 'Brazil', limit: 3 },
            description: '(Vagas sem versão)'
        },

        // Teste 4: Endpoint de vagas com versão v2
        {
            method: 'POST',
            endpoint: '/api/v2/jobs/',
            data: { query: 'Python Developer', location: 'Brazil', limit: 3 },
            description: '(Vagas v2)'
        },

        // Teste 5: Endpoint alternativo
        {
            method: 'POST',
            endpoint: '/jobs/search',
            data: { query: 'Python Developer', location: 'Brazil', limit: 3 },
            description: '(Busca alternativa)'
        },

        // Teste 6: Endpoint com GET em vez de POST
        {
            method: 'GET',
            endpoint: '/api/v1/jobs/?query=Python Developer&location=Brazil&limit=3',
            description: '(Vagas GET)'
        }
    ];

    const results = [];

    for (const test of tests) {
        const result = await testEndpoint(test.method, test.endpoint, test.data, test.description);
        results.push({ ...test, result });

        // Aguardar um pouco entre os testes
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return results;
}

// Função para analisar resultados
function analyzeResults(results) {
    console.log('📊 ANÁLISE DOS RESULTADOS\n');
    console.log('='.repeat(60));

    let workingEndpoints = 0;
    let totalTests = results.length;

    results.forEach((test, index) => {
        const status = test.result.success ? '✅ FUNCIONA' : '❌ FALHOU';
        console.log(`${status} - ${test.method} ${test.endpoint} ${test.description}`);

        if (test.result.success) {
            workingEndpoints++;
        }
    });

    console.log('='.repeat(60));
    console.log(`Total de testes: ${totalTests}`);
    console.log(`Endpoints funcionando: ${workingEndpoints}`);
    console.log(`Endpoints falhando: ${totalTests - workingEndpoints}`);

    if (workingEndpoints === 0) {
        console.log('\n🚨 NENHUM ENDPOINT DE VAGAS ESTÁ FUNCIONANDO!');
        console.log('   Possíveis causas:');
        console.log('   - API em desenvolvimento/construção');
        console.log('   - Endpoints diferentes dos documentados');
        console.log('   - Problemas de autenticação');
        console.log('   - API indisponível temporariamente');
    } else if (workingEndpoints === 1) {
        console.log('\n⚠️ APENAS 1 ENDPOINT FUNCIONA (provavelmente health check)');
        console.log('   - Endpoints de vagas não estão implementados ainda');
        console.log('   - API pode estar em desenvolvimento');
    } else {
        console.log('\n🎉 MÚLTIPLOS ENDPOINTS FUNCIONANDO!');
        console.log('   - Sistema está funcionando corretamente');
    }

    // Recomendações
    console.log('\n💡 RECOMENDAÇÕES:');

    if (workingEndpoints === 0) {
        console.log('   1. Verificar se a API externa está realmente implementada');
        console.log('   2. Contatar o desenvolvedor da API externa');
        console.log('   3. Usar apenas o sistema de fallback por enquanto');
        console.log('   4. Implementar monitoramento para quando a API ficar disponível');
    } else if (workingEndpoints === 1) {
        console.log('   1. API externa está em desenvolvimento');
        console.log('   2. Manter sistema de fallback ativo');
        console.log('   3. Implementar verificação periódica de disponibilidade');
        console.log('   4. Documentar endpoints que funcionam');
    } else {
        console.log('   1. Atualizar configuração com endpoints corretos');
        console.log('   2. Testar funcionalidade completa');
        console.log('   3. Monitorar performance e estabilidade');
    }
}

// Executar diagnóstico
async function runDiagnosis() {
    try {
        console.log('🚀 Iniciando diagnóstico...\n');

        const results = await testAllEndpoints();
        analyzeResults(results);

        console.log('\n✅ Diagnóstico concluído!');

    } catch (error) {
        console.error('❌ Erro durante o diagnóstico:', error.message);
    }
}

// Executar se o arquivo for executado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
    runDiagnosis().catch(error => {
        console.error('❌ Erro fatal durante o diagnóstico:', error);
        process.exit(1);
    });
}

export { runDiagnosis }; 