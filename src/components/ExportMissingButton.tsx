import { Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import type { Sticker } from '../types';

type ExportMissingButtonProps = {
  stickers: Sticker[];
  missingStickers: Sticker[];
  total: number;
};

type StickerLine = {
  prefix: string;
  label: string;
  missingNumbers: string[];
};

function getCodeParts(code: string) {
  const match = code.match(/^([A-Z]+)(\d+)$/);
  return {
    prefix: match?.[1] ?? code,
    number: match?.[2] ?? '',
  };
}

function buildMissingLines(stickers: Sticker[], missingStickers: Sticker[]) {
  const missingIds = new Set(missingStickers.map((sticker) => sticker.id));
  const lines = new Map<string, StickerLine>();

  for (const sticker of stickers) {
    const { prefix, number } = getCodeParts(sticker.codigo);
    const currentLine = lines.get(prefix) ?? {
      prefix,
      label: sticker.secao,
      missingNumbers: [],
    };

    if (missingIds.has(sticker.id)) {
      currentLine.missingNumbers.push(number || sticker.codigo);
    }

    lines.set(prefix, currentLine);
  }

  return [...lines.values()].sort((a, b) => a.prefix.localeCompare(b.prefix, 'pt-BR'));
}

export function ExportMissingButton({
  stickers,
  missingStickers,
  total,
}: ExportMissingButtonProps) {
  function exportPdf() {
    const doc = new jsPDF();
    const generatedAt = new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date());

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginX = 16;
    const maxY = pageHeight - 18;
    let y = 18;

    const addPageIfNeeded = (height = 8) => {
      if (y + height <= maxY) {
        return;
      }
      doc.addPage();
      y = 18;
    };

    doc.setProperties({ title: 'Figurinhas faltantes - Copa 2026' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Figurinhas faltantes - Copa 2026', marginX, y);
    y += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Gerado em ${generatedAt}`, marginX, y);
    y += 7;

    doc.setFontSize(12);
    doc.text(`Faltam ${missingStickers.length} de ${total} figurinhas.`, marginX, y);
    y += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);

    for (const line of buildMissingLines(stickers, missingStickers)) {
      addPageIfNeeded(8);
      const status =
        line.missingNumbers.length > 0
          ? line.missingNumbers.join(', ')
          : 'já completou';
      const text = `${line.prefix} - ${line.label}: ${status}`;
      const wrappedLines = doc.splitTextToSize(text, pageWidth - marginX * 2);
      doc.text(wrappedLines, marginX, y);
      y += wrappedLines.length * 7;
    }

    doc.save('figurinhas-faltantes-copa-2026.pdf');
  }

  return (
    <button className="primary-action" type="button" onClick={exportPdf}>
      <Download aria-hidden="true" />
      Exportar faltantes em PDF
    </button>
  );
}
