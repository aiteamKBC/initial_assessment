export function parseCSV(csvText: string): Record<string, string>[] {
  // Split into proper rows, respecting quoted newlines
  const rowStrings = splitIntoRows(csvText);
  if (rowStrings.length < 2) return [];

  const headers = parseCSVLine(rowStrings[0]).map(cleanHeader);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < rowStrings.length; i++) {
    const values = parseCSVLine(rowStrings[i]);
    if (values.length === 0) continue;

    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      row[header] = (values[idx] || '').trim();
    });
    rows.push(row);
  }

  return rows;
}

function splitIntoRows(text: string): string[] {
  const rows: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = i + 1 < text.length ? text[i + 1] : '';

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === '\n') {
        rows.push(current);
        current = '';
      } else if (char === '\r') {
        if (nextChar === '\n') {
          i++; // skip the \n, we will hit it next iteration but current row is already pushed below
        }
        rows.push(current);
        current = '';
      } else {
        current += char;
      }
    }
  }

  if (current !== '' || rows.length > 0) {
    rows.push(current);
  }

  return rows;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
  }
  result.push(current);
  return result;
}

function cleanHeader(header: string): string {
  return header
    .replace(/^["'\s]+|["'\s]+$/g, '')
    .replace(/\s+/g, ' ')
    .replace(/[\n\r]+/g, '')
    .trim();
}

export function cleanString(value: string): string {
  return value.replace(/^["'\s]+|["'\s]+$/g, '').replace(/\s+/g, ' ').trim();
}

export function normalizeHeader(value: unknown): string {
  return String(value ?? '')
    .replace(/\r?\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export function parseNumericScore(value: string): number | null {
  const cleaned = cleanString(value);
  if (cleaned === '' || cleaned === '-' || cleaned === 'N/A' || cleaned === 'null' || cleaned === 'undefined') {
    return null;
  }

  // Handle "Level X.Y (Z.ZZ)" format — extract the number in parentheses or the first number
  const parenMatch = cleaned.match(/\(([-\d.]+)\)/);
  if (parenMatch) {
    const num = Number(parenMatch[1]);
    if (!isNaN(num)) return num;
  }

  const num = Number(cleaned);
  if (isNaN(num)) return null;
  return num;
}

export function parseExemption(value: string): boolean {
  const cleaned = cleanString(value).toLowerCase();
  const exemptValues = ['yes', 'y', 'true', '1', 'exempt', 'exemption'];
  return exemptValues.includes(cleaned);
}

/* ------------------------------------------------------------------ */
/*  Diagnostic Level Parsing                                          */
/* ------------------------------------------------------------------ */

export interface ParsedDiagnosticLevel {
  displayLevel: string;
  category: string;
  format: 'valid' | 'invalid' | 'missing';
}

/**
 * Convert raw cell values like "Entry 2.9 (-0.11)" or "Level 1.6 (1.62)"
 * into a structured diagnostic level { displayLevel: "E2.9", category: "E2", format: "valid" }.
 *
 * Only the readable text BEFORE the opening bracket is used.
 * The bracketed raw score is completely ignored.
 */
export function parseDiagnosticLevel(value: string): ParsedDiagnosticLevel {
  const trimmed = cleanString(value);
  if (trimmed === '' || trimmed === '-' || trimmed === 'N/A' || trimmed === 'null' || trimmed === 'undefined') {
    return { displayLevel: '', category: '', format: 'missing' };
  }

  // Extract text before the first opening bracket
  const bracketIdx = trimmed.indexOf('(');
  const beforeBracket = bracketIdx >= 0 ? trimmed.slice(0, bracketIdx).trim() : trimmed;

  if (beforeBracket === '') {
    // Only brackets or only numeric raw score like "-0.11"
    const parenMatch = trimmed.match(/\(([-\d.]+)\)/);
    if (parenMatch) {
      // There is a bracketed score but no readable level before it
      return { displayLevel: '', category: '', format: 'invalid' };
    }
    // Plain number, no readable level
    const num = Number(trimmed);
    if (!isNaN(num)) {
      return { displayLevel: '', category: '', format: 'invalid' };
    }
    return { displayLevel: '', category: '', format: 'invalid' };
  }

  const normalized = normalizeDiagnosticText(beforeBracket);
  if (!normalized) {
    return { displayLevel: '', category: '', format: 'invalid' };
  }

  const category = extractCategory(normalized);

  return {
    displayLevel: normalized,
    category,
    format: 'valid',
  };
}

/**
 * Normalise unstructured level text like "Entry Level 2.9" → "E2.9"
 * Returns empty string if the text cannot be recognized.
 */
function normalizeDiagnosticText(text: string): string {
  const t = text.toLowerCase().replace(/\s+/g, ' ').trim();

  // Match patterns:
  // "entry level 2.9", "entry 2.9", "entry level 3.5", "entry 3.5"
  // "level 1.6", "level 2.4"
  const entryLevelMatch = t.match(/^entry\s*(?:level)?\s*(\d)\.?(\d*)$/);
  if (entryLevelMatch) {
    const major = entryLevelMatch[1];
    const minor = entryLevelMatch[2] || '0';
    const prefix = major === '1' ? 'E1' : major === '2' ? 'E2' : 'E3';
    return `${prefix}.${minor}`;
  }

  const levelMatch = t.match(/^level\s*(\d)\.?(\d*)$/);
  if (levelMatch) {
    const major = levelMatch[1];
    const minor = levelMatch[2] || '0';
    const prefix = major === '1' ? 'L1' : 'L2';
    return `${prefix}.${minor}`;
  }

  // Already in abbreviated form? e.g. "E2.9", "L1.6"
  const abbrevMatch = t.match(/^([el])(\d)\.?(\d*)$/i);
  if (abbrevMatch) {
    const prefix = abbrevMatch[1].toUpperCase();
    const major = abbrevMatch[2];
    const minor = abbrevMatch[3] || '0';
    return `${prefix}${major}.${minor}`;
  }

  return '';
}

function extractCategory(displayLevel: string): string {
  const match = displayLevel.match(/^([EL]\d)/);
  return match ? match[1] : '';
}

/**
 * Convert a diagnostic level to a numeric rank for comparison.
 * E1.x → 1.x, E2.x → 2.x, E3.x → 3.x, L1.x → 4.x, L2.x → 5.x
 * Lower rank = weaker / lower level.
 */
export function diagnosticLevelRank(displayLevel: string): number {
  const match = displayLevel.match(/^([EL])(\d)\.(\d+)$/i);
  if (!match) return 999;
  const prefix = match[1].toUpperCase();
  const major = parseInt(match[2], 10);
  const minor = parseInt(match[3], 10);

  const baseRank = prefix === 'E' ? major : major + 3; // E1→1, E2→2, E3→3, L1→4, L2→5
  return baseRank + minor / 1000;
}

/**
 * Convert a numeric IA Score to a ParsedDiagnosticLevel.
 * IA Scores are bare numbers like 1.97, 2.66, -0.11 — NOT "Level X.Y (Z)" text.
 * Category derived from: >=2→L2, 1-1.99→L1, 0-0.99→E3, -1 to -0.01→E2, <-1→E1
 */
export function iaScoreToDiagnosticLevel(score: number | null): ParsedDiagnosticLevel {
  if (score === null) return { displayLevel: '', category: '', format: 'missing' };

  let category: string;
  if (score >= 2) category = 'L2';
  else if (score >= 1) category = 'L1';
  else if (score >= 0) category = 'E3';
  else if (score >= -1) category = 'E2';
  else category = 'E1';

  return { displayLevel: String(score), category, format: 'valid' };
}

/* ------------------------------------------------------------------ */
/*  Functional Skills Status Normalisation                             */
/* ------------------------------------------------------------------ */

/**
 * Normalise the raw exemption value for display as Functional Skills Status.
 * Only adjusts capitalisation/spacing, preserves the original value.
 * "exempt" → "Exempt", "optout" → "OptOut", "notexempt" → "NotExempt"
 * Unknown values are title-cased.
 */
export function normalizeFunctionalSkillsStatus(raw: string): string {
  const t = cleanString(raw);
  if (t === '') return '';

  const lower = t.toLowerCase();

  const known: Record<string, string> = {
    exempt: 'Exempt',
    optout: 'OptOut',
    notexempt: 'NotExempt',
    exemption: 'Exempt',
    'not exempt': 'NotExempt',
    'opt out': 'OptOut',
    yes: 'Exempt',
    y: 'Exempt',
    true: 'Exempt',
    '1': 'Exempt',
  };

  if (known[lower] !== undefined) return known[lower];

  // Title-case for unknown values
  return lower.replace(/\b\w/g, c => c.toUpperCase());
}