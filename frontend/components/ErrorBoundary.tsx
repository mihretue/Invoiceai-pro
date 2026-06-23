'use client';
import React, { Component, ReactNode, ErrorInfo } from 'react';

interface Props  { children: ReactNode; fallback?: ReactNode; }
interface State  { hasError: boolean; error: Error | null; }

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    return (
      <div style={{
        minHeight: '100vh', display: 'grid', placeItems: 'center',
        background: 'var(--bg)', padding: 'var(--lg)',
      }}>
        <div className="card card-pad" style={{ maxWidth: 480, textAlign: 'center', width: '100%' }}>
          <div style={{ fontSize: 56, lineHeight: 1, marginBottom: 16 }}>⚠️</div>
          <h1 className="h2" style={{ marginBottom: 8 }}>Something went wrong</h1>
          <p className="body muted" style={{ marginBottom: 20, lineHeight: 1.55 }}>
            {this.state.error?.message || 'An unexpected error occurred. Please reload the page.'}
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              Reload page
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }
}
