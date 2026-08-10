import { LogViewer, LogViewerSearch } from '@patternfly/react-log-viewer';
import { Toolbar, ToolbarContent, ToolbarItem } from '@patternfly/react-core';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button } from '@mui/material';
import { alpha } from '@mui/material/styles';
import TerminalOutlinedIcon from '@mui/icons-material/TerminalOutlined';
import VerticalAlignBottomOutlinedIcon from '@mui/icons-material/VerticalAlignBottomOutlined';
import { RendererWebsocketMessage } from 'main/sentient-sims/models/RendererWebsocketMessage';
import log from 'electron-log';
import { formatLog } from 'main/sentient-sims/util/format';
import { rendererWebsocketPort } from 'main/sentient-sims/constants';
import AppCard from './AppCard';
import { useDebounceHook } from './hooks/useDebounceHook';
import { EmptyState } from './components/EmptyState';
import theme from './theme';

type LogViewerHandle = { scrollToBottom: () => void };

type ScrollEvent = {
  scrollDirection: 'forward' | 'backward';
  scrollOffset: number;
  scrollOffsetToBottom: number;
  scrollUpdateWasRequested: boolean;
};

const ANSI_RESET = '\u001b[0m';
const ANSI_BOLD = '\u001b[1m';

function ansiColor(hex: string): string {
  const rgb = parseInt(hex.slice(1), 16);
  return `\u001b[38;2;${(rgb >> 16) & 0xff};${(rgb >> 8) & 0xff};${rgb & 0xff}m`;
}

const timestampColor = ansiColor(theme.palette.text.secondary);

const levelColors = new Map<string, string>([
  ['ERROR', ansiColor(theme.palette.error.main)],
  ['WARNING', ansiColor(theme.palette.warning.main)],
  ['WARN', ansiColor(theme.palette.warning.main)],
  ['INFO', ansiColor(theme.palette.info.main)],
  ['SUCCESS', ansiColor(theme.palette.success.main)],
  ['DEBUG', ansiColor(theme.palette.text.secondary)],
  ['TRACE', ansiColor(theme.palette.text.secondary)],
]);

const logLinePattern = /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3})( - )([A-Z]+)( - )/;

// Purely presentational: the log viewer renders ANSI codes as colored spans while
// search, copy, and row measurement all strip them first, so behavior is unchanged.
function colorizeLogLine(line: string): string {
  const match = logLinePattern.exec(line);
  if (!match) {
    return line;
  }
  const [prefix, timestamp, leftSeparator, level, rightSeparator] = match;
  const levelColor = levelColors.get(level);
  if (!levelColor) {
    return line;
  }
  const message = line.slice(prefix.length);
  return [
    `${timestampColor}${timestamp}${leftSeparator}${ANSI_RESET}`,
    `${ANSI_BOLD}${levelColor}${level}${ANSI_RESET}`,
    `${timestampColor}${rightSeparator}${ANSI_RESET}`,
    message,
  ].join('');
}

export default function LogViewerPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const shouldScrollToBottomRef = useRef<boolean>(true);
  const logViewerRef = useRef<LogViewerHandle | null>(null);
  const scrollToBottomDebounceRef = useRef(useDebounceHook());

  const handleClick = () => {
    shouldScrollToBottomRef.current = true;
    logViewerRef.current?.scrollToBottom();
  };

  const onScroll = (event: ScrollEvent) => {
    if (event.scrollOffsetToBottom === 0) {
      shouldScrollToBottomRef.current = true;
    } else if (event.scrollOffsetToBottom === -1) {
      // continue to scroll until we hit the bottom
      shouldScrollToBottomRef.current = true;
      logViewerRef.current?.scrollToBottom();
    } else {
      shouldScrollToBottomRef.current = false;
    }
  };

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:${rendererWebsocketPort}`);
    let pendingScrollTimeout: ReturnType<typeof setTimeout> | undefined;
    ws.onopen = () => {
      log.debug('Renderer opened connection with app');
    };
    ws.onclose = () => {
      log.debug('Renderer closed connection with app');
    };

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data as string) as RendererWebsocketMessage;
      if (msg.log?.message) {
        const formattedLogMessage = formatLog(msg.log);
        setLogs((prevLogs) => [...prevLogs, formattedLogMessage]);
      } else if (msg.logs) {
        setLogs((prevLogs) => msg.logs ?? prevLogs);

        // Scroll to the bottom after logs are loaded
        pendingScrollTimeout = setTimeout(() => {
          if (shouldScrollToBottomRef.current) {
            logViewerRef.current?.scrollToBottom();
          }
        }, 300);
      }

      scrollToBottomDebounceRef.current(() => {
        if (shouldScrollToBottomRef.current) {
          logViewerRef.current?.scrollToBottom();
        }
      }, 300);
    };

    return () => {
      if (pendingScrollTimeout !== undefined) clearTimeout(pendingScrollTimeout);
      ws.close();
    };
  }, []);

  const coloredLogs = useMemo(() => logs.map((line) => colorizeLogLine(line)), [logs]);

  return (
    <>
      {logs.length === 0 ? (
        <EmptyState
          icon={<TerminalOutlinedIcon />}
          title="Waiting for log output"
          description="Logs from the mod stream here in real time while The Sims 4 is running."
        />
      ) : (
        <AppCard
          title="Log stream"
          subtitle={`${logs.length.toLocaleString()} line${logs.length === 1 ? '' : 's'} streamed`}
          icon={<TerminalOutlinedIcon sx={{ fontSize: 18 }} />}
        >
          <Box
            sx={{
              // Dark-theme the PatternFly widgets (search input, badge, arrow buttons)
              // by scoping their global design tokens to this container.
              '--pf-t--global--text--color--regular': theme.palette.text.primary,
              '--pf-t--global--text--color--subtle': theme.palette.text.secondary,
              '--pf-t--global--text--color--placeholder': theme.palette.text.disabled,
              '--pf-t--global--text--color--on-disabled': theme.palette.text.disabled,
              '--pf-t--global--icon--color--regular': theme.palette.text.secondary,
              '--pf-t--global--icon--color--subtle': theme.palette.text.secondary,
              '--pf-t--global--icon--color--on-disabled': theme.palette.text.disabled,
              '--pf-t--global--background--color--control--default': 'transparent',
              '--pf-t--global--background--color--disabled--default': theme.palette.action.disabledBackground,
              '--pf-t--global--background--color--action--plain--hover': alpha(theme.palette.common.white, 0.08),
              '--pf-t--global--background--color--action--plain--clicked': alpha(theme.palette.common.white, 0.12),
              '--pf-t--global--border--color--control--default': alpha(theme.palette.common.white, 0.14),
              '--pf-t--global--border--color--hover': alpha(theme.palette.common.white, 0.28),
              '--pf-t--global--border--color--clicked': theme.palette.primary.main,
              '--pf-t--global--border--color--disabled': 'transparent',
              '--pf-t--global--border--color--high-contrast': 'transparent',
              '--pf-t--global--color--nonstatus--gray--default': alpha(theme.palette.common.white, 0.1),
              '--pf-t--global--text--color--nonstatus--on-gray--default': theme.palette.text.secondary,
              '& .pf-v6-c-log-viewer': {
                '--pf-v6-c-log-viewer__list--FontFamily': "'Courier New', Courier, monospace",
                '--pf-v6-c-log-viewer__list--FontSize': '13px',
                '--pf-v6-c-log-viewer__string--m-match--Color': theme.palette.text.primary,
                '--pf-v6-c-log-viewer__string--m-match--BackgroundColor': alpha(theme.palette.primary.main, 0.3),
                '--pf-v6-c-log-viewer__string--m-current--Color': theme.palette.primary.contrastText,
                '--pf-v6-c-log-viewer__string--m-current--BackgroundColor': theme.palette.primary.dark,
              },
              '& .pf-v6-c-log-viewer__header': {
                marginBlockEnd: '12px',
              },
              '& .pf-v6-c-toolbar__item': {
                width: 360,
                maxWidth: '100%',
              },
              // Console window surface, matching the app's .code-window look
              '& .pf-v6-c-log-viewer__main': {
                backgroundColor: '#141414',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '8px',
                overflow: 'hidden',
              },
              '& .pf-v6-c-log-viewer__text': {
                color: 'text.primary',
              },
            }}
          >
            <LogViewer
              ref={logViewerRef}
              theme="dark"
              hasLineNumbers={false}
              data={coloredLogs}
              onScroll={onScroll}
              toolbar={
                <Toolbar>
                  <ToolbarContent>
                    <ToolbarItem>
                      <LogViewerSearch placeholder="Search value" minSearchChars={0} />
                    </ToolbarItem>
                  </ToolbarContent>
                </Toolbar>
              }
              footer={
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: 1 }}>
                  <Button
                    variant="text"
                    color="secondary"
                    size="small"
                    startIcon={<VerticalAlignBottomOutlinedIcon sx={{ fontSize: 16 }} />}
                    onClick={handleClick}
                  >
                    Jump to the bottom
                  </Button>
                </Box>
              }
            />
          </Box>
        </AppCard>
      )}
    </>
  );
}
