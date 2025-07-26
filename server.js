import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { gerarRoadmapCompleto } from './services/analysisService.js';
import { otimizacaoCurriculo } from './services/geminiClient.js';

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

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

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
}); 