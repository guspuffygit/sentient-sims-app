/* eslint-disable react/jsx-no-useless-fragment */
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

export default function LogViewerPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const shouldScrollToBottom = useRef<boolean>(true);
  const logViewerRef = useRef<any>(null);
  const scrollToBottomDebounce = useRef(useDebounceHook());

  const handleClick = () => {
    shouldScrollToBottom.current = true;
    logViewerRef?.current?.scrollToBottom();
  };

  const onScroll = (event: any) => {
    if (event.scrollOffsetToBottom === 0) {
      shouldScrollToBottom.current = true;
    } else if (event.scrollOffsetToBottom === -1) {
      // continue to scroll until we hit the bottom
      shouldScrollToBottom.current = true;
      logViewerRef?.current?.scrollToBottom();
    } else {
      shouldScrollToBottom.current = false;
    }
  };

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:${rendererWebsocketPort}`);
    ws.onopen = () => log.debug('Renderer opened connection with app');
    ws.onclose = () => log.debug('Renderer closed connection with app');

    ws.onmessage = (e) => {
      const msg: RendererWebsocketMessage = JSON.parse(e.data);
      if (msg?.log?.message) {
        const formattedLogMessage = formatLog(msg.log);
        setLogs((prevLogs) => [...prevLogs, formattedLogMessage]);
      } else if (msg?.logs) {
        setLogs((prevLogs) => msg.logs || prevLogs);

        // Scroll to the bottom after logs are loaded
        setTimeout(() => {
          if (shouldScrollToBottom.current) {
            logViewerRef?.current?.scrollToBottom();
          }
        }, 300);
      }

      scrollToBottomDebounce.current(() => {
        if (shouldScrollToBottom.current) {
          logViewerRef?.current?.scrollToBottom();
        }
      }, 300);
    };

    return () => {
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
                <LogViewerSearch
                  placeholder="Search value"
                  minSearchChars={0}
                />
              </ToolbarItem>
            </ToolbarContent>
          </Toolbar>
        }
        footer={<Button onClick={handleClick}>Jump to the bottom</Button>}
      />
    </AppCard>
  );
}
