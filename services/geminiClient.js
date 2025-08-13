import axios from 'axios';
import { getSectionConfig } from '../config/api.js';

const GEMINI_CONFIG = getSectionConfig('GEMINI');
const GEMINI_API_URL = GEMINI_CONFIG.API_URL;
const GEMINI_API_KEY = GEMINI_CONFIG.API_KEY;

// Função auxiliar para limpar resposta JSON do Gemini
function limparRespostaGemini(responseText) {
    let cleanText = responseText;
    if (cleanText.includes('```json')) {
        cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }
    return JSON.parse(cleanText);
}

export async function extrairCompetencias(textoDoCV) {
    const prompt = `# PERSONA\nVocê é um especialista em recrutamento técnico (Tech Recruiter).\n\n# TAREFA\nExtraia de forma estruturada as competências (hard skills e soft skills) do currículo a seguir.\n\n# CONTEÚDO DO CURRÍCULO\n${textoDoCV}\n\n# FORMATO DE SAÍDA (Obrigatório)\nResponda APENAS com um objeto JSON válido com as chaves: "hard_skills" (array de strings) e "soft_skills" (array de strings).`;

    try {
        const response = await axios.post(
            `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
            {
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        // Extrair o texto da resposta do Gemini
        const responseText = response.data.candidates[0].content.parts[0].text;
        return limparRespostaGemini(responseText);
    } catch (error) {
        console.error('Erro ao extrair competências:', error.response?.data || error.message);
        throw new Error('Falha ao extrair competências do CV');
    }
}

export async function realizarAnalise(competenciasUsuario, competenciasMercado, cargoAlmejado) {
    const prompt = `# PERSONA\nVocê é um Analista de Carreira e Mentor profissional.\n\n# TAREFA\nRealize uma análise de lacunas (gap analysis) comparando as competências do usuário com as do mercado para o cargo de \"${cargoAlmejado}\".\n\n# CONTEXTO\n- Competências do Usuário: ${JSON.stringify(competenciasUsuario)}\n- Competências Mais Demandadas pelo Mercado: ${JSON.stringify(competenciasMercado)}\n\n# FORMATO DE SAÍDA (Obrigatório)\nResponda APENAS com um objeto JSON válido com as chaves: "pontos_fortes" (array de strings) e "pontos_a_desenvolver" (array de objetos, cada um com "competencia" e "importancia").\n\n# OBSERVAÇÃO\nAs competencias devem ser diretas, por exemplo, ao invés de retornar Testes Automatizados (Jest, Mocha, Cypress), retorne apenas Jest. O termo retornado será usada para uma busca em uma api de cursos por isso o termo essencial precisa estar explicito`;

    try {
        const response = await axios.post(
            `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
            {
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        // Extrair o texto da resposta do Gemini
        const responseText = response.data.candidates[0].content.parts[0].text;
        return limparRespostaGemini(responseText);
    } catch (error) {
        console.error('Erro ao realizar análise de lacunas:', error.response?.data || error.message);
        throw new Error('Falha ao realizar análise de lacunas');
    }
}

export async function otimizacaoCurriculo(textoDoCV) {
    const prompt = `# PERSONA\nVocê é um especialista em RH e otimização de currículos.\n\n# TAREFA\nAnalise o texto do currículo a seguir e sugira melhorias para deixá-lo mais atrativo para recrutadores. Foque em:\n- Uso de verbos de ação\n- Quantificação de resultados\n- Especificidade das experiências\n\n# CURRÍCULO\n${textoDoCV}\n\n# FORMATO DE SAÍDA (Obrigatório)\nResponda APENAS com um array de objetos JSON, cada um com as chaves: "title", "original", "suggestion".`;

    try {
        const response = await axios.post(
            `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
            {
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        // Extrair o texto da resposta do Gemini
        const responseText = response.data.candidates[0].content.parts[0].text;
        return limparRespostaGemini(responseText);
    } catch (error) {
        console.error('Erro na otimização do currículo:', error.response?.data || error.message);
        throw new Error('Falha na otimização do currículo');
    }
}

export async function gerarRoadmapEstrategico(cargoAlmejado, diagnosticoJson, cursosDisponiveisJson) {
    const prompt = `# PERSONA
Você é um Mentor de Carreira Sênior e Estrategista de Talentos, com vasta experiência em guiar profissionais de tecnologia. Seu tom é encorajador, estratégico e focado em ações práticas.

# TAREFA
Sua missão é criar um Roadmap de Desenvolvimento Estratégico para um profissional que deseja alcançar o cargo de "${cargoAlmejado}". Você receberá o diagnóstico de competências deste profissional (seus pontos fortes e as lacunas a serem desenvolvidas) e uma lista de cursos disponíveis.

Com base nisso, você deve criar um plano passo a passo, priorizando as lacunas mais importantes e sequenciando o aprendizado de forma lógica. Para cada passo, você deve fornecer uma justificativa motivacional, sugerir um projeto prático e listar os cursos relevantes.

# CONTEXTO
- Cargo Almejado: "${cargoAlmejado}"
- Diagnóstico do Profissional (JSON): ${JSON.stringify(diagnosticoJson)}
- Cursos Disponíveis (JSON): ${JSON.stringify(cursosDisponiveisJson)}

# REGRAS E FORMATO DE SAÍDA (Obrigatório)
Responda APENAS com um objeto JSON válido, sem nenhum texto ou explicação adicional. O objeto JSON deve ter uma única chave principal chamada "roadmap", que é um array de objetos. Cada objeto nesse array representa um passo no plano de desenvolvimento e deve conter as seguintes chaves:
- "passo": (Número) A ordem do passo (ex: 1, 2, 3...).
- "competencia_foco": (String) A principal competência a ser desenvolvida neste passo.
- "justificativa": (String) Uma explicação motivacional e estratégica sobre por que esta competência é crucial para o cargo almejado.
- "projeto_sugerido": (String) Uma descrição de um pequeno projeto prático para aplicar e solidificar o conhecimento adquirido.
- "cursos_recomendados": (Array de Objetos) Uma lista de cursos relevantes para este passo, cada um contendo "nome", "plataforma" e "url".`;

    try {
        const response = await axios.post(
            `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
            {
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        // Extrair o texto da resposta do Gemini
        const responseText = response.data.candidates[0].content.parts[0].text;
        return limparRespostaGemini(responseText);
    } catch (error) {
        console.error('Erro ao gerar roadmap estratégico:', error.response?.data || error.message);
        throw new Error('Falha ao gerar roadmap estratégico');
    }
} 