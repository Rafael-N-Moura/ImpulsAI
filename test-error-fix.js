#!/usr/bin/env node

/**
 * Teste da Correção do Erro de Cursos
 * Verifica se o erro TypeError foi corrigido
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:4000';

async function testErrorFix() {
    console.log('🔍 Testando Correção do Erro de Cursos');
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

        // 3. Testar busca de cursos que estava causando erro
        console.log('\n3️⃣ Testando busca de cursos que causava erro...');

        const competenciasTeste = [
            'Testes Automatizados (Jest, Mocha, Cypress)',
            'React.js',
            'Node.js'
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

                if (source === 'external_api') {
                    console.log(`   ✅ Fonte correta: API Externa`);
                } else if (source === 'fallback') {
                    console.log(`   ⚠️ Fonte: Fallback`);
                }

            } catch (error) {
                console.log(`   ❌ Erro: ${error.response?.data?.message || error.message}`);
            }
        }

        // 4. Testar integração completa para verificar se não há mais erros
        console.log('\n4️⃣ Testando integração completa...');

        try {
            const integrationResponse = await axios.post(`${BASE_URL}/api/test/course-integration`, {
                competencias: ['Testes Automatizados (Jest, Mocha, Cypress)', 'React.js'],
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

            // Se for erro 400, pode ser problema de validação
            if (error.response?.status === 400) {
                console.log(`   🔍 Verificando detalhes do erro 400...`);
                console.log(`   📋 Response data:`, error.response.data);
            }
        }

        // 5. Instruções para verificar os logs
        console.log('\n5️⃣ Para verificar se o erro foi corrigido:');
        console.log('   📋 Verifique o console do servidor (terminal onde rodou npm run server)');
        console.log('   📋 Procure por mensagens como:');
        console.log('      - "🔧 Formatando X cursos da API externa para Y"');
        console.log('      - "📋 Estrutura do primeiro curso:"');
        console.log('      - "✅ Curso X formatado: Nome do Curso"');
        console.log('      - "🌐 Curso da API externa detectado para X"');

        console.log('\n🎉 Teste concluído!');
        console.log('\n📋 Resumo das correções aplicadas:');
        console.log('   1. ✅ Adicionadas verificações de segurança em calculateRelevanceScore');
        console.log('   2. ✅ Validação de tipos antes de chamar toLowerCase()');
        console.log('   3. ✅ Valores padrão para campos obrigatórios');
        console.log('   4. ✅ Logs de debug para entender a estrutura dos dados');
        console.log('   5. ✅ Tratamento de arrays e objetos undefined');

    } catch (error) {
        console.error('❌ Erro no teste:', error.message);

        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Solução: Inicie o servidor com "npm run server"');
        }
    }
}

// Executar o teste
testErrorFix().catch(console.error); 