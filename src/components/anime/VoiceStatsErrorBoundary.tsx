import React, { Component, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface VoiceStatsErrorBoundaryProps {
  children: ReactNode;
}

interface VoiceStatsErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary specifically for voice stats components
 * Provides graceful error handling without crashing the entire app
 */
export class VoiceStatsErrorBoundary extends Component<
  VoiceStatsErrorBoundaryProps,
  VoiceStatsErrorBoundaryState
> {
  constructor(props: VoiceStatsErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): VoiceStatsErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Voice stats error boundary caught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <AlertCircle className="w-8 h-8 text-yellow-400 mb-2" />
          <p className="text-sm text-gray-400 text-center mb-3">
            Не удалось загрузить статистику озвучек
          </p>
          <button
            onClick={this.handleReset}
            className="px-4 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
          >
            Попробовать снова
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
