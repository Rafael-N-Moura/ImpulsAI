import pdfParse from 'pdf-parse';

export async function parseCv(fileBuffer) {
    const data = await pdfParse(fileBuffer);
    return data.text;
} 