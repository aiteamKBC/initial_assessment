import { useDashboardData } from '@/hooks/useDashboardData';
import { needsEnglishSkillsDevSupport, needsMathsSkillsDevSupport, needsBothSkillsDevSupport } from '@/utils/dataProcessor';
import { useMemo } from 'react';
import Header from './components/Header';
import SubjectSelector from './components/SubjectSelector';
import KpiCards from './components/KpiCards';
import FilterBar from './components/FilterBar';
import LearnerTable from './components/LearnerTable';
import LearnerDetailPanel from './components/LearnerDetailPanel';
import InsightsSection from './components/InsightsSection';
import ChartsSection from './components/ChartsSection';
import DataQualitySection from './components/DataQualitySection';

export default function Dashboard() {
  const data = useDashboardData();

  const isLoading = data.allLearners.length === 0 && data.connectionStatus === 'refreshing';
  const hasError = data.connectionStatus === 'connection-error' && data.allLearners.length === 0;
  const isEmpty = data.allLearners.length === 0 && !isLoading && !hasError;
  const hasData = data.allLearners.length > 0;

  const effectiveCoach = data.selectedCoachFromChart || data.filters.coach;

  const coachSummary = useMemo(() => {
    if (!effectiveCoach) return null;
    const coachLearners = data.allLearners.filter(l => l.coachName === effectiveCoach);
    return {
      total: coachLearners.length,
      engSupport: coachLearners.filter(l => needsEnglishSkillsDevSupport(l)).length,
      mathsSupport: coachLearners.filter(l => needsMathsSkillsDevSupport(l)).length,
      bothSupport: coachLearners.filter(l => needsBothSkillsDevSupport(l)).length,
      missing: coachLearners.filter(l =>
        l.englishDiagnosticLevel.format === 'missing' || l.mathsDiagnosticLevel.format === 'missing'
      ).length,
      invalid: coachLearners.filter(l =>
        l.englishDiagnosticLevel.format === 'invalid' || l.mathsDiagnosticLevel.format === 'invalid'
      ).length,
      exempt: coachLearners.filter(l => l.englishExempt || l.mathsExempt).length,
    };
  }, [data.allLearners, effectiveCoach]);

  return (
    <div className="min-h-screen bg-background-50">
      <Header
        connectionStatus={data.connectionStatus}
        lastUpdated={data.lastUpdated}
        onRefresh={data.fetchData}
        englishError={data.englishError}
        mathsError={data.mathsError}
      />

      <main className="px-4 md:px-6 py-6 max-w-[1440px] mx-auto space-y-6">
        <div>
          <SubjectSelector
            value={data.filters.subject}
            onChange={(v) => data.updateFilter('subject', v)}
          />
        </div>

        {hasError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <i className="ri-error-warning-line text-lg text-red-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-red-800 mb-1">Cannot Connect to Google Sheet</h3>
                <p className="text-xs text-red-700 mb-3">
                  The dashboard could not connect to the Google Sheet. Please check the spreadsheet sharing permissions and try again.
                </p>
                <button
                  onClick={data.fetchData}
                  className="px-3 py-1.5 text-xs font-medium rounded-md bg-red-100 text-red-800 hover:bg-red-200 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-refresh-line mr-1" /> Retry Connection
                </button>
                {(data.englishError || data.mathsError) && (
                  <div className="mt-3 p-2 bg-white/60 rounded border border-red-100">
                    <p className="text-xs text-red-700">
                      The Google Sheet must be shared as <strong>Anyone with the link, Viewer</strong>.
                    </p>
                    {data.englishError && <p className="text-xs text-red-600 mt-1">English: {data.englishError}</p>}
                    {data.mathsError && <p className="text-xs text-red-600 mt-1">Maths: {data.mathsError}</p>}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {data.connectionStatus === 'partially-connected' && (
          <div className="bg-accent-50 border border-accent-200 rounded-lg p-3 flex items-center gap-2">
            <i className="ri-alert-line text-accent-600" />
            <p className="text-xs text-accent-800">
              Partially connected. {data.englishError && `English: ${data.englishError} `}{data.mathsError && `Maths: ${data.mathsError}`}
            </p>
          </div>
        )}

        {isLoading && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm text-foreground-500">
              <i className="ri-loader-4-line animate-spin text-base" />
              <span>Loading diagnostic data from Google Sheets...</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="p-4 rounded-lg bg-background-100 border border-background-200/70 animate-pulse">
                  <div className="h-3 w-16 bg-background-300 rounded mb-2" />
                  <div className="h-6 w-10 bg-background-300 rounded" />
                </div>
              ))}
            </div>
            <div className="border border-background-200/70 rounded-lg p-4 animate-pulse space-y-3">
              <div className="h-4 w-full bg-background-200 rounded" />
              <div className="h-4 w-3/4 bg-background-200 rounded" />
              <div className="h-4 w-5/6 bg-background-200 rounded" />
              <div className="h-4 w-2/3 bg-background-200 rounded" />
            </div>
          </div>
        )}

        {isEmpty && (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <i className="ri-inbox-line text-5xl text-foreground-300 mb-4" />
            <h2 className="text-lg font-heading font-semibold text-foreground-800 mb-2">No Data Available</h2>
            <p className="text-sm text-foreground-600 text-center max-w-md mb-4">
              {!data.englishError && !data.mathsError
                ? 'No diagnostic data is currently available in either tab. The spreadsheet may be empty.'
                : 'One or both tabs returned empty data.'}
            </p>
            <button
              onClick={data.fetchData}
              className="px-4 py-2 text-sm font-medium rounded-md bg-primary-500 text-white hover:bg-primary-600 transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-refresh-line mr-1.5" /> Refresh
            </button>
            {data.englishError && <p className="text-xs text-red-600 mt-3">English tab: {data.englishError}</p>}
            {data.mathsError && <p className="text-xs text-red-600 mt-3">Maths tab: {data.mathsError}</p>}
          </div>
        )}

        {hasData && (
          <>
            {effectiveCoach && coachSummary && (
              <div className="bg-background-100 border border-background-200/70 rounded-lg px-4 py-3">
                <p className="text-sm font-semibold text-foreground-800 mb-2">
                  Coach View: {effectiveCoach}
                  <button
                    onClick={data.clearFilters}
                    className="ml-3 text-xs text-primary-600 hover:text-primary-700 cursor-pointer font-normal"
                  >
                    <i className="ri-close-line" /> Clear
                  </button>
                </p>
                <div className="flex flex-wrap gap-4 text-xs text-foreground-600">
                  <span>Total: <strong className="text-foreground-800">{coachSummary.total}</strong></span>
                  <span>Eng Support: <strong className="text-red-600">{coachSummary.engSupport}</strong></span>
                  <span>Maths Support: <strong className="text-red-600">{coachSummary.mathsSupport}</strong></span>
                  <span>Both: <strong className="text-red-600">{coachSummary.bothSupport}</strong></span>
                  <span>Missing: <strong className="text-foreground-500">{coachSummary.missing}</strong></span>
                  <span>Invalid: <strong className="text-foreground-500">{coachSummary.invalid}</strong></span>
                  <span>Exempt: <strong className="text-blue-600">{coachSummary.exempt}</strong></span>
                </div>
              </div>
            )}

            <KpiCards
              totalLearners={data.kpiData.totalLearners}
              l2Both={data.kpiData.l2Both}
              belowL2Either={data.kpiData.belowL2Either}
              belowL2Both={data.kpiData.belowL2Both}
              entryEither={data.kpiData.entryEither}
              missing={data.kpiData.missing}
              activeKpi={data.kpiFilter}
              onKpiClick={data.applyKpiFilter}
              fsKpiData={data.fsKpiData}
              fsSubject={data.fsSubject}
              onFsSubjectChange={data.setFsSubject}
              onFsKpiClick={data.applyFsKpiFilter}
              subject={data.filters.subject}
            />

            <FilterBar
              filters={data.filters}
              onUpdateFilter={data.updateFilter}
              onClearFilters={data.clearFilters}
              coaches={data.coaches}
              statuses={data.statuses}
              weakAreas={data.weakAreas}
              englishExemptionOptions={data.englishExemptionOptions}
              mathsExemptionOptions={data.mathsExemptionOptions}
              resultCount={data.sortedLearners.length}
              subject={data.filters.subject}
            />

            <ChartsSection
              learners={data.filteredLearners}
              onDiagnosticLevelClick={(level) => {
                data.setSelectedCoachFromChart('');
                data.setSelectedWeakAreaFromChart('');
                data.setSelectedDiagnosticLevelFromChart(level);
                data.setCurrentPage(1);
              }}
              onCoachClick={(coach) => {
                data.setSelectedCoachFromChart(coach);
                data.setSelectedWeakAreaFromChart('');
                data.setSelectedDiagnosticLevelFromChart('all');
                data.setCurrentPage(1);
              }}
              onWeakAreaClick={(area) => {
                data.setSelectedWeakAreaFromChart(area);
                data.setSelectedCoachFromChart('');
                data.setSelectedDiagnosticLevelFromChart('all');
                data.setCurrentPage(1);
              }}
            />

            <InsightsSection
              learners={data.filteredLearners}
              subject={data.filters.subject}
              onCoachClick={(coach) => {
                data.setSelectedCoachFromChart(coach);
                data.setCurrentPage(1);
              }}
              onWeakAreaClick={(area) => {
                data.setSelectedWeakAreaFromChart(area);
                data.setCurrentPage(1);
              }}
            />

            <section>
              <h2 className="text-base font-heading font-semibold text-foreground-900 mb-4">Learner Support Table</h2>
              <LearnerTable
                learners={data.pagedLearners}
                allFiltered={data.sortedLearners}
                subject={data.filters.subject}
                sortField={data.sortField}
                sortDirection={data.sortDirection}
                onSort={data.handleSort}
                currentPage={data.currentPage}
                totalPages={data.totalPages}
                pageSize={data.pageSize}
                onPageChange={data.setCurrentPage}
                onPageSizeChange={data.setPageSize}
                onSelectLearner={data.setSelectedLearner}
                onExport={data.exportFilteredCSV}
                onClearFilters={data.clearFilters}
              />
            </section>

            <DataQualitySection
              data={data.dataQuality}
              processingErrors={data.processingErrors}
              onFilterMissingEnglish={() => {
                data.setSelectedDiagnosticLevelFromChart('missing');
                data.updateFilter('subject', 'english');
              }}
              onFilterMissingMaths={() => {
                data.setSelectedDiagnosticLevelFromChart('missing');
                data.updateFilter('subject', 'maths');
              }}
              onFilterMissingEmail={() => {}}
              onFilterMissingName={() => {}}
              onFilterMissingCoach={() => {}}
              onFilterInvalidEnglish={() => {
                data.setSelectedDiagnosticLevelFromChart('invalid');
                data.updateFilter('subject', 'english');
              }}
              onFilterInvalidMaths={() => {
                data.setSelectedDiagnosticLevelFromChart('invalid');
                data.updateFilter('subject', 'maths');
              }}
              onFilterMissingEngFS={() => {
                data.updateFilter('englishExemptionFilter', '');
              }}
              onFilterMissingMathsFS={() => {
                data.updateFilter('mathsExemptionFilter', '');
              }}
              onFilterDuplicate={() => {}}
              onFilterEnglishOnly={() => {}}
              onFilterMathsOnly={() => {}}
            />
          </>
        )}
      </main>

      {data.selectedLearner && (
        <LearnerDetailPanel
          learner={data.selectedLearner}
          onClose={() => data.setSelectedLearner(null)}
        />
      )}
    </div>
  );
}