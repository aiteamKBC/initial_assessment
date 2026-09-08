import { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  LearnerRecord,
  ConnectionStatus,
  DashboardFilters,
  DashboardSortField,
  SortDirection,
  DiagnosticLevelFilter,
} from '@/types/dashboard';
import {
  fetchCSVData,
  processRawData,
  getSupportRequired,
  needsEnglishSkillsDevSupport,
  needsMathsSkillsDevSupport,
  needsEitherSkillsDevSupport,
  needsBothSkillsDevSupport,
  getWeakestEnglishArea,
  getWeakestMathsArea,
  getWeakAreaLabel,
} from '@/utils/dataProcessor';

const AUTO_REFRESH_MS = 5 * 60 * 1000;

export interface DataQualityInfo {
  missingEmails: number;
  missingNames: number;
  missingCoaches: number;
  missingEnglishDiag: number;
  missingMathsDiag: number;
  invalidEnglishDiag: number;
  invalidMathsDiag: number;
  unrecognisedEnglishDiag: number;
  unrecognisedMathsDiag: number;
  missingEnglishFSStatus: number;
  missingMathsFSStatus: number;
  duplicateEmails: number;
  englishOnly: number;
  mathsOnly: number;
}

export type KpiFilterType = 'all' | 'total' | 'l2-both' | 'below-l2-either' | 'below-l2-both' | 'entry-either' | 'missing';

export type FsSubject = 'english' | 'maths';

export interface FsKpiData {
  exempt: number;
  optOut: number;
  notExempt: number;
}

export function useDashboardData() {
  const [allLearners, setAllLearners] = useState<LearnerRecord[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('refreshing');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [englishError, setEnglishError] = useState('');
  const [mathsError, setMathsError] = useState('');
  const [processingErrors, setProcessingErrors] = useState<string[]>([]);
  const [dataQuality, setDataQuality] = useState<DataQualityInfo>({
    missingEmails: 0, missingNames: 0, missingCoaches: 0,
    missingEnglishDiag: 0, missingMathsDiag: 0,
    invalidEnglishDiag: 0, invalidMathsDiag: 0,
    unrecognisedEnglishDiag: 0, unrecognisedMathsDiag: 0,
    missingEnglishFSStatus: 0, missingMathsFSStatus: 0,
    duplicateEmails: 0, englishOnly: 0, mathsOnly: 0,
  });

  const [filters, setFilters] = useState<DashboardFilters>({
    search: '',
    coach: '',
    status: '',
    subject: 'all',
    diagnosticLevel: 'all',
    englishExemptionFilter: '',
    mathsExemptionFilter: '',
    weakArea: '',
  });

  const [sortField, setSortField] = useState<DashboardSortField>('learnerName');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedLearner, setSelectedLearner] = useState<LearnerRecord | null>(null);

  const [selectedCoachFromChart, setSelectedCoachFromChart] = useState<string>('');
  const [selectedWeakAreaFromChart, setSelectedWeakAreaFromChart] = useState<string>('');
  const [selectedDiagnosticLevelFromChart, setSelectedDiagnosticLevelFromChart] = useState<DiagnosticLevelFilter>('all');
  const [kpiFilter, setKpiFilter] = useState<KpiFilterType>('all');
  const [fsSubject, setFsSubject] = useState<FsSubject>('english');

  const fetchData = useCallback(async () => {
    setConnectionStatus('refreshing');
    try {
      const result = await fetchCSVData();

      if (!result.englishOk && !result.mathsOk) {
        setConnectionStatus('connection-error');
        setEnglishError(result.englishError || 'Failed to fetch English data');
        setMathsError(result.mathsError || 'Failed to fetch Maths data');
        return;
      }

      if (!result.englishOk || !result.mathsOk) {
        setConnectionStatus('partially-connected');
      } else {
        setConnectionStatus('connected');
      }

      setEnglishError(result.englishError);
      setMathsError(result.mathsError);

      const englishCsv = result.englishCsv ?? '';
      const mathsCsv = result.mathsCsv ?? '';

      let learners: LearnerRecord[] = [];
      let englishOnly = 0;
      let mathsOnly = 0;
      let errors: string[] = [];

      try {
        const processed = processRawData(englishCsv, mathsCsv);
        learners = processed.learners;
        englishOnly = processed.englishOnly;
        mathsOnly = processed.mathsOnly;
        errors = processed.errors;
      } catch (procErr) {
        errors.push(procErr instanceof Error ? procErr.message : 'Data processing error');
      }

      setAllLearners(learners);
      setProcessingErrors(errors);
      setLastUpdated(new Date());

      const dq: DataQualityInfo = {
        missingEmails: learners.filter(l => l.missingEmail).length,
        missingNames: learners.filter(l => l.missingName).length,
        missingCoaches: learners.filter(l => l.missingCoach).length,
        missingEnglishDiag: learners.filter(l => l.englishIAScore === null).length,
        missingMathsDiag: learners.filter(l => l.mathsIAScore === null).length,
        invalidEnglishDiag: learners.filter(l => {
          const areas = l.englishAreaLevels;
          return Object.values(areas as Record<string, { format: string }>).some(v => v.format === 'invalid');
        }).length,
        invalidMathsDiag: learners.filter(l => {
          const areas = l.mathsAreaLevels;
          return Object.values(areas as Record<string, { format: string }>).some(v => v.format === 'invalid');
        }).length,
        unrecognisedEnglishDiag: 0,
        unrecognisedMathsDiag: 0,
        missingEnglishFSStatus: learners.filter(l => !l.englishFunctionalSkillsStatus).length,
        missingMathsFSStatus: learners.filter(l => !l.mathsFunctionalSkillsStatus).length,
        duplicateEmails: learners.filter(l => l.isDuplicate).length,
        englishOnly,
        mathsOnly,
      };
      setDataQuality(dq);
    } catch (e) {
      setConnectionStatus('connection-error');
      setEnglishError(e instanceof Error ? e.message : 'Unknown error');
      setMathsError('');
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, AUTO_REFRESH_MS);
    return () => clearInterval(interval);
  }, [fetchData]);

  const coaches = useMemo(() => {
    const set = new Set<string>();
    allLearners.forEach(l => { if (l.coachName) set.add(l.coachName); });
    return Array.from(set).sort();
  }, [allLearners]);

  const statuses = useMemo(() => {
    const set = new Set<string>();
    allLearners.forEach(l => { if (l.status) set.add(l.status); });
    return Array.from(set).sort();
  }, [allLearners]);

  const weakAreas = useMemo(() => {
    const set = new Set<string>();
    allLearners.forEach(l => {
      const eng = getWeakestEnglishArea(l);
      const mat = getWeakestMathsArea(l);
      if (eng) set.add(eng.label);
      if (mat) set.add(mat.label);
    });
    return Array.from(set).sort();
  }, [allLearners]);

  const englishExemptionOptions = useMemo(() => {
    const values = new Set<string>();
    allLearners.forEach(l => {
      if (l.englishFunctionalSkillsStatus) values.add(l.englishFunctionalSkillsStatus);
    });
    return Array.from(values).sort();
  }, [allLearners]);

  const mathsExemptionOptions = useMemo(() => {
    const values = new Set<string>();
    allLearners.forEach(l => {
      if (l.mathsFunctionalSkillsStatus) values.add(l.mathsFunctionalSkillsStatus);
    });
    return Array.from(values).sort();
  }, [allLearners]);

  // Base for FS KPI cards — all filters except exemption filters
  const baseForFsKpi = useMemo(() => {
    let result = allLearners;

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(l =>
        l.learnerName.toLowerCase().includes(q) || l.email.toLowerCase().includes(q)
      );
    }

    const effectiveCoach = filters.coach || selectedCoachFromChart;
    if (effectiveCoach) {
      result = result.filter(l => l.coachName === effectiveCoach);
    }

    if (filters.status) {
      result = result.filter(l => l.status === filters.status);
    }

    const effectiveDiagLevel = selectedDiagnosticLevelFromChart !== 'all' ? selectedDiagnosticLevelFromChart : filters.diagnosticLevel;
    if (effectiveDiagLevel !== 'all') {
      result = result.filter(l => {
        switch (effectiveDiagLevel) {
          case 'L2':
            return (l.englishDiagnosticLevel.category === 'L2' && filters.subject !== 'maths') ||
                   (l.mathsDiagnosticLevel.category === 'L2' && filters.subject !== 'english');
          case 'L1':
            return (l.englishDiagnosticLevel.category === 'L1' && filters.subject !== 'maths') ||
                   (l.mathsDiagnosticLevel.category === 'L1' && filters.subject !== 'english');
          case 'E3':
            return (l.englishDiagnosticLevel.category === 'E3' && filters.subject !== 'maths') ||
                   (l.mathsDiagnosticLevel.category === 'E3' && filters.subject !== 'english');
          case 'E2':
            return (l.englishDiagnosticLevel.category === 'E2' && filters.subject !== 'maths') ||
                   (l.mathsDiagnosticLevel.category === 'E2' && filters.subject !== 'english');
          case 'E1':
            return (l.englishDiagnosticLevel.category === 'E1' && filters.subject !== 'maths') ||
                   (l.mathsDiagnosticLevel.category === 'E1' && filters.subject !== 'english');
          case 'missing':
            return (l.englishDiagnosticLevel.format === 'missing' && filters.subject !== 'maths') ||
                   (l.mathsDiagnosticLevel.format === 'missing' && filters.subject !== 'english');
          case 'invalid':
            return (l.englishDiagnosticLevel.format === 'invalid' && filters.subject !== 'maths') ||
                   (l.mathsDiagnosticLevel.format === 'invalid' && filters.subject !== 'english');
          default: return true;
        }
      });
    }

    const effectiveWeakArea = filters.weakArea || selectedWeakAreaFromChart;
    if (effectiveWeakArea) {
      result = result.filter(l => {
        if (filters.subject === 'maths') {
          const area = getWeakestMathsArea(l);
          return area ? area.label.includes(effectiveWeakArea) : false;
        }
        if (filters.subject === 'english') {
          const area = getWeakestEnglishArea(l);
          return area ? area.label.includes(effectiveWeakArea) : false;
        }
        const engArea = getWeakestEnglishArea(l);
        const matArea = getWeakestMathsArea(l);
        return (engArea && engArea.label.includes(effectiveWeakArea)) ||
               (matArea && matArea.label.includes(effectiveWeakArea));
      });
    }

    if (filters.subject === 'english') {
      result = result.filter(l => l.englishDiagnosticLevel.format !== 'missing');
    } else if (filters.subject === 'maths') {
      result = result.filter(l => l.mathsDiagnosticLevel.format !== 'missing');
    }

    if (kpiFilter !== 'all' && kpiFilter !== 'total') {
      result = result.filter(l => {
        switch (kpiFilter) {
          case 'l2-both':
            return l.englishIAScore !== null && l.mathsIAScore !== null &&
                   l.englishIAScore >= 2 && l.mathsIAScore >= 2;
          case 'below-l2-either':
            return (l.englishIAScore !== null && l.englishIAScore < 2) ||
                   (l.mathsIAScore !== null && l.mathsIAScore < 2);
          case 'below-l2-both':
            return l.englishIAScore !== null && l.mathsIAScore !== null &&
                   l.englishIAScore < 2 && l.mathsIAScore < 2;
          case 'entry-either':
            return (l.englishIAScore !== null && l.englishIAScore < 1) ||
                   (l.mathsIAScore !== null && l.mathsIAScore < 1);
          case 'missing':
            return l.englishIAScore === null || l.mathsIAScore === null;
          default:
            return true;
        }
      });
    }

    return result;
  }, [allLearners, filters, selectedCoachFromChart, selectedWeakAreaFromChart, selectedDiagnosticLevelFromChart, kpiFilter]);

  const filteredLearners = useMemo(() => {
    let result = baseForFsKpi;

    if (filters.englishExemptionFilter) {
      result = result.filter(l => l.englishFunctionalSkillsStatus === filters.englishExemptionFilter);
    }
    if (filters.mathsExemptionFilter) {
      result = result.filter(l => l.mathsFunctionalSkillsStatus === filters.mathsExemptionFilter);
    }

    return result;
  }, [baseForFsKpi, filters.englishExemptionFilter, filters.mathsExemptionFilter]);

  const sortedLearners = useMemo(() => {
    const sorted = [...filteredLearners];
    const dir = sortDirection === 'asc' ? 1 : -1;

    sorted.sort((a, b) => {
      switch (sortField) {
        case 'learnerName':
          return a.learnerName.localeCompare(b.learnerName) * dir;
        case 'coachName':
          return a.coachName.localeCompare(b.coachName) * dir;
        case 'status':
          return a.status.localeCompare(b.status) * dir;
        case 'englishDiagnosticLevel': {
          const aScore = a.englishIAScore ?? -Infinity;
          const bScore = b.englishIAScore ?? -Infinity;
          if (aScore === bScore) return 0;
          return aScore < bScore ? -1 * dir : 1 * dir;
        }
        case 'mathsDiagnosticLevel': {
          const aScore = a.mathsIAScore ?? -Infinity;
          const bScore = b.mathsIAScore ?? -Infinity;
          if (aScore === bScore) return 0;
          return aScore < bScore ? -1 * dir : 1 * dir;
        }
        case 'supportRequired':
          return getSupportRequired(a).localeCompare(getSupportRequired(b)) * dir;
        case 'weakestArea':
          return getWeakAreaLabel(a).localeCompare(getWeakAreaLabel(b)) * dir;
        default:
          return 0;
      }
    });

    return sorted;
  }, [filteredLearners, sortField, sortDirection]);

  const pagedLearners = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedLearners.slice(start, start + pageSize);
  }, [sortedLearners, currentPage, pageSize]);

  const totalPages = Math.max(1, Math.ceil(sortedLearners.length / pageSize));

  const effectiveFsSubject: FsSubject = filters.subject === 'all' ? fsSubject : (filters.subject as FsSubject);

  const kpiData = useMemo(() => {
    // Deduplicate by email for accurate counts
    const unique = new Map<string, LearnerRecord>();
    filteredLearners.forEach(l => {
      if (!unique.has(l.email)) unique.set(l.email, l);
    });
    const base = Array.from(unique.values());

    return {
      totalLearners: base.length,
      l2Both: base.filter(l =>
        l.englishIAScore !== null && l.mathsIAScore !== null &&
        l.englishIAScore >= 2 && l.mathsIAScore >= 2
      ).length,
      belowL2Either: base.filter(l =>
        (l.englishIAScore !== null && l.englishIAScore < 2) ||
        (l.mathsIAScore !== null && l.mathsIAScore < 2)
      ).length,
      belowL2Both: base.filter(l =>
        l.englishIAScore !== null && l.mathsIAScore !== null &&
        l.englishIAScore < 2 && l.mathsIAScore < 2
      ).length,
      entryEither: base.filter(l =>
        (l.englishIAScore !== null && l.englishIAScore < 1) ||
        (l.mathsIAScore !== null && l.mathsIAScore < 1)
      ).length,
      missing: base.filter(l =>
        l.englishIAScore === null || l.mathsIAScore === null
      ).length,
    };
  }, [filteredLearners]);

  const fsKpiData = useMemo((): FsKpiData => {
    const unique = new Map<string, LearnerRecord>();
    baseForFsKpi.forEach(l => {
      if (!unique.has(l.email)) unique.set(l.email, l);
    });
    const base = Array.from(unique.values());

    const fsField = effectiveFsSubject === 'english' ? 'englishFunctionalSkillsStatus' as const : 'mathsFunctionalSkillsStatus' as const;

    return {
      exempt: base.filter(l => l[fsField] === 'Exempt').length,
      optOut: base.filter(l => l[fsField] === 'OptOut').length,
      notExempt: base.filter(l => l[fsField] === 'NotExempt').length,
    };
  }, [baseForFsKpi, effectiveFsSubject]);

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      coach: '',
      status: '',
      subject: 'all',
      diagnosticLevel: 'all',
      englishExemptionFilter: '',
      mathsExemptionFilter: '',
      weakArea: '',
    });
    setSelectedCoachFromChart('');
    setSelectedWeakAreaFromChart('');
    setSelectedDiagnosticLevelFromChart('all');
    setKpiFilter('all');
    setFsSubject('english');
    setCurrentPage(1);
  }, []);

  const updateFilter = useCallback((key: keyof DashboardFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  const handleSort = useCallback((field: DashboardSortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField]);

  const applyKpiFilter = useCallback((kpiType: string) => {
    setSelectedCoachFromChart('');
    setSelectedWeakAreaFromChart('');
    setSelectedDiagnosticLevelFromChart('all');
    setKpiFilter(kpiType === 'total' ? 'all' : kpiType as KpiFilterType);
    // Clear FS exemption filters when switching to diagnostic KPI view
    setFilters(prev => ({ ...prev, englishExemptionFilter: '', mathsExemptionFilter: '' }));
    setCurrentPage(1);
  }, []);

  const applyFsKpiFilter = useCallback((fsType: 'exempt' | 'optOut' | 'notExempt') => {
    setSelectedCoachFromChart('');
    setSelectedWeakAreaFromChart('');
    setSelectedDiagnosticLevelFromChart('all');
    setKpiFilter('all');

    const statusMap: Record<string, string> = {
      exempt: 'Exempt',
      optOut: 'OptOut',
      notExempt: 'NotExempt',
    };

    const value = statusMap[fsType];

    setFilters(prev => {
      if (effectiveFsSubject === 'english') {
        return { ...prev, englishExemptionFilter: value, mathsExemptionFilter: '' };
      }
      return { ...prev, mathsExemptionFilter: value, englishExemptionFilter: '' };
    });
    setCurrentPage(1);
  }, [effectiveFsSubject]);

  const exportFilteredCSV = useCallback(() => {
    const headers = [
      'Learner Name', 'Email', 'Coach Name', 'Status',
      'English Diagnostic Level', 'Maths Diagnostic Level',
      'English Diagnostic Category', 'Maths Diagnostic Category',
      'English Functional Skills Status', 'Maths Functional Skills Status',
      'English Skills Development Support', 'Maths Skills Development Support',
      'Weakest English Area', 'Weakest Maths Area',
    ];
    const rows = sortedLearners.map(l => {
      const engWeak = getWeakestEnglishArea(l);
      const matWeak = getWeakestMathsArea(l);
      return [
        l.learnerName, l.email, l.coachName, l.status,
        l.englishDiagnosticLevel.displayLevel || '-',
        l.mathsDiagnosticLevel.displayLevel || '-',
        l.englishDiagnosticLevel.category || '-',
        l.mathsDiagnosticLevel.category || '-',
        l.englishFunctionalSkillsStatus || '-',
        l.mathsFunctionalSkillsStatus || '-',
        needsEnglishSkillsDevSupport(l) ? 'Yes' : 'No',
        needsMathsSkillsDevSupport(l) ? 'Yes' : 'No',
        engWeak ? `${engWeak.label} (${engWeak.displayLevel})` : 'No Data',
        matWeak ? `${matWeak.label} (${matWeak.displayLevel})` : 'No Data',
      ];
    });

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diagnostic-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [sortedLearners]);

  return {
    allLearners,
    filteredLearners,
    sortedLearners,
    pagedLearners,
    connectionStatus,
    lastUpdated,
    englishError,
    mathsError,
    processingErrors,
    dataQuality,
    filters,
    updateFilter,
    clearFilters,
    sortField,
    sortDirection,
    handleSort,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    coaches,
    statuses,
    weakAreas,
    englishExemptionOptions,
    mathsExemptionOptions,
    kpiData,
    kpiFilter,
    fsKpiData,
    fsSubject,
    setFsSubject,
    effectiveFsSubject,
    applyFsKpiFilter,
    selectedLearner,
    setSelectedLearner,
    fetchData,
    applyKpiFilter,
    exportFilteredCSV,
    selectedCoachFromChart,
    setSelectedCoachFromChart,
    selectedWeakAreaFromChart,
    setSelectedWeakAreaFromChart,
    selectedDiagnosticLevelFromChart,
    setSelectedDiagnosticLevelFromChart,
  };
}

export type UseDashboardDataReturn = ReturnType<typeof useDashboardData>;