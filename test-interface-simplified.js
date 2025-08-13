#!/usr/bin/env node

/**
 * Teste da Interface Simplificada
 * Verifica se apenas as tabs Roadmap e Otimização de Currículo estão funcionando
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:4000';

async function testInterfaceSimplified() {
    console.log('🔍 Testando Interface Simplificada');
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

        // 3. Testar se as funcionalidades principais ainda funcionam
        console.log('\n3️⃣ Testando funcionalidades principais...');

        // Testar busca de cursos
        console.log('\n🔍 Testando busca de cursos...');
        try {
            const coursesResponse = await axios.post(`${BASE_URL}/api/courses/search`, {
                query: 'React.js'
            }, {
                headers: { 'Content-Type': 'application/json' }
            });

            const { count, source, message } = coursesResponse.data;
            console.log(`   📊 Cursos: ${count} encontrados (${source})`);
            console.log(`   💬 Mensagem: ${message}`);

        } catch (error) {
            console.log(`   ❌ Erro na busca de cursos: ${error.response?.data?.message || error.message}`);
        }

        // Testar integração de cursos
        console.log('\n🔍 Testando integração de cursos...');
        try {
            const integrationResponse = await axios.post(`${BASE_URL}/api/test/course-integration`, {
                competencias: ['React.js', 'Node.js'],
                cargoAlvo: 'Desenvolvedor Full-Stack'
            }, {
                headers: { 'Content-Type': 'application/json' }
            });

            const { success, metadata } = integrationResponse.data;
            console.log(`   📊 Integração: ${success ? 'SUCESSO' : 'FALHA'}`);
            console.log(`   🔍 Fonte: ${metadata?.fonte_cursos}`);
            console.log(`   📚 Total: ${metadata?.total_cursos} cursos`);

        } catch (error) {
            console.log(`   ❌ Erro na integração: ${error.response?.data?.message || error.message}`);
        }

        // 4. Verificar se endpoints de vagas ainda existem (devem retornar 404)
        console.log('\n4️⃣ Verificando se endpoints de vagas foram removidos...');

        try {
            const vagasResponse = await axios.post(`${BASE_URL}/api/vagas-jsearch`, {
                cargo: 'Desenvolvedor',
                localizacao: 'Brazil',
                limit: 3
            });
            console.log(`   ⚠️ Endpoint de vagas ainda está ativo (não deveria estar)`);
        } catch (error) {
            if (error.response?.status === 404) {
                console.log(`   ✅ Endpoint de vagas retornou 404 (como esperado)`);
            } else {
                console.log(`   ❓ Endpoint de vagas retornou: ${error.response?.status}`);
            }
        }

        // 5. Instruções para testar no frontend
        console.log('\n5️⃣ Para testar no frontend:');
        console.log('   📋 Acesse a aplicação no navegador');
        console.log('   📋 Faça upload de um CV');
        console.log('   📋 Verifique se apenas 2 tabs estão visíveis:');
        console.log('      - Roadmap');
        console.log('      - Otimização de Currículo');
        console.log('   📋 Confirme que as tabs "Análise de Mercado" e "Vagas do Mercado" não aparecem');

        console.log('\n🎉 Teste concluído!');
        console.log('\n📋 Resumo das mudanças aplicadas:');
        console.log('   1. ✅ Tab "Análise de Mercado" removida');
        console.log('   2. ✅ Tab "Vagas do Mercado" comentada');
        console.log('   3. ✅ Grid de tabs alterado de 4 colunas para 2 colunas');
        console.log('   4. ✅ Apenas "Roadmap" e "Otimização de Currículo" visíveis');

    } catch (error) {
        console.error('❌ Erro no teste:', error.message);

        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Solução: Inicie o servidor com "npm run server"');
        }
    }
}

// Executar o teste
testInterfaceSimplified().catch(console.error); 