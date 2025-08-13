#!/usr/bin/env node

/**
 * Script de teste simples para cursos - apenas com campo "query"
 * Testa se a API externa está funcionando com parâmetros mínimos
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:4000';
const EXTERNAL_API_BASE = 'https://api-jobs-courses-impulseai-develop.up.railway.app';
const API_KEY = '1e6a8d8f-9b0c-4c7e-8a3d-5f2b1c9d8e7a';

// Função para fazer requisição HTTP
async function makeRequest(method, endpoint, data = null, headers = {}) {
    try {
        const config = {
            method,
            url: `${BASE_URL}${endpoint}`,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        if (data && (method === 'POST' || method === 'PUT')) {
            config.data = data;
        }

        const response = await axios(config);
        return { success: true, data: response.data, status: response.status };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data || error.message,
            status: error.response?.status || 500
        };
    }
}

// Função para testar API externa diretamente
async function testExternalAPIDirectly() {
    console.log('🔍 Testando API Externa Diretamente...');
    console.log('='.repeat(50));

    try {
        // Teste 1: Health check direto
        console.log('\n📡 Teste 1: Health Check Direto');
        const healthResponse = await axios.get(`${EXTERNAL_API_BASE}/health`, {
            headers: {
                'X-API-Key': API_KEY
            },
            timeout: 10000
        });

        console.log('✅ Health Check:', healthResponse.data);

        // Teste 2: Busca de cursos com apenas query
        console.log('\n📚 Teste 2: Busca de Cursos (apenas query)');
        const coursesResponse = await axios.post(`${EXTERNAL_API_BASE}/api/v1/courses/`, {
            query: 'Python'
        }, {
            headers: {
                'X-API-Key': API_KEY,
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });

        console.log('✅ Resposta da API Externa:');
        console.log('   Status:', coursesResponse.status);
        console.log('   Success:', coursesResponse.data.success);
        console.log('   Count:', coursesResponse.data.total);
        console.log('   Data:', coursesResponse.data.data ? `${coursesResponse.data.data.length} cursos` : 'N/A');

        if (coursesResponse.data.data && coursesResponse.data.data.length > 0) {
            console.log('\n📖 Primeiro curso encontrado:');
            const firstCourse = coursesResponse.data.data[0];
            console.log('   ID:', firstCourse.id);
            console.log('   Título:', firstCourse.title || firstCourse.nome);
            console.log('   Instrutor:', firstCourse.instructor || firstCourse.instrutor);
            console.log('   Plataforma:', firstCourse.source || firstCourse.plataforma);
        }

        return true;

    } catch (error) {
        console.error('❌ Erro na API Externa:', error.response?.data || error.message);
        console.error('   Status:', error.response?.status);
        console.error('   Headers:', error.response?.headers);
        return false;
    }
}

// Função para testar nosso endpoint com apenas query
async function testOurEndpointSimple() {
    console.log('\n🔍 Testando Nosso Endpoint (apenas query)...');
    console.log('='.repeat(50));

    try {
        // Teste com apenas o campo query
        const data = {
            query: 'Python'
        };

        console.log('\n📤 Enviando requisição:');
        console.log('   Endpoint: POST /api/courses/search');
        console.log('   Body:', JSON.stringify(data, null, 2));

        const response = await makeRequest('POST', '/api/courses/search', data);

        if (response.success) {
            console.log('\n✅ Resposta do nosso endpoint:');
            console.log('   Status:', response.status);
            console.log('   Success:', response.data.success);
            console.log('   Count:', response.data.total);
            console.log('   Source:', response.data.source);
            console.log('   Message:', response.data.message);

            if (response.data.data && response.data.data.length > 0) {
                console.log('\n📖 Primeiro curso retornado:');
                const firstCourse = response.data.data[0];
                console.log('   ID:', firstCourse.id);
                console.log('   Nome:', firstCourse.nome);
                console.log('   Instrutor:', firstCourse.instrutor);
                console.log('   Plataforma:', firstCourse.plataforma);
            }
        } else {
            console.log('\n❌ Erro no nosso endpoint:');
            console.log('   Status:', response.status);
            console.log('   Error:', response.error);
        }

        return response.success;

    } catch (error) {
        console.error('❌ Erro ao testar nosso endpoint:', error);
        return false;
    }
}

// Função para testar diferentes variações de body
async function testDifferentBodies() {
    console.log('\n🔍 Testando Diferentes Variações de Body...');
    console.log('='.repeat(50));

    const testCases = [
        { name: 'Apenas query', body: { query: 'Python' } },
        { name: 'Query + platform', body: { query: 'Python', platform: 'udemy' } },
        { name: 'Query + limit', body: { query: 'Python', limit: 5 } },
        { name: 'Query + language', body: { query: 'Python', language: 'en' } },
        { name: 'Query + platform + limit', body: { query: 'Python', platform: 'udemy', limit: 3 } },
        { name: 'Query + platform + language', body: { query: 'Python', platform: 'udemy', language: 'en' } },
        { name: 'Query + limit + language', body: { query: 'Python', limit: 3, language: 'en' } },
        { name: 'Todos os campos', body: { query: 'Python', platform: 'udemy', limit: 3, language: 'en' } }
    ];

    const results = [];

    for (const testCase of testCases) {
        console.log(`\n📋 Teste: ${testCase.name}`);
        console.log('   Body:', JSON.stringify(testCase.body, null, 2));

        const response = await makeRequest('POST', '/api/courses/search', testCase.body);

        if (response.success) {
            console.log('   ✅ Sucesso:', response.data.success);
            console.log('   📊 Count:', response.data.total);
            console.log('   🔍 Source:', response.data.source);
            console.log('   💬 Message:', response.data.message);

            results.push({
                testCase: testCase.name,
                success: true,
                source: response.data.source,
                count: response.data.total
            });
        } else {
            console.log('   ❌ Falha:', response.error?.message || response.error);
            console.log('   📊 Status:', response.status);

            results.push({
                testCase: testCase.name,
                success: false,
                error: response.error?.message || response.error,
                status: response.status
            });
        }

        // Aguardar um pouco entre as requisições
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return results;
}

// Função principal
async function runSimpleTest() {
    console.log('🚀 Teste Simples de Cursos - Apenas Query');
    console.log('='.repeat(60));

    try {
        // Teste 1: API externa diretamente
        const externalSuccess = await testExternalAPIDirectly();

        // Teste 2: Nosso endpoint com apenas query
        const ourEndpointSuccess = await testOurEndpointSimple();

        // Teste 3: Diferentes variações de body
        const bodyVariations = await testDifferentBodies();

        // Relatório final
        console.log('\n' + '='.repeat(60));
        console.log('📊 RELATÓRIO FINAL');
        console.log('='.repeat(60));

        console.log(`✅ API Externa Direta: ${externalSuccess ? 'PASSOU' : 'FALHOU'}`);
        console.log(`✅ Nosso Endpoint (apenas query): ${ourEndpointSuccess ? 'PASSOU' : 'FALHOU'}`);

        console.log('\n📋 Variações de Body:');
        bodyVariations.forEach(result => {
            if (result.success) {
                console.log(`   ✅ ${result.testCase}: ${result.count} cursos (${result.source})`);
            } else {
                console.log(`   ❌ ${result.testCase}: ${result.error}`);
            }
        });

        // Análise das fontes
        const sources = bodyVariations.filter(r => r.success).map(r => r.source);
        const uniqueSources = [...new Set(sources)];

        console.log('\n🎯 Fontes dos dados:');
        uniqueSources.forEach(source => {
            const count = sources.filter(s => s === source).length;
            console.log(`   ${source}: ${count} testes`);
        });

        console.log('\n🎯 Teste concluído!');

    } catch (error) {
        console.error('❌ Erro durante o teste:', error);
    }
}

// Executar teste se o script for chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
    runSimpleTest().catch(console.error);
} 