#!/usr/bin/env node

/**
 * Script de teste para a API JSearch
 * Executa testes básicos para verificar a integração
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:4000';

// Cores para console
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name) {
    log(`\n🧪 Testando: ${name}`, 'cyan');
}

function logSuccess(message) {
    log(`✅ ${message}`, 'green');
}

function logError(message) {
    log(`❌ ${message}`, 'red');
}

function logInfo(message) {
    log(`ℹ️  ${message}`, 'blue');
}

async function testServerConnection() {
    logTest('Conexão com o servidor');

    try {
        const response = await axios.get(`${BASE_URL}/`);
        if (response.data.status === 'API is running') {
            logSuccess('Servidor está rodando');
            return true;
        } else {
            logError('Servidor respondeu mas com status inesperado');
            return false;
        }
    } catch (error) {
        logError(`Erro ao conectar com servidor: ${error.message}`);
        return false;
    }
}

async function testJSearchAPI() {
    logTest('API JSearch');

    try {
        const response = await axios.get(`${BASE_URL}/test-jsearch`);
        const data = response.data;

        if (data.success) {
            logSuccess(`API JSearch funcionando - ${data.total_vagas} vagas encontradas`);
            logInfo(`Requisições restantes: ${data.requests_remaining}`);
            return true;
        } else {
            logError('API JSearch retornou sucesso false');
            return false;
        }
    } catch (error) {
        logError(`Erro ao testar JSearch: ${error.response?.data?.error || error.message}`);
        return false;
    }
}

async function testVagasSearch() {
    logTest('Busca de vagas');

    try {
        const response = await axios.post(`${BASE_URL}/api/vagas-jsearch`, {
            cargo: 'Desenvolvedor',
            localizacao: 'Brazil',
            limit: 2
        });

        const vagas = response.data;
        if (Array.isArray(vagas) && vagas.length > 0) {
            logSuccess(`Encontradas ${vagas.length} vagas`);
            logInfo(`Primeira vaga: ${vagas[0].titulo} na ${vagas[0].empresa}`);
            return true;
        } else {
            logError('Nenhuma vaga encontrada');
            return false;
        }
    } catch (error) {
        logError(`Erro ao buscar vagas: ${error.response?.data?.error || error.message}`);
        return false;
    }
}

async function testAnaliseMercado() {
    logTest('Análise de mercado');

    try {
        const response = await axios.post(`${BASE_URL}/api/analise-mercado`, {
            cargo: 'Programador',
            localizacao: 'Brazil'
        });

        const data = response.data;
        if (data.vagas && data.analise) {
            logSuccess(`Análise concluída - ${data.total_vagas} vagas analisadas`);
            logInfo(`Competências principais: ${data.analise.competencias_principais.slice(0, 3).join(', ')}`);
            return true;
        } else {
            logError('Análise de mercado falhou');
            return false;
        }
    } catch (error) {
        logError(`Erro na análise de mercado: ${error.response?.data?.error || error.message}`);
        return false;
    }
}

async function testAPIStats() {
    logTest('Estatísticas da API');

    try {
        const response = await axios.get(`${BASE_URL}/api/jsearch/stats`);
        const stats = response.data;

        logSuccess('Estatísticas obtidas com sucesso');
        logInfo(`Requisições feitas: ${stats.requests_made}`);
        logInfo(`Requisições restantes: ${stats.requests_remaining}`);
        logInfo(`Porcentagem da cota: ${stats.quota_percentage}%`);
        logInfo(`Tamanho do cache: ${stats.cache_size}`);

        return true;
    } catch (error) {
        logError(`Erro ao obter estatísticas: ${error.response?.data?.error || error.message}`);
        return false;
    }
}

async function runAllTests() {
    log('🚀 Iniciando testes da API JSearch', 'bright');
    log('=====================================', 'bright');

    const tests = [
        { name: 'Conexão com servidor', fn: testServerConnection },
        { name: 'API JSearch', fn: testJSearchAPI },
        { name: 'Busca de vagas', fn: testVagasSearch },
        { name: 'Análise de mercado', fn: testAnaliseMercado },
        { name: 'Estatísticas da API', fn: testAPIStats }
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
        try {
            const result = await test.fn();
            if (result) {
                passed++;
            } else {
                failed++;
            }
        } catch (error) {
            logError(`Teste ${test.name} falhou com exceção: ${error.message}`);
            failed++;
        }
    }

    log('\n📊 Resultado dos Testes', 'bright');
    log('========================', 'bright');
    log(`✅ Testes aprovados: ${passed}`, 'green');
    log(`❌ Testes falharam: ${failed}`, failed > 0 ? 'red' : 'green');
    log(`📈 Taxa de sucesso: ${Math.round((passed / (passed + failed)) * 100)}%`, 'cyan');

    if (failed === 0) {
        log('\n🎉 Todos os testes passaram! A integração está funcionando perfeitamente.', 'green');
    } else {
        log('\n⚠️  Alguns testes falharam. Verifique os logs acima para mais detalhes.', 'yellow');
    }
}

// Executar testes
runAllTests().catch(error => {
    logError(`Erro fatal durante os testes: ${error.message}`);
    process.exit(1);
}); 