import { useState } from 'react';
import type { DataQualityInfo } from '@/hooks/useDashboardData';

interface DataQualitySectionProps {
  data: DataQualityInfo;
  processingErrors: string[];
  onFilterMissingEnglish: () => void;
  onFilterMissingMaths: () => void;
  onFilterMissingEmail: () => void;
  onFilterMissingName: () => void;
  onFilterMissingCoach: () => void;
  onFilterInvalidEnglish: () => void;
  onFilterInvalidMaths: () => void;
  onFilterMissingEngFS: () => void;
  onFilterMissingMathsFS: () => void;
  onFilterDuplicate: () => void;
  onFilterEnglishOnly: () => void;
  onFilterMathsOnly: () => void;
}

export default function DataQualitySection({
  data, processingErrors,
  onFilterMissingEnglish, onFilterMissingMaths,
  onFilterMissingEmail, onFilterMissingName, onFilterMissingCoach,
  onFilterInvalidEnglish, onFilterInvalidMaths,
  onFilterMissingEngFS, onFilterMissingMathsFS,
  onFilterDuplicate, onFilterEnglishOnly, onFilterMathsOnly,
}: DataQualitySectionProps) {
  const [open, setOpen] = useState(false);

  const items = [
    { label: 'Missing Learner Emails', count: data.missingEmails, onClick: onFilterMissingEmail },
    { label: 'Missing Learner Names', count: data.missingNames, onClick: onFilterMissingName },
    { label: 'Missing Coach Names', count: data.missingCoaches, onClick: onFilterMissingCoach },
    { label: 'Missing English Diagnostic Result', count: data.missingEnglishDiag, onClick: onFilterMissingEnglish },
    { label: 'Missing Maths Diagnostic Result', count: data.missingMathsDiag, onClick: onFilterMissingMaths },
    { label: 'Invalid English Diagnostic Format', count: data.invalidEnglishDiag, onClick: onFilterInvalidEnglish },
    { label: 'Invalid Maths Diagnostic Format', count: data.invalidMathsDiag, onClick: onFilterInvalidMaths },
    { label: 'Missing English FS Status', count: data.missingEnglishFSStatus, onClick: onFilterMissingEngFS },
    { label: 'Missing Maths FS Status', count: data.missingMathsFSStatus, onClick: onFilterMissingMathsFS },
    { label: 'Duplicate Email Addresses', count: data.duplicateEmails, onClick: onFilterDuplicate },
    { label: 'Learners Present Only in English', count: data.englishOnly, onClick: onFilterEnglishOnly },
    { label: 'Learners Present Only in Maths', count: data.mathsOnly, onClick: onFilterMathsOnly },
  ];

  return (
    <section className="border border-background-200/70 rounded-lg">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3 cursor-pointer hover:bg-background-100/50 transition-colors"
      >
        <h2 className="text-base font-heading font-semibold text-foreground-900">Data Quality</h2>
        {open ? (
          <i className="ri-arrow-up-s-line text-foreground-600 text-lg" />
        ) : (
          <i className="ri-arrow-down-s-line text-foreground-600 text-lg" />
        )}
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-background-200/70 pt-4">
          {processingErrors.length > 0 && (
            <div className="mb-4 p-3 bg-accent-50 border border-accent-200 rounded-md">
              {processingErrors.map((err, i) => (
                <p key={i} className="text-sm text-accent-800">{err}</p>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {items.map(item => (
              <button
                key={item.label}
                onClick={item.onClick}
                className="flex flex-col p-3 rounded-lg bg-background-100 border border-background-200/70 hover:border-secondary-300 transition-colors cursor-pointer text-left"
              >
                <span className="text-xs text-foreground-600">{item.label}</span>
                <span className={`text-xl font-heading font-semibold mt-1 ${item.count > 0 ? 'text-accent-600' : 'text-foreground-400'}`}>
                  {item.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}