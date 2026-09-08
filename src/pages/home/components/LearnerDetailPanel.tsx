import type { LearnerRecord } from '@/types/dashboard';
import { getSupportRequired, needsEnglishSkillsDevSupport, needsMathsSkillsDevSupport, getWeakestEnglishArea, getWeakestMathsArea } from '@/utils/dataProcessor';
import { ENGLISH_DIAGNOSTIC_FIELDS, MATHS_DIAGNOSTIC_FIELDS, MAIN_ENGLISH_GROUPS, MAIN_MATHS_GROUPS } from '@/types/dashboard';
import type { ParsedDiagnosticLevel } from '@/utils/csvParser';
import { useState } from 'react';

interface LearnerDetailPanelProps {
  learner: LearnerRecord;
  onClose: () => void;
}

function LevelBar({ label, level }: { label: string; level: ParsedDiagnosticLevel }) {
  const isLow = level.format === 'valid' && ['E1', 'E2', 'E3', 'L1'].includes(level.category);

  if (level.format === 'missing') {
    return (
      <div className="flex items-center gap-3">
        <span className="text-xs text-foreground-700 w-36 flex-shrink-0 truncate">{label}</span>
        <div className="flex-1 h-2 bg-background-200 rounded-full overflow-hidden">
          <div className="h-full rounded-full w-0" />
        </div>
        <span className="text-xs text-foreground-400 w-16 text-right">No Data</span>
      </div>
    );
  }

  if (level.format === 'invalid') {
    return (
      <div className="flex items-center gap-3">
        <span className="text-xs text-foreground-700 w-36 flex-shrink-0 truncate">{label}</span>
        <div className="flex-1 h-2 bg-background-200 rounded-full overflow-hidden">
          <div className="h-full rounded-full w-0" />
        </div>
        <span className="text-xs text-foreground-500 w-16 text-right">Invalid</span>
      </div>
    );
  }

  const rankMap: Record<string, number> = { E1: 1, E2: 2, E3: 3, L1: 4, L2: 5 };
  const rank = rankMap[level.category] || 0;
  const pct = (rank / 5) * 100;

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-foreground-700 w-36 flex-shrink-0 truncate">{label}</span>
      <div className="flex-1 h-2 bg-background-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${isLow ? 'bg-red-400' : 'bg-primary-400'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-xs font-medium w-16 text-right ${isLow ? 'text-red-600' : 'text-foreground-700'}`}>
        {level.displayLevel}
      </span>
    </div>
  );
}

function DiagnosticGroup({ title, fields, areaLevels, fieldMap }: {
  title: string;
  fields: string[];
  areaLevels: Record<string, ParsedDiagnosticLevel>;
  fieldMap: { key: string; label: string }[];
}) {
  const groupFields = fieldMap.filter(f => fields.includes(f.key));

  return (
    <div className="mb-4">
      <h4 className="text-xs font-semibold text-foreground-800 mb-2 uppercase tracking-wider">{title}</h4>
      <div className="space-y-2">
        {groupFields.map(f => (
          <LevelBar key={f.key} label={f.label} level={areaLevels[f.key] ?? { displayLevel: '', category: '', format: 'missing' }} />
        ))}
      </div>
    </div>
  );
}

function categoryLabel(category: string): string {
  switch (category) {
    case 'L2': return 'Level 2';
    case 'L1': return 'Level 1';
    case 'E3': return 'Entry Level 3';
    case 'E2': return 'Entry Level 2';
    case 'E1': return 'Entry Level 1';
    default: return '';
  }
}

export default function LearnerDetailPanel({ learner, onClose }: LearnerDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<'english' | 'maths'>('english');
  const support = getSupportRequired(learner);
  const engWeak = getWeakestEnglishArea(learner);
  const matWeak = getWeakestMathsArea(learner);

  const engFieldMap = ENGLISH_DIAGNOSTIC_FIELDS.map(f => ({ key: f.key, label: f.label }));
  const matFieldMap = MATHS_DIAGNOSTIC_FIELDS.map(f => ({ key: f.key, label: f.label }));

  const engAreaLevels = learner.englishAreaLevels as unknown as Record<string, ParsedDiagnosticLevel>;
  const matAreaLevels = learner.mathsAreaLevels as unknown as Record<string, ParsedDiagnosticLevel>;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-background-50 z-50 overflow-y-auto">
        <div className="sticky top-0 bg-background-50 border-b border-background-200/70 px-5 py-4 flex items-center justify-between z-10">
          <h3 className="text-base font-heading font-semibold text-foreground-900">{learner.learnerName || 'Unknown Learner'}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-background-100 cursor-pointer transition-colors">
            <i className="ri-close-line text-xl text-foreground-600" />
          </button>
        </div>

        <div className="px-5 py-4">
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div>
              <span className="text-xs text-foreground-500">Email</span>
              <p className="text-sm text-foreground-800 font-medium">{learner.email || '—'}</p>
            </div>
            <div>
              <span className="text-xs text-foreground-500">Coach</span>
              <p className="text-sm text-foreground-800 font-medium">{learner.coachName || '—'}</p>
            </div>
            <div>
              <span className="text-xs text-foreground-500">Status</span>
              <p className="text-sm text-foreground-800 font-medium">{learner.status || '—'}</p>
            </div>
            <div>
              <span className="text-xs text-foreground-500">Skills Dev Support</span>
              <p className={`text-sm font-medium ${
                support === 'English Support Required' || support === 'Maths Support Required' || support === 'English and Maths Support Required'
                  ? 'text-red-600'
                  : support === 'Missing Diagnostic Result' || support === 'Invalid Diagnostic Format' ? 'text-foreground-600' : 'text-green-600'
              }`}>{support}</p>
            </div>
          </div>

          <div className="flex border-b border-background-200/70 mb-4">
            <button
              onClick={() => setActiveTab('english')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'english' ? 'border-primary-500 text-primary-700' : 'border-transparent text-foreground-500 hover:text-foreground-700'
              }`}
            >
              English Details
            </button>
            <button
              onClick={() => setActiveTab('maths')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'maths' ? 'border-primary-500 text-primary-700' : 'border-transparent text-foreground-500 hover:text-foreground-700'
              }`}
            >
              Maths Details
            </button>
          </div>

          {activeTab === 'english' && (
            <div>
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-background-100 rounded-lg p-3">
                  <span className="text-xs text-foreground-500">Diagnostic Level</span>
                  <p className="text-lg font-heading font-semibold text-foreground-900">
                    {learner.englishDiagnosticLevel.format === 'valid' ? learner.englishDiagnosticLevel.displayLevel : 'Missing'}
                  </p>
                </div>
                <div className="bg-background-100 rounded-lg p-3">
                  <span className="text-xs text-foreground-500">FS Status</span>
                  <p className={`text-sm font-semibold ${learner.englishFunctionalSkillsStatus ? 'text-blue-600' : 'text-foreground-400'}`}>
                    {learner.englishFunctionalSkillsStatus || 'None'}
                  </p>
                </div>
                <div className="bg-background-100 rounded-lg p-3">
                  <span className="text-xs text-foreground-500">Lowest Area</span>
                  <p className="text-sm font-semibold text-foreground-800">
                    {engWeak ? `${engWeak.label} (${engWeak.displayLevel})` : 'No Data'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-background-100 rounded-lg p-3">
                  <span className="text-xs text-foreground-500">Category</span>
                  <p className="text-sm font-semibold text-foreground-800">{categoryLabel(learner.englishDiagnosticLevel.category) || '—'}</p>
                </div>
                <div className="bg-background-100 rounded-lg p-3">
                  <span className="text-xs text-foreground-500">Skills Dev Support</span>
                  <p className={`text-sm font-semibold ${needsEnglishSkillsDevSupport(learner) ? 'text-red-600' : learner.englishDiagnosticLevel.format === 'valid' ? 'text-green-600' : 'text-foreground-500'}`}>
                    {learner.englishDiagnosticLevel.format === 'valid'
                      ? (needsEnglishSkillsDevSupport(learner) ? 'Required' : 'Not Required')
                      : learner.englishDiagnosticLevel.format === 'invalid' ? 'Invalid Format' : 'Missing'}
                  </p>
                </div>
              </div>

              <DiagnosticGroup title="Reading" fields={['readingText', 'readingWord']} areaLevels={engAreaLevels} fieldMap={engFieldMap} />
              <DiagnosticGroup title="Spelling, Punctuation and Grammar" fields={['spelling', 'punctuation', 'grammar']} areaLevels={engAreaLevels} fieldMap={engFieldMap} />
              <DiagnosticGroup title="Writing" fields={['writingText']} areaLevels={engAreaLevels} fieldMap={engFieldMap} />

              <div className="mt-4 pt-4 border-t border-background-200/70">
                <h4 className="text-xs font-semibold text-foreground-800 mb-2 uppercase tracking-wider">Main Groups</h4>
                <div className="space-y-2">
                  <LevelBar label="Reading" level={learner.englishAreaLevels.reading} />
                  <LevelBar label="Spelling, Punctuation &amp; Grammar" level={learner.englishAreaLevels.spag} />
                  <LevelBar label="Writing" level={learner.englishAreaLevels.writing} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'maths' && (
            <div>
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-background-100 rounded-lg p-3">
                  <span className="text-xs text-foreground-500">Diagnostic Level</span>
                  <p className="text-lg font-heading font-semibold text-foreground-900">
                    {learner.mathsDiagnosticLevel.format === 'valid' ? learner.mathsDiagnosticLevel.displayLevel : 'Missing'}
                  </p>
                </div>
                <div className="bg-background-100 rounded-lg p-3">
                  <span className="text-xs text-foreground-500">FS Status</span>
                  <p className={`text-sm font-semibold ${learner.mathsFunctionalSkillsStatus ? 'text-blue-600' : 'text-foreground-400'}`}>
                    {learner.mathsFunctionalSkillsStatus || 'None'}
                  </p>
                </div>
                <div className="bg-background-100 rounded-lg p-3">
                  <span className="text-xs text-foreground-500">Lowest Area</span>
                  <p className="text-sm font-semibold text-foreground-800">
                    {matWeak ? `${matWeak.label} (${matWeak.displayLevel})` : 'No Data'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-background-100 rounded-lg p-3">
                  <span className="text-xs text-foreground-500">Category</span>
                  <p className="text-sm font-semibold text-foreground-800">{categoryLabel(learner.mathsDiagnosticLevel.category) || '—'}</p>
                </div>
                <div className="bg-background-100 rounded-lg p-3">
                  <span className="text-xs text-foreground-500">Skills Dev Support</span>
                  <p className={`text-sm font-semibold ${needsMathsSkillsDevSupport(learner) ? 'text-red-600' : learner.mathsDiagnosticLevel.format === 'valid' ? 'text-green-600' : 'text-foreground-500'}`}>
                    {learner.mathsDiagnosticLevel.format === 'valid'
                      ? (needsMathsSkillsDevSupport(learner) ? 'Required' : 'Not Required')
                      : learner.mathsDiagnosticLevel.format === 'invalid' ? 'Invalid Format' : 'Missing'}
                  </p>
                </div>
              </div>

              <DiagnosticGroup title="Number" fields={['wholeNumbers', 'calculations', 'fdpRatio']} areaLevels={matAreaLevels} fieldMap={matFieldMap} />
              <DiagnosticGroup title="Measure, Shape and Space" fields={['measure', 'shape']} areaLevels={matAreaLevels} fieldMap={matFieldMap} />
              <DiagnosticGroup title="Statistics and Data" fields={['handlingInfo', 'statistics']} areaLevels={matAreaLevels} fieldMap={matFieldMap} />

              <div className="mt-4 pt-4 border-t border-background-200/70">
                <h4 className="text-xs font-semibold text-foreground-800 mb-2 uppercase tracking-wider">Main Groups</h4>
                <div className="space-y-2">
                  <LevelBar label="Number" level={learner.mathsAreaLevels.number} />
                  <LevelBar label="Measure, Shape &amp; Space" level={learner.mathsAreaLevels.mss} />
                  <LevelBar label="Statistics &amp; Data" level={learner.mathsAreaLevels.statsData} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}