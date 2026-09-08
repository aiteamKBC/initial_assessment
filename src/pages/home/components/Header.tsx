import type { ConnectionStatus } from '@/types/dashboard';

interface HeaderProps {
  connectionStatus: ConnectionStatus;
  lastUpdated: Date | null;
  onRefresh: () => void;
  englishError: string;
  mathsError: string;
}

function getStatusLabel(status: ConnectionStatus): string {
  switch (status) {
    case 'connected': return 'Connected';
    case 'partially-connected': return 'Partially Connected';
    case 'connection-error': return 'Connection Error';
    case 'refreshing': return 'Refreshing';
  }
}

function getStatusDot(status: ConnectionStatus): string {
  switch (status) {
    case 'connected': return 'bg-primary-500';
    case 'partially-connected': return 'bg-accent-500';
    case 'connection-error': return 'bg-red-500';
    case 'refreshing': return 'bg-secondary-400 animate-pulse';
  }
}

export default function Header({ connectionStatus, lastUpdated, onRefresh, englishError, mathsError }: HeaderProps) {
  return (
    <header className="w-full bg-background-50 border-b border-background-200/70">
      <div className="px-4 md:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg md:text-xl font-heading font-semibold text-foreground-900">
            English &amp; Maths Diagnostic Dashboard
          </h1>
          <p className="text-sm text-foreground-600 mt-0.5">
            Monitor diagnostic scores and identify learners requiring support.
          </p>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-foreground-600">
            <span className={`w-2 h-2 rounded-full ${getStatusDot(connectionStatus)}`} />
            <span className="whitespace-nowrap">{getStatusLabel(connectionStatus)}</span>
          </div>
          {lastUpdated && (
            <span className="text-xs text-foreground-500 whitespace-nowrap">
              Last updated: {lastUpdated.toLocaleString('en-GB')}
            </span>
          )}
          <button
            onClick={onRefresh}
            disabled={connectionStatus === 'refreshing'}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-secondary-100 text-secondary-800 hover:bg-secondary-200 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
          >
            <i className={`ri-refresh-line text-base ${connectionStatus === 'refreshing' ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>
      </div>
      {(englishError || mathsError) && (
        <div className="px-4 md:px-6 pb-3">
          {englishError && (
            <p className="text-xs text-red-600">English tab: {englishError}</p>
          )}
          {mathsError && (
            <p className="text-xs text-red-600">Maths tab: {mathsError}</p>
          )}
        </div>
      )}
    </header>
  );
}