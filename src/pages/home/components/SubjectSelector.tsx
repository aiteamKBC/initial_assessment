import type { SubjectView } from '@/types/dashboard';

interface SubjectSelectorProps {
  value: SubjectView;
  onChange: (value: SubjectView) => void;
}

const options: { value: SubjectView; label: string }[] = [
  { value: 'all', label: 'All Subjects' },
  { value: 'english', label: 'English' },
  { value: 'maths', label: 'Maths' },
];

export default function SubjectSelector({ value, onChange }: SubjectSelectorProps) {
  return (
    <div className="inline-flex bg-background-100 rounded-full p-1 border border-background-200/70">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all whitespace-nowrap cursor-pointer ${
            value === opt.value
              ? 'bg-background-50 text-foreground-900'
              : 'text-foreground-600 hover:text-foreground-800'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}