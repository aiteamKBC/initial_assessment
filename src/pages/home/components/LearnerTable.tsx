import type {
  LearnerRecord,
  SubjectView,
  SupportRequired,
  DashboardSortField,
  SortDirection,
} from '@/types/dashboard';
import {
  getSupportRequired,
  needsEnglishSkillsDevSupport,
  needsMathsSkillsDevSupport,
  getWeakestEnglishArea,
  getWeakestMathsArea,
  getOverallWeakestArea,
} from '@/utils/dataProcessor';

interface LearnerTableProps {
  learners: LearnerRecord[];
  allFiltered: LearnerRecord[];
  subject: SubjectView;
  sortField: DashboardSortField;
  sortDirection: SortDirection;
  onSort: (field: DashboardSortField) => void;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onSelectLearner: (learner: LearnerRecord) => void;
  onExport: () => void;
  onClearFilters?: () => void;
}

function SortIcon({ field, currentField, direction }: { field: DashboardSortField; currentField: DashboardSortField; direction: SortDirection }) {
  if (field !== currentField) {
    return <i className="ri-expand-up-down-fill text-xs text-foreground-400 ml-1" />;
  }
  return (
    <i className={`text-xs ml-1 ${direction === 'asc' ? 'ri-sort-asc' : 'ri-sort-desc'} text-foreground-700`} />
  );
}

function DiagnosticBadge({ displayLevel, category, format }: { displayLevel: string; category: string; format: string }) {
  if (format === 'missing') {
    return <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-secondary-100 text-foreground-600 font-medium">Missing</span>;
  }
  if (format === 'invalid') {
    return <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-foreground-100 text-foreground-600 font-medium">Invalid</span>;
  }
  const isBelowL2 = category === 'E1' || category === 'E2' || category === 'E3' || category === 'L1';
  if (isBelowL2) {
    return <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-red-50 text-red-700 font-medium">{displayLevel}</span>;
  }
  return <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-green-50 text-green-700 font-medium">{displayLevel}</span>;
}

function SupportBadge({ support }: { support: SupportRequired }) {
  switch (support) {
    case 'English Support Required':
      return <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-red-50 text-red-700 font-medium">English</span>;
    case 'Maths Support Required':
      return <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-red-50 text-red-700 font-medium">Maths</span>;
    case 'English and Maths Support Required':
      return <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-red-50 text-red-700 font-medium">English &amp; Maths</span>;
    case 'Missing Diagnostic Result':
      return <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-secondary-100 text-foreground-600 font-medium">Missing</span>;
    case 'Invalid Diagnostic Format':
      return <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-foreground-100 text-foreground-600 font-medium">Invalid</span>;
    default:
      return <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-green-50 text-green-700 font-medium">None</span>;
  }
}

function getRowBg(learner: LearnerRecord): string {
  const support = getSupportRequired(learner);
  if (support === 'English Support Required' || support === 'Maths Support Required' || support === 'English and Maths Support Required') {
    return 'bg-red-50/40';
  }
  if (support === 'Missing Diagnostic Result' || support === 'Invalid Diagnostic Format') {
    return 'bg-secondary-50/40';
  }
  return '';
}

function AllSubjectsColumns({ learner, onSelect }: { learner: LearnerRecord; onSelect: (l: LearnerRecord) => void }) {
  const overall = getOverallWeakestArea(learner);
  const weakestLabel = overall ? `${overall.label}, ${overall.subject} (${overall.displayLevel})` : 'No Data';

  return (
    <>
      <td className="px-4 py-2.5 text-sm font-medium text-foreground-800 whitespace-nowrap">{learner.learnerName || '—'}</td>
      <td className="px-4 py-2.5 text-sm text-foreground-600 whitespace-nowrap">{learner.email || '—'}</td>
      <td className="px-4 py-2.5 text-sm text-foreground-600 whitespace-nowrap">{learner.coachName || '—'}</td>
      <td className="px-4 py-2.5 text-sm text-foreground-600 whitespace-nowrap">{learner.status || '—'}</td>
      <td className="px-4 py-2.5">
        <DiagnosticBadge displayLevel={learner.englishDiagnosticLevel.displayLevel} category={learner.englishDiagnosticLevel.category} format={learner.englishDiagnosticLevel.format} />
      </td>
      <td className="px-4 py-2.5">
        <DiagnosticBadge displayLevel={learner.mathsDiagnosticLevel.displayLevel} category={learner.mathsDiagnosticLevel.category} format={learner.mathsDiagnosticLevel.format} />
      </td>
      <td className="px-4 py-2.5 text-sm whitespace-nowrap">
        {learner.englishFunctionalSkillsStatus
          ? <span className="text-blue-600 text-xs">{learner.englishFunctionalSkillsStatus}</span>
          : <span className="text-foreground-400 text-xs">Missing</span>}
      </td>
      <td className="px-4 py-2.5 text-sm whitespace-nowrap">
        {learner.mathsFunctionalSkillsStatus
          ? <span className="text-blue-600 text-xs">{learner.mathsFunctionalSkillsStatus}</span>
          : <span className="text-foreground-400 text-xs">Missing</span>}
      </td>
      <td className="px-4 py-2.5"><SupportBadge support={getSupportRequired(learner)} /></td>
      <td className="px-4 py-2.5 text-sm text-foreground-600 max-w-[180px] truncate" title={weakestLabel}>{weakestLabel}</td>
      <td className="px-4 py-2.5">
        <button
          onClick={() => onSelect(learner)}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-md bg-secondary-100 text-secondary-800 hover:bg-secondary-200 transition-colors whitespace-nowrap cursor-pointer"
        >
          <i className="ri-eye-line" /> View
        </button>
      </td>
    </>
  );
}

function EnglishColumns({ learner, onSelect }: { learner: LearnerRecord; onSelect: (l: LearnerRecord) => void }) {
  const engWeak = getWeakestEnglishArea(learner);
  const weakestLabel = engWeak ? `${engWeak.label} (${engWeak.displayLevel})` : 'No Data';

  return (
    <>
      <td className="px-4 py-2.5 text-sm font-medium text-foreground-800 whitespace-nowrap">{learner.learnerName || '—'}</td>
      <td className="px-4 py-2.5 text-sm text-foreground-600 whitespace-nowrap">{learner.email || '—'}</td>
      <td className="px-4 py-2.5 text-sm text-foreground-600 whitespace-nowrap">{learner.coachName || '—'}</td>
      <td className="px-4 py-2.5 text-sm text-foreground-600 whitespace-nowrap">{learner.status || '—'}</td>
      <td className="px-4 py-2.5">
        <DiagnosticBadge displayLevel={learner.englishDiagnosticLevel.displayLevel} category={learner.englishDiagnosticLevel.category} format={learner.englishDiagnosticLevel.format} />
      </td>
      <td className="px-4 py-2.5 text-sm whitespace-nowrap">
        {learner.englishFunctionalSkillsStatus
          ? <span className="text-blue-600 text-xs">{learner.englishFunctionalSkillsStatus}</span>
          : <span className="text-foreground-400 text-xs">Missing</span>}
      </td>
      <td className="px-4 py-2.5">
        {learner.englishDiagnosticLevel.format === 'valid' ? (
          needsEnglishSkillsDevSupport(learner) ? (
            <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-red-50 text-red-700 font-medium">Required</span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-green-50 text-green-700 font-medium">Not Required</span>
          )
        ) : learner.englishDiagnosticLevel.format === 'invalid' ? (
          <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-foreground-100 text-foreground-600 font-medium">Invalid</span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-secondary-100 text-foreground-600 font-medium">Missing</span>
        )}
      </td>
      <td className="px-4 py-2.5 text-sm text-foreground-600 max-w-[180px] truncate" title={weakestLabel}>{weakestLabel}</td>
      <td className="px-4 py-2.5">
        <button
          onClick={() => onSelect(learner)}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-md bg-secondary-100 text-secondary-800 hover:bg-secondary-200 transition-colors whitespace-nowrap cursor-pointer"
        >
          <i className="ri-eye-line" /> View
        </button>
      </td>
    </>
  );
}

function MathsColumns({ learner, onSelect }: { learner: LearnerRecord; onSelect: (l: LearnerRecord) => void }) {
  const matWeak = getWeakestMathsArea(learner);
  const weakestLabel = matWeak ? `${matWeak.label} (${matWeak.displayLevel})` : 'No Data';

  return (
    <>
      <td className="px-4 py-2.5 text-sm font-medium text-foreground-800 whitespace-nowrap">{learner.learnerName || '—'}</td>
      <td className="px-4 py-2.5 text-sm text-foreground-600 whitespace-nowrap">{learner.email || '—'}</td>
      <td className="px-4 py-2.5 text-sm text-foreground-600 whitespace-nowrap">{learner.coachName || '—'}</td>
      <td className="px-4 py-2.5 text-sm text-foreground-600 whitespace-nowrap">{learner.status || '—'}</td>
      <td className="px-4 py-2.5">
        <DiagnosticBadge displayLevel={learner.mathsDiagnosticLevel.displayLevel} category={learner.mathsDiagnosticLevel.category} format={learner.mathsDiagnosticLevel.format} />
      </td>
      <td className="px-4 py-2.5 text-sm whitespace-nowrap">
        {learner.mathsFunctionalSkillsStatus
          ? <span className="text-blue-600 text-xs">{learner.mathsFunctionalSkillsStatus}</span>
          : <span className="text-foreground-400 text-xs">Missing</span>}
      </td>
      <td className="px-4 py-2.5">
        {learner.mathsDiagnosticLevel.format === 'valid' ? (
          needsMathsSkillsDevSupport(learner) ? (
            <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-red-50 text-red-700 font-medium">Required</span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-green-50 text-green-700 font-medium">Not Required</span>
          )
        ) : learner.mathsDiagnosticLevel.format === 'invalid' ? (
          <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-foreground-100 text-foreground-600 font-medium">Invalid</span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-secondary-100 text-foreground-600 font-medium">Missing</span>
        )}
      </td>
      <td className="px-4 py-2.5 text-sm text-foreground-600 max-w-[180px] truncate" title={weakestLabel}>{weakestLabel}</td>
      <td className="px-4 py-2.5">
        <button
          onClick={() => onSelect(learner)}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-md bg-secondary-100 text-secondary-800 hover:bg-secondary-200 transition-colors whitespace-nowrap cursor-pointer"
        >
          <i className="ri-eye-line" /> View
        </button>
      </td>
    </>
  );
}

export default function LearnerTable({
  learners, allFiltered, subject, sortField, sortDirection, onSort,
  currentPage, totalPages, pageSize, onPageChange, onPageSizeChange,
  onSelectLearner, onExport, onClearFilters,
}: LearnerTableProps) {
  const pageNumbers: number[] = [];
  const maxVisible = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  const endPage = Math.min(totalPages, startPage + maxVisible - 1);
  if (endPage - startPage + 1 < maxVisible) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  const SortHeader = ({ field, label }: { field: DashboardSortField; label: string }) => (
    <th
      className="px-4 py-2.5 text-left text-xs font-medium text-foreground-600 uppercase tracking-wider cursor-pointer hover:text-foreground-800 transition-colors whitespace-nowrap"
      onClick={() => onSort(field)}
    >
      <span className="inline-flex items-center">
        {label}
        <SortIcon field={field} currentField={sortField} direction={sortDirection} />
      </span>
    </th>
  );

  if (allFiltered.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-foreground-600 mb-3">No learners match the selected filters.</p>
        {onClearFilters && (
          <button
            onClick={onClearFilters}
            className="px-4 py-2 text-sm rounded-md bg-secondary-100 text-secondary-800 hover:bg-secondary-200 transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-sm text-foreground-600">
            Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, allFiltered.length)} of {allFiltered.length}
          </span>
          <select
            value={pageSize}
            onChange={e => { onPageSizeChange(Number(e.target.value)); onPageChange(1); }}
            className="px-2 py-1 text-xs rounded border border-background-200/70 bg-background-50 text-foreground-700 cursor-pointer"
          >
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>
        <button
          onClick={onExport}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-secondary-100 text-secondary-800 hover:bg-secondary-200 transition-colors whitespace-nowrap cursor-pointer"
        >
          <i className="ri-download-line" />
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto border border-background-200/70 rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="bg-background-100 border-b border-background-200/70">
              {subject === 'all' && (
                <>
                  <SortHeader field="learnerName" label="Learner Name" />
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-foreground-600 uppercase tracking-wider">Email</th>
                  <SortHeader field="coachName" label="Coach" />
                  <SortHeader field="status" label="Status" />
                  <SortHeader field="englishDiagnosticLevel" label="English Diag Level" />
                  <SortHeader field="mathsDiagnosticLevel" label="Maths Diag Level" />
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-foreground-600 uppercase tracking-wider">Eng FS Status</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-foreground-600 uppercase tracking-wider">Maths FS Status</th>
                  <SortHeader field="supportRequired" label="Skills Dev Support" />
                  <SortHeader field="weakestArea" label="Weakest Area" />
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-foreground-600 uppercase tracking-wider">Action</th>
                </>
              )}
              {subject === 'english' && (
                <>
                  <SortHeader field="learnerName" label="Learner Name" />
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-foreground-600 uppercase tracking-wider">Email</th>
                  <SortHeader field="coachName" label="Coach" />
                  <SortHeader field="status" label="Status" />
                  <SortHeader field="englishDiagnosticLevel" label="English Diag Level" />
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-foreground-600 uppercase tracking-wider">FS Status</th>
                  <SortHeader field="supportRequired" label="Skills Dev Support" />
                  <SortHeader field="weakestArea" label="Weakest Area" />
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-foreground-600 uppercase tracking-wider">Action</th>
                </>
              )}
              {subject === 'maths' && (
                <>
                  <SortHeader field="learnerName" label="Learner Name" />
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-foreground-600 uppercase tracking-wider">Email</th>
                  <SortHeader field="coachName" label="Coach" />
                  <SortHeader field="status" label="Status" />
                  <SortHeader field="mathsDiagnosticLevel" label="Maths Diag Level" />
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-foreground-600 uppercase tracking-wider">FS Status</th>
                  <SortHeader field="supportRequired" label="Skills Dev Support" />
                  <SortHeader field="weakestArea" label="Weakest Area" />
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-foreground-600 uppercase tracking-wider">Action</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {learners.map(learner => (
              <tr key={learner.email || `${learner.learnerName}-${learner.coachName}`} className={`border-b border-background-200/40 ${getRowBg(learner)}`}>
                {subject === 'all' && <AllSubjectsColumns learner={learner} onSelect={onSelectLearner} />}
                {subject === 'english' && <EnglishColumns learner={learner} onSelect={onSelectLearner} />}
                {subject === 'maths' && <MathsColumns learner={learner} onSelect={onSelectLearner} />}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 mt-4">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-2 py-1 text-sm rounded hover:bg-background-100 disabled:opacity-30 cursor-pointer disabled:cursor-default transition-colors"
          >
            <i className="ri-arrow-left-s-line" />
          </button>
          {startPage > 1 && (
            <>
              <button onClick={() => onPageChange(1)} className="px-2.5 py-1 text-sm rounded hover:bg-background-100 cursor-pointer transition-colors">1</button>
              {startPage > 2 && <span className="px-1 text-foreground-400">…</span>}
            </>
          )}
          {pageNumbers.map(p => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`px-2.5 py-1 text-sm rounded cursor-pointer transition-colors ${p === currentPage ? 'bg-primary-500 text-white' : 'hover:bg-background-100'}`}
            >
              {p}
            </button>
          ))}
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="px-1 text-foreground-400">…</span>}
              <button onClick={() => onPageChange(totalPages)} className="px-2.5 py-1 text-sm rounded hover:bg-background-100 cursor-pointer transition-colors">{totalPages}</button>
            </>
          )}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-2 py-1 text-sm rounded hover:bg-background-100 disabled:opacity-30 cursor-pointer disabled:cursor-default transition-colors"
          >
            <i className="ri-arrow-right-s-line" />
          </button>
        </div>
      )}
    </div>
  );
}