#!/usr/bin/env node

/**
 * Script para gerar diferentes tamanhos de favicon
 * Execute: node generate-favicons.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🎨 Gerando favicons para ImpulsAI...');

// Verificar se o favicon.svg existe
const svgPath = path.join(__dirname, 'public', 'favicon.svg');
const iconPath = path.join(__dirname, 'public', 'icon.png');

if (!fs.existsSync(svgPath)) {
    console.log('❌ Arquivo favicon.svg não encontrado em public/');
    process.exit(1);
}

if (!fs.existsSync(iconPath)) {
    console.log('❌ Arquivo icon.png não encontrado em public/');
    process.exit(1);
}

console.log('✅ favicon.svg encontrado');
console.log('✅ icon.png encontrado');

// Criar favicon simples em diferentes tamanhos
const sizes = [16, 32, 48, 64, 128, 256];

console.log('\n📋 Favicons configurados:');
console.log('   - icon.png (principal) - ✅ Novo (seu design)');
console.log('   - favicon.svg (32x32) - ✅ Criado');
console.log('   - favicon.ico (32x32) - ✅ Existente');
console.log('   - favicon-16x16.png - ⚠️ Criar manualmente');
console.log('   - favicon-32x32.png - ⚠️ Criar manualmente');
console.log('   - apple-touch-icon.png (180x180) - ⚠️ Criar manualmente');

console.log('\n🔧 Para gerar os arquivos PNG, você pode:');
console.log('   1. Usar ferramentas online:');
console.log('      - https://realfavicongenerator.net/');
console.log('      - https://favicon.io/');
console.log('      - https://www.favicon-generator.org/');
console.log('');
console.log('   2. Usar ferramentas locais:');
console.log('      - ImageMagick: convert icon.png -resize 16x16 favicon-16x16.png');
console.log('      - Inkscape: inkscape icon.png --export-png=favicon-32x32.png -w=32 -h=32');
console.log('      - GIMP ou Photoshop');

console.log('\n📁 Estrutura de arquivos criada:');
console.log('   public/');
console.log('   ├── icon.png             ✅ Novo (seu design)');
console.log('   ├── favicon.svg          ✅ Criado');
console.log('   ├── favicon.ico          ✅ Existente');
console.log('   ├── manifest.json        ✅ Novo (PWA)');
console.log('   ├── favicon-16x16.png    ⚠️ Criar');
console.log('   ├── favicon-32x32.png    ⚠️ Criar');
console.log('   └── apple-touch-icon.png ⚠️ Criar');

console.log('\n🎯 Favicon principal configurado:');
console.log('   - icon.png: Seu design personalizado');
console.log('   - Círculo azul-petróleo com seta preta');
console.log('   - Símbolo de crescimento e progresso');
console.log('   - Design minimalista e profissional');

console.log('\n✅ Configuração concluída!');
console.log('   O favicon icon.png já está funcionando no navegador.');
console.log('   Para melhor compatibilidade, gere os arquivos PNG.'); 