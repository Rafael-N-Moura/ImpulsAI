import { parseCv } from './cvParser.js';
import { loadCursos } from '../data/dataLoader.js';
import { extrairCompetencias, realizarAnalise } from './geminiClient.js';
import { buscarVagasJSearch, extrairCompetenciasVagas } from './jsearchService.js';
import courseIntegrationService from './courseIntegrationService.js';

function extrairCompetenciasMaisComuns(vagas, cargoAlmejado, topN = 10) {
    console.log('🔍 Extraindo competências para cargo:', cargoAlmejado);
    console.log('📊 Total de vagas carregadas:', vagas.length);

    const competenciasCount = {};
    vagas.forEach(vaga => {
        if (
            vaga.cargo && vaga.cargo.toLowerCase().includes(cargoAlmejado.toLowerCase()) && Array.isArray(vaga.competencias)
        ) {
            vaga.competencias.forEach(comp => {
                competenciasCount[comp] = (competenciasCount[comp] || 0) + 1;
            });
        }
    });

    const competenciasOrdenadas = Object.entries(competenciasCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, topN)
        .map(([comp]) => comp);

    console.log('📈 Competências mais comuns encontradas:', competenciasOrdenadas);
    return competenciasOrdenadas;
}

/**
 * FASE 4: PRESCRIÇÃO - Integração com CourseIntegrationService
 * Segue a metodologia definida em metodologia.md
 */
async function sugerirCursosIntegrado(pontosADesenvolver, cargoAlmejado) {
    console.log('🎯 FASE 4: Iniciando Prescrição Integrada');
    console.log('📚 Total de pontos a desenvolver:', pontosADesenvolver.length);

    try {
        // Usar o CourseIntegrationService para enriquecer o roadmap
        const roadmapEnriquecido = await courseIntegrationService.generateEnrichedRoadmap(
            pontosADesenvolver,
            cargoAlmejado
        );

        console.log('✅ Roadmap enriquecido gerado via CourseIntegrationService');
        console.log(`📊 Total de cursos mapeados: ${roadmapEnriquecido.metadata.total_cursos}`);
        console.log(`🔍 Fonte dos cursos: ${roadmapEnriquecido.metadata.fonte_cursos}`);

        return roadmapEnriquecido.pontos_a_desenvolver;

    } catch (error) {
        console.error('❌ Erro na integração de cursos:', error);
        console.log('🔄 Usando fallback para sugestão de cursos...');

        // Fallback para o método antigo
        return pontosADesenvolver.map(ponto => ({
            ...ponto,
            cursos_sugeridos: [],
            total_cursos: 0,
            prioridade: 50
        }));
    }
}

export async function gerarRoadmapCompleto(arquivoCV, cargoAlmejado) {
    try {
        console.log('🔍 Iniciando extração do texto do CV...');
        const textoCV = await parseCv(arquivoCV);
        console.log('📄 Texto extraído do CV:', textoCV ? textoCV.substring(0, 200) + '...' : 'NULO');

        console.log('🔍 Buscando vagas reais via JSearch...');
        let vagas = [];
        let fonteDados = 'estática';

        try {
            // Usar apenas 3 vagas para economizar a cota da API
            vagas = await buscarVagasJSearch(cargoAlmejado, 'Brazil', 3);
            console.log('✅ Vagas do JSearch carregadas:', vagas.length);

            // Verificar se as vagas são relevantes para o cargo
            const vagasRelevantes = vagas.filter(vaga =>
                vaga.titulo.toLowerCase().includes('developer') ||
                vaga.titulo.toLowerCase().includes('engineer') ||
                vaga.titulo.toLowerCase().includes('programmer') ||
                vaga.titulo.toLowerCase().includes('analyst') ||
                vaga.titulo.toLowerCase().includes('manager') ||
                vaga.titulo.toLowerCase().includes('designer')
            );

            if (vagasRelevantes.length > 0) {
                vagas = vagasRelevantes;
                fonteDados = 'JSearch';
                console.log(`✅ Encontradas ${vagasRelevantes.length} vagas relevantes do JSearch`);
            } else {
                console.log(`⚠️ Vagas do JSearch não são relevantes para ${cargoAlmejado}`);
                vagas = [];
            }
        } catch (error) {
            console.log('⚠️ Erro ao buscar vagas do JSearch, usando dados estáticos:', error.message);
            vagas = [];
        }

        // Definir competências do mercado baseado no que foi extraído anteriormente
        let competenciasMercado;
        if (vagas.length > 0) {
            // Usar competências extraídas do JSearch
            console.log('🤖 Extraindo competências das vagas do JSearch...');
            const analiseMercado = await extrairCompetenciasVagas(vagas);
            console.log('✅ Análise de mercado do JSearch:', analiseMercado);

            const competenciasJSearch = analiseMercado.competencias_principais || [];
            const competenciasVagas = extrairCompetenciasMaisComuns(vagas, cargoAlmejado, 15);

            // Combinar e remover duplicatas
            competenciasMercado = [...new Set([...competenciasJSearch, ...competenciasVagas])];
            console.log('✅ Competências do mercado (JSearch):', competenciasMercado);
        } else {
            // Fallback para dados estáticos
            console.log('⚠️ Nenhuma vaga encontrada, usando dados estáticos como fallback...');
            const { loadVagas } = await import('../data/dataLoader.js');
            const vagasEstaticas = await loadVagas();
            competenciasMercado = extrairCompetenciasMaisComuns(vagasEstaticas, cargoAlmejado);
            console.log('✅ Competências do mercado (estáticas):', competenciasMercado);
        }

        console.log('📂 Carregando dados de cursos...');
        const cursos = await loadCursos();
        console.log('✅ Cursos carregados:', cursos.length);

        console.log('🤖 Extraindo competências via IA...');
        const competenciasUsuario = await extrairCompetencias(textoCV);
        console.log('✅ Competências do usuário:', competenciasUsuario);

        console.log('✅ Competências do mercado:', competenciasMercado);

        console.log('🤖 Realizando análise de lacunas...');
        const analise = await realizarAnalise(competenciasUsuario, competenciasMercado, cargoAlmejado);
        console.log('✅ Análise concluída');

        const roadmap = {
            cargo_almejado: cargoAlmejado,
            pontos_fortes: analise.pontos_fortes,
            pontos_a_desenvolver: await sugerirCursosIntegrado(analise.pontos_a_desenvolver, cargoAlmejado),
            texto_cv: textoCV,
            vagas_mercado: vagas.slice(0, 10), // Incluir top 10 vagas encontradas
            total_vagas_analisadas: vagas.length,
            fonte_dados: fonteDados,
            // Metadados sobre cursos (Fase 4 da metodologia)
            cursos_metadata: {
                total_lacunas: analise.pontos_a_desenvolver.length,
                fonte_cursos: 'integrated_service',
                timestamp: new Date().toISOString()
            }
        };
        console.log('✅ Roadmap gerado com texto_cv:', roadmap.texto_cv ? 'SIM' : 'NÃO');
        return roadmap;
    } catch (error) {
        console.error('❌ Erro em gerarRoadmapCompleto:', error);
        throw error;
    }
} 