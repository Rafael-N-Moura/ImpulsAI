#!/usr/bin/env node

/**
 * Script para testar APENAS a API externa - sem fallbacks
 * Força o uso da API externa e reporta resultados reais
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
    console.log('='.repeat(60));

    const results = [];

    try {
        // Teste 1: Health check
        console.log('\n📡 Teste 1: Health Check');
        const healthResponse = await axios.get(`${EXTERNAL_API_BASE}/health`, {
            headers: {
                'X-API-Key': API_KEY
            },
            timeout: 10000
        });

        console.log('✅ Health Check:', healthResponse.data);
        results.push({
            test: 'Health Check',
            success: true,
            data: healthResponse.data
        });

        // Teste 2: Busca de cursos com diferentes queries
        const queries = ['Python', 'Machine Learning', 'JavaScript', 'Data Science'];

        for (const query of queries) {
            console.log(`\n📚 Teste 2: Busca "${query}" (apenas query)`);

            try {
                const coursesResponse = await axios.post(`${EXTERNAL_API_BASE}/api/v1/courses/`, {
                    query: query
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
                console.log('   Data:', coursesResponse.data.courses ? `${coursesResponse.data.courses.length} cursos` : 'N/A');
                console.log('   Platform:', coursesResponse.data.platform || 'N/A');
                console.log('   Query:', coursesResponse.data.query || 'N/A');
                console.log('   Timestamp:', coursesResponse.data.timestamp || 'N/A');

                if (coursesResponse.data.courses && coursesResponse.data.courses.length > 0) {
                    console.log('\n📖 Primeiro curso encontrado:');
                    const firstCourse = coursesResponse.data.courses[0];
                    console.log('   ID:', firstCourse.id);
                    console.log('   Título:', firstCourse.title);
                    console.log('   Instrutor:', firstCourse.instructor);
                    console.log('   Plataforma:', firstCourse.source);
                    console.log('   Preço:', firstCourse.price || 'Gratuito');
                    console.log('   Avaliação:', firstCourse.rating);
                    console.log('   Duração:', firstCourse.duration);
                    console.log('   Nível:', firstCourse.level);
                    console.log('   Idioma:', firstCourse.language);
                    console.log('   Reviews:', firstCourse.num_reviews);
                }

                results.push({
                    test: `Busca "${query}"`,
                    success: true,
                    status: coursesResponse.status,
                    data: coursesResponse.data,
                    hasData: coursesResponse.data.courses && coursesResponse.data.courses.length > 0,
                    count: coursesResponse.data.total || 0,
                    actualCount: coursesResponse.data.courses ? coursesResponse.data.courses.length : 0
                });

            } catch (error) {
                console.log('❌ Erro na busca:', error.response?.data || error.message);
                console.log('   Status:', error.response?.status);

                results.push({
                    test: `Busca "${query}"`,
                    success: false,
                    error: error.response?.data || error.message,
                    status: error.response?.status
                });
            }

            // Aguardar entre requisições
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // Teste 3: Busca com diferentes plataformas
        console.log('\n🔄 Teste 3: Busca com diferentes plataformas');
        const platforms = ['udemy', 'coursera', 'edx'];

        for (const platform of platforms) {
            console.log(`\n📱 Testando plataforma: ${platform}`);

            try {
                const platformResponse = await axios.post(`${EXTERNAL_API_BASE}/api/v1/courses/`, {
                    query: 'Python',
                    platform: platform
                }, {
                    headers: {
                        'X-API-Key': API_KEY,
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000
                });

                console.log('✅ Resposta:');
                console.log('   Success:', platformResponse.data.success);
                console.log('   Count:', platformResponse.data.total);
                console.log('   Data:', platformResponse.data.courses ? `${platformResponse.data.courses.length} cursos` : 'N/A');

                results.push({
                    test: `Plataforma ${platform}`,
                    success: true,
                    status: platformResponse.status,
                    data: platformResponse.data,
                    hasData: platformResponse.data.courses && platformResponse.data.courses.length > 0,
                    count: platformResponse.data.total || 0,
                    actualCount: platformResponse.data.courses ? platformResponse.data.courses.length : 0
                });

            } catch (error) {
                console.log('❌ Erro:', error.response?.data || error.message);

                results.push({
                    test: `Plataforma ${platform}`,
                    success: false,
                    error: error.response?.data || error.message,
                    status: error.response?.status
                });
            }

            // Aguardar entre requisições
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // Teste 4: Busca com diferentes limites
        console.log('\n📊 Teste 4: Busca com diferentes limites');
        const limits = [1, 3, 5, 10];

        for (const limit of limits) {
            console.log(`\n🔢 Testando limite: ${limit}`);

            try {
                const limitResponse = await axios.post(`${EXTERNAL_API_BASE}/api/v1/courses/`, {
                    query: 'Python',
                    limit: limit
                }, {
                    headers: {
                        'X-API-Key': API_KEY,
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000
                });

                console.log('✅ Resposta:');
                console.log('   Success:', limitResponse.data.success);
                console.log('   Count:', limitResponse.data.total);
                console.log('   Data:', limitResponse.data.courses ? `${limitResponse.data.courses.length} cursos` : 'N/A');
                console.log('   Limite solicitado vs retornado:', `${limit} vs ${limitResponse.data.courses ? limitResponse.data.courses.length : 0}`);

                results.push({
                    test: `Limite ${limit}`,
                    success: true,
                    status: limitResponse.status,
                    data: limitResponse.data,
                    hasData: limitResponse.data.courses && limitResponse.data.courses.length > 0,
                    count: limitResponse.data.total || 0,
                    actualCount: limitResponse.data.courses ? limitResponse.data.courses.length : 0,
                    limitRequested: limit,
                    limitRespected: limitResponse.data.courses ? limitResponse.data.courses.length <= limit : true
                });

            } catch (error) {
                console.log('❌ Erro:', error.response?.data || error.message);

                results.push({
                    test: `Limite ${limit}`,
                    success: false,
                    error: error.response?.data || error.message,
                    status: error.response?.status
                });
            }

            // Aguardar entre requisições
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

    } catch (error) {
        console.error('❌ Erro geral na API externa:', error);
    }

    return results;
}

// Função para testar nosso endpoint com API externa forçada
async function testOurEndpointWithExternalAPI() {
    console.log('\n🔍 Testando Nosso Endpoint com API Externa Forçada...');
    console.log('='.repeat(60));

    try {
        // Primeiro, ativar a API externa
        console.log('\n🔄 Ativando API externa...');
        const toggleResponse = await makeRequest('POST', '/api/external/toggle', { enabled: true });

        if (toggleResponse.success) {
            console.log('✅ API externa ativada');
        } else {
            console.log('❌ Falha ao ativar API externa:', toggleResponse.error);
            return [];
        }

        // Aguardar um pouco
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Testar busca com apenas query
        console.log('\n📤 Testando busca com apenas query...');
        const data = { query: 'Python' };

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
                console.log('   Nome:', firstCourse.nome || firstCourse.title);
                console.log('   Instrutor:', firstCourse.instrutor || firstCourse.instructor);
                console.log('   Plataforma:', firstCourse.plataforma || firstCourse.source);
            }

            return [{
                test: 'Nosso Endpoint (API Externa)',
                success: true,
                status: response.status,
                data: response.data,
                source: response.data.source,
                hasData: response.data.data && response.data.data.length > 0,
                count: response.data.total || 0
            }];
        } else {
            console.log('\n❌ Erro no nosso endpoint:');
            console.log('   Status:', response.status);
            console.log('   Error:', response.error);

            return [{
                test: 'Nosso Endpoint (API Externa)',
                success: false,
                error: response.error,
                status: response.status
            }];
        }

    } catch (error) {
        console.error('❌ Erro ao testar nosso endpoint:', error);
        return [];
    }
}

// Função para gerar relatório detalhado
function generateDetailedReport(externalResults, ourEndpointResults) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 RELATÓRIO DETALHADO - APENAS API EXTERNA');
    console.log('='.repeat(60));

    // Análise dos testes externos
    console.log('\n🔍 ANÁLISE DOS TESTES EXTERNOS:');
    console.log('='.repeat(40));

    const successfulTests = externalResults.filter(r => r.success);
    const failedTests = externalResults.filter(r => !r.success);

    console.log(`✅ Testes bem-sucedidos: ${successfulTests.length}/${externalResults.length}`);
    console.log(`❌ Testes com falha: ${failedTests.length}/${externalResults.length}`);

    // Análise dos dados retornados
    const testsWithData = successfulTests.filter(r => r.hasData);
    const testsWithoutData = successfulTests.filter(r => !r.hasData);

    console.log(`📊 Testes com dados: ${testsWithData.length}/${successfulTests.length}`);
    console.log(`📭 Testes sem dados: ${testsWithoutData.length}/${successfulTests.length}`);

    // Detalhes dos testes bem-sucedidos
    if (testsWithData.length > 0) {
        console.log('\n🎯 TESTES COM DADOS REAIS:');
        testsWithData.forEach(result => {
            console.log(`   ✅ ${result.test}: ${result.actualCount} cursos (Count: ${result.count})`);
        });
    }

    // Detalhes dos testes sem dados
    if (testsWithoutData.length > 0) {
        console.log('\n📭 TESTES SEM DADOS:');
        testsWithoutData.forEach(result => {
            console.log(`   ⚠️ ${result.test}: Count=${result.count}, Dados=${result.actualCount}`);
        });
    }

    // Análise dos testes com falha
    if (failedTests.length > 0) {
        console.log('\n❌ TESTES COM FALHA:');
        failedTests.forEach(result => {
            console.log(`   ❌ ${result.test}: ${result.error?.error || result.error?.message || result.error}`);
        });
    }

    // Análise do nosso endpoint
    if (ourEndpointResults.length > 0) {
        console.log('\n🔍 ANÁLISE DO NOSSO ENDPOINT:');
        console.log('='.repeat(40));

        ourEndpointResults.forEach(result => {
            if (result.success) {
                console.log(`✅ ${result.test}: ${result.count} cursos (${result.source})`);
                if (result.hasData) {
                    console.log(`   📊 Dados reais obtidos da API externa`);
                } else {
                    console.log(`   📭 Sem dados da API externa`);
                }
            } else {
                console.log(`❌ ${result.test}: ${result.error}`);
            }
        });
    }

    // Resumo final
    console.log('\n🎯 RESUMO FINAL:');
    console.log('='.repeat(40));

    const totalExternalTests = externalResults.length;
    const totalSuccessful = successfulTests.length;
    const totalWithData = testsWithData.length;

    console.log(`📡 Total de testes externos: ${totalExternalTests}`);
    console.log(`✅ Sucessos: ${totalSuccessful}`);
    console.log(`📊 Com dados reais: ${totalWithData}`);
    console.log(`📭 Sem dados: ${totalSuccessful - totalWithData}`);
    console.log(`❌ Falhas: ${failedTests.length}`);

    if (totalWithData > 0) {
        console.log('\n🎉 A API externa está funcionando e retornando dados!');
    } else if (totalSuccessful > 0) {
        console.log('\n⚠️ A API externa está funcionando, mas não retornando dados.');
        console.log('   Possíveis causas:');
        console.log('   - Queries não encontram resultados');
        console.log('   - Problemas na estrutura de resposta');
        console.log('   - Dados vazios na API');
    } else {
        console.log('\n❌ A API externa não está funcionando.');
    }
}

// Função principal
async function runAPITest() {
    console.log('🚀 Teste APENAS da API Externa - Sem Fallbacks');
    console.log('='.repeat(60));

    try {
        // Teste 1: API externa diretamente
        const externalResults = await testExternalAPIDirectly();

        // Teste 2: Nosso endpoint com API externa forçada
        const ourEndpointResults = await testOurEndpointWithExternalAPI();

        // Gerar relatório detalhado
        generateDetailedReport(externalResults, ourEndpointResults);

    } catch (error) {
        console.error('❌ Erro durante o teste:', error);
    }
}

// Executar teste se o script for chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
    runAPITest().catch(console.error);
} 