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
    const prompt = `# PERSONA\nVocê é um Analista de Carreira e Mentor profissional.\n\n# TAREFA\nRealize uma análise de lacunas (gap analysis) comparando as competências do usuário com as do mercado para o cargo de \"${cargoAlmejado}\".\n\n# CONTEXTO\n- Competências do Usuário: ${JSON.stringify(competenciasUsuario)}\n- Competências Mais Demandadas pelo Mercado: ${JSON.stringify(competenciasMercado)}\n\n# FORMATO DE SAÍDA (Obrigatório)\nResponda APENAS com um objeto JSON válido com as chaves: "pontos_fortes" (array de strings) e "pontos_a_desenvolver" (array de objetos, cada um com "competencia" e "importancia").`;

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