import { Component, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Dashboard render error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-background-50">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <i className="ri-error-warning-line text-xl text-red-600" />
          </div>
          <h1 className="text-lg font-heading font-semibold text-foreground-800 mb-2">
            Something went wrong
          </h1>
          <p className="text-sm text-foreground-600 mb-4 max-w-md text-center">
            The dashboard encountered an error while rendering. Please refresh the page or check the browser console for details.
          </p>
          <div className="bg-background-100 border border-background-200/70 rounded-lg p-3 max-w-md w-full mb-4">
            <p className="text-xs text-red-600 font-mono break-all">{this.state.errorMessage}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-sm font-medium rounded-md bg-primary-500 text-white hover:bg-primary-600 transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-refresh-line mr-1.5" /> Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}