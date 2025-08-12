import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { gerarRoadmapCompleto } from './services/analysisService.js';
import { otimizacaoCurriculo } from './services/geminiClient.js';
import { testarAPIJSearch, buscarVagasJSearch, extrairCompetenciasVagas, getAPIStats, clearCache, resetRequestCount } from './services/jsearchService.js';
import { getSectionConfig, validateConfig, validateExternalAPIConfig } from './config/api.js';
import jobSearchService from './services/jobSearchService.js';
import externalAPIService from './services/externalAPIService.js';
import axios from 'axios'; // axios is imported here for the new test endpoint

const app = express();
const port = getSectionConfig('SERVER').PORT;

app.use(cors());
app.use(express.json());

// Validar configurações na inicialização
if (!validateConfig()) {
    console.error('❌ Configurações inválidas. Servidor não pode ser iniciado.');
    process.exit(1);
}

// Validar configurações da API externa (não bloqueante)
validateExternalAPIConfig().then(isValid => {
    if (isValid) {
        console.log('✅ API externa configurada e validada');
    } else {
        console.log('⚠️ API externa não configurada, usando apenas dados estáticos');
    }
}).catch(error => {
    console.log('⚠️ Erro ao validar API externa, usando apenas dados estáticos');
});

const upload = multer();

app.get('/', (req, res) => {
    console.log('Requisição GET / recebida');
    res.json({ status: 'API is running' });
});

app.post('/analyze', upload.single('cv'), async (req, res) => {
    try {
        const arquivoCV = req.file && req.file.buffer;
        const cargoAlmejado = req.body.cargoAlmejado;
        if (!arquivoCV || !cargoAlmejado) {
            return res.status(400).json({ error: 'Arquivo do CV e cargoAlmejado são obrigatórios.' });
        }
        const resultado = await gerarRoadmapCompleto(arquivoCV, cargoAlmejado);
        res.status(200).json(resultado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao processar análise de carreira.' });
    }
});

app.post('/optimize-cv', async (req, res) => {
    try {
        const { textoCV } = req.body;
        if (!textoCV) {
            return res.status(400).json({ error: 'O texto do currículo é obrigatório.' });
        }
        const sugestoes = await otimizacaoCurriculo(textoCV);
        res.status(200).json(sugestoes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao otimizar currículo.' });
    }
});

// Endpoint para testar a API JSearch
app.get('/test-jsearch', async (req, res) => {
    try {
        const resultado = await testarAPIJSearch();
        res.status(200).json(resultado);
    } catch (error) {
        console.error('❌ Erro ao testar JSearch:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Endpoint para buscar vagas via JSearch
app.post('/api/vagas-jsearch', async (req, res) => {
    try {
        const { cargo, localizacao, limit } = req.body;

        if (!cargo) {
            return res.status(400).json({ error: 'Cargo é obrigatório' });
        }

        const vagas = await buscarVagasJSearch(cargo, localizacao || 'Brazil', limit || 3);
        res.status(200).json(vagas);
    } catch (error) {
        console.error('❌ Erro ao buscar vagas JSearch:', error);
        res.status(500).json({ error: 'Erro ao buscar vagas JSearch' });
    }
});

// Endpoint para análise de mercado via JSearch
app.post('/api/analise-mercado', async (req, res) => {
    try {
        const { cargo, localizacao } = req.body;

        if (!cargo) {
            return res.status(400).json({ error: 'Cargo é obrigatório' });
        }

        const vagas = await buscarVagasJSearch(cargo, localizacao || 'Brazil', 3);
        const analise = await extrairCompetenciasVagas(vagas);

        res.status(200).json({
            vagas: vagas,
            analise: analise,
            total_vagas: vagas.length
        });
    } catch (error) {
        console.error('❌ Erro na análise de mercado:', error);
        res.status(500).json({ error: 'Erro na análise de mercado' });
    }
});

// Endpoint para obter estatísticas da API JSearch
app.get('/api/jsearch/stats', (req, res) => {
    try {
        const stats = getAPIStats();
        res.status(200).json(stats);
    } catch (error) {
        console.error('❌ Erro ao obter estatísticas:', error);
        res.status(500).json({ error: 'Erro ao obter estatísticas da API' });
    }
});

// Endpoint para limpar cache da API JSearch
app.post('/api/jsearch/clear-cache', (req, res) => {
    try {
        clearCache();
        res.status(200).json({ message: 'Cache limpo com sucesso' });
    } catch (error) {
        console.error('❌ Erro ao limpar cache:', error);
        res.status(500).json({ error: 'Erro ao limpar cache' });
    }
});

// Endpoint para resetar contador de requisições (apenas para desenvolvimento)
app.post('/api/jsearch/reset-count', (req, res) => {
    try {
        resetRequestCount();
        res.status(200).json({ message: 'Contador de requisições resetado' });
    } catch (error) {
        console.error('❌ Erro ao resetar contador:', error);
        res.status(500).json({ error: 'Erro ao resetar contador' });
    }
});

// ===== NOVOS ENDPOINTS PARA API EXTERNA =====

// Health check da API externa
app.get('/api/external/health', async (req, res) => {
    try {
        const health = await externalAPIService.healthCheck();
        res.status(200).json(health);
    } catch (error) {
        console.error('❌ Erro no health check da API externa:', error);
        res.status(500).json({
            success: false,
            error: 'Erro no health check da API externa',
            message: error.message
        });
    }
});

// Testar conectividade com a API externa
app.get('/api/external/test', async (req, res) => {
    try {
        const result = await externalAPIService.testConnection();
        res.status(200).json(result);
    } catch (error) {
        console.error('❌ Erro no teste da API externa:', error);
        res.status(500).json({
            success: false,
            error: 'Erro no teste da API externa',
            message: error.message
        });
    }
});

// Buscar vagas via API externa (novo endpoint unificado)
app.post('/api/jobs/search', async (req, res) => {
    try {
        const { query, location, limit } = req.body;

        if (!query) {
            return res.status(400).json({ error: 'Query é obrigatória' });
        }

        const jobs = await jobSearchService.searchJobs(query, location || 'Brazil', limit || 10);
        res.status(200).json(jobs);
    } catch (error) {
        console.error('❌ Erro na busca de vagas:', error);
        res.status(500).json({
            success: false,
            error: 'Erro na busca de vagas',
            message: error.message
        });
    }
});

// Obter detalhes de uma vaga específica
app.get('/api/jobs/:jobId', async (req, res) => {
    try {
        const { jobId } = req.params;
        const details = await jobSearchService.getJobDetails(jobId);
        res.status(200).json(details);
    } catch (error) {
        console.error(`❌ Erro ao obter detalhes da vaga ${req.params.jobId}:`, error);
        res.status(500).json({
            success: false,
            error: 'Erro ao obter detalhes da vaga',
            message: error.message
        });
    }
});

// Obter estatísticas de uso da API externa
app.get('/api/external/stats', (req, res) => {
    try {
        const stats = jobSearchService.getUsageStats();
        res.status(200).json(stats);
    } catch (error) {
        console.error('❌ Erro ao obter estatísticas:', error);
        res.status(500).json({ error: 'Erro ao obter estatísticas' });
    }
});

// Ativar/desativar API externa
app.post('/api/external/toggle', (req, res) => {
    try {
        const { enabled } = req.body;

        if (typeof enabled !== 'boolean') {
            return res.status(400).json({ error: 'Parâmetro "enabled" deve ser um booleano' });
        }

        const result = jobSearchService.setExternalAPIUsage(enabled);
        res.status(200).json(result);
    } catch (error) {
        console.error('❌ Erro ao alterar uso da API externa:', error);
        res.status(500).json({ error: 'Erro ao alterar uso da API externa' });
    }
});

// Limpar cache da API externa
app.post('/api/external/clear-cache', async (req, res) => {
    try {
        const cacheService = await import('./services/cacheService.js');
        cacheService.default.clearAll();
        res.status(200).json({ message: 'Cache da API externa limpo com sucesso' });
    } catch (error) {
        console.error('❌ Erro ao limpar cache:', error);
        res.status(500).json({ error: 'Erro ao limpar cache' });
    }
});

// ===== ENDPOINTS PARA CURSOS =====

// Buscar cursos via API externa
app.post('/api/courses/search', async (req, res) => {
    try {
        const { query, platform, limit, language } = req.body;

        if (!query) {
            return res.status(400).json({ error: 'Query é obrigatória' });
        }

        const courses = await jobSearchService.searchCourses(
            query,
            platform || 'all',
            limit || 10,
            language || 'pt'
        );
        res.status(200).json(courses);
    } catch (error) {
        console.error('❌ Erro na busca de cursos:', error);
        res.status(500).json({
            success: false,
            error: 'Erro na busca de cursos',
            message: error.message
        });
    }
});

// Obter detalhes de um curso específico
app.get('/api/courses/:courseId', async (req, res) => {
    try {
        const { courseId } = req.params;
        const details = await externalAPIService.getCourseDetails(courseId);
        res.status(200).json(details);
    } catch (error) {
        console.error(`❌ Erro ao obter detalhes do curso ${req.params.courseId}:`, error);
        res.status(500).json({
            success: false,
            error: 'Erro ao obter detalhes do curso',
            message: error.message
        });
    }
});

// ===== ENDPOINTS PARA TESTE DA INTEGRAÇÃO =====

// Testar integração de cursos com metodologia
app.post('/api/test/course-integration', async (req, res) => {
    try {
        const { pontosADesenvolver, cargoAlvo } = req.body;

        if (!pontosADesenvolver || !Array.isArray(pontosADesenvolver) || !cargoAlvo) {
            return res.status(400).json({
                error: 'pontosADesenvolver (array) e cargoAlvo (string) são obrigatórios'
            });
        }

        console.log('🧪 Testando integração de cursos com metodologia...');
        console.log(`📚 Pontos a desenvolver: ${pontosADesenvolver.length}`);
        console.log(`🎯 Cargo alvo: ${cargoAlvo}`);

        // Importar o serviço de integração
        const courseIntegrationService = await import('./services/courseIntegrationService.js');

        // Gerar roadmap enriquecido
        const roadmapEnriquecido = await courseIntegrationService.default.generateEnrichedRoadmap(
            pontosADesenvolver,
            cargoAlvo
        );

        res.status(200).json({
            success: true,
            message: 'Integração de cursos testada com sucesso',
            roadmap: roadmapEnriquecido,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Erro no teste de integração:', error);
        res.status(500).json({
            success: false,
            error: 'Erro no teste de integração',
            message: error.message
        });
    }
});

// Obter estatísticas da integração de cursos
app.get('/api/courses/integration/stats', async (req, res) => {
    try {
        const courseIntegrationService = await import('./services/courseIntegrationService.js');
        const stats = courseIntegrationService.default.getUsageStats();

        res.status(200).json({
            success: true,
            stats: stats
        });
    } catch (error) {
        console.error('❌ Erro ao obter estatísticas da integração:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao obter estatísticas da integração',
            message: error.message
        });
    }
});

// Toggle da integração de cursos
app.post('/api/courses/integration/toggle', async (req, res) => {
    try {
        const { enabled } = req.body;

        if (typeof enabled !== 'boolean') {
            return res.status(400).json({ error: 'Parâmetro "enabled" deve ser um booleano' });
        }

        const courseIntegrationService = await import('./services/courseIntegrationService.js');
        const result = courseIntegrationService.default.setExternalAPIUsage(enabled);

        res.status(200).json(result);
    } catch (error) {
        console.error('❌ Erro ao alterar integração de cursos:', error);
        res.status(500).json({ error: 'Erro ao alterar integração de cursos' });
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
}); 