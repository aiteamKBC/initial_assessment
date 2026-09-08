import { useMemo, useState } from 'react';
import type { LearnerRecord, ChartSubjectSwitch, DiagnosticLevelFilter } from '@/types/dashboard';
import {
  needsEnglishSkillsDevSupport,
  needsMathsSkillsDevSupport,
  needsEitherSkillsDevSupport,
  needsBothSkillsDevSupport,
  getWeakestEnglishArea,
  getWeakestMathsArea,
} from '@/utils/dataProcessor';
import { ENGLISH_DIAGNOSTIC_FIELDS, MATHS_DIAGNOSTIC_FIELDS } from '@/types/dashboard';
import type { ParsedDiagnosticLevel } from '@/utils/csvParser';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface ChartsSectionProps {
  learners: LearnerRecord[];
  onDiagnosticLevelClick: (level: DiagnosticLevelFilter) => void;
  onCoachClick: (coach: string) => void;
  onWeakAreaClick: (area: string) => void;
}

const DIAG_COLORS: Record<string, string> = {
  L2: '#22c55e',
  L1: '#ef4444',
  E3: '#f97316',
  E2: '#eab308',
  E1: '#dc2626',
  Missing: '#9ca3af',
  Invalid: '#6b7280',
};

const FS_COLORS: Record<string, string> = {
  Exempt: '#3b82f6',
  OptOut: '#8b5cf6',
  NotExempt: '#10b981',
};

const BAR_COLOR = '#f87171';

export default function ChartsSection({ learners, onDiagnosticLevelClick, onCoachClick, onWeakAreaClick }: ChartsSectionProps) {
  const [coachSubject, setCoachSubject] = useState<ChartSubjectSwitch>('any');
  const [weakSubject, setWeakSubject] = useState<'english' | 'maths'>('english');
  const [diagSubject, setDiagSubject] = useState<'english' | 'maths'>('english');
  const [fsSubject, setFsSubject] = useState<'english' | 'maths'>('english');

  // ---- Chart 1: Learners by Diagnostic Level ----
  const diagDonutData = useMemo(() => {
    const counts: Record<string, number> = { L2: 0, L1: 0, E3: 0, E2: 0, E1: 0, Missing: 0, Invalid: 0 };
    learners.forEach(l => {
      const dl = diagSubject === 'english' ? l.englishDiagnosticLevel : l.mathsDiagnosticLevel;
      if (dl.format === 'valid') {
        const cat = dl.category;
        if (counts[cat] !== undefined) counts[cat]++;
      } else if (dl.format === 'invalid') {
        counts.Invalid++;
      } else {
        counts.Missing++;
      }
    });
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value, color: DIAG_COLORS[name] || '#9ca3af' }));
  }, [learners, diagSubject]);

  const handleDiagClick = (entry: { name: string }) => {
    switch (entry.name) {
      case 'L2': onDiagnosticLevelClick('L2'); break;
      case 'L1': onDiagnosticLevelClick('L1'); break;
      case 'E3': onDiagnosticLevelClick('E3'); break;
      case 'E2': onDiagnosticLevelClick('E2'); break;
      case 'E1': onDiagnosticLevelClick('E1'); break;
      case 'Missing': onDiagnosticLevelClick('missing'); break;
      case 'Invalid': onDiagnosticLevelClick('invalid'); break;
    }
  };

  // ---- Chart 2: Functional Skills Status ----
  const fsDonutData = useMemo(() => {
    const counts: Record<string, number> = {};
    learners.forEach(l => {
      const fs = fsSubject === 'english' ? l.englishFunctionalSkillsStatus : l.mathsFunctionalSkillsStatus;
      const status = fs || 'Missing';
      counts[status] = (counts[status] || 0) + 1;
    });
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => {
        const color = FS_COLORS[name] || '#9ca3af';
        return { name, value, color };
      });
  }, [learners, fsSubject]);

  // ---- Chart 3: Support Learners by Coach ----
  const coachBarData = useMemo(() => {
    const coachMap = new Map<string, number>();
    learners.forEach(l => {
      if (!l.coachName) return;
      let include = false;
      switch (coachSubject) {
        case 'any': include = needsEitherSkillsDevSupport(l); break;
        case 'english': include = needsEnglishSkillsDevSupport(l); break;
        case 'maths': include = needsMathsSkillsDevSupport(l); break;
        case 'both': include = needsBothSkillsDevSupport(l); break;
      }
      if (include) {
        coachMap.set(l.coachName, (coachMap.get(l.coachName) || 0) + 1);
      }
    });
    return Array.from(coachMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [learners, coachSubject]);

  // ---- Chart 4: Most Common Weak Areas ----
  const weakBarData = useMemo(() => {
    const areaMap = new Map<string, number>();
    if (weakSubject === 'english') {
      learners.forEach(l => {
        ENGLISH_DIAGNOSTIC_FIELDS.forEach(f => {
          const val = (l.englishAreaLevels as unknown as Record<string, ParsedDiagnosticLevel>)[f.key];
          if (val && val.format === 'valid' && ['E1', 'E2', 'E3', 'L1'].includes(val.category)) {
            areaMap.set(f.label, (areaMap.get(f.label) || 0) + 1);
          }
        });
      });
    } else {
      learners.forEach(l => {
        MATHS_DIAGNOSTIC_FIELDS.forEach(f => {
          const val = (l.mathsAreaLevels as unknown as Record<string, ParsedDiagnosticLevel>)[f.key];
          if (val && val.format === 'valid' && ['E1', 'E2', 'E3', 'L1'].includes(val.category)) {
            areaMap.set(f.label, (areaMap.get(f.label) || 0) + 1);
          }
        });
      });
    }
    return Array.from(areaMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [learners, weakSubject]);

  return (
    <section>
      <h2 className="text-base font-heading font-semibold text-foreground-900 mb-4">Charts</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Chart 1: Diagnostic Level Donut */}
        <div className="bg-background-50 border border-background-200/70 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground-800">Learners by Diagnostic Level</h3>
            <select
              value={diagSubject}
              onChange={e => setDiagSubject(e.target.value as 'english' | 'maths')}
              className="px-2 py-1 text-xs rounded border border-background-200/70 bg-background-50 text-foreground-700 cursor-pointer"
            >
              <option value="english">English</option>
              <option value="maths">Maths</option>
            </select>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={diagDonutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={38}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                  cursor="pointer"
                  onClick={(_, index) => handleDiagClick(diagDonutData[index])}
                >
                  {diagDonutData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value} learner${value !== 1 ? 's' : ''}`, '']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            {diagDonutData.map((entry, idx) => (
              <button
                key={idx}
                onClick={() => handleDiagClick(entry)}
                className="flex items-center gap-1 text-xs text-foreground-600 hover:text-foreground-800 cursor-pointer transition-colors"
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name} ({entry.value})
              </button>
            ))}
          </div>
        </div>

        {/* Chart 2: Functional Skills Status Donut */}
        <div className="bg-background-50 border border-background-200/70 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground-800">Functional Skills Status</h3>
            <select
              value={fsSubject}
              onChange={e => setFsSubject(e.target.value as 'english' | 'maths')}
              className="px-2 py-1 text-xs rounded border border-background-200/70 bg-background-50 text-foreground-700 cursor-pointer"
            >
              <option value="english">English</option>
              <option value="maths">Maths</option>
            </select>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={fsDonutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={38}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {fsDonutData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value} learner${value !== 1 ? 's' : ''}`, '']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            {fsDonutData.map((entry, idx) => (
              <span
                key={idx}
                className="flex items-center gap-1 text-xs text-foreground-600"
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name} ({entry.value})
              </span>
            ))}
          </div>
        </div>

        {/* Chart 3: Bar - Support by Coach */}
        <div className="bg-background-50 border border-background-200/70 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground-800">Learners by Coach</h3>
            <select
              value={coachSubject}
              onChange={e => setCoachSubject(e.target.value as ChartSubjectSwitch)}
              className="px-2 py-1 text-xs rounded border border-background-200/70 bg-background-50 text-foreground-700 cursor-pointer"
            >
              <option value="any">Any Subject</option>
              <option value="english">English</option>
              <option value="maths">Maths</option>
              <option value="both">Both Subjects</option>
            </select>
          </div>
          {coachBarData.length > 0 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={coachBarData} layout="vertical" margin={{ left: 0, right: 10, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="oklch(var(--background-200))" />
                  <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={80} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(value: number) => [`${value} learner${value !== 1 ? 's' : ''}`, '']} />
                  <Bar dataKey="count" fill={BAR_COLOR} radius={[0, 4, 4, 0]} cursor="pointer" onClick={(data) => onCoachClick(data.name)} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-sm text-foreground-400">No data available</div>
          )}
        </div>

        {/* Chart 4: Bar - Weak Areas */}
        <div className="bg-background-50 border border-background-200/70 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground-800">Common Weak Areas</h3>
            <select
              value={weakSubject}
              onChange={e => setWeakSubject(e.target.value as 'english' | 'maths')}
              className="px-2 py-1 text-xs rounded border border-background-200/70 bg-background-50 text-foreground-700 cursor-pointer"
            >
              <option value="english">English</option>
              <option value="maths">Maths</option>
            </select>
          </div>
          {weakBarData.length > 0 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weakBarData} layout="vertical" margin={{ left: 0, right: 10, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="oklch(var(--background-200))" />
                  <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={90} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(value: number) => [`${value} learner${value !== 1 ? 's' : ''}`, '']} />
                  <Bar dataKey="count" fill="#fbbf24" radius={[0, 4, 4, 0]} cursor="pointer" onClick={(data) => onWeakAreaClick(data.name)} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-sm text-foreground-400">No data available</div>
          )}
        </div>
      </div>
    </section>
  );
}