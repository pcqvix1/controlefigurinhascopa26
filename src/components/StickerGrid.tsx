import { Check, Circle } from 'lucide-react';
import type { Sticker } from '../types';

type StickerGridProps = {
  stickers: Sticker[];
  ownedIds: Set<string>;
  onToggleSticker: (id: string) => void;
};

export function StickerGrid({ stickers, ownedIds, onToggleSticker }: StickerGridProps) {
  if (stickers.length === 0) {
    return (
      <section className="empty-state">
        <strong>Nenhuma figurinha encontrada</strong>
        <span>Ajuste a busca ou rode a extração do PDF para popular a lista.</span>
      </section>
    );
  }

  return (
    <section className="sticker-grid" aria-label="Lista de figurinhas">
      {stickers.map((sticker) => {
        const isOwned = ownedIds.has(sticker.id);

        return (
          <button
            className={`sticker-card ${isOwned ? 'is-owned' : ''}`}
            key={sticker.id}
            type="button"
            onClick={() => onToggleSticker(sticker.id)}
            aria-pressed={isOwned}
          >
            <span className="sticker-code">{sticker.codigo}</span>
            <span className="sticker-name">{sticker.nome}</span>
            <span className="sticker-meta">
              {sticker.grupo} / {sticker.secao}
            </span>
            <span className="sticker-status" aria-hidden="true">
              {isOwned ? <Check /> : <Circle />}
              {isOwned ? 'Tenho' : 'Falta'}
            </span>
          </button>
        );
      })}
    </section>
  );
}
