import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Outermost error boundary (Phase 16.5 §2, position 1).
 *
 * Sits ABOVE every provider, so the fallback must be dependency-free:
 * no MUI, no theme, no router — inline styles only. Route-level boundaries
 * (added with real pages) handle page crashes with full styling; this is
 * the last line of defense.
 */
export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Error-reporter integration lands in Production Readiness (blueprint S).
    console.error('[AppErrorBoundary]', error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          style={{
            fontFamily: 'system-ui, sans-serif',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <div style={{ maxWidth: 480, textAlign: 'center' }}>
            <h1 style={{ fontSize: 20, marginBottom: 8 }}>Something broke on our side</h1>
            <p style={{ color: '#6B6B88', fontSize: 14, marginBottom: 24 }}>
              The application hit an unexpected error. Reloading usually fixes it.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: '#5B5BD6',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '10px 18px',
                fontSize: 15,
                cursor: 'pointer',
              }}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
