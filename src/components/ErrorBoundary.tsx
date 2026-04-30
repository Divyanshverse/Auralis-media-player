import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full w-full bg-[#0B0B0D] text-white p-6 text-center z-50 absolute inset-0">
          <h2 className="text-2xl font-bold mb-4 text-red-500">Oops, something went wrong</h2>
          <p className="text-gray-400 mb-6 max-w-md">
            {this.state.error?.message || "An unexpected error occurred while rendering the page."}
          </p>
          <button
            className="px-6 py-2 bg-[#A78BFA] text-[#0B0B0D] rounded-full font-bold hover:bg-[#8B5CF6] transition-colors"
            onClick={() => {
              this.setState({ hasError: false });
              window.location.href = '/';
            }}
          >
            Return to Home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
