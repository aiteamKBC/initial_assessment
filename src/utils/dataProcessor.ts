import {
  parseCSV,
  parseNumericScore,
  parseExemption,
  parseDiagnosticLevel,
  normalizeFunctionalSkillsStatus,
  diagnosticLevelRank,
  iaScoreToDiagnosticLevel,
  cleanString,
  normalizeHeader,
} from './csvParser';
import type { ParsedDiagnosticLevel } from './csvParser';
import type {
  EnglishRawRow,
  MathsRawRow,
  LearnerRecord,
  SupportRequired,
  WeakestAreaResult,
  EnglishDiagnostics,
  MathsDiagnostics,
  EnglishDiagnosticLevels,
  MathsDiagnosticLevels,
} from '@/types/dashboard';

const ENGLISH_CSV_URL =
  'https://docs.google.com/spreadsheets/d/16-TRmdvt8RPdf1UcwQnbDWqINIO64XWTS8MRRKYwv6c/gviz/tq?tqx=out:csv&sheet=English';
const MATHS_CSV_URL =
  'https://docs.google.com/spreadsheets/d/16-TRmdvt8RPdf1UcwQnbDWqINIO64XWTS8MRRKYwv6c/gviz/tq?tqx=out:csv&sheet=Maths';

/* ------------------------------------------------------------------ */
/*  Header matching helpers                                            */
/* ------------------------------------------------------------------ */

function findHeaderValue(row: Record<string, string>, targetHeader: string): string {
  const normalizedTarget = normalizeHeader(targetHeader);
  for (const key of Object.keys(row)) {
    if (normalizeHeader(key) === normalizedTarget) {
      return row[key];
    }
  }
  return '';
}

/* ------------------------------------------------------------------ */
/*  Raw row mappers                                                     */
/* ------------------------------------------------------------------ */

function mapEnglishRow(row: Record<string, string>): EnglishRawRow {
  return {
    coachName: cleanString(findHeaderValue(row, 'Coach Name')),
    learnerName: cleanString(findHeaderValue(row, 'Learner Name')),
    email: cleanString(findHeaderValue(row, 'Email')).toLowerCase(),
    status: cleanString(findHeaderValue(row, 'Status')),
    englishExemption: cleanString(findHeaderValue(row, 'English Exemption')),
    englishIAScore: cleanString(findHeaderValue(row, 'English IA Score')),
    reading: cleanString(findHeaderValue(row, 'Reading')),
    spag: cleanString(findHeaderValue(row, 'Spelling, Punctuation and Grammar')),
    writing: cleanString(findHeaderValue(row, 'Writing')),
    readingText: cleanString(findHeaderValue(row, 'Reading - Text')),
    readingWord: cleanString(findHeaderValue(row, 'Reading - Word')),
    spelling: cleanString(findHeaderValue(row, 'Spelling')),
    punctuation: cleanString(findHeaderValue(row, 'Punctuation')),
    grammar: cleanString(findHeaderValue(row, 'Grammar')),
    writingText: cleanString(findHeaderValue(row, 'Writing - Text')),
  };
}

function mapMathsRow(row: Record<string, string>): MathsRawRow {
  return {
    coachName: cleanString(findHeaderValue(row, 'Coach Name')),
    learnerName: cleanString(findHeaderValue(row, 'Learner Name')),
    email: cleanString(findHeaderValue(row, 'Email')).toLowerCase(),
    status: cleanString(findHeaderValue(row, 'Status')),
    mathsExemption: cleanString(findHeaderValue(row, 'Maths Exemption')),
    mathsIAScore: cleanString(findHeaderValue(row, 'Maths IA Score')),
    number: cleanString(findHeaderValue(row, 'Number')),
    mss: cleanString(findHeaderValue(row, 'Measure, Shape and Space')),
    statsData: cleanString(findHeaderValue(row, 'Statistics and Data')),
    wholeNumbers: cleanString(findHeaderValue(row, 'Whole Numbers')),
    calculations: cleanString(findHeaderValue(row, 'Calculations')),
    fdpRatio: cleanString(findHeaderValue(row, 'Fractions, Decimals, Percentages and Ratio')),
    measure: cleanString(findHeaderValue(row, 'Measure')),
    shape: cleanString(findHeaderValue(row, 'Shape')),
    handlingInfo: cleanString(findHeaderValue(row, 'Handling Information and Data')),
    statistics: cleanString(findHeaderValue(row, 'Statistics')),
  };
}

/* ------------------------------------------------------------------ */
/*  Diagnostic builders                                                 */
/* ------------------------------------------------------------------ */

function emptyParsedLevel(): ParsedDiagnosticLevel {
  return { displayLevel: '', category: '', format: 'missing' };
}

function buildEnglishDiagnostics(raw: EnglishRawRow): EnglishDiagnostics {
  return {
    reading: parseNumericScore(raw.reading),
    spag: parseNumericScore(raw.spag),
    writing: parseNumericScore(raw.writing),
    readingText: parseNumericScore(raw.readingText),
    readingWord: parseNumericScore(raw.readingWord),
    spelling: parseNumericScore(raw.spelling),
    punctuation: parseNumericScore(raw.punctuation),
    grammar: parseNumericScore(raw.grammar),
    writingText: parseNumericScore(raw.writingText),
  };
}

function buildMathsDiagnostics(raw: MathsRawRow): MathsDiagnostics {
  return {
    number: parseNumericScore(raw.number),
    mss: parseNumericScore(raw.mss),
    statsData: parseNumericScore(raw.statsData),
    wholeNumbers: parseNumericScore(raw.wholeNumbers),
    calculations: parseNumericScore(raw.calculations),
    fdpRatio: parseNumericScore(raw.fdpRatio),
    measure: parseNumericScore(raw.measure),
    shape: parseNumericScore(raw.shape),
    handlingInfo: parseNumericScore(raw.handlingInfo),
    statistics: parseNumericScore(raw.statistics),
  };
}

function buildEnglishAreaLevels(raw: EnglishRawRow): EnglishDiagnosticLevels {
  return {
    reading: parseDiagnosticLevel(raw.reading),
    spag: parseDiagnosticLevel(raw.spag),
    writing: parseDiagnosticLevel(raw.writing),
    readingText: parseDiagnosticLevel(raw.readingText),
    readingWord: parseDiagnosticLevel(raw.readingWord),
    spelling: parseDiagnosticLevel(raw.spelling),
    punctuation: parseDiagnosticLevel(raw.punctuation),
    grammar: parseDiagnosticLevel(raw.grammar),
    writingText: parseDiagnosticLevel(raw.writingText),
  };
}

function buildMathsAreaLevels(raw: MathsRawRow): MathsDiagnosticLevels {
  return {
    number: parseDiagnosticLevel(raw.number),
    mss: parseDiagnosticLevel(raw.mss),
    statsData: parseDiagnosticLevel(raw.statsData),
    wholeNumbers: parseDiagnosticLevel(raw.wholeNumbers),
    calculations: parseDiagnosticLevel(raw.calculations),
    fdpRatio: parseDiagnosticLevel(raw.fdpRatio),
    measure: parseDiagnosticLevel(raw.measure),
    shape: parseDiagnosticLevel(raw.shape),
    handlingInfo: parseDiagnosticLevel(raw.handlingInfo),
    statistics: parseDiagnosticLevel(raw.statistics),
  };
}

/* ------------------------------------------------------------------ */
/*  Learner merging                                                     */
/* ------------------------------------------------------------------ */

function getLearnerKey(email: string, learnerName: string, coachName: string): string {
  if (email && email !== '') return email;
  return `${cleanString(learnerName)}|||${cleanString(coachName)}`.toLowerCase();
}

export function processRawData(
  englishCsv: string,
  mathsCsv: string
): { learners: LearnerRecord[]; englishOnly: number; mathsOnly: number; errors: string[] } {
  const errors: string[] = [];

  const englishRawRows = parseCSV(englishCsv).map(mapEnglishRow);
  const mathsRawRows = parseCSV(mathsCsv).map(mapMathsRow);

  const learnerMap = new Map<string, LearnerRecord>();
  let englishOnly = 0;
  let mathsOnly = 0;
  const duplicateEmails = new Set<string>();
  const emailSeenEnglish = new Set<string>();
  const emailSeenMaths = new Set<string>();

  for (const row of englishRawRows) {
    const key = getLearnerKey(row.email, row.learnerName, row.coachName);
    if (row.email && emailSeenEnglish.has(row.email)) {
      duplicateEmails.add(row.email);
      continue;
    }
    if (row.email) emailSeenEnglish.add(row.email);

    const iaScore = parseNumericScore(row.englishIAScore);
    const diag = iaScoreToDiagnosticLevel(iaScore);

    learnerMap.set(key, {
      email: row.email,
      learnerName: row.learnerName,
      coachName: row.coachName,
      status: row.status,

      englishDiagnosticLevel: diag,
      englishDiagnostics: buildEnglishDiagnostics(row),
      englishAreaLevels: buildEnglishAreaLevels(row),

      mathsDiagnosticLevel: emptyParsedLevel(),
      mathsDiagnostics: emptyMathsDiagnostics(),
      mathsAreaLevels: emptyMathsAreaLevels(),

      englishFunctionalSkillsStatus: normalizeFunctionalSkillsStatus(row.englishExemption),
      mathsFunctionalSkillsStatus: '',

      englishExemptionRaw: row.englishExemption,
      englishExempt: parseExemption(row.englishExemption),
      mathsExemptionRaw: '',
      mathsExempt: false,

      englishIAScore: iaScore,
      mathsIAScore: null,

      isDuplicate: false,
      missingEmail: !row.email,
      missingName: !row.learnerName,
      missingCoach: !row.coachName,
      onlyEnglish: true,
      onlyMaths: false,
    });
  }

  for (const row of mathsRawRows) {
    const key = getLearnerKey(row.email, row.learnerName, row.coachName);
    if (row.email && emailSeenMaths.has(row.email)) {
      duplicateEmails.add(row.email);
      continue;
    }
    if (row.email) emailSeenMaths.add(row.email);

    const iaScore = parseNumericScore(row.mathsIAScore);
    const diag = iaScoreToDiagnosticLevel(iaScore);

    const existing = learnerMap.get(key);
    if (existing) {
      existing.mathsDiagnosticLevel = diag;
      existing.mathsDiagnostics = buildMathsDiagnostics(row);
      existing.mathsAreaLevels = buildMathsAreaLevels(row);
      existing.mathsFunctionalSkillsStatus = normalizeFunctionalSkillsStatus(row.mathsExemption);
      existing.mathsExemptionRaw = row.mathsExemption;
      existing.mathsExempt = parseExemption(row.mathsExemption);
      existing.mathsIAScore = iaScore;
      existing.onlyEnglish = false;
      existing.onlyMaths = false;
    } else {
      learnerMap.set(key, {
        email: row.email,
        learnerName: row.learnerName,
        coachName: row.coachName,
        status: row.status,

        englishDiagnosticLevel: emptyParsedLevel(),
        englishDiagnostics: emptyEnglishDiagnostics(),
        englishAreaLevels: emptyEnglishAreaLevels(),

        mathsDiagnosticLevel: diag,
        mathsDiagnostics: buildMathsDiagnostics(row),
        mathsAreaLevels: buildMathsAreaLevels(row),

        englishFunctionalSkillsStatus: '',
        mathsFunctionalSkillsStatus: normalizeFunctionalSkillsStatus(row.mathsExemption),

        englishExemptionRaw: '',
        englishExempt: false,
        mathsExemptionRaw: row.mathsExemption,
        mathsExempt: parseExemption(row.mathsExemption),

        englishIAScore: null,
        mathsIAScore: iaScore,

        isDuplicate: false,
        missingEmail: !row.email,
        missingName: !row.learnerName,
        missingCoach: !row.coachName,
        onlyEnglish: false,
        onlyMaths: true,
      });
    }
  }

  for (const learner of learnerMap.values()) {
    if (learner.onlyEnglish) englishOnly++;
    if (learner.onlyMaths) mathsOnly++;
    if (learner.email && duplicateEmails.has(learner.email)) {
      learner.isDuplicate = true;
    }
  }

  if (duplicateEmails.size > 0) {
    errors.push(`${duplicateEmails.size} duplicate email address(es) detected.`);
  }

  return { learners: Array.from(learnerMap.values()), englishOnly, mathsOnly, errors };
}

/* ------------------------------------------------------------------ */
/*  Empty diagnostic helpers                                            */
/* ------------------------------------------------------------------ */

function emptyEnglishDiagnostics(): EnglishDiagnostics {
  return {
    reading: null, spag: null, writing: null,
    readingText: null, readingWord: null,
    spelling: null, punctuation: null, grammar: null, writingText: null,
  };
}

function emptyMathsDiagnostics(): MathsDiagnostics {
  return {
    number: null, mss: null, statsData: null,
    wholeNumbers: null, calculations: null, fdpRatio: null,
    measure: null, shape: null, handlingInfo: null, statistics: null,
  };
}

function emptyEnglishAreaLevels(): EnglishDiagnosticLevels {
  const e = emptyParsedLevel();
  return { reading: e, spag: e, writing: e, readingText: e, readingWord: e, spelling: e, punctuation: e, grammar: e, writingText: e };
}

function emptyMathsAreaLevels(): MathsDiagnosticLevels {
  const e = emptyParsedLevel();
  return { number: e, mss: e, statsData: e, wholeNumbers: e, calculations: e, fdpRatio: e, measure: e, shape: e, handlingInfo: e, statistics: e };
}

/* ------------------------------------------------------------------ */
/*  Skills Development Support                                          */
/* ------------------------------------------------------------------ */

/**
 * Skills development support is based on IA Score alone.
 * IA Score >= 2 → support not required.
 * IA Score < 2 → support required.
 * Null IA Score → no determination (shown as Missing).
 */
export function needsEnglishSkillsDevSupport(learner: LearnerRecord): boolean {
  const score = learner.englishIAScore;
  if (score === null) return false;
  return score < 2;
}

export function needsMathsSkillsDevSupport(learner: LearnerRecord): boolean {
  const score = learner.mathsIAScore;
  if (score === null) return false;
  return score < 2;
}

export function needsEitherSkillsDevSupport(learner: LearnerRecord): boolean {
  return needsEnglishSkillsDevSupport(learner) || needsMathsSkillsDevSupport(learner);
}

export function needsBothSkillsDevSupport(learner: LearnerRecord): boolean {
  return needsEnglishSkillsDevSupport(learner) && needsMathsSkillsDevSupport(learner);
}

export function getSupportRequired(learner: LearnerRecord): SupportRequired {
  const engValid = learner.englishDiagnosticLevel.format === 'valid';
  const matValid = learner.mathsDiagnosticLevel.format === 'valid';
  const engInvalid = learner.englishDiagnosticLevel.format === 'invalid';
  const matInvalid = learner.mathsDiagnosticLevel.format === 'invalid';
  const engMissing = learner.englishDiagnosticLevel.format === 'missing';
  const matMissing = learner.mathsDiagnosticLevel.format === 'missing';

  const engSupport = engValid && needsEnglishSkillsDevSupport(learner);
  const matSupport = matValid && needsMathsSkillsDevSupport(learner);

  if (engSupport && matSupport) return 'English and Maths Support Required';
  if (engSupport) return 'English Support Required';
  if (matSupport) return 'Maths Support Required';
  if (engInvalid || matInvalid) return 'Invalid Diagnostic Format';
  if (engMissing || matMissing) return 'Missing Diagnostic Result';
  return 'No Skills Development Support Required';
}

// ---- Backward-compat wrappers (keeps old charts/hooks compiling) ---- //

export function needsEnglishSupport(learner: LearnerRecord): boolean {
  return needsEnglishSkillsDevSupport(learner);
}

export function needsMathsSupport(learner: LearnerRecord): boolean {
  return needsMathsSkillsDevSupport(learner);
}

export function needsEitherSupport(learner: LearnerRecord): boolean {
  return needsEitherSkillsDevSupport(learner);
}

export function needsBothSupport(learner: LearnerRecord): boolean {
  return needsBothSkillsDevSupport(learner);
}

/* ------------------------------------------------------------------ */
/*  Weakest area calculation (uses diagnostic levels, not raw scores)   */
/* ------------------------------------------------------------------ */

type AreaEntry = { label: string; displayLevel: string; rank: number };

const ENGLISH_WEAK_FIELDS: { key: keyof EnglishDiagnosticLevels; label: string }[] = [
  { key: 'reading', label: 'Reading' },
  { key: 'spag', label: 'Spelling, Punctuation and Grammar' },
  { key: 'writing', label: 'Writing' },
  { key: 'readingText', label: 'Reading - Text' },
  { key: 'readingWord', label: 'Reading - Word' },
  { key: 'spelling', label: 'Spelling' },
  { key: 'punctuation', label: 'Punctuation' },
  { key: 'grammar', label: 'Grammar' },
  { key: 'writingText', label: 'Writing - Text' },
];

const MATHS_WEAK_FIELDS: { key: keyof MathsDiagnosticLevels; label: string }[] = [
  { key: 'number', label: 'Number' },
  { key: 'mss', label: 'Measure, Shape and Space' },
  { key: 'statsData', label: 'Statistics and Data' },
  { key: 'wholeNumbers', label: 'Whole Numbers' },
  { key: 'calculations', label: 'Calculations' },
  { key: 'fdpRatio', label: 'Fractions, Decimals, Percentages and Ratio' },
  { key: 'measure', label: 'Measure' },
  { key: 'shape', label: 'Shape' },
  { key: 'handlingInfo', label: 'Handling Information and Data' },
  { key: 'statistics', label: 'Statistics' },
];

function collectValidAreas(
  levels: Record<string, ParsedDiagnosticLevel>,
  fields: { key: string; label: string }[]
): AreaEntry[] {
  const areas: AreaEntry[] = [];
  for (const f of fields) {
    const lvl = levels[f.key] as ParsedDiagnosticLevel | undefined;
    if (lvl && lvl.format === 'valid' && lvl.displayLevel) {
      areas.push({ label: f.label, displayLevel: lvl.displayLevel, rank: diagnosticLevelRank(lvl.displayLevel) });
    }
  }
  return areas;
}

function pickWeakest(areas: AreaEntry[], subject: 'English' | 'Maths'): WeakestAreaResult | null {
  if (areas.length === 0) return null;
  areas.sort((a, b) => a.rank - b.rank);
  const lowest = areas[0].rank;
  const lowestAreas = areas.filter(a => a.rank === lowest);

  if (lowestAreas.length === 1) {
    return { label: lowestAreas[0].label, displayLevel: lowestAreas[0].displayLevel, subject };
  } else if (lowestAreas.length === 2) {
    return { label: `${lowestAreas[0].label}, ${lowestAreas[1].label}`, displayLevel: lowestAreas[0].displayLevel, subject };
  } else {
    return {
      label: `${lowestAreas[0].label}, ${lowestAreas[1].label}, plus ${lowestAreas.length - 2} more`,
      displayLevel: lowestAreas[0].displayLevel,
      subject,
    };
  }
}

export function getWeakestEnglishArea(learner: LearnerRecord): WeakestAreaResult | null {
  const areas = collectValidAreas(
    learner.englishAreaLevels as unknown as Record<string, ParsedDiagnosticLevel>,
    ENGLISH_WEAK_FIELDS
  );
  return pickWeakest(areas, 'English');
}

export function getWeakestMathsArea(learner: LearnerRecord): WeakestAreaResult | null {
  const areas = collectValidAreas(
    learner.mathsAreaLevels as unknown as Record<string, ParsedDiagnosticLevel>,
    MATHS_WEAK_FIELDS
  );
  return pickWeakest(areas, 'Maths');
}

export function getOverallWeakestArea(learner: LearnerRecord): WeakestAreaResult | null {
  const eng = getWeakestEnglishArea(learner);
  const mat = getWeakestMathsArea(learner);
  if (!eng && !mat) return null;
  if (!eng) return mat;
  if (!mat) return eng;
  return diagnosticLevelRank(eng.displayLevel) <= diagnosticLevelRank(mat.displayLevel) ? eng : mat;
}

export function getWeakAreaLabel(learner: LearnerRecord): string {
  const area = getOverallWeakestArea(learner);
  if (!area) return 'No Data';
  return `${area.label}, ${area.subject}, ${area.displayLevel}`;
}

/* ------------------------------------------------------------------ */
/*  Fetch CSV data                                                      */
/* ------------------------------------------------------------------ */

export async function fetchCSVData(): Promise<{
  englishCsv: string;
  mathsCsv: string;
  englishOk: boolean;
  mathsOk: boolean;
  englishError: string;
  mathsError: string;
}> {
  let englishCsv = '';
  let mathsCsv = '';
  let englishOk = false;
  let mathsOk = false;
  let englishError = '';
  let mathsError = '';

  try {
    const resp = await fetch(ENGLISH_CSV_URL);
    if (!resp.ok) {
      englishError = `HTTP ${resp.status}: ${resp.statusText}`;
    } else {
      englishCsv = await resp.text();
      if (englishCsv.trim().length === 0) {
        englishError = 'Empty response';
      } else {
        englishOk = true;
      }
    }
  } catch (e) {
    englishError = e instanceof Error ? e.message : 'Unknown error';
  }

  try {
    const resp = await fetch(MATHS_CSV_URL);
    if (!resp.ok) {
      mathsError = `HTTP ${resp.status}: ${resp.statusText}`;
    } else {
      mathsCsv = await resp.text();
      if (mathsCsv.trim().length === 0) {
        mathsError = 'Empty response';
      } else {
        mathsOk = true;
      }
    }
  } catch (e) {
    mathsError = e instanceof Error ? e.message : 'Unknown error';
  }

  return { englishCsv, mathsCsv, englishOk, mathsOk, englishError, mathsError };
}