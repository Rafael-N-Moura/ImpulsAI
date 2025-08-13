#!/usr/bin/env node

/**
 * Teste da Correção da Integração de Cursos
 * Verifica se a API externa está sendo usada corretamente
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:4000';

async function testCourseIntegrationFix() {
    console.log('🔍 Testando Correção da Integração de Cursos');
    console.log('='.repeat(60));

    try {
        // 1. Verificar se o servidor está rodando
        console.log('\n1️⃣ Verificando se o servidor está rodando...');
        const statsResponse = await axios.get(`${BASE_URL}/api/external/stats`);
        console.log('✅ Servidor rodando e respondendo');

        // 2. Verificar status da API externa
        console.log('\n2️⃣ Verificando status da API externa...');
        const useExternalAPI = statsResponse.data.useExternalAPI;
        console.log('✅ API Externa ativa:', useExternalAPI);

        // 3. Testar busca de cursos para verificar se está usando a API externa
        console.log('\n3️⃣ Testando busca de cursos para verificar fonte...');

        const competenciasTeste = [
            'React.js',
            'Node.js',
            'TypeScript'
        ];

        for (const competencia of competenciasTeste) {
            console.log(`\n🔍 Testando: "${competencia}"`);

            try {
                const response = await axios.post(`${BASE_URL}/api/courses/search`, {
                    query: competencia
                }, {
                    headers: { 'Content-Type': 'application/json' }
                });

                const { count, source, message } = response.data;
                console.log(`   📊 Resultado: ${count} cursos (${source})`);
                console.log(`   💬 Mensagem: ${message}`);

                // Verificar se a fonte está correta
                if (source === 'external_api') {
                    console.log(`   ✅ Fonte correta: API Externa`);
                } else if (source === 'fallback') {
                    console.log(`   ⚠️ Fonte: Fallback (pode indicar problema)`);
                } else {
                    console.log(`   ❓ Fonte desconhecida: ${source}`);
                }

            } catch (error) {
                console.log(`   ❌ Erro: ${error.response?.data?.message || error.message}`);
            }
        }

        // 4. Testar integração completa via endpoint de teste
        console.log('\n4️⃣ Testando integração completa...');

        try {
            const integrationResponse = await axios.post(`${BASE_URL}/api/test/course-integration`, {
                competencias: ['React.js', 'Node.js'],
                cargoAlvo: 'Desenvolvedor Full-Stack'
            }, {
                headers: { 'Content-Type': 'application/json' }
            });

            const { success, metadata, pontos_a_desenvolver } = integrationResponse.data;
            console.log(`   📊 Integração: ${success ? 'SUCESSO' : 'FALHA'}`);
            console.log(`   🔍 Fonte dos cursos: ${metadata?.fonte_cursos}`);
            console.log(`   📚 Total de cursos: ${metadata?.total_cursos}`);

            // Verificar se os cursos estão sendo mapeados corretamente
            if (pontos_a_desenvolver && pontos_a_desenvolver.length > 0) {
                pontos_a_desenvolver.forEach((ponto, index) => {
                    console.log(`   📝 Ponto ${index + 1}: ${ponto.competencia}`);
                    console.log(`      - Cursos disponíveis: ${ponto.cursos_disponiveis?.length || 0}`);
                    console.log(`      - Cursos sugeridos: ${ponto.cursos_sugeridos?.length || 0}`);
                    console.log(`      - Fonte: ${ponto.cursos_disponiveis?.[0]?.fonte || 'N/A'}`);
                });
            }

        } catch (error) {
            console.log(`   ❌ Erro na integração: ${error.response?.data?.message || error.message}`);
        }

        // 5. Instruções para verificar os logs
        console.log('\n5️⃣ Para verificar os logs detalhados:');
        console.log('   📋 Verifique o console do servidor (terminal onde rodou npm run server)');
        console.log('   📋 Procure por mensagens como:');
        console.log('      - "✅ X cursos encontrados via API externa"');
        console.log('      - "🌐 Curso da API externa detectado para X"');
        console.log('      - "🔍 Fonte dos cursos: external_api"');

        console.log('\n🎉 Teste concluído!');
        console.log('\n📋 Resumo das correções aplicadas:');
        console.log('   1. ✅ Corrigido acesso aos cursos em response.courses (não response.data)');
        console.log('   2. ✅ Corrigido acesso ao cache em cachedCourses.courses');
        console.log('   3. ✅ Adicionado log para detectar cursos da API externa');
        console.log('   4. ✅ Verificação da fonte dos cursos corrigida');

    } catch (error) {
        console.error('❌ Erro no teste:', error.message);

        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Solução: Inicie o servidor com "npm run server"');
        }
    }
}

// Executar o teste
testCourseIntegrationFix().catch(console.error); 