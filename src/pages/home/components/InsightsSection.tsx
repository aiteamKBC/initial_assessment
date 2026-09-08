import type { LearnerRecord, SubjectView } from '@/types/dashboard';
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

interface InsightsSectionProps {
  learners: LearnerRecord[];
  subject: SubjectView;
  onCoachClick: (coach: string) => void;
  onWeakAreaClick: (area: string) => void;
}

export default function InsightsSection({ learners, subject, onCoachClick, onWeakAreaClick }: InsightsSectionProps) {
  // Insight 1: Most Common English Weakness (below L2 diagnostic areas)
  const engWeakCounts = new Map<string, number>();
  const engTotalWithData = new Map<string, number>();
  learners.forEach(l => {
    ENGLISH_DIAGNOSTIC_FIELDS.forEach(f => {
      const val = (l.englishAreaLevels as unknown as Record<string, ParsedDiagnosticLevel>)[f.key];
      if (val && val.format === 'valid') {
        engTotalWithData.set(f.label, (engTotalWithData.get(f.label) || 0) + 1);
        if (['E1', 'E2', 'E3', 'L1'].includes(val.category)) {
          engWeakCounts.set(f.label, (engWeakCounts.get(f.label) || 0) + 1);
        }
      }
    });
  });
  let topEngWeak = '';
  let topEngWeakCount = 0;
  let topEngWeakPct = 0;
  engWeakCounts.forEach((count, label) => {
    if (count > topEngWeakCount) {
      topEngWeakCount = count;
      topEngWeak = label;
      topEngWeakPct = Math.round((count / (engTotalWithData.get(label) || 1)) * 100);
    }
  });

  // Insight 2: Most Common Maths Weakness
  const matWeakCounts = new Map<string, number>();
  const matTotalWithData = new Map<string, number>();
  learners.forEach(l => {
    MATHS_DIAGNOSTIC_FIELDS.forEach(f => {
      const val = (l.mathsAreaLevels as unknown as Record<string, ParsedDiagnosticLevel>)[f.key];
      if (val && val.format === 'valid') {
        matTotalWithData.set(f.label, (matTotalWithData.get(f.label) || 0) + 1);
        if (['E1', 'E2', 'E3', 'L1'].includes(val.category)) {
          matWeakCounts.set(f.label, (matWeakCounts.get(f.label) || 0) + 1);
        }
      }
    });
  });
  let topMatWeak = '';
  let topMatWeakCount = 0;
  let topMatWeakPct = 0;
  matWeakCounts.forEach((count, label) => {
    if (count > topMatWeakCount) {
      topMatWeakCount = count;
      topMatWeak = label;
      topMatWeakPct = Math.round((count / (matTotalWithData.get(label) || 1)) * 100);
    }
  });

  // Insight 3: Coach with highest support caseload
  const coachSupport = new Map<string, { total: number; eng: number; maths: number }>();
  learners.forEach(l => {
    if (!l.coachName) return;
    if (!coachSupport.has(l.coachName)) {
      coachSupport.set(l.coachName, { total: 0, eng: 0, maths: 0 });
    }
    const c = coachSupport.get(l.coachName)!;
    if (needsEitherSkillsDevSupport(l)) {
      c.total++;
    }
    if (needsEnglishSkillsDevSupport(l)) c.eng++;
    if (needsMathsSkillsDevSupport(l)) c.maths++;
  });
  let topCoach = '';
  let topCoachData = { total: 0, eng: 0, maths: 0 };
  coachSupport.forEach((data, coach) => {
    if (data.total > topCoachData.total) {
      topCoachData = data;
      topCoach = coach;
    }
  });

  // Insight 4: Learners requiring both
  const bothCount = learners.filter(l => needsBothSkillsDevSupport(l)).length;
  const anySupport = learners.filter(l => needsEitherSkillsDevSupport(l)).length;
  const bothPctAll = learners.length > 0 ? Math.round((bothCount / learners.length) * 100) : 0;
  const bothPctAny = anySupport > 0 ? Math.round((bothCount / anySupport) * 100) : 0;

  const displayInsights = subject === 'all' || subject === 'english' || subject === 'maths';
  if (!displayInsights) return null;

  return (
    <section>
      <h2 className="text-base font-heading font-semibold text-foreground-900 mb-4">Key Insights</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(subject === 'all' || subject === 'english') && topEngWeak && (
          <div className="bg-background-50 border border-background-200/70 rounded-lg p-4">
            <p className="text-xs text-foreground-500 mb-1">Most Common English Weakness</p>
            <button
              onClick={() => onWeakAreaClick(topEngWeak)}
              className="text-sm font-semibold text-foreground-900 hover:text-primary-600 transition-colors cursor-pointer text-left"
            >
              {topEngWeak}
            </button>
            <p className="text-xs text-foreground-600 mt-2">
              {topEngWeakCount} learner{topEngWeakCount !== 1 ? 's' : ''} below L2 ({topEngWeakPct}% of those assessed).
            </p>
          </div>
        )}

        {(subject === 'all' || subject === 'maths') && topMatWeak && (
          <div className="bg-background-50 border border-background-200/70 rounded-lg p-4">
            <p className="text-xs text-foreground-500 mb-1">Most Common Maths Weakness</p>
            <button
              onClick={() => onWeakAreaClick(topMatWeak)}
              className="text-sm font-semibold text-foreground-900 hover:text-primary-600 transition-colors cursor-pointer text-left"
            >
              {topMatWeak}
            </button>
            <p className="text-xs text-foreground-600 mt-2">
              {topMatWeakCount} learner{topMatWeakCount !== 1 ? 's' : ''} below L2 ({topMatWeakPct}% of those assessed).
            </p>
          </div>
        )}

        {topCoach && (
          <div className="bg-background-50 border border-background-200/70 rounded-lg p-4">
            <p className="text-xs text-foreground-500 mb-1">Coach With Highest Support Caseload</p>
            <button
              onClick={() => onCoachClick(topCoach)}
              className="text-sm font-semibold text-foreground-900 hover:text-primary-600 transition-colors cursor-pointer text-left"
            >
              {topCoach}
            </button>
            <p className="text-xs text-foreground-600 mt-2">
              {topCoachData.total} learner{topCoachData.total !== 1 ? 's' : ''} ({topCoachData.eng} English, {topCoachData.maths} Maths)
            </p>
          </div>
        )}

        {subject === 'all' && (
          <div className="bg-background-50 border border-background-200/70 rounded-lg p-4">
            <p className="text-xs text-foreground-500 mb-1">Learners Requiring Both Subjects</p>
            <p className="text-sm font-semibold text-foreground-900">
              {bothCount} learner{bothCount !== 1 ? 's' : ''}
            </p>
            <p className="text-xs text-foreground-600 mt-2">
              {bothPctAll}% of all learners &middot; {bothPctAny}% of those needing any support
            </p>
          </div>
        )}
      </div>
    </section>
  );
}