import type { KpiFilterType, FsSubject, FsKpiData } from '@/hooks/useDashboardData';
import type { SubjectView } from '@/types/dashboard';

interface KpiCardsProps {
  totalLearners: number;
  l2Both: number;
  belowL2Either: number;
  belowL2Both: number;
  entryEither: number;
  missing: number;
  activeKpi: KpiFilterType;
  onKpiClick: (type: string) => void;
  fsKpiData: FsKpiData;
  fsSubject: FsSubject;
  onFsSubjectChange: (s: FsSubject) => void;
  onFsKpiClick: (type: 'exempt' | 'optOut' | 'notExempt') => void;
  subject: SubjectView;
}

export default function KpiCards({
  totalLearners, l2Both, belowL2Either, belowL2Both,
  entryEither, missing, activeKpi, onKpiClick,
  fsKpiData, fsSubject, onFsSubjectChange, onFsKpiClick, subject,
}: KpiCardsProps) {
  const diagCards = [
    {
      type: 'total' as const,
      label: 'Total Learners',
      value: totalLearners,
      description: null,
      color: 'text-foreground-900',
      bg: 'bg-background-100',
      border: 'border-background-200/70',
    },
    {
      type: 'l2-both' as const,
      label: 'L2+ in Both Subjects',
      value: l2Both,
      description: null,
      color: 'text-green-700',
      bg: 'bg-green-50',
      border: 'border-green-200',
    },
    {
      type: 'below-l2-either' as const,
      label: 'Below L2 in Either Subject',
      value: belowL2Either,
      description: 'Skills development support required',
      color: 'text-red-700',
      bg: 'bg-red-50',
      border: 'border-red-200',
    },
    {
      type: 'below-l2-both' as const,
      label: 'Below L2 in Both Subjects',
      value: belowL2Both,
      description: null,
      color: 'text-red-700',
      bg: 'bg-red-50',
      border: 'border-red-200',
    },
    {
      type: 'entry-either' as const,
      label: 'Entry Level in Either Subject',
      value: entryEither,
      description: null,
      color: 'text-red-700',
      bg: 'bg-red-50',
      border: 'border-red-200',
    },
    {
      type: 'missing' as const,
      label: 'Missing IA Scores',
      value: missing,
      description: null,
      color: 'text-foreground-600',
      bg: 'bg-secondary-50',
      border: 'border-secondary-200',
    },
  ];

  const fsCards = [
    {
      type: 'exempt' as const,
      label: 'Exempt (FS)',
      value: fsKpiData.exempt,
    },
    {
      type: 'optOut' as const,
      label: 'OptOut (FS)',
      value: fsKpiData.optOut,
    },
    {
      type: 'notExempt' as const,
      label: 'Not Exempt (FS)',
      value: fsKpiData.notExempt,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {diagCards.map(card => {
          const isActive = activeKpi === card.type || (activeKpi === 'all' && card.type === 'total');

          return (
            <button
              key={card.type}
              onClick={() => onKpiClick(card.type)}
              className={`flex flex-col items-start p-4 rounded-lg border ${card.border} ${card.bg} hover:opacity-80 transition-opacity cursor-pointer text-left ${isActive ? 'ring-2 ring-offset-1 ring-primary-400' : ''}`}
            >
              <span className="text-xs font-medium text-foreground-600 mb-1">{card.label}</span>
              <span className={`text-2xl font-heading font-semibold ${card.color}`}>{card.value}</span>
              {card.description && (
                <span className="text-[10px] text-foreground-500 mt-1 leading-tight">{card.description}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Functional Skills row */}
      <div>
        {subject === 'all' && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-foreground-600">Functional Skills subject:</span>
            <div className="inline-flex rounded-full bg-background-100 border border-background-200/70 p-0.5">
              <button
                onClick={() => onFsSubjectChange('english')}
                className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors cursor-pointer whitespace-nowrap ${fsSubject === 'english' ? 'bg-primary-500 text-white' : 'text-foreground-600 hover:text-foreground-800'}`}
              >
                English
              </button>
              <button
                onClick={() => onFsSubjectChange('maths')}
                className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors cursor-pointer whitespace-nowrap ${fsSubject === 'maths' ? 'bg-primary-500 text-white' : 'text-foreground-600 hover:text-foreground-800'}`}
              >
                Maths
              </button>
            </div>
          </div>
        )}
        <div className="grid grid-cols-3 gap-3">
          {fsCards.map(card => (
            <button
              key={card.type}
              onClick={() => onFsKpiClick(card.type)}
              className="flex flex-col items-start p-4 rounded-lg border border-blue-200 bg-blue-50 hover:opacity-80 transition-opacity cursor-pointer text-left"
            >
              <span className="text-xs font-medium text-foreground-600 mb-1">{card.label}</span>
              <span className="text-xl font-heading font-semibold text-blue-700">{card.value}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}