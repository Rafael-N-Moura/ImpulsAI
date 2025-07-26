import express from 'express';

const app = express();
const port = 4001;

app.get('/', (req, res) => {
    console.log('Teste: Requisição recebida');
    res.json({ message: 'Teste funcionando!' });
});

app.listen(port, () => {
    console.log(`Servidor de teste rodando na porta ${port}`);
}); 