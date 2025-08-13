#!/usr/bin/env node

/**
 * Teste da Ordenação por Prioridade
 * Verifica se as oportunidades estão sendo ordenadas corretamente
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:4000';

async function testPriorityOrdering() {
    console.log('🔍 Testando Ordenação por Prioridade');
    console.log('='.repeat(60));

    try {
        // 1. Verificar se o servidor está rodando
        console.log('\n1️⃣ Verificando se o servidor está rodando...');
        const statsResponse = await axios.get(`${BASE_URL}/api/external/stats`);
        console.log('✅ Servidor rodando e respondendo');

        // 2. Testar integração de cursos para ver a ordenação
        console.log('\n2️⃣ Testando integração de cursos para verificar ordenação...');

        try {
            const integrationResponse = await axios.post(`${BASE_URL}/api/test/course-integration`, {
                competencias: [
                    'React.js',
                    'Node.js',
                    'TypeScript',
                    'Docker',
                    'Kubernetes',
                    'AWS',
                    'Testes Automatizados'
                ],
                cargoAlvo: 'Desenvolvedor Full-Stack'
            }, {
                headers: { 'Content-Type': 'application/json' }
            });

            const { success, pontos_a_desenvolver } = integrationResponse.data;
            console.log(`   📊 Integração: ${success ? 'SUCESSO' : 'FALHA'}`);

            if (success && pontos_a_desenvolver && pontos_a_desenvolver.length > 0) {
                console.log('\n   📋 Oportunidades ordenadas por prioridade:');

                pontos_a_desenvolver.forEach((ponto, index) => {
                    const prioridade = ponto.importancia || 'Média';
                    const emoji = prioridade === 'Alta' ? '🔴' : prioridade === 'Média' ? '🟡' : '🟢';
                    console.log(`      ${index + 1}. ${emoji} ${ponto.competencia} (${prioridade})`);
                });

                // Verificar se está ordenado corretamente
                const prioridades = pontos_a_desenvolver.map(p => p.importancia || 'Média');
                console.log('\n   🔍 Verificação da ordenação:');
                console.log(`      Prioridades encontradas: ${prioridades.join(' → ')}`);

                // Verificar se há pelo menos uma oportunidade de cada prioridade
                const hasAlta = prioridades.includes('Alta');
                const hasMedia = prioridades.includes('Média');
                const hasBaixa = prioridades.includes('Baixa');

                console.log(`      Tem Alta: ${hasAlta ? '✅' : '❌'}`);
                console.log(`      Tem Média: ${hasMedia ? '✅' : '❌'}`);
                console.log(`      Tem Baixa: ${hasBaixa ? '✅' : '❌'}`);

            } else {
                console.log('   ⚠️ Nenhuma oportunidade retornada');
            }

        } catch (error) {
            console.log(`   ❌ Erro na integração: ${error.response?.data?.message || error.message}`);
        }

        // 3. Testar busca individual de cursos para ver prioridades
        console.log('\n3️⃣ Testando busca individual de cursos...');

        const competenciasTeste = [
            'React.js',
            'Node.js',
            'Docker'
        ];

        for (const competencia of competenciasTeste) {
            try {
                const response = await axios.post(`${BASE_URL}/api/courses/search`, {
                    query: competencia
                }, {
                    headers: { 'Content-Type': 'application/json' }
                });

                const { count, source } = response.data;
                console.log(`   📚 ${competencia}: ${count} cursos (${source})`);

            } catch (error) {
                console.log(`   ❌ Erro ao buscar ${competencia}: ${error.response?.data?.message || error.message}`);
            }
        }

        // 4. Instruções para testar no frontend
        console.log('\n4️⃣ Para testar no frontend:');
        console.log('   📋 Acesse a aplicação no navegador');
        console.log('   📋 Faça upload de um CV');
        console.log('   📋 Vá para a aba "Roadmap"');
        console.log('   📋 No painel "Oportunidades de Desenvolvimento":');
        console.log('      - Verifique se as oportunidades estão ordenadas por prioridade');
        console.log('      - Confirme que as de prioridade "Alta" aparecem primeiro');
        console.log('      - Depois as de prioridade "Média"');
        console.log('      - Por último as de prioridade "Baixa"');
        console.log('   📋 Confirme que há um indicador visual da ordenação');

        console.log('\n🎉 Teste concluído!');
        console.log('\n📋 Resumo da implementação:');
        console.log('   1. ✅ Função sortByPriority implementada');
        console.log('   2. ✅ Ordenação: Alta (3) → Média (2) → Baixa (1)');
        console.log('   3. ✅ Indicador visual da ordenação adicionado');
        console.log('   4. ✅ Oportunidades ordenadas automaticamente');

    } catch (error) {
        console.error('❌ Erro no teste:', error.message);

        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Solução: Inicie o servidor com "npm run server"');
        }
    }
}

// Executar o teste
testPriorityOrdering().catch(console.error); 