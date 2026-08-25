import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AppButton } from './ui/AppButton';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Last line of defence against a render crash. Keeps the partner inside the
 * app with a way out, rather than showing a blank white screen.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Replace with the crash reporter once one is configured.
    console.error('Unhandled render error:', error, info.componentStack);
  }

  private handleReset = (): void => {
    this.setState({ error: null });
    window.location.assign('/');
  };

  render(): ReactNode {
    if (!this.state.error) return this.props.children;

    return (
      <div className="flex h-dvh flex-col items-center justify-center bg-surface px-8 text-center">
        <h1 className="text-[15px] font-extrabold text-content">Something broke</h1>
        <p className="mt-2 max-w-sm text-[12px] leading-relaxed text-muted">
          The app hit an unexpected error. Restarting usually clears it. If it keeps happening,
          please let our support team know.
        </p>
        <AppButton className="mt-6" onClick={this.handleReset}>
          Restart app
        </AppButton>
      </div>
    );
  }
}
