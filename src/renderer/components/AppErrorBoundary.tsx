import { Component, CSSProperties, ErrorInfo, ReactNode } from 'react';
import log from 'electron-log';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  error?: Error;
}

// Inline styles instead of MUI: the boundary wraps the whole provider stack,
// so the fallback must render even when ThemeProvider itself is what crashed.
const styles: Record<string, CSSProperties> = {
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#232428',
    color: '#f2f3f7',
    fontFamily: "'Inter Variable', 'Inter', 'Segoe UI', Roboto, sans-serif",
  },
  card: {
    maxWidth: 520,
    padding: '32px 36px',
    backgroundColor: '#2b2d33',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    boxShadow: '0 12px 48px rgba(0, 0, 0, 0.5)',
    textAlign: 'center',
  },
  title: {
    margin: '0 0 12px',
    fontSize: 20,
    fontWeight: 600,
  },
  body: {
    margin: '0 0 8px',
    fontSize: 14,
    lineHeight: 1.6,
    color: '#a6adc8',
  },
  detail: {
    margin: '0 0 24px',
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#72767d',
    wordBreak: 'break-word',
  },
  button: {
    padding: '10px 24px',
    fontSize: 14,
    fontWeight: 600,
    fontFamily: 'inherit',
    color: '#ffffff',
    backgroundColor: '#7c8aec',
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer',
  },
};

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  constructor(props: AppErrorBoundaryProps) {
    super(props);
    this.state = {};
  }

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Render-phase crashes are otherwise invisible in player log bundles:
    // errorHandler.startCatching only covers the main process.
    log.error(`Renderer crashed during render: ${error.stack ?? error.message}${errorInfo.componentStack ?? ''}`);
  }

  render() {
    const { error } = this.state;
    const { children } = this.props;
    if (error) {
      return (
        <div style={styles.root}>
          <div style={styles.card}>
            <h1 style={styles.title}>Something went wrong</h1>
            <p style={styles.body}>
              The app hit an unexpected error. Reloading usually fixes it — if it keeps happening, send us your logs
              from the Settings page.
            </p>
            <p style={styles.detail}>{error.message}</p>
            <button
              type="button"
              style={styles.button}
              onClick={() => {
                window.location.reload();
              }}
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }
    return children;
  }
}
