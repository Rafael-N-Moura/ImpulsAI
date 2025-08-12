#!/usr/bin/env node

/**
 * Script de teste para os endpoints de cursos da API externa
 * Testa busca de cursos, detalhes de cursos e funcionalidades relacionadas
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:4000';
const EXTERNAL_API_BASE = 'https://api-jobs-courses-impulseai-develop.up.railway.app';

// Configurações de teste
const TEST_CONFIG = {
    queries: ['Python', 'Machine Learning', 'JavaScript', 'Data Science'],
    platforms: ['udemy', 'coursera', 'edx', 'all'],
    limits: [5, 10, 15],
    languages: ['pt', 'en']
};

// Função para fazer requisições HTTP
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

// Função para testar endpoint de health check
async function testHealthCheck() {
    console.log('\n🔍 Testando Health Check da API Externa...');

    try {
        const response = await makeRequest('GET', '/api/external/health');

        if (response.success) {
            console.log('✅ Health Check:', response.data);
        } else {
            console.log('❌ Health Check falhou:', response.error);
        }

        return response.success;
    } catch (error) {
        console.error('❌ Erro no Health Check:', error);
        return false;
    }
}

// Função para testar busca de cursos
async function testCourseSearch() {
    console.log('\n🔍 Testando Busca de Cursos...');

    const results = [];

    for (const query of TEST_CONFIG.queries.slice(0, 2)) { // Testar apenas 2 queries para não sobrecarregar
        for (const platform of TEST_CONFIG.platforms.slice(0, 2)) { // Testar apenas 2 plataformas
            for (const limit of TEST_CONFIG.limits.slice(0, 2)) { // Testar apenas 2 limites
                console.log(`\n📚 Testando: "${query}" em "${platform}" com limite ${limit}`);

                const searchData = {
                    query,
                    platform,
                    limit,
                    language: 'pt'
                };

                const response = await makeRequest('POST', '/api/courses/search', searchData);

                if (response.success) {
                    console.log(`✅ Sucesso: ${response.data.count || 0} cursos encontrados`);
                    console.log(`   Fonte: ${response.data.source}`);
                    console.log(`   Primeiro curso: ${response.data.data?.[0]?.nome || 'N/A'}`);

                    results.push({
                        query,
                        platform,
                        limit,
                        success: true,
                        count: response.data.count || 0,
                        source: response.data.source
                    });
                } else {
                    console.log(`❌ Falha: ${response.error?.message || response.error}`);

                    results.push({
                        query,
                        platform,
                        limit,
                        success: false,
                        error: response.error?.message || response.error
                    });
                }

                // Aguardar um pouco entre as requisições para não sobrecarregar
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }

    return results;
}

// Função para testar detalhes de curso
async function testCourseDetails() {
    console.log('\n🔍 Testando Detalhes de Curso...');

    // Primeiro buscar alguns cursos para obter IDs
    const searchData = {
        query: 'Python',
        platform: 'udemy',
        limit: 3
    };

    const searchResponse = await makeRequest('POST', '/api/courses/search', searchData);

    if (!searchResponse.success || !searchResponse.data.data || searchResponse.data.data.length === 0) {
        console.log('❌ Não foi possível buscar cursos para testar detalhes');
        return [];
    }

    const results = [];

    for (const course of searchResponse.data.data.slice(0, 2)) { // Testar apenas 2 cursos
        console.log(`\n📖 Testando detalhes do curso: ${course.nome} (ID: ${course.id})`);

        const response = await makeRequest('GET', `/api/courses/${course.id}`);

        if (response.success) {
            console.log(`✅ Detalhes obtidos com sucesso`);
            console.log(`   Título: ${response.data.data?.title || response.data.data?.nome || 'N/A'}`);
            console.log(`   Instrutor: ${response.data.data?.instructor || response.data.data?.instrutor || 'N/A'}`);
            console.log(`   Avaliação: ${response.data.data?.rating || response.data.data?.avaliacao || 'N/A'}`);

            results.push({
                courseId: course.id,
                success: true,
                data: response.data.data
            });
        } else {
            console.log(`❌ Falha ao obter detalhes: ${response.error?.message || response.error}`);

            results.push({
                courseId: course.id,
                success: false,
                error: response.error?.message || response.error
            });
        }

        // Aguardar um pouco entre as requisições
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return results;
}

// Função para testar estatísticas
async function testStats() {
    console.log('\n🔍 Testando Estatísticas...');

    try {
        const response = await makeRequest('GET', '/api/external/stats');

        if (response.success) {
            console.log('✅ Estatísticas obtidas com sucesso:');
            console.log('   Uso da API externa:', response.data.useExternalAPI);
            console.log('   Timestamp:', response.data.timestamp);

            if (response.data.externalAPI) {
                console.log('   API Externa:', response.data.externalAPI);
            }
        } else {
            console.log('❌ Falha ao obter estatísticas:', response.error);
        }

        return response.success;
    } catch (error) {
        console.error('❌ Erro ao obter estatísticas:', error);
        return false;
    }
}

// Função para testar toggle da API externa
async function testToggleExternalAPI() {
    console.log('\n🔍 Testando Toggle da API Externa...');

    try {
        // Desativar
        console.log('🔄 Desativando API externa...');
        const disableResponse = await makeRequest('POST', '/api/external/toggle', { enabled: false });

        if (disableResponse.success) {
            console.log('✅ API externa desativada');
        } else {
            console.log('❌ Falha ao desativar API externa:', disableResponse.error);
        }

        // Aguardar um pouco
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Reativar
        console.log('🔄 Reativando API externa...');
        const enableResponse = await makeRequest('POST', '/api/external/toggle', { enabled: true });

        if (enableResponse.success) {
            console.log('✅ API externa reativada');
        } else {
            console.log('❌ Falha ao reativar API externa:', enableResponse.error);
        }

        return disableResponse.success && enableResponse.success;
    } catch (error) {
        console.error('❌ Erro ao testar toggle:', error);
        return false;
    }
}

// Função para testar limpeza de cache
async function testClearCache() {
    console.log('\n🔍 Testando Limpeza de Cache...');

    try {
        const response = await makeRequest('POST', '/api/external/clear-cache');

        if (response.success) {
            console.log('✅ Cache limpo com sucesso');
        } else {
            console.log('❌ Falha ao limpar cache:', response.error);
        }

        return response.success;
    } catch (error) {
        console.error('❌ Erro ao limpar cache:', error);
        return false;
    }
}

// Função para testar conectividade direta com a API externa
async function testDirectExternalAPI() {
    console.log('\n🔍 Testando Conectividade Direta com API Externa...');

    try {
        // Testar health check direto
        const healthResponse = await axios.get(`${EXTERNAL_API_BASE}/health`, {
            headers: {
                'X-API-Key': '1e6a8d8f-9b0c-4c7e-8a3d-5f2b1c9d8e7a'
            },
            timeout: 10000
        });

        console.log('✅ Health Check direto:', healthResponse.data);

        // Testar busca de cursos direta
        const coursesResponse = await axios.post(`${EXTERNAL_API_BASE}/api/v1/courses/`, {
            query: 'Python',
            platform: 'udemy',
            limit: 3
        }, {
            headers: {
                'X-API-Key': '1e6a8d8f-9b0c-4c7e-8a3d-5f2b1c9d8e7a',
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });

        console.log('✅ Busca de cursos direta:', {
            success: coursesResponse.data.success,
            count: coursesResponse.data.count,
            data: coursesResponse.data.data?.slice(0, 2) // Mostrar apenas 2 cursos
        });

        return true;
    } catch (error) {
        console.error('❌ Erro na conectividade direta:', error.response?.data || error.message);
        return false;
    }
}

// Função principal de teste
async function runTests() {
    console.log('🚀 Iniciando Testes dos Endpoints de Cursos da API Externa');
    console.log('='.repeat(60));

    const results = {
        healthCheck: false,
        courseSearch: [],
        courseDetails: [],
        stats: false,
        toggle: false,
        clearCache: false,
        directAPI: false
    };

    try {
        // Teste 1: Health Check
        results.healthCheck = await testHealthCheck();

        // Teste 2: Busca de Cursos
        results.courseSearch = await testCourseSearch();

        // Teste 3: Detalhes de Curso
        results.courseDetails = await testCourseDetails();

        // Teste 4: Estatísticas
        results.stats = await testStats();

        // Teste 5: Toggle da API Externa
        results.toggle = await testToggleExternalAPI();

        // Teste 6: Limpeza de Cache
        results.clearCache = await testClearCache();

        // Teste 7: Conectividade Direta
        results.directAPI = await testDirectExternalAPI();

    } catch (error) {
        console.error('❌ Erro durante os testes:', error);
    }

    // Relatório final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RELATÓRIO FINAL DOS TESTES');
    console.log('='.repeat(60));

    console.log(`✅ Health Check: ${results.healthCheck ? 'PASSOU' : 'FALHOU'}`);

    const searchSuccess = results.courseSearch.filter(r => r.success).length;
    const searchTotal = results.courseSearch.length;
    console.log(`✅ Busca de Cursos: ${searchSuccess}/${searchTotal} testes passaram`);

    const detailsSuccess = results.courseDetails.filter(r => r.success).length;
    const detailsTotal = results.courseDetails.length;
    console.log(`✅ Detalhes de Curso: ${detailsSuccess}/${detailsTotal} testes passaram`);

    console.log(`✅ Estatísticas: ${results.stats ? 'PASSOU' : 'FALHOU'}`);
    console.log(`✅ Toggle API Externa: ${results.toggle ? 'PASSOU' : 'FALHOU'}`);
    console.log(`✅ Limpeza de Cache: ${results.clearCache ? 'PASSOU' : 'FALHOU'}`);
    console.log(`✅ Conectividade Direta: ${results.directAPI ? 'PASSOU' : 'FALHOU'}`);

    // Resumo dos resultados de busca
    if (results.courseSearch.length > 0) {
        console.log('\n📚 Resumo da Busca de Cursos:');
        results.courseSearch.forEach(result => {
            if (result.success) {
                console.log(`   ✅ "${result.query}" em "${result.platform}": ${result.count} cursos (${result.source})`);
            } else {
                console.log(`   ❌ "${result.query}" em "${result.platform}": ${result.error}`);
            }
        });
    }

    console.log('\n🎯 Testes concluídos!');
}

// Executar testes se o script for chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
    runTests().catch(console.error);
} 