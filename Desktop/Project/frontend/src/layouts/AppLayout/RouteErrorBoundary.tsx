import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { ErrorState } from '@/ui/layout/ErrorState';
import { Container } from '@/ui/layout/Container';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Route-level error boundary (Phase 18.1) — sits inside the themed shell,
 * below AppErrorBoundary (Phase 16.5's dependency-free outermost boundary).
 * Catches a crash in one lazy-loaded page/chunk without tearing down the
 * sidebar/topbar around it, and offers a reload rather than a dead page.
 */
export class RouteErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[RouteErrorBoundary]', error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <Container width="narrow">
          <ErrorState
            title="This page hit an error"
            cause="Reloading usually resolves it — your session is untouched."
            onRetry={() => window.location.reload()}
          />
        </Container>
      );
    }
    return this.props.children;
  }
}
