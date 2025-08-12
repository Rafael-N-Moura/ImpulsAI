#!/usr/bin/env node

/**
 * Script de diagnóstico para os endpoints de cursos da API externa
 * Testa diferentes variações de endpoints, métodos HTTP e parâmetros
 */

import axios from 'axios';

const EXTERNAL_API_BASE = 'https://api-jobs-courses-impulseai-develop.up.railway.app';
const API_KEY = '1e6a8d8f-9b0c-4c7e-8a3d-5f2b1c9d8e7a';

// Configurações de teste
const TEST_ENDPOINTS = [
    '/api/v1/courses',
    '/api/v1/courses/',
    '/api/v1/courses/search',
    '/api/v1/courses/search/',
    '/api/v1/courses/udemy',
    '/api/v1/courses/udemy/',
    '/api/v1/courses/platform/udemy',
    '/api/v1/courses/platform/udemy/'
];

const TEST_METHODS = ['GET', 'POST'];
const TEST_PLATFORMS = ['udemy', 'coursera', 'edx', 'all'];

// Função para fazer requisição de teste
async function testEndpoint(method, endpoint, data = null) {
    try {
        const config = {
            method,
            url: `${EXTERNAL_API_BASE}${endpoint}`,
            headers: {
                'X-API-Key': API_KEY,
                'Content-Type': 'application/json'
            },
            timeout: 10000
        };

        if (data && method === 'POST') {
            config.data = data;
        }

        const response = await axios(config);

        return {
            success: true,
            status: response.status,
            data: response.data,
            endpoint,
            method
        };
    } catch (error) {
        return {
            success: false,
            status: error.response?.status || 0,
            error: error.response?.data || error.message,
            endpoint,
            method
        };
    }
}

// Função para testar diferentes variações de endpoints
async function testEndpointVariations() {
    console.log('\n🔍 Testando Variações de Endpoints...');
    console.log('='.repeat(60));

    const results = [];

    for (const endpoint of TEST_ENDPOINTS) {
        for (const method of TEST_METHODS) {
            console.log(`\n📡 Testando: ${method} ${endpoint}`);

            let data = null;
            if (method === 'POST') {
                data = {
                    query: 'Python',
                    platform: 'udemy',
                    limit: 3,
                    language: 'pt'
                };
            }

            const result = await testEndpoint(method, endpoint, data);

            if (result.success) {
                console.log(`   ✅ ${result.status}: ${result.data.success ? 'Sucesso' : 'Falha'}`);
                if (result.data.data) {
                    console.log(`   📊 Dados: ${result.data.count || 0} cursos encontrados`);
                }
            } else {
                console.log(`   ❌ ${result.status}: ${result.error.error || result.error.message || result.error}`);
            }

            results.push(result);

            // Aguardar um pouco entre as requisições
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    return results;
}

// Função para testar diferentes parâmetros
async function testParameters() {
    console.log('\n🔍 Testando Diferentes Parâmetros...');
    console.log('='.repeat(60));

    const baseEndpoint = '/api/v1/courses/';
    const results = [];

    // Testar diferentes queries
    const queries = ['Python', 'Machine Learning', 'JavaScript', 'Data Science', 'Web Development'];

    for (const query of queries.slice(0, 3)) { // Testar apenas 3 para não sobrecarregar
        console.log(`\n📚 Testando query: "${query}"`);

        const data = {
            query,
            platform: 'udemy',
            limit: 5,
            language: 'pt'
        };

        const result = await testEndpoint('POST', baseEndpoint, data);

        if (result.success) {
            console.log(`   ✅ Sucesso: ${result.data.count || 0} cursos encontrados`);
            if (result.data.data && result.data.data.length > 0) {
                console.log(`   🎯 Primeiro curso: ${result.data.data[0].title || result.data.data[0].nome || 'N/A'}`);
            }
        } else {
            console.log(`   ❌ Falha: ${result.error.error || result.error.message || result.error}`);
        }

        results.push(result);

        // Aguardar um pouco entre as requisições
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Testar diferentes plataformas
    console.log('\n🔄 Testando diferentes plataformas...');

    for (const platform of TEST_PLATFORMS) {
        console.log(`\n📱 Testando plataforma: "${platform}"`);

        const data = {
            query: 'Python',
            platform,
            limit: 3,
            language: 'pt'
        };

        const result = await testEndpoint('POST', baseEndpoint, data);

        if (result.success) {
            console.log(`   ✅ Sucesso: ${result.data.count || 0} cursos encontrados`);
        } else {
            console.log(`   ❌ Falha: ${result.error.error || result.error.message || result.error}`);
        }

        results.push(result);

        // Aguardar um pouco entre as requisições
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return results;
}

// Função para testar diferentes limites
async function testLimits() {
    console.log('\n🔍 Testando Diferentes Limites...');
    console.log('='.repeat(60));

    const baseEndpoint = '/api/v1/courses/';
    const limits = [1, 5, 10, 20, 50];
    const results = [];

    for (const limit of limits) {
        console.log(`\n📊 Testando limite: ${limit}`);

        const data = {
            query: 'Python',
            platform: 'udemy',
            limit,
            language: 'pt'
        };

        const result = await testEndpoint('POST', baseEndpoint, data);

        if (result.success) {
            console.log(`   ✅ Sucesso: ${result.data.count || 0} cursos retornados (solicitado: ${limit})`);
            if (result.data.data) {
                console.log(`   📈 Array retornado: ${result.data.data.length} itens`);
            }
        } else {
            console.log(`   ❌ Falha: ${result.error.error || result.error.message || result.error}`);
        }

        results.push(result);

        // Aguardar um pouco entre as requisições
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return results;
}

// Função para testar diferentes idiomas
async function testLanguages() {
    console.log('\n🔍 Testando Diferentes Idiomas...');
    console.log('='.repeat(60));

    const baseEndpoint = '/api/v1/courses/';
    const languages = ['pt', 'en', 'es', 'fr', 'de'];
    const results = [];

    for (const language of languages) {
        console.log(`\n🌍 Testando idioma: "${language}"`);

        const data = {
            query: 'Python',
            platform: 'udemy',
            limit: 3,
            language
        };

        const result = await testEndpoint('POST', baseEndpoint, data);

        if (result.success) {
            console.log(`   ✅ Sucesso: ${result.data.count || 0} cursos encontrados`);
            if (result.data.data && result.data.data.length > 0) {
                const firstCourse = result.data.data[0];
                console.log(`   🎯 Primeiro curso: ${firstCourse.title || firstCourse.nome || 'N/A'}`);
                console.log(`   🗣️ Idioma: ${firstCourse.language || 'N/A'}`);
            }
        } else {
            console.log(`   ❌ Falha: ${result.error.error || result.error.message || result.error}`);
        }

        results.push(result);

        // Aguardar um pouco entre as requisições
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return results;
}

// Função para testar detalhes de curso
async function testCourseDetails() {
    console.log('\n🔍 Testando Detalhes de Curso...');
    console.log('='.repeat(60));

    // Primeiro buscar alguns cursos para obter IDs
    const searchData = {
        query: 'Python',
        platform: 'udemy',
        limit: 3
    };

    const searchResult = await testEndpoint('POST', '/api/v1/courses/', searchData);

    if (!searchResult.success || !searchResult.data.data || searchResult.data.data.length === 0) {
        console.log('❌ Não foi possível buscar cursos para testar detalhes');
        return [];
    }

    const results = [];

    for (const course of searchResult.data.data.slice(0, 2)) { // Testar apenas 2 cursos
        const courseId = course.id;
        console.log(`\n📖 Testando detalhes do curso: ${course.title || course.nome || 'N/A'} (ID: ${courseId})`);

        // Testar diferentes variações do endpoint de detalhes
        const detailEndpoints = [
            `/api/v1/courses/${courseId}`,
            `/api/v1/courses/${courseId}/`,
            `/api/v1/courses/detail/${courseId}`,
            `/api/v1/courses/detail/${courseId}/`
        ];

        for (const endpoint of detailEndpoints) {
            console.log(`   🔍 Testando: GET ${endpoint}`);

            const result = await testEndpoint('GET', endpoint);

            if (result.success) {
                console.log(`      ✅ Sucesso: ${result.status}`);
                if (result.data.data) {
                    const details = result.data.data;
                    console.log(`      📊 Título: ${details.title || details.nome || 'N/A'}`);
                    console.log(`      👨‍🏫 Instrutor: ${details.instructor || details.instrutor || 'N/A'}`);
                    console.log(`      ⭐ Avaliação: ${details.rating || details.avaliacao || 'N/A'}`);
                }
            } else {
                console.log(`      ❌ Falha: ${result.status} - ${result.error.error || result.error.message || result.error}`);
            }

            results.push(result);

            // Aguardar um pouco entre as requisições
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    return results;
}

// Função principal de diagnóstico
async function runDiagnosis() {
    console.log('🚀 Iniciando Diagnóstico dos Endpoints de Cursos da API Externa');
    console.log('='.repeat(60));

    const results = {
        endpoints: [],
        parameters: [],
        limits: [],
        languages: [],
        details: []
    };

    try {
        // Teste 1: Variações de endpoints
        results.endpoints = await testEndpointVariations();

        // Teste 2: Diferentes parâmetros
        results.parameters = await testParameters();

        // Teste 3: Diferentes limites
        results.limits = await testLimits();

        // Teste 4: Diferentes idiomas
        results.languages = await testLanguages();

        // Teste 5: Detalhes de curso
        results.details = await testCourseDetails();

    } catch (error) {
        console.error('❌ Erro durante o diagnóstico:', error);
    }

    // Relatório final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RELATÓRIO FINAL DO DIAGNÓSTICO');
    console.log('='.repeat(60));

    // Resumo dos endpoints
    const endpointSuccess = results.endpoints.filter(r => r.success).length;
    const endpointTotal = results.endpoints.length;
    console.log(`✅ Endpoints: ${endpointSuccess}/${endpointTotal} testes passaram`);

    // Resumo dos parâmetros
    const paramSuccess = results.parameters.filter(r => r.success).length;
    const paramTotal = results.parameters.length;
    console.log(`✅ Parâmetros: ${paramSuccess}/${paramTotal} testes passaram`);

    // Resumo dos limites
    const limitSuccess = results.limits.filter(r => r.success).length;
    const limitTotal = results.limits.length;
    console.log(`✅ Limites: ${limitSuccess}/${limitTotal} testes passaram`);

    // Resumo dos idiomas
    const langSuccess = results.languages.filter(r => r.success).length;
    const langTotal = results.languages.length;
    console.log(`✅ Idiomas: ${langSuccess}/${langTotal} testes passaram`);

    // Resumo dos detalhes
    const detailSuccess = results.details.filter(r => r.success).length;
    const detailTotal = results.details.length;
    console.log(`✅ Detalhes: ${detailSuccess}/${detailTotal} testes passaram`);

    // Análise dos endpoints que funcionaram
    console.log('\n🎯 Endpoints Funcionais:');
    const workingEndpoints = results.endpoints.filter(r => r.success);
    const uniqueEndpoints = [...new Set(workingEndpoints.map(r => `${r.method} ${r.endpoint}`))];

    uniqueEndpoints.forEach(endpoint => {
        console.log(`   ✅ ${endpoint}`);
    });

    // Análise dos códigos de erro
    console.log('\n❌ Códigos de Erro Encontrados:');
    const errorCodes = {};
    results.endpoints.forEach(result => {
        if (!result.success && result.status > 0) {
            errorCodes[result.status] = (errorCodes[result.status] || 0) + 1;
        }
    });

    Object.entries(errorCodes).forEach(([status, count]) => {
        console.log(`   ${status}: ${count} ocorrências`);
    });

    console.log('\n🎯 Diagnóstico concluído!');
}

// Executar diagnóstico se o script for chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
    runDiagnosis().catch(console.error);
} 