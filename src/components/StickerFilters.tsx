import { Search } from 'lucide-react';

type StickerFiltersProps = {
  query: string;
  selectedGroup: string;
  selectedSection: string;
  groups: string[];
  sections: string[];
  onQueryChange: (query: string) => void;
  onGroupChange: (group: string) => void;
  onSectionChange: (section: string) => void;
};

export function StickerFilters({
  query,
  selectedGroup,
  selectedSection,
  groups,
  sections,
  onQueryChange,
  onGroupChange,
  onSectionChange,
}: StickerFiltersProps) {
  return (
    <section className="filters" aria-label="Filtros de figurinhas">
      <label className="search-field">
        <Search aria-hidden="true" />
        <input
          type="search"
          placeholder="Buscar código, país ou figurinha"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </label>

      <label>
        <span>Grupo</span>
        <select
          value={selectedGroup}
          onChange={(event) => onGroupChange(event.target.value)}
        >
          <option value="todos">Todos</option>
          {groups.map((group) => (
            <option key={group} value={group}>
              {group}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span>Seção</span>
        <select
          value={selectedSection}
          onChange={(event) => onSectionChange(event.target.value)}
        >
          <option value="todas">Todas</option>
          {sections.map((section) => (
            <option key={section} value={section}>
              {section}
            </option>
          ))}
        </select>
      </label>
    </section>
  );
}
