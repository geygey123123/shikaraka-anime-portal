import React, { Component, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface SearchErrorBoundaryProps {
  children: ReactNode;
}

interface SearchErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary specifically for search components
 * Provides graceful error handling without crashing the entire app
 */
export class SearchErrorBoundary extends Component<
  SearchErrorBoundaryProps,
  SearchErrorBoundaryState
> {
  constructor(props: SearchErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): SearchErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Search error boundary caught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Ошибка при загрузке поиска
          </h3>
          <p className="text-gray-400 text-center mb-6 max-w-md">
            Произошла ошибка при загрузке компонента поиска. Попробуйте обновить страницу.
          </p>
          {this.state.error && (
            <p className="text-gray-500 text-sm mb-6 font-mono text-center max-w-md">
              {this.state.error.message}
            </p>
          )}
          <div className="flex gap-4">
            <button
              onClick={this.handleReset}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Попробовать снова
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Обновить страницу
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
