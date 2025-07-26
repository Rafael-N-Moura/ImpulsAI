import { parseCv } from './cvParser.js';
import { loadVagas, loadCursos } from '../data/dataLoader.js';
import { extrairCompetencias, realizarAnalise } from './geminiClient.js';

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

function sugerirCursos(pontosADesenvolver, cursos) {
    console.log('📚 Total de cursos carregados:', cursos.length);
    console.log('🎯 Pontos a desenvolver:', pontosADesenvolver.length);

    return pontosADesenvolver.map(ponto => {
        const sugestoes = cursos.filter(curso =>
            curso.competencia && curso.competencia.toLowerCase() === ponto.competencia.toLowerCase()
        );
        return {
            ...ponto,
            cursos_sugeridos: sugestoes.map(curso => ({ nome: curso.nome, url: curso.url }))
        };
    });
}

export async function gerarRoadmapCompleto(arquivoCV, cargoAlmejado) {
    try {
        console.log('🔍 Iniciando extração do texto do CV...');
        const textoCV = await parseCv(arquivoCV);
        console.log('📄 Texto extraído do CV:', textoCV ? textoCV.substring(0, 200) + '...' : 'NULO');

        console.log('📂 Carregando dados de vagas...');
        const vagas = await loadVagas();
        console.log('✅ Vagas carregadas:', vagas.length);

        console.log('📂 Carregando dados de cursos...');
        const cursos = await loadCursos();
        console.log('✅ Cursos carregados:', cursos.length);

        console.log('🤖 Extraindo competências via IA...');
        const competenciasUsuario = await extrairCompetencias(textoCV);
        console.log('✅ Competências do usuário:', competenciasUsuario);

        const competenciasMercado = extrairCompetenciasMaisComuns(vagas, cargoAlmejado);
        console.log('✅ Competências do mercado:', competenciasMercado);

        console.log('🤖 Realizando análise de lacunas...');
        const analise = await realizarAnalise(competenciasUsuario, competenciasMercado, cargoAlmejado);
        console.log('✅ Análise concluída');

        const roadmap = {
            cargo_almejado: cargoAlmejado,
            pontos_fortes: analise.pontos_fortes,
            pontos_a_desenvolver: sugerirCursos(analise.pontos_a_desenvolver, cursos),
            texto_cv: textoCV // Adicionando o texto extraído do CV
        };
        console.log('✅ Roadmap gerado com texto_cv:', roadmap.texto_cv ? 'SIM' : 'NÃO');
        return roadmap;
    } catch (error) {
        console.error('❌ Erro em gerarRoadmapCompleto:', error);
        throw error;
    }
} 