#!/usr/bin/env node

/**
 * Teste Rápido - Método GET para Vagas
 * 
 * Testa se o endpoint de vagas aceita GET em vez de POST
 */

import axios from 'axios';
import { EXTERNAL_API_CONFIG, getBaseURL } from './config/externalAPI.js';

console.log('🧪 TESTE RÁPIDO - MÉTODO GET PARA VAGAS\n');

const baseURL = getBaseURL();
const apiKey = EXTERNAL_API_CONFIG.API_KEY;

console.log(`🌐 Base URL: ${baseURL}`);
console.log(`🔑 API Key: ${apiKey ? '✅ Configurada' : '❌ Não configurada'}\n`);

// Configurar cliente axios
const client = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
    }
});

// Testar método GET com query parameters
async function testGetMethod() {
    try {
        console.log('🧪 Testando GET /api/v1/jobs com query parameters...');

        const response = await client.get('/api/v1/jobs', {
            params: {
                query: 'Python Developer',
                location: 'Brazil',
                limit: 3
            }
        });

        console.log(`   ✅ Status: ${response.status}`);
        console.log(`   📊 Resposta: ${JSON.stringify(response.data, null, 2).substring(0, 300)}...`);

        return { success: true, status: response.status, data: response.data };

    } catch (error) {
        const status = error.response?.status || 'N/A';
        const message = error.response?.data?.message || error.message || 'Erro desconhecido';

        console.log(`   ❌ Status: ${status}`);
        console.log(`   📝 Erro: ${message}`);

        return { success: false, status, error: message };
    }
}

// Executar teste
async function runTest() {
    try {
        const result = await testGetMethod();

        console.log('\n📋 RESULTADO:');
        if (result.success) {
            console.log('🎉 SUCESSO! O endpoint aceita GET com query parameters');
            console.log('💡 Solução: Alterar de POST para GET no código');
        } else {
            console.log('❌ Falhou. Verificar documentação da API externa');
        }

    } catch (error) {
        console.error('❌ Erro durante o teste:', error.message);
    }
}

// Executar se o arquivo for executado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
    runTest().catch(error => {
        console.error('❌ Erro fatal durante o teste:', error);
        process.exit(1);
    });
}

export { runTest }; 