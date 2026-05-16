import { RotateCcw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ExportMissingButton } from './components/ExportMissingButton';
import { StatsBar } from './components/StatsBar';
import { StickerFilters } from './components/StickerFilters';
import { StickerGrid } from './components/StickerGrid';
import stickersData from './data/stickers.json';
import type { Sticker } from './types';

const STORAGE_KEY = 'copa26-owned-stickers-v1';
const stickers: Sticker[] = [...(stickersData as Sticker[])].sort(
  (a, b) => a.ordem - b.ordem,
);

function readStoredOwnedIds() {
  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    if (!rawValue) {
      return new Set<string>();
    }

    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) {
      return new Set<string>();
    }

    return new Set(parsed.filter((id): id is string => typeof id === 'string'));
  } catch {
    return new Set<string>();
  }
}

function App() {
  const [ownedIds, setOwnedIds] = useState<Set<string>>(() => readStoredOwnedIds());
  const [query, setQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('todos');
  const [selectedSection, setSelectedSection] = useState('todas');

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...ownedIds]));
  }, [ownedIds]);

  const groups = useMemo(
    () => [...new Set(stickers.map((sticker) => sticker.grupo))],
    [],
  );

  const sections = useMemo(() => {
    const source =
      selectedGroup === 'todos'
        ? stickers
        : stickers.filter((sticker) => sticker.grupo === selectedGroup);

    return [...new Set(source.map((sticker) => sticker.secao))];
  }, [selectedGroup]);

  const filteredStickers = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('pt-BR');

    return stickers.filter((sticker) => {
      const matchesGroup =
        selectedGroup === 'todos' || sticker.grupo === selectedGroup;
      const matchesSection =
        selectedSection === 'todas' || sticker.secao === selectedSection;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        `${sticker.codigo} ${sticker.nome} ${sticker.grupo} ${sticker.secao}`
          .toLocaleLowerCase('pt-BR')
          .includes(normalizedQuery);

      return matchesGroup && matchesSection && matchesQuery;
    });
  }, [query, selectedGroup, selectedSection]);

  const missingStickers = useMemo(
    () => stickers.filter((sticker) => !ownedIds.has(sticker.id)),
    [ownedIds],
  );

  const ownedCount = stickers.length - missingStickers.length;

  function toggleSticker(id: string) {
    setOwnedIds((currentIds) => {
      const nextIds = new Set(currentIds);
      if (nextIds.has(id)) {
        nextIds.delete(id);
      } else {
        nextIds.add(id);
      }
      return nextIds;
    });
  }

  function handleGroupChange(group: string) {
    setSelectedGroup(group);
    setSelectedSection('todas');
  }

  function clearProgress() {
    const shouldClear = window.confirm(
      'Tem certeza que deseja limpar todas as figurinhas marcadas como tenho?',
    );
    if (shouldClear) {
      setOwnedIds(new Set());
    }
  }

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Copa 2026</p>
          <h1>Controle de figurinhas</h1>
          <p className="hero-copy">
            Marque o que já entrou no álbum, filtre por seleção e gere uma lista
            em PDF com tudo que ainda falta.
          </p>
        </div>

        <div className="hero-actions">
          <ExportMissingButton missingStickers={missingStickers} total={stickers.length} />
          <button
            className="secondary-action"
            type="button"
            onClick={clearProgress}
            disabled={ownedIds.size === 0}
          >
            <RotateCcw aria-hidden="true" />
            Limpar progresso
          </button>
        </div>
      </section>

      <StatsBar total={stickers.length} owned={ownedCount} missing={missingStickers.length} />

      <StickerFilters
        query={query}
        selectedGroup={selectedGroup}
        selectedSection={selectedSection}
        groups={groups}
        sections={sections}
        onQueryChange={setQuery}
        onGroupChange={handleGroupChange}
        onSectionChange={setSelectedSection}
      />

      <section className="list-header">
        <div>
          <h2>Figurinhas</h2>
          <p>
            {filteredStickers.length} resultado{filteredStickers.length === 1 ? '' : 's'}
          </p>
        </div>
      </section>

      <StickerGrid
        stickers={filteredStickers}
        ownedIds={ownedIds}
        onToggleSticker={toggleSticker}
      />
    </main>
  );
}

export default App;
