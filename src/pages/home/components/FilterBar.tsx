import type { DashboardFilters, SubjectView } from '@/types/dashboard';

interface FilterBarProps {
  filters: DashboardFilters;
  onUpdateFilter: (key: keyof DashboardFilters, value: string) => void;
  onClearFilters: () => void;
  coaches: string[];
  statuses: string[];
  weakAreas: string[];
  englishExemptionOptions: string[];
  mathsExemptionOptions: string[];
  resultCount: number;
  subject: SubjectView;
}

const diagnosticLevelOptions = [
  { value: 'all', label: 'All Diagnostic Levels' },
  { value: 'L2', label: 'L2' },
  { value: 'L1', label: 'L1' },
  { value: 'E3', label: 'E3' },
  { value: 'E2', label: 'E2' },
  { value: 'E1', label: 'E1' },
  { value: 'missing', label: 'Missing Diagnostic Result' },
  { value: 'invalid', label: 'Invalid Diagnostic Format' },
];

export default function FilterBar({
  filters, onUpdateFilter, onClearFilters,
  coaches, statuses, weakAreas, englishExemptionOptions, mathsExemptionOptions,
  resultCount, subject,
}: FilterBarProps) {
  const hasActiveFilters = filters.search || filters.coach || filters.status ||
    filters.diagnosticLevel !== 'all' || filters.weakArea ||
    filters.englishExemptionFilter || filters.mathsExemptionFilter ||
    filters.subject !== 'all';

  const activeChips: { key: string; label: string; onRemove: () => void }[] = [];

  if (filters.search) {
    activeChips.push({ key: 'search', label: `Search: "${filters.search}"`, onRemove: () => onUpdateFilter('search', '') });
  }
  if (filters.coach) {
    activeChips.push({ key: 'coach', label: `Coach: ${filters.coach}`, onRemove: () => onUpdateFilter('coach', '') });
  }
  if (filters.status) {
    activeChips.push({ key: 'status', label: `Status: ${filters.status}`, onRemove: () => onUpdateFilter('status', '') });
  }
  if (filters.diagnosticLevel !== 'all') {
    const opt = diagnosticLevelOptions.find(o => o.value === filters.diagnosticLevel);
    activeChips.push({ key: 'diagnosticLevel', label: opt?.label ?? filters.diagnosticLevel, onRemove: () => onUpdateFilter('diagnosticLevel', 'all') });
  }
  if (filters.weakArea) {
    activeChips.push({ key: 'weakArea', label: `Weak: ${filters.weakArea}`, onRemove: () => onUpdateFilter('weakArea', '') });
  }
  if (filters.englishExemptionFilter) {
    activeChips.push({ key: 'englishExemption', label: `Eng FS: ${filters.englishExemptionFilter}`, onRemove: () => onUpdateFilter('englishExemptionFilter', '') });
  }
  if (filters.mathsExemptionFilter) {
    activeChips.push({ key: 'mathsExemption', label: `Maths FS: ${filters.mathsExemptionFilter}`, onRemove: () => onUpdateFilter('mathsExemptionFilter', '') });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-foreground-400 text-sm" />
          <input
            type="text"
            placeholder="Search name or email..."
            value={filters.search}
            onChange={e => onUpdateFilter('search', e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-background-200/70 bg-background-50 text-foreground-800 placeholder:text-foreground-400 focus:outline-none focus:border-secondary-400 transition-colors"
          />
        </div>

        <select
          value={filters.coach}
          onChange={e => onUpdateFilter('coach', e.target.value)}
          className="px-3 py-2 text-sm rounded-md border border-background-200/70 bg-background-50 text-foreground-800 cursor-pointer focus:outline-none focus:border-secondary-400"
        >
          <option value="">All Coaches</option>
          {coaches.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select
          value={filters.status}
          onChange={e => onUpdateFilter('status', e.target.value)}
          className="px-3 py-2 text-sm rounded-md border border-background-200/70 bg-background-50 text-foreground-800 cursor-pointer focus:outline-none focus:border-secondary-400"
        >
          <option value="">All Statuses</option>
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select
          value={filters.diagnosticLevel}
          onChange={e => onUpdateFilter('diagnosticLevel', e.target.value)}
          className="px-3 py-2 text-sm rounded-md border border-background-200/70 bg-background-50 text-foreground-800 cursor-pointer focus:outline-none focus:border-secondary-400"
        >
          {diagnosticLevelOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        {(subject === 'all' || subject === 'english') && englishExemptionOptions.length > 0 && (
          <select
            value={filters.englishExemptionFilter}
            onChange={e => onUpdateFilter('englishExemptionFilter', e.target.value)}
            className="px-3 py-2 text-sm rounded-md border border-background-200/70 bg-background-50 text-foreground-800 cursor-pointer focus:outline-none focus:border-secondary-400"
          >
            <option value="">All English FS Status</option>
            {englishExemptionOptions.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        )}

        {(subject === 'all' || subject === 'maths') && mathsExemptionOptions.length > 0 && (
          <select
            value={filters.mathsExemptionFilter}
            onChange={e => onUpdateFilter('mathsExemptionFilter', e.target.value)}
            className="px-3 py-2 text-sm rounded-md border border-background-200/70 bg-background-50 text-foreground-800 cursor-pointer focus:outline-none focus:border-secondary-400"
          >
            <option value="">All Maths FS Status</option>
            {mathsExemptionOptions.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        )}

        <select
          value={filters.weakArea}
          onChange={e => onUpdateFilter('weakArea', e.target.value)}
          className="px-3 py-2 text-sm rounded-md border border-background-200/70 bg-background-50 text-foreground-800 cursor-pointer focus:outline-none focus:border-secondary-400"
        >
          <option value="">All Weak Areas</option>
          {weakAreas.map(a => <option key={a} value={a}>{a}</option>)}
        </select>

        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="px-3 py-2 text-sm rounded-md bg-secondary-100 text-secondary-800 hover:bg-secondary-200 transition-colors whitespace-nowrap cursor-pointer"
          >
            <i className="ri-close-line mr-1" />
            Clear Filters
          </button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-foreground-600">
          {resultCount} learner{resultCount !== 1 ? 's' : ''} found
        </span>
        {activeChips.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {activeChips.map(chip => (
              <span
                key={chip.key}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-secondary-100 text-secondary-800"
              >
                {chip.label}
                <button onClick={chip.onRemove} className="cursor-pointer hover:text-foreground-900">
                  <i className="ri-close-line text-sm" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}