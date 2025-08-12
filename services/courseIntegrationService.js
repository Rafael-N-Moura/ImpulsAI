/**
 * Serviço de Integração de Cursos na Metodologia
 * Integra com a Fase 4: Prescrição (Geração do Roadmap)
 * Segue o fluxo metodológico definido em metodologia.md
 */

import externalAPIService from './externalAPIService.js';
import cacheService from './cacheService.js';

class CourseIntegrationService {
    constructor() {
        this.useExternalAPI = true; // Configurável
        this.fallbackEnabled = true; // Sempre habilitado como backup
    }

    /**
     * FASE 4: PRESCRIÇÃO - Mapeamento de Cursos para Lacunas
     * 
     * @param {Array} pontosADesenvolver - Lista de lacunas do diagnóstico
     * @param {string} cargoAlvo - Cargo alvo para contextualizar busca
     * @returns {Object} Roadmap enriquecido com cursos
     */
    async generateEnrichedRoadmap(pontosADesenvolver, cargoAlvo) {
        console.log('🎯 FASE 4: Iniciando Prescrição com Integração de Cursos');
        console.log(`📚 Mapeando ${pontosADesenvolver.length} lacunas para cursos`);

        const roadmapEnriquecido = {
            pontos_fortes: [], // Será preenchido pelo analysisService
            pontos_a_desenvolver: [],
            cursos_recomendados: [],
            metadata: {
                total_lacunas: pontosADesenvolver.length,
                total_cursos: 0,
                fonte_cursos: 'fallback', // Será atualizado se API externa funcionar
                timestamp: new Date().toISOString()
            }
        };

        // Variável para rastrear se algum curso veio da API externa
        let hasExternalCourses = false;

        // Processar cada lacuna
        for (const lacuna of pontosADesenvolver) {
            console.log(`\n🔍 Processando lacuna: ${lacuna.competencia || lacuna.skill}`);

            const cursosParaLacuna = await this.findCoursesForSkill(
                lacuna.competencia || lacuna.skill,
                cargoAlvo,
                lacuna.importancia || 'Média'
            );

            // Enriquecer a lacuna com cursos (formato compatível com frontend)
            console.log(`   📝 Formatando ${cursosParaLacuna.length} cursos para frontend...`);

            const cursosFormatados = this.formatCursosForFrontend(cursosParaLacuna);
            console.log(`   ✅ Cursos formatados: ${cursosFormatados.length}`);

            const lacunaEnriquecida = {
                ...lacuna,
                cursos_disponiveis: cursosParaLacuna,
                cursos_sugeridos: cursosFormatados, // Formato para frontend
                total_cursos: cursosParaLacuna.length,
                prioridade: this.calculatePriority(lacuna.importancia || 'Média', cursosParaLacuna.length)
            };

            console.log(`   🔍 Lacuna enriquecida: ${lacunaEnriquecida.competencia || lacuna.skill}`);
            console.log(`      - cursos_disponiveis: ${lacunaEnriquecida.cursos_disponiveis.length}`);
            console.log(`      - cursos_sugeridos: ${lacunaEnriquecida.cursos_sugeridos.length}`);
            console.log(`      - total_cursos: ${lacunaEnriquecida.total_cursos}`);
            console.log(`      - prioridade: ${lacunaEnriquecida.prioridade}`);

            // Verificar se algum curso veio da API externa
            if (cursosParaLacuna.length > 0 && cursosParaLacuna[0].fonte === 'external_api') {
                hasExternalCourses = true;
            }

            roadmapEnriquecido.pontos_a_desenvolver.push(lacunaEnriquecida);
            roadmapEnriquecido.cursos_recomendados.push(...cursosParaLacuna);
        }

        // Atualizar metadata
        roadmapEnriquecido.metadata.total_cursos = roadmapEnriquecido.cursos_recomendados.length;
        roadmapEnriquecido.metadata.fonte_cursos = hasExternalCourses ? 'external_api' : 'fallback';

        console.log(`✅ Roadmap enriquecido gerado: ${roadmapEnriquecido.metadata.total_cursos} cursos mapeados`);
        console.log(`🔍 Fonte dos cursos: ${roadmapEnriquecido.metadata.fonte_cursos}`);

        return roadmapEnriquecido;
    }

    /**
     * Encontrar cursos para uma habilidade específica
     * Segue a metodologia: API Externa → Cache → Fallback
     */
    async findCoursesForSkill(skill, cargoAlvo, importancia = 'Média') {
        const query = this.buildSearchQuery(skill, cargoAlvo);
        const limit = this.calculateLimitByImportance(importancia);

        console.log(`   🔍 Buscando cursos para "${skill}" (${importancia})`);
        console.log(`   📝 Query: "${query}", Limite: ${limit}`);

        try {
            // Tentativa 1: API Externa (se habilitada)
            if (this.useExternalAPI) {
                const externalCourses = await this.searchExternalCourses(query, limit);
                if (externalCourses && externalCourses.length > 0) {
                    console.log(`   ✅ ${externalCourses.length} cursos encontrados via API externa`);
                    return this.formatExternalCourses(externalCourses, skill, importancia);
                }
            }

            // Tentativa 2: Cache (se disponível)
            const cachedCourses = cacheService.getCourses(query, 'all', limit, 'pt');
            if (cachedCourses && cachedCourses.data && cachedCourses.data.length > 0) {
                console.log(`   💾 ${cachedCourses.data.length} cursos encontrados no cache`);
                return this.formatExternalCourses(cachedCourses.data, skill, importancia);
            }

            // Tentativa 3: Fallback (dados estáticos)
            console.log(`   🔄 Usando fallback para "${skill}"`);
            const fallbackCourses = await this.getFallbackCourses(skill, limit);

            return this.formatFallbackCourses(fallbackCourses, skill, importancia);

        } catch (error) {
            console.error(`   ❌ Erro ao buscar cursos para "${skill}":`, error);
            console.log(`   🔄 Usando fallback devido a erro`);

            const fallbackCourses = await this.getFallbackCourses(skill, limit);
            return this.formatFallbackCourses(fallbackCourses, skill, importancia);
        }
    }

    /**
     * Buscar cursos na API externa
     */
    async searchExternalCourses(query, limit) {
        try {
            console.log(`   📡 Chamando API externa para "${query}"`);

            const response = await externalAPIService.searchCourses(query, 'all', limit, 'pt');

            if (response.success && response.data && response.data.length > 0) {
                // Atualizar fonte nos metadados
                this.updateSourceMetadata('external');
                return response.data;
            }

            return null;
        } catch (error) {
            console.error(`   ❌ Erro na API externa:`, error.message);
            return null;
        }
    }

    /**
     * Obter cursos de fallback (dados estáticos)
     */
    async getFallbackCourses(skill, limit) {
        try {
            const fs = await import('fs');
            const path = await import('path');

            const cursosPath = path.join(process.cwd(), 'cursos.json');
            const cursosData = JSON.parse(fs.readFileSync(cursosPath, 'utf8'));

            // Filtrar por skill com busca mais inteligente
            const skillLower = skill.toLowerCase();
            const skillVariations = [
                skillLower,
                skillLower.replace('.', ''), // Para "Node.js" -> "nodejs"
                skillLower.replace('js', 'javascript'), // Para "js" -> "javascript"
                skillLower.replace('react', 'react'),
                skillLower.replace('node', 'nodejs'),
                skillLower.replace('vue', 'vue'),
                skillLower.replace('css', 'css'),
                skillLower.replace('python', 'python'),
                skillLower.replace('postgresql', 'postgresql'),
                skillLower.replace('redis', 'redis'),
                skillLower.replace('docker', 'docker'),
                skillLower.replace('kubernetes', 'kubernetes'),
                skillLower.replace('terraform', 'terraform')
            ];

            console.log(`   🔍 Buscando variações: ${skillVariations.join(', ')}`);

            const cursosFiltrados = cursosData.cursos.filter(curso => {
                const nomeLower = curso.nome.toLowerCase();
                const descricaoLower = curso.descricao.toLowerCase();
                const categoriaLower = curso.categoria.toLowerCase();
                const tagsLower = curso.tags.map(tag => tag.toLowerCase());

                // Verificar se alguma variação da skill está presente
                return skillVariations.some(variation =>
                    nomeLower.includes(variation) ||
                    descricaoLower.includes(variation) ||
                    categoriaLower.includes(variation) ||
                    tagsLower.some(tag => tag.includes(variation))
                );
            });

            console.log(`   📚 Cursos encontrados no fallback: ${cursosFiltrados.length}`);
            if (cursosFiltrados.length > 0) {
                cursosFiltrados.forEach(curso => {
                    console.log(`      - ${curso.nome} (${curso.plataforma})`);
                });
            }

            // Limitar resultados
            return cursosFiltrados.slice(0, limit);

        } catch (error) {
            console.error('   ❌ Erro ao carregar fallback:', error);
            return [];
        }
    }

    /**
     * Construir query de busca inteligente
     */
    buildSearchQuery(skill, cargoAlvo) {
        // Query base: skill + contexto do cargo
        let query = skill;

        // Adicionar contexto se relevante
        if (cargoAlvo) {
            const cargoLower = cargoAlvo.toLowerCase();

            // Mapear cargos para termos de busca mais específicos
            if (cargoLower.includes('frontend') || cargoLower.includes('ui') || cargoLower.includes('ux')) {
                if (!query.toLowerCase().includes('frontend') && !query.toLowerCase().includes('ui')) {
                    query = `${skill} frontend`;
                }
            } else if (cargoLower.includes('backend') || cargoLower.includes('api')) {
                if (!query.toLowerCase().includes('backend') && !query.toLowerCase().includes('api')) {
                    query = `${skill} backend`;
                }
            } else if (cargoLower.includes('fullstack') || cargoLower.includes('full stack')) {
                query = `${skill} fullstack`;
            } else if (cargoLower.includes('data') || cargoLower.includes('analytics')) {
                if (!query.toLowerCase().includes('data')) {
                    query = `${skill} data science`;
                }
            }
        }

        return query;
    }

    /**
     * Calcular limite baseado na importância da lacuna
     */
    calculateLimitByImportance(importancia) {
        switch (importancia.toLowerCase()) {
            case 'alta':
                return 8; // Mais cursos para lacunas críticas
            case 'média':
                return 5; // Quantidade equilibrada
            case 'baixa':
                return 3; // Menos cursos para lacunas menores
            default:
                return 5;
        }
    }

    /**
     * Calcular prioridade da lacuna
     */
    calculatePriority(importancia, totalCursos) {
        let baseScore = 0;

        // Score baseado na importância
        switch (importancia.toLowerCase()) {
            case 'alta':
                baseScore = 100;
                break;
            case 'média':
                baseScore = 70;
                break;
            case 'baixa':
                baseScore = 40;
                break;
            default:
                baseScore = 50;
        }

        // Bonus baseado na disponibilidade de cursos
        const courseBonus = Math.min(totalCursos * 5, 30);

        return Math.min(baseScore + courseBonus, 100);
    }

    /**
     * Formatar cursos da API externa
     */
    formatExternalCourses(externalCourses, skill, importancia) {
        return externalCourses.map((course, index) => ({
            id: course.id,
            nome: course.title || course.nome,
            instrutor: course.instructor || course.instrutor,
            avaliacao: course.rating || course.avaliacao,
            alunos: course.students_count || course.alunos,
            preco: course.price || course.preco,
            preco_original: course.original_price || course.preco_original,
            idioma: course.language || course.idioma,
            duracao: course.duration || course.duracao,
            nivel: course.level || course.nivel,
            url: course.url,
            imagem: course.image_url || course.imagem,
            descricao: course.description || course.descricao,
            plataforma: course.source || course.plataforma,
            categoria: course.category || course.categoria,
            tags: course.tags || [],
            relevancia: {
                skill_alvo: skill,
                importancia: importancia,
                score: this.calculateRelevanceScore(course, skill, importancia)
            },
            fonte: 'external_api',
            timestamp: new Date().toISOString()
        }));
    }

    /**
     * Formatar cursos de fallback
     */
    formatFallbackCourses(fallbackCourses, skill, importancia) {
        return fallbackCourses.map((course, index) => ({
            ...course,
            relevancia: {
                skill_alvo: skill,
                importancia: importancia,
                score: this.calculateRelevanceScore(course, skill, importancia)
            },
            fonte: 'fallback_static',
            timestamp: new Date().toISOString()
        }));
    }

    /**
     * Formatar cursos para o frontend (formato compatível)
     */
    formatCursosForFrontend(cursos) {
        console.log(`   🔧 Formatando ${cursos.length} cursos para frontend...`);

        if (!Array.isArray(cursos) || cursos.length === 0) {
            console.log('   ⚠️ Nenhum curso para formatar');
            return [];
        }

        const cursosFormatados = cursos.map((curso, index) => {
            console.log(`   📝 Formatando curso ${index + 1}: ${curso.nome}`);

            const cursoFormatado = {
                nome: curso.nome || 'Curso sem nome',
                url: curso.url || '#',
                plataforma: curso.plataforma || 'Plataforma não especificada',
                preco: curso.preco || 'Preço não especificado',
                avaliacao: curso.avaliacao || 0,
                duracao: curso.duracao || 'Duração não especificada',
                nivel: curso.nivel || 'Nível não especificado',
                instrutor: curso.instrutor || 'Instrutor não especificado',
                score_relevancia: curso.relevancia?.score || 0,
                fonte: curso.fonte || 'fallback_static'
            };

            console.log(`   ✅ Curso formatado: ${cursoFormatado.nome} (${cursoFormatado.plataforma})`);
            return cursoFormatado;
        });

        console.log(`   🎯 Total de cursos formatados: ${cursosFormatados.length}`);
        return cursosFormatados;
    }

    /**
     * Calcular score de relevância do curso
     */
    calculateRelevanceScore(course, skill, importancia) {
        let score = 0;
        const skillLower = skill.toLowerCase();

        // Score baseado na correspondência exata
        if (course.nome.toLowerCase().includes(skillLower)) {
            score += 50;
        }
        if (course.descricao.toLowerCase().includes(skillLower)) {
            score += 30;
        }
        if (course.tags && course.tags.some(tag => tag.toLowerCase().includes(skillLower))) {
            score += 20;
        }
        if (course.categoria && course.categoria.toLowerCase().includes(skillLower)) {
            score += 15;
        }

        // Bonus baseado na importância
        switch (importancia.toLowerCase()) {
            case 'alta':
                score += 20;
                break;
            case 'média':
                score += 10;
                break;
            case 'baixa':
                score += 5;
                break;
        }

        // Bonus baseado na avaliação
        if (course.avaliacao && course.avaliacao >= 4.5) {
            score += 15;
        } else if (course.avaliacao && course.avaliacao >= 4.0) {
            score += 10;
        }

        // Bonus baseado no número de alunos
        if (course.alunos && course.alunos >= 100000) {
            score += 10;
        } else if (course.alunos && course.alunos >= 50000) {
            score += 5;
        }

        return Math.min(score, 100);
    }

    /**
     * Atualizar metadados da fonte
     */
    updateSourceMetadata(source) {
        if (source === 'external') {
            this.lastExternalAPISuccess = new Date().toISOString();
        }
    }

    /**
     * Ativar/desativar API externa
     */
    setExternalAPIUsage(enabled) {
        this.useExternalAPI = enabled;
        console.log(`🔄 API Externa ${enabled ? 'ativada' : 'desativada'}`);
        return {
            success: true,
            useExternalAPI: this.useExternalAPI,
            message: `API Externa ${enabled ? 'ativada' : 'desativada'} com sucesso`,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Obter estatísticas de uso
     */
    getUsageStats() {
        return {
            useExternalAPI: this.useExternalAPI,
            fallbackEnabled: this.fallbackEnabled,
            lastExternalAPISuccess: this.lastExternalAPISuccess,
            timestamp: new Date().toISOString()
        };
    }
}

export default new CourseIntegrationService(); 