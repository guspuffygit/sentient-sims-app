import { LogViewer, LogViewerSearch } from '@patternfly/react-log-viewer';
import { Toolbar, ToolbarContent, ToolbarItem } from '@patternfly/react-core';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@mui/material';
import { RendererWebsocketMessage } from 'main/sentient-sims/models/RendererWebsocketMessage';
import log from 'electron-log';
import { formatLog } from 'main/sentient-sims/util/format';
import { rendererWebsocketPort } from 'main/sentient-sims/constants';
import AppCard from './AppCard';
import { useDebounceHook } from './hooks/useDebounceHook';

type LogViewerHandle = { scrollToBottom: () => void };

type ScrollEvent = {
  scrollDirection: 'forward' | 'backward';
  scrollOffset: number;
  scrollOffsetToBottom: number;
  scrollUpdateWasRequested: boolean;
};

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

  return (
    <AppCard>
      <LogViewer
        ref={logViewerRef}
        theme="dark"
        hasLineNumbers={false}
        data={logs}
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
        footer={<Button onClick={handleClick}>Jump to the bottom</Button>}
      />
    </AppCard>
  );
}
