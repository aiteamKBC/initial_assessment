import type { ParsedDiagnosticLevel } from '@/utils/csvParser';

export interface EnglishRawRow {
  coachName: string;
  learnerName: string;
  email: string;
  status: string;
  englishExemption: string;
  englishIAScore: string;
  reading: string;
  spag: string;
  writing: string;
  readingText: string;
  readingWord: string;
  spelling: string;
  punctuation: string;
  grammar: string;
  writingText: string;
}

export interface MathsRawRow {
  coachName: string;
  learnerName: string;
  email: string;
  status: string;
  mathsExemption: string;
  mathsIAScore: string;
  number: string;
  mss: string;
  statsData: string;
  wholeNumbers: string;
  calculations: string;
  fdpRatio: string;
  measure: string;
  shape: string;
  handlingInfo: string;
  statistics: string;
}

export interface EnglishDiagnostics {
  reading: number | null;
  spag: number | null;
  writing: number | null;
  readingText: number | null;
  readingWord: number | null;
  spelling: number | null;
  punctuation: number | null;
  grammar: number | null;
  writingText: number | null;
}

export interface MathsDiagnostics {
  number: number | null;
  mss: number | null;
  statsData: number | null;
  wholeNumbers: number | null;
  calculations: number | null;
  fdpRatio: number | null;
  measure: number | null;
  shape: number | null;
  handlingInfo: number | null;
  statistics: number | null;
}

/** Parsed diagnostic levels for all English diagnostic areas */
export interface EnglishDiagnosticLevels {
  reading: ParsedDiagnosticLevel;
  spag: ParsedDiagnosticLevel;
  writing: ParsedDiagnosticLevel;
  readingText: ParsedDiagnosticLevel;
  readingWord: ParsedDiagnosticLevel;
  spelling: ParsedDiagnosticLevel;
  punctuation: ParsedDiagnosticLevel;
  grammar: ParsedDiagnosticLevel;
  writingText: ParsedDiagnosticLevel;
}

/** Parsed diagnostic levels for all Maths diagnostic areas */
export interface MathsDiagnosticLevels {
  number: ParsedDiagnosticLevel;
  mss: ParsedDiagnosticLevel;
  statsData: ParsedDiagnosticLevel;
  wholeNumbers: ParsedDiagnosticLevel;
  calculations: ParsedDiagnosticLevel;
  fdpRatio: ParsedDiagnosticLevel;
  measure: ParsedDiagnosticLevel;
  shape: ParsedDiagnosticLevel;
  handlingInfo: ParsedDiagnosticLevel;
  statistics: ParsedDiagnosticLevel;
}

export interface LearnerRecord {
  email: string;
  learnerName: string;
  coachName: string;
  status: string;

  // English diagnostic
  englishDiagnosticLevel: ParsedDiagnosticLevel;
  englishDiagnostics: EnglishDiagnostics;
  englishAreaLevels: EnglishDiagnosticLevels;

  // Maths diagnostic
  mathsDiagnosticLevel: ParsedDiagnosticLevel;
  mathsDiagnostics: MathsDiagnostics;
  mathsAreaLevels: MathsDiagnosticLevels;

  // Functional Skills status — separate from diagnostic result
  englishFunctionalSkillsStatus: string;
  mathsFunctionalSkillsStatus: string;

  // Keep raw exemption for backward compat
  englishExemptionRaw: string;
  englishExempt: boolean;
  mathsExemptionRaw: string;
  mathsExempt: boolean;

  // Backward-compat raw IA scores (derived)
  englishIAScore: number | null;
  mathsIAScore: number | null;

  isDuplicate: boolean;
  missingEmail: boolean;
  missingName: boolean;
  missingCoach: boolean;
  onlyEnglish: boolean;
  onlyMaths: boolean;
}

export type SupportRequired =
  | 'English Support Required'
  | 'Maths Support Required'
  | 'English and Maths Support Required'
  | 'No Skills Development Support Required'
  | 'Missing Diagnostic Result'
  | 'Invalid Diagnostic Format';

export type SubjectView = 'all' | 'english' | 'maths';

export type DiagnosticLevelFilter =
  | 'all'
  | 'L2'
  | 'L1'
  | 'E3'
  | 'E2'
  | 'E1'
  | 'missing'
  | 'invalid';

export type ConnectionStatus = 'connected' | 'partially-connected' | 'connection-error' | 'refreshing';

export type ChartSubjectSwitch = 'any' | 'english' | 'maths' | 'both';

export type DashboardSortField =
  | 'learnerName'
  | 'coachName'
  | 'status'
  | 'englishDiagnosticLevel'
  | 'mathsDiagnosticLevel'
  | 'supportRequired'
  | 'weakestArea';

export type SortDirection = 'asc' | 'desc';

export interface DashboardFilters {
  search: string;
  coach: string;
  status: string;
  subject: SubjectView;
  diagnosticLevel: DiagnosticLevelFilter;
  englishExemptionFilter: string;
  mathsExemptionFilter: string;
  weakArea: string;
}

export const ENGLISH_DIAGNOSTIC_FIELDS: { key: keyof EnglishDiagnostics; label: string; group: string }[] = [
  { key: 'reading', label: 'Reading', group: 'Reading' },
  { key: 'spag', label: 'Spelling, Punctuation and Grammar', group: 'Spelling, Punctuation and Grammar' },
  { key: 'writing', label: 'Writing', group: 'Writing' },
  { key: 'readingText', label: 'Reading - Text', group: 'Reading' },
  { key: 'readingWord', label: 'Reading - Word', group: 'Reading' },
  { key: 'spelling', label: 'Spelling', group: 'Spelling, Punctuation and Grammar' },
  { key: 'punctuation', label: 'Punctuation', group: 'Spelling, Punctuation and Grammar' },
  { key: 'grammar', label: 'Grammar', group: 'Spelling, Punctuation and Grammar' },
  { key: 'writingText', label: 'Writing - Text', group: 'Writing' },
];

export const MATHS_DIAGNOSTIC_FIELDS: { key: keyof MathsDiagnostics; label: string; group: string }[] = [
  { key: 'number', label: 'Number', group: 'Number' },
  { key: 'mss', label: 'Measure, Shape and Space', group: 'Measure, Shape and Space' },
  { key: 'statsData', label: 'Statistics and Data', group: 'Statistics and Data' },
  { key: 'wholeNumbers', label: 'Whole Numbers', group: 'Number' },
  { key: 'calculations', label: 'Calculations', group: 'Number' },
  { key: 'fdpRatio', label: 'Fractions, Decimals, Percentages and Ratio', group: 'Number' },
  { key: 'measure', label: 'Measure', group: 'Measure, Shape and Space' },
  { key: 'shape', label: 'Shape', group: 'Measure, Shape and Space' },
  { key: 'handlingInfo', label: 'Handling Information and Data', group: 'Statistics and Data' },
  { key: 'statistics', label: 'Statistics', group: 'Statistics and Data' },
];

export const MAIN_ENGLISH_GROUPS = ['Reading', 'Spelling, Punctuation and Grammar', 'Writing'];
export const DETAIL_ENGLISH_FIELDS = ['readingText', 'readingWord', 'spelling', 'punctuation', 'grammar', 'writingText'];

export const MAIN_MATHS_GROUPS = ['Number', 'Measure, Shape and Space', 'Statistics and Data'];
export const DETAIL_MATHS_FIELDS = ['wholeNumbers', 'calculations', 'fdpRatio', 'measure', 'shape', 'handlingInfo', 'statistics'];

export interface WeakestAreaResult {
  label: string;
  displayLevel: string;
  subject: 'English' | 'Maths';
}

export interface SupportBreakdown {
  englishCount: number;
  mathsCount: number;
}