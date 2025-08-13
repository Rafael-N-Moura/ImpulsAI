#!/usr/bin/env node

/**
 * Script para testar a integração de cursos com a metodologia existente
 * Testa a Fase 4: Prescrição (Geração do Roadmap) integrada
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:4000';

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

// Função para testar integração de cursos
async function testCourseIntegration() {
    console.log('🧪 Testando Integração de Cursos com Metodologia');
    console.log('='.repeat(60));

    // Dados de teste baseados na metodologia
    const testData = {
        pontosADesenvolver: [
            {
                competencia: 'Python',
                importancia: 'Alta',
                descricao: 'Linguagem de programação essencial para desenvolvimento'
            },
            {
                competencia: 'Machine Learning',
                importancia: 'Média',
                descricao: 'Conhecimentos básicos de ML para projetos de dados'
            },
            {
                competencia: 'Docker',
                importancia: 'Baixa',
                descricao: 'Containerização para deploy de aplicações'
            }
        ],
        cargoAlvo: 'Desenvolvedor Full Stack Python'
    };

    console.log('\n📤 Enviando dados de teste:');
    console.log('   Endpoint: POST /api/test/course-integration');
    console.log('   Cargo alvo:', testData.cargoAlvo);
    console.log('   Pontos a desenvolver:', testData.pontosADesenvolver.length);

    testData.pontosADesenvolver.forEach((ponto, index) => {
        console.log(`   ${index + 1}. ${ponto.competencia} (${ponto.importancia})`);
    });

    try {
        const response = await makeRequest('POST', '/api/test/course-integration', testData);

        if (response.success) {
            console.log('\n✅ Integração testada com sucesso!');
            console.log('   Status:', response.status);
            console.log('   Message:', response.data.message);

            const roadmap = response.data.roadmap;

            console.log('\n📊 Roadmap Gerado:');
            console.log('   Total de lacunas:', roadmap.metadata.total_lacunas);
            console.log('   Total de cursos:', roadmap.metadata.total_cursos);
            console.log('   Fonte dos cursos:', roadmap.metadata.fonte_cursos);
            console.log('   Timestamp:', roadmap.metadata.timestamp);

            console.log('\n🎯 Pontos a Desenvolver Enriquecidos:');
            roadmap.pontos_a_desenvolver.forEach((ponto, index) => {
                console.log(`\n   ${index + 1}. ${ponto.competencia} (${ponto.importancia})`);
                console.log(`      Prioridade: ${ponto.prioridade}/100`);
                console.log(`      Total de cursos: ${ponto.total_cursos}`);
                console.log(`      Cursos disponíveis: ${ponto.cursos_disponiveis.length}`);

                if (ponto.cursos_disponiveis.length > 0) {
                    console.log(`      Primeiro curso: ${ponto.cursos_disponiveis[0].nome}`);
                    console.log(`      Plataforma: ${ponto.cursos_disponiveis[0].plataforma}`);
                    console.log(`      Preço: ${ponto.cursos_disponiveis[0].preco}`);
                    console.log(`      Score de relevância: ${ponto.cursos_disponiveis[0].relevancia.score}/100`);
                }
            });

            // Análise das fontes dos cursos
            const fontes = roadmap.pontos_a_desenvolver.flatMap(ponto =>
                ponto.cursos_disponiveis.map(curso => curso.fonte)
            );
            const fontesUnicas = [...new Set(fontes)];

            console.log('\n🔍 Análise das Fontes dos Cursos:');
            fontesUnicas.forEach(fonte => {
                const count = fontes.filter(f => f === fonte).length;
                console.log(`   ${fonte}: ${count} cursos`);
            });

            return true;

        } else {
            console.log('\n❌ Falha na integração:');
            console.log('   Status:', response.status);
            console.log('   Error:', response.error);
            return false;
        }

    } catch (error) {
        console.error('\n❌ Erro ao testar integração:', error);
        return false;
    }
}

// Função para testar estatísticas da integração
async function testIntegrationStats() {
    console.log('\n🔍 Testando Estatísticas da Integração...');
    console.log('='.repeat(50));

    try {
        const response = await makeRequest('GET', '/api/courses/integration/stats');

        if (response.success) {
            console.log('✅ Estatísticas obtidas com sucesso:');
            const stats = response.data.stats;
            console.log('   Uso da API externa:', stats.useExternalAPI);
            console.log('   Fallback habilitado:', stats.fallbackEnabled);
            console.log('   Último sucesso da API:', stats.lastExternalAPISuccess || 'Nunca');
            console.log('   Timestamp:', stats.timestamp);
        } else {
            console.log('❌ Falha ao obter estatísticas:', response.error);
        }

        return response.success;

    } catch (error) {
        console.error('❌ Erro ao obter estatísticas:', error);
        return false;
    }
}

// Função para testar toggle da integração
async function testIntegrationToggle() {
    console.log('\n🔄 Testando Toggle da Integração...');
    console.log('='.repeat(50));

    try {
        // Desativar
        console.log('🔄 Desativando integração...');
        const disableResponse = await makeRequest('POST', '/api/courses/integration/toggle', { enabled: false });

        if (disableResponse.success) {
            console.log('✅ Integração desativada');
        } else {
            console.log('❌ Falha ao desativar:', disableResponse.error);
        }

        // Aguardar um pouco
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Reativar
        console.log('🔄 Reativando integração...');
        const enableResponse = await makeRequest('POST', '/api/courses/integration/toggle', { enabled: true });

        if (enableResponse.success) {
            console.log('✅ Integração reativada');
        } else {
            console.log('❌ Falha ao reativar:', enableResponse.error);
        }

        return disableResponse.success && enableResponse.success;

    } catch (error) {
        console.error('❌ Erro ao testar toggle:', error);
        return false;
    }
}

// Função para testar análise completa (simulando o fluxo real)
async function testCompleteAnalysis() {
    console.log('\n🔍 Testando Análise Completa (Fluxo Real)...');
    console.log('='.repeat(50));

    try {
        // Simular dados de uma análise real
        const analiseCompleta = {
            pontosADesenvolver: [
                {
                    competencia: 'React',
                    importancia: 'Alta',
                    descricao: 'Framework frontend essencial para desenvolvimento web'
                },
                {
                    competencia: 'Node.js',
                    importancia: 'Média',
                    descricao: 'Runtime JavaScript para backend'
                },
                {
                    competencia: 'MongoDB',
                    importancia: 'Baixa',
                    descricao: 'Banco de dados NoSQL'
                }
            ],
            cargoAlvo: 'Desenvolvedor Frontend React'
        };

        console.log('📤 Testando análise completa com dados realistas...');

        const response = await makeRequest('POST', '/api/test/course-integration', analiseCompleta);

        if (response.success) {
            console.log('✅ Análise completa executada com sucesso!');

            const roadmap = response.data.roadmap;
            console.log(`📊 Total de cursos mapeados: ${roadmap.metadata.total_cursos}`);
            console.log(`🔍 Fonte: ${roadmap.metadata.fonte_cursos}`);

            // Verificar se os cursos estão sendo mapeados corretamente
            const totalCursosMapeados = roadmap.pontos_a_desenvolver.reduce(
                (total, ponto) => total + ponto.total_cursos, 0
            );

            console.log(`🎯 Cursos mapeados por lacuna: ${totalCursosMapeados}`);

            return true;
        } else {
            console.log('❌ Falha na análise completa:', response.error);
            return false;
        }

    } catch (error) {
        console.error('❌ Erro na análise completa:', error);
        return false;
    }
}

// Função principal
async function runIntegrationTests() {
    console.log('🚀 Testes de Integração de Cursos com Metodologia');
    console.log('='.repeat(60));

    const results = {
        integration: false,
        stats: false,
        toggle: false,
        completeAnalysis: false
    };

    try {
        // Teste 1: Integração básica
        results.integration = await testCourseIntegration();

        // Teste 2: Estatísticas
        results.stats = await testIntegrationStats();

        // Teste 3: Toggle
        results.toggle = await testIntegrationToggle();

        // Teste 4: Análise completa
        results.completeAnalysis = await testCompleteAnalysis();

    } catch (error) {
        console.error('❌ Erro durante os testes:', error);
    }

    // Relatório final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RELATÓRIO FINAL DOS TESTES DE INTEGRAÇÃO');
    console.log('='.repeat(60));

    console.log(`✅ Integração Básica: ${results.integration ? 'PASSOU' : 'FALHOU'}`);
    console.log(`✅ Estatísticas: ${results.stats ? 'PASSOU' : 'FALHOU'}`);
    console.log(`✅ Toggle: ${results.toggle ? 'PASSOU' : 'FALHOU'}`);
    console.log(`✅ Análise Completa: ${results.completeAnalysis ? 'PASSOU' : 'FALHOU'}`);

    const totalPassed = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;

    console.log(`\n🎯 Resultado Geral: ${totalPassed}/${totalTests} testes passaram`);

    if (totalPassed === totalTests) {
        console.log('🎉 Todos os testes passaram! A integração está funcionando perfeitamente.');
    } else if (totalPassed > totalTests / 2) {
        console.log('⚠️ A maioria dos testes passou. Verifique os que falharam.');
    } else {
        console.log('❌ Muitos testes falharam. Verifique a implementação.');
    }

    console.log('\n🎯 Testes de integração concluídos!');
}

// Executar testes se o script for chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
    runIntegrationTests().catch(console.error);
} 