import externalAPIService from './externalAPIService.js';
import { getVagasFallback } from './jsearchService.js';

class JobSearchService {
    constructor() {
        this.useExternalAPI = true; // Flag para controlar qual API usar
        console.log('🔍 Job Search Service unificado inicializado');
    }

    // Função principal para buscar vagas
    async searchJobs(query, location = 'Brazil', limit = 10) {
        try {
            // Tentar usar a API externa primeiro
            if (this.useExternalAPI) {
                console.log(`🔍 Buscando vagas via API externa: "${query}" em "${location}"`);

                const externalJobs = await externalAPIService.searchJobs(query, location, limit);

                if (externalJobs.success && externalJobs.data && externalJobs.data.length > 0) {
                    console.log(`✅ ${externalJobs.data.length} vagas encontradas via API externa`);
                    return this.formatExternalJobs(externalJobs.data);
                }

                console.log('⚠️ API externa não retornou vagas, tentando fallback...');
            }

            // Fallback para dados estáticos
            console.log('🔄 Usando dados de fallback estáticos');
            const fallbackJobs = getVagasFallback(query, location, limit);

            return {
                success: true,
                data: fallbackJobs,
                count: fallbackJobs.length,
                source: 'fallback',
                message: 'Dados obtidos via fallback estático',
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('❌ Erro na busca de vagas:', error);

            // Em caso de erro, usar fallback
            console.log('🔄 Erro na API externa, usando fallback...');
            const fallbackJobs = getVagasFallback(query, location, limit);

            return {
                success: true,
                data: fallbackJobs,
                count: fallbackJobs.length,
                source: 'fallback',
                message: 'Dados obtidos via fallback devido a erro na API externa',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    // Formatar vagas da API externa para o formato do sistema
    formatExternalJobs(externalJobs) {
        return externalJobs.map(job => ({
            id: job.id,
            titulo: job.title,
            empresa: job.company,
            localizacao: job.location,
            descricao: job.description,
            tipo: 'Tempo integral', // Valor padrão
            remoto: this.detectRemoteWork(job.description),
            requisitos: this.extractRequirements(job.description),
            dataPostada: job.posted_date || new Date().toISOString().split('T')[0],
            url: job.url,
            candidatos: job.applicants || 'N/A',
            source: 'linkedin'
        }));
    }

    // Detectar se a vaga é remota baseado na descrição
    detectRemoteWork(description) {
        if (!description) return false;

        const remoteKeywords = [
            'remote', 'remoto', 'home office', 'home-office', 'trabalho remoto',
            'full remote', '100% remote', 'remote first', 'distributed team'
        ];

        const descriptionLower = description.toLowerCase();
        return remoteKeywords.some(keyword => descriptionLower.includes(keyword));
    }

    // Extrair requisitos básicos da descrição
    extractRequirements(description) {
        if (!description) return 'N/A';

        const techKeywords = [
            'javascript', 'python', 'java', 'react', 'node.js', 'angular',
            'vue.js', 'php', 'c#', '.net', 'sql', 'mongodb', 'aws',
            'docker', 'kubernetes', 'git', 'agile', 'scrum'
        ];

        const foundRequirements = [];
        const descriptionLower = description.toLowerCase();

        techKeywords.forEach(keyword => {
            if (descriptionLower.includes(keyword)) {
                foundRequirements.push(keyword);
            }
        });

        return foundRequirements.length > 0 ? foundRequirements.join(', ') : 'N/A';
    }

    // Obter detalhes de uma vaga específica
    async getJobDetails(jobId) {
        try {
            if (this.useExternalAPI) {
                const details = await externalAPIService.getJobDetails(jobId);

                if (details.success && details.data) {
                    return {
                        success: true,
                        data: this.formatExternalJobDetails(details.data),
                        source: 'external_api',
                        timestamp: new Date().toISOString()
                    };
                }
            }

            // Fallback para dados básicos
            return {
                success: false,
                message: 'Detalhes da vaga não disponíveis',
                source: 'fallback',
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error(`❌ Erro ao obter detalhes da vaga ${jobId}:`, error);

            return {
                success: false,
                error: error.message,
                message: 'Erro ao obter detalhes da vaga',
                source: 'error',
                timestamp: new Date().toISOString()
            };
        }
    }

    // Formatar detalhes da vaga da API externa
    formatExternalJobDetails(job) {
        return {
            id: job.id,
            titulo: job.title,
            empresa: job.company,
            localizacao: job.location,
            descricao: job.description,
            requisitos: job.requirements || this.extractRequirements(job.description),
            beneficios: job.benefits || [],
            salario: job.salary_range || 'N/A',
            dataPostada: job.posted_date || new Date().toISOString().split('T')[0],
            url: job.url,
            source: job.source || 'linkedin'
        };
    }

    // Testar conectividade com a API externa
    async testExternalAPI() {
        try {
            const result = await externalAPIService.testConnection();
            return result;
        } catch (error) {
            return {
                success: false,
                message: 'Falha no teste da API externa',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    // Obter estatísticas de uso
    getUsageStats() {
        return {
            externalAPI: externalAPIService.getUsageStats(),
            useExternalAPI: this.useExternalAPI,
            timestamp: new Date().toISOString()
        };
    }

    // Buscar cursos via API externa
    async searchCourses(query, platform = 'all', limit = 10, language = 'pt') {
        try {
            console.log(`🔍 [DEBUG] Iniciando busca de cursos: "${query}" em "${platform}"`);
            console.log(`🔍 [DEBUG] useExternalAPI: ${this.useExternalAPI}`);

            if (this.useExternalAPI) {
                console.log(`🔍 [DEBUG] Tentando API externa...`);

                try {
                    const externalCourses = await externalAPIService.searchCourses(query, platform, limit, language);
                    console.log(`🔍 [DEBUG] Resposta da API externa:`, JSON.stringify(externalCourses, null, 2));

                    if (externalCourses.success && externalCourses.courses && externalCourses.courses.length > 0) {
                        console.log(`✅ [DEBUG] ${externalCourses.courses.length} cursos encontrados via API externa`);
                        const formattedCourses = this.formatExternalCourses(externalCourses.courses);

                        return {
                            success: true,
                            data: formattedCourses,
                            count: formattedCourses.length,
                            source: 'external_api',
                            message: 'Cursos obtidos via API externa',
                            timestamp: new Date().toISOString()
                        };
                    } else {
                        console.log(`⚠️ [DEBUG] API externa não retornou dados válidos:`, {
                            success: externalCourses.success,
                            hasData: !!externalCourses.courses,
                            dataLength: externalCourses.courses ? externalCourses.courses.length : 0
                        });
                    }
                } catch (apiError) {
                    console.error(`❌ [DEBUG] Erro específico da API externa:`, apiError);
                }

                console.log('⚠️ [DEBUG] API externa não retornou cursos, tentando fallback...');
            } else {
                console.log('⚠️ [DEBUG] API externa desabilitada, indo direto para fallback');
            }

            // Fallback para dados estáticos
            console.log('🔄 [DEBUG] Usando dados de fallback estáticos para cursos');
            const fallbackCourses = await this.getCoursesFallback(query, platform, limit);

            return {
                success: true,
                data: fallbackCourses,
                count: fallbackCourses.length,
                source: 'fallback',
                message: 'Cursos obtidos via fallback estático',
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('❌ [DEBUG] Erro geral na busca de cursos:', error);

            // Em caso de erro, usar fallback
            console.log('🔄 [DEBUG] Erro na API externa, usando fallback para cursos...');
            const fallbackCourses = await this.getCoursesFallback(query, platform, limit);

            return {
                success: true,
                data: fallbackCourses,
                count: fallbackCourses.length,
                source: 'fallback',
                message: 'Cursos obtidos via fallback devido a erro na API externa',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    // Formatar cursos da API externa para o formato do sistema
    formatExternalCourses(externalCourses) {
        return externalCourses.map(course => ({
            id: course.id,
            nome: course.title,
            instrutor: course.instructor,
            avaliacao: course.rating,
            alunos: course.students_count,
            preco: course.price,
            preco_original: course.original_price,
            idioma: course.language,
            duracao: course.duration,
            nivel: course.level,
            url: course.url,
            imagem: course.image_url,
            descricao: course.description,
            plataforma: course.source
        }));
    }

    // Fallback para cursos (dados estáticos)
    async getCoursesFallback(query, platform, limit) {
        try {
            // Importar dados do arquivo JSON
            const fs = await import('fs');
            const path = await import('path');

            const cursosPath = path.join(process.cwd(), 'cursos.json');
            const cursosData = JSON.parse(fs.readFileSync(cursosPath, 'utf8'));

            let cursosFiltrados = cursosData.cursos;

            // Filtrar por plataforma se especificada
            if (platform !== 'all') {
                cursosFiltrados = cursosFiltrados.filter(curso =>
                    curso.plataforma.toLowerCase() === platform.toLowerCase()
                );
            }

            // Filtrar por query se especificada
            if (query) {
                const queryLower = query.toLowerCase();
                cursosFiltrados = cursosFiltrados.filter(curso =>
                    curso.nome.toLowerCase().includes(queryLower) ||
                    curso.descricao.toLowerCase().includes(queryLower) ||
                    curso.tags.some(tag => tag.toLowerCase().includes(queryLower))
                );
            }

            // Limitar resultados
            return cursosFiltrados.slice(0, limit);

        } catch (error) {
            console.error('❌ Erro ao carregar dados de fallback de cursos:', error);

            // Retornar dados mínimos em caso de erro
            return [
                {
                    id: 'fallback_001',
                    nome: 'Curso de Fallback',
                    instrutor: 'Sistema',
                    avaliacao: 4.0,
                    alunos: 1000,
                    preco: 'Gratuito',
                    preco_original: 'Gratuito',
                    idioma: 'Português',
                    duracao: '10 horas',
                    nivel: 'Iniciante',
                    url: '#',
                    imagem: '',
                    descricao: 'Curso de fallback quando a API externa não está disponível',
                    plataforma: 'fallback'
                }
            ];
        }
    }

    // Ativar/desativar API externa
    setExternalAPIUsage(enabled) {
        this.useExternalAPI = enabled;
        console.log(`🔧 API externa ${enabled ? 'ativada' : 'desativada'}`);
        return {
            success: true,
            useExternalAPI: this.useExternalAPI,
            message: `API externa ${enabled ? 'ativada' : 'desativada'} com sucesso`,
            timestamp: new Date().toISOString()
        };
    }

    // Health check do serviço
    async healthCheck() {
        try {
            const externalHealth = await externalAPIService.healthCheck();

            return {
                success: true,
                service: 'JobSearchService',
                externalAPI: externalHealth,
                useExternalAPI: this.useExternalAPI,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                success: false,
                service: 'JobSearchService',
                error: error.message,
                useExternalAPI: this.useExternalAPI,
                timestamp: new Date().toISOString()
            };
        }
    }
}

// Instância singleton do serviço
const jobSearchService = new JobSearchService();

export default jobSearchService; 