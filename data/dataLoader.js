import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function loadVagas() {
    const filePath = path.resolve(__dirname, '../vagas.json');
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
}

export async function loadCursos() {
    const filePath = path.resolve(__dirname, '../cursos.json');
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
} 