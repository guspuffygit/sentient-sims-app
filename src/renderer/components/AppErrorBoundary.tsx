import { Component, CSSProperties, ErrorInfo, ReactNode, SyntheticEvent } from 'react';
import log from 'electron-log';
import { DebugClient } from 'main/sentient-sims/clients/DebugClient';
import { SendLogsRequest } from 'main/sentient-sims/models/SendLogsRequest';
import { AuthUserAttributes, loadUserAttributes } from 'renderer/providers/AuthProvider';

// The boundary sits above AuthProvider, so the crash screen reads the session
// directly; without these lines a crash report cannot answer Patreon questions.
async function userAttributesForReport(): Promise<AuthUserAttributes | undefined> {
  try {
    return await loadUserAttributes();
  } catch (err) {
    log.warn('Crash report sent without user attributes', err);
    return undefined;
  }
}

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  error?: Error;
  componentStack?: string;
  discordUsername: string;
  errorDescription: string;
  sending: boolean;
  logId?: string;
  sendError?: string;
}

// Inline styles instead of MUI: the boundary wraps the whole provider stack,
// so the fallback must render even when ThemeProvider itself is what crashed.
const styles: Record<string, CSSProperties> = {
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: 24,
    boxSizing: 'border-box',
    backgroundColor: '#232428',
    color: '#f2f3f7',
    fontFamily: "'Inter Variable', 'Inter', 'Segoe UI', Roboto, sans-serif",
  },
  card: {
    width: '100%',
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
  secondaryButton: {
    padding: '10px 24px',
    fontSize: 14,
    fontWeight: 600,
    fontFamily: 'inherit',
    color: '#f2f3f7',
    backgroundColor: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.16)',
    borderRadius: 10,
    cursor: 'pointer',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    marginTop: 24,
    paddingTop: 20,
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    textAlign: 'left',
  },
  formTitle: {
    margin: 0,
    fontSize: 14,
    fontWeight: 600,
  },
  formHint: {
    margin: 0,
    fontSize: 12,
    lineHeight: 1.5,
    color: '#a6adc8',
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '9px 12px',
    fontSize: 14,
    fontFamily: 'inherit',
    color: '#f2f3f7',
    backgroundColor: '#232428',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: 8,
    outline: 'none',
  },
  actions: {
    display: 'flex',
    gap: 10,
    justifyContent: 'center',
    marginTop: 6,
  },
  logId: {
    margin: '6px 0 0',
    padding: '10px 12px',
    fontSize: 13,
    fontFamily: 'monospace',
    color: '#f2f3f7',
    backgroundColor: '#232428',
    border: '1px solid rgba(124, 138, 236, 0.5)',
    borderRadius: 8,
    textAlign: 'center',
    userSelect: 'text',
  },
  sendError: {
    margin: '6px 0 0',
    fontSize: 12,
    color: '#f28b82',
    wordBreak: 'break-word',
  },
};

const debugClient = new DebugClient();

export function crashReportDescription(userDescription: string, error: Error, componentStack?: string): string {
  return [`Renderer crash: ${error.message}`, userDescription.trim(), error.stack ?? '', componentStack ?? '']
    .filter((part) => part.length > 0)
    .join('\n\n');
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  constructor(props: AppErrorBoundaryProps) {
    super(props);
    this.state = { discordUsername: '', errorDescription: '', sending: false };
  }

  static getDerivedStateFromError(error: Error): Partial<AppErrorBoundaryState> {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Render-phase crashes are otherwise invisible in player log bundles:
    // errorHandler.startCatching only covers the main process.
    log.error(`Renderer crashed during render: ${error.stack ?? error.message}${errorInfo.componentStack ?? ''}`);
    this.setState({ componentStack: errorInfo.componentStack ?? undefined });
  }

  handleSendLogs = async (e: SyntheticEvent) => {
    e.preventDefault();
    const { error, componentStack, discordUsername, errorDescription } = this.state;
    if (!error) return;

    this.setState({ sending: true, sendError: undefined });
    try {
      const request: SendLogsRequest = {
        discordUsername,
        errorDescription: crashReportDescription(errorDescription, error, componentStack),
        userAttributes: await userAttributesForReport(),
      };
      const response = await debugClient.sendDebugLogs(request);
      if (response.errors.length > 0) {
        this.setState({
          logId: response.logId,
          sendError: 'Some parts of the log bundle failed to attach. The id may still help, paste it in #support.',
        });
        return;
      }
      this.setState({ logId: response.logId });
    } catch (err) {
      this.setState({ sendError: `Could not send logs: ${err instanceof Error ? err.message : String(err)}` });
    } finally {
      this.setState({ sending: false });
    }
  };

  renderSendLogs() {
    const { discordUsername, errorDescription, sending, logId, sendError } = this.state;

    if (logId) {
      return (
        <div style={styles.form}>
          <p style={styles.formTitle}>Logs sent</p>
          <p style={styles.formHint}>Paste this id in the #support channel on Discord so we can find your report.</p>
          <p style={styles.logId}>{logId}</p>
          {sendError && <p style={styles.sendError}>{sendError}</p>}
          <div style={styles.actions}>
            <button
              type="button"
              style={styles.secondaryButton}
              onClick={() => {
                void navigator.clipboard.writeText(logId);
              }}
            >
              Copy id
            </button>
          </div>
        </div>
      );
    }

    return (
      <form
        style={styles.form}
        onSubmit={(e) => {
          void this.handleSendLogs(e);
        }}
      >
        <p style={styles.formTitle}>Send logs to the developer</p>
        <p style={styles.formHint}>
          Sends your app and mod logs, settings (API keys removed), lastException files, and a list of file names in
          your Mods folder. The data is deleted once reviewed.
        </p>
        <input
          style={styles.input}
          placeholder="Discord username"
          value={discordUsername}
          onChange={(e) => {
            this.setState({ discordUsername: e.target.value });
          }}
          required
          disabled={sending}
        />
        <textarea
          style={{ ...styles.input, resize: 'vertical' }}
          placeholder="What were you doing when this happened?"
          rows={3}
          value={errorDescription}
          onChange={(e) => {
            this.setState({ errorDescription: e.target.value });
          }}
          required
          disabled={sending}
        />
        {sendError && <p style={styles.sendError}>{sendError}</p>}
        <div style={styles.actions}>
          <button type="submit" style={styles.secondaryButton} disabled={sending}>
            {sending ? 'Sending…' : 'Send Logs'}
          </button>
        </div>
      </form>
    );
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
              below.
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
            {this.renderSendLogs()}
          </div>
        </div>
      );
    }
    return children;
  }
}
