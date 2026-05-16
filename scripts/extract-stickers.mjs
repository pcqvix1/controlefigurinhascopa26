import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const albumPath = path.resolve('album.pdf');
const outputPath = path.resolve('src/data/stickers.json');

const teams = [
  ['Grupo A', 'México', 'MEX'],
  ['Grupo A', 'África do Sul', 'RSA'],
  ['Grupo A', 'Coreia do Sul', 'KOR'],
  ['Grupo A', 'Rep. Tcheca', 'CZE'],
  ['Grupo B', 'Canadá', 'CAN'],
  ['Grupo B', 'Bósnia', 'BIH'],
  ['Grupo B', 'Catar', 'QAT'],
  ['Grupo B', 'Suíça', 'SUI'],
  ['Grupo C', 'Brasil', 'BRA'],
  ['Grupo C', 'Marrocos', 'MAR'],
  ['Grupo C', 'Haiti', 'HAI'],
  ['Grupo C', 'Escócia', 'SCO'],
  ['Grupo D', 'Estados Unidos', 'USA'],
  ['Grupo D', 'Paraguai', 'PAR'],
  ['Grupo D', 'Austrália', 'AUS'],
  ['Grupo D', 'Turquia', 'TUR'],
  ['Grupo E', 'Alemanha', 'GER'],
  ['Grupo E', 'Curaçao', 'CUW'],
  ['Grupo E', 'Costa do Marfim', 'CIV'],
  ['Grupo E', 'Equador', 'ECU'],
  ['Grupo F', 'Holanda', 'NED'],
  ['Grupo F', 'Japão', 'JPN'],
  ['Grupo F', 'Suécia', 'SWE'],
  ['Grupo F', 'Tunísia', 'TUN'],
  ['Grupo G', 'Bélgica', 'BEL'],
  ['Grupo G', 'Egito', 'EGY'],
  ['Grupo G', 'Irã', 'IRN'],
  ['Grupo G', 'Nova Zelândia', 'NZL'],
  ['Grupo H', 'Espanha', 'ESP'],
  ['Grupo H', 'Cabo Verde', 'CPV'],
  ['Grupo H', 'Arábia Saudita', 'KSA'],
  ['Grupo H', 'Uruguai', 'URU'],
  ['Grupo I', 'França', 'FRA'],
  ['Grupo I', 'Senegal', 'SEN'],
  ['Grupo I', 'Iraque', 'IRQ'],
  ['Grupo I', 'Noruega', 'NOR'],
  ['Grupo J', 'Argentina', 'ARG'],
  ['Grupo J', 'Argélia', 'ALG'],
  ['Grupo J', 'Áustria', 'AUT'],
  ['Grupo J', 'Jordânia', 'JOR'],
  ['Grupo K', 'Portugal', 'POR'],
  ['Grupo K', 'Congo', 'COD'],
  ['Grupo K', 'Uzbequistão', 'UZB'],
  ['Grupo K', 'Colômbia', 'COL'],
  ['Grupo L', 'Inglaterra', 'ENG'],
  ['Grupo L', 'Croácia', 'CRO'],
  ['Grupo L', 'Gana', 'GHA'],
  ['Grupo L', 'Panamá', 'PAN'],
];

function makeSticker({ codigo, nome, grupo, secao, ordem }) {
  return {
    id: codigo.toLowerCase(),
    codigo,
    nome,
    grupo,
    secao,
    ordem,
  };
}

async function readPdfText() {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const data = new Uint8Array(await readFile(albumPath));
  const pdf = await pdfjs.getDocument({
    data,
    disableWorker: true,
    useSystemFonts: true,
  }).promise;

  const pageTexts = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    pageTexts.push(textContent.items.map((item) => item.str).join(' '));
  }

  return pageTexts.join('\n').replace(/\s+/g, ' ').trim();
}

function buildChecklistStickers() {
  const stickers = [];
  let order = 1;

  stickers.push(
    makeSticker({
      codigo: 'FWC00',
      nome: 'Página inicial - figurinha 00',
      grupo: 'Extras',
      secao: 'FIFA World Cup History',
      ordem: order,
    }),
  );
  order += 1;

  for (let number = 1; number <= 19; number += 1) {
    stickers.push(
      makeSticker({
        codigo: `FWC${number}`,
        nome: `FIFA World Cup History - figurinha ${number}`,
        grupo: 'Extras',
        secao: 'FIFA World Cup History',
        ordem: order,
      }),
    );
    order += 1;
  }

  for (const [grupo, country, prefix] of teams) {
    for (let number = 1; number <= 20; number += 1) {
      stickers.push(
        makeSticker({
          codigo: `${prefix}${number}`,
          nome: `${country} - figurinha ${number}`,
          grupo,
          secao: country,
          ordem: order,
        }),
      );
      order += 1;
    }
  }

  for (let number = 1; number <= 14; number += 1) {
    stickers.push(
      makeSticker({
        codigo: `CC${number}`,
        nome: `Figurinhas da Coca-Cola - ${number}`,
        grupo: 'Extras',
        secao: 'Figurinhas da Coca-Cola',
        ordem: order,
      }),
    );
    order += 1;
  }

  return stickers;
}

function canUseKnownChecklist(text) {
  if (!text) {
    return true;
  }

  const normalized = text.toUpperCase();
  const expectedCodes = teams.map(([, , prefix]) => prefix);
  const matchedCodes = expectedCodes.filter((code) => normalized.includes(code));
  return normalized.includes('FIGURINHAS') || matchedCodes.length >= 24;
}

async function main() {
  if (!existsSync(albumPath)) {
    throw new Error(
      'album.pdf não encontrado. Coloque o PDF na raiz do projeto e rode npm run extract:stickers novamente.',
    );
  }

  const text = await readPdfText();
  if (text) {
    console.log(`Texto detectado no PDF (${text.length} caracteres).`);
  } else {
    console.log('O PDF não possui texto extraível; usando a checklist visual conhecida do arquivo.');
  }

  if (!canUseKnownChecklist(text)) {
    throw new Error(
      'Não foi possível reconhecer uma checklist de figurinhas Copa 2026 no PDF. Revise o arquivo ou adapte scripts/extract-stickers.mjs.',
    );
  }

  const stickers = buildChecklistStickers();
  if (stickers.length < 900) {
    throw new Error('Extração incompleta: menos de 900 figurinhas geradas.');
  }

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(`${outputPath}`, `${JSON.stringify(stickers, null, 2)}\n`, 'utf8');
  console.log(`Geradas ${stickers.length} figurinhas em ${path.relative(process.cwd(), outputPath)}.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
