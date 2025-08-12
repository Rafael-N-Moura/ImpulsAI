import pdfParse from 'pdf-parse';

export async function parseCv(fileBuffer) {
    try {
        console.log('📄 Iniciando parse do PDF...');
        console.log('📊 Tipo do arquivo recebido:', typeof fileBuffer);
        console.log('📊 Buffer recebido:', fileBuffer ? 'SIM' : 'NÃO');

        if (!fileBuffer || !fileBuffer.buffer) {
            throw new Error('Arquivo inválido ou sem buffer');
        }

        const data = await pdfParse(fileBuffer.buffer);
        console.log('✅ PDF parseado com sucesso, texto extraído');
        return data.text;
    } catch (error) {
        console.error('❌ Erro ao fazer parse do PDF:', error);
        throw new Error(`Falha ao extrair texto do PDF: ${error.message}`);
    }
} 