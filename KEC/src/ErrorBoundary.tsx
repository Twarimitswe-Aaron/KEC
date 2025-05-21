import React from 'react';

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-10 text-center">
          <h1 className="text-3xl font-bold text-red-600">Something went wrong.</h1>
          <p className="text-gray-600 mt-4">{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
