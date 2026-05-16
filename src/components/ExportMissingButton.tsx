import { Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import type { Sticker } from '../types';

type ExportMissingButtonProps = {
  missingStickers: Sticker[];
  total: number;
};

function groupMissingStickers(stickers: Sticker[]) {
  return stickers.reduce<Record<string, Sticker[]>>((groups, sticker) => {
    const key =
      sticker.grupo === 'Extras'
        ? sticker.secao
        : `${sticker.grupo} / ${sticker.secao}`;
    groups[key] = groups[key] ?? [];
    groups[key].push(sticker);
    return groups;
  }, {});
}

export function ExportMissingButton({ missingStickers, total }: ExportMissingButtonProps) {
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

    if (missingStickers.length === 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('Album completo!', marginX, y + 8);
      doc.save('figurinhas-faltantes-copa-2026.pdf');
      return;
    }

    const grouped = groupMissingStickers(missingStickers);

    for (const [section, stickers] of Object.entries(grouped)) {
      addPageIfNeeded(14);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(section, marginX, y);
      y += 7;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);

      for (const sticker of stickers) {
        addPageIfNeeded();
        const text = `${sticker.codigo} - ${sticker.nome}`;
        const lines = doc.splitTextToSize(text, pageWidth - marginX * 2);
        doc.text(lines, marginX, y);
        y += lines.length * 5;
      }

      y += 3;
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
