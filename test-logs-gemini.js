#!/usr/bin/env node

/**
 * Teste dos Logs Detalhados da API
 * Verifica se os logs da função realizarAnalise do Gemini estão funcionando
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:4000';

async function testLogsGemini() {
    console.log('🔍 Testando Logs Detalhados da API');
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

        // 3. Testar busca de cursos para verificar logs
        console.log('\n3️⃣ Testando busca de cursos para verificar logs...');

        const competenciasTeste = [
            'JavaScript',
            'React',
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

            } catch (error) {
                console.log(`   ❌ Erro: ${error.response?.data?.message || error.message}`);
            }
        }

        // 4. Instruções para testar os logs completos
        console.log('\n4️⃣ Para ver os logs completos da função realizarAnalise:');
        console.log('   📋 Acesse o frontend e faça upload de um CV');
        console.log('   📋 Verifique o console do servidor (terminal onde rodou npm run server)');
        console.log('   📋 Os logs mostrarão:');
        console.log('      - Dados enviados para o Gemini');
        console.log('      - Resposta completa do Gemini');
        console.log('      - Estrutura dos dados retornados');
        console.log('      - Resumo final da análise');

        // 5. Estrutura dos logs esperados
        console.log('\n5️⃣ Estrutura dos logs esperados:');
        console.log('   🔍 Iniciando extração do texto do CV...');
        console.log('   🤖 Extraindo competências via IA...');
        console.log('   📊 Dados enviados para o Gemini:');
        console.log('   ✅ Competências do usuário extraídas pelo Gemini:');
        console.log('   🤖 Realizando análise de lacunas...');
        console.log('   📊 Dados enviados para o Gemini:');
        console.log('   ✅ Análise do Gemini concluída');
        console.log('   📋 Resposta completa do Gemini:');
        console.log('   🎯 Iniciando Fase 4: Geração de Roadmap Estratégico...');
        console.log('   🎉 RESUMO FINAL DA ANÁLISE:');

        console.log('\n🎉 Teste de logs concluído!');
        console.log('\n📋 Próximos passos:');
        console.log('   1. Faça upload de um CV no frontend');
        console.log('   2. Verifique o console do servidor');
        console.log('   3. Confirme se todos os logs estão aparecendo');
        console.log('   4. Verifique a estrutura da resposta do Gemini');

    } catch (error) {
        console.error('❌ Erro no teste:', error.message);

        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Solução: Inicie o servidor com "npm run server"');
        }
    }
}

// Executar o teste
testLogsGemini().catch(console.error); 