import {
  AppBar,
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Link,
  Paper,
  Toolbar,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import axios from 'axios';
import log from 'electron-log';
import { appApiUrl } from 'main/sentient-sims/constants';
import { JSX, useCallback, useEffect, useMemo, useRef, useState } from 'react';

type AnnouncementMessage = {
  id: string;
  author: string;
  authorId: string;
  content: string;
  timestamp: Date;
  attachments: Map<string, unknown>;
  isSystem: boolean;
  authorDisplayName: string;
  authorAvatar: string;
};

type AnnouncementContentProps = {
  content: string;
};

type TextSegment = {
  type: 'text';
  content: string;
};

type LinkSegment = {
  type: 'link';
  text: string;
  url: string;
};

type MarkdownSegment = TextSegment | LinkSegment;

function parseMarkdownLinks(input: string): MarkdownSegment[] {
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g;

  const segments: MarkdownSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(input)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        content: input.slice(lastIndex, match.index),
      });
    }

    segments.push({
      type: 'link',
      text: match[1],
      url: match[2],
    });

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < input.length) {
    segments.push({
      type: 'text',
      content: input.slice(lastIndex),
    });
  }

  return segments;
}

const AnnouncementContent = ({ content }: AnnouncementContentProps) => {
  if (content.startsWith('## ')) {
    return (
      <Typography variant="h6" sx={{ color: 'text.primary', marginBottom: 1 }}>
        {content.substring(3, content.length)}
      </Typography>
    );
  }

  return (
    <Typography variant="body2" sx={{ color: 'text.primary', marginBottom: 1 }}>
      {parseMarkdownLinks(content).map((segment, index) => {
        const key = `${index}-${segment.type === 'text' ? segment.content : `${segment.url}-${segment.text}`}`;
        if (segment.type === 'text') {
          return <span key={key}>{segment.content}</span>;
        }

        return (
          <Link
            key={key}
            href={segment.url}
            target="_blank"
            rel="noopener noreferrer"
            variant="body2"
            underline="none"
            sx={{
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            {segment.text}
          </Link>
        );
      })}
    </Typography>
  );
};

export const useAnnouncements = () => {
  const [data, setData] = useState<AnnouncementMessage[]>([]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        type RawAnnouncement = Omit<AnnouncementMessage, 'timestamp'> & { timestamp: string };
        const response = await axios.get<RawAnnouncement[]>(`${appApiUrl}/announcements`);
        const rawData = response.data;

        const formattedData: AnnouncementMessage[] = rawData.map((announcement) => ({
          ...announcement,
          timestamp: new Date(announcement.timestamp), // Date doesnt parse with JSON.parse(), so it must be converted from a string to Date
        }));

        setData(formattedData);
      } catch (err) {
        log.error('Failed to fetch announcements:', err);
      }
    };

    void fetchAnnouncements();

    const intervalId = setInterval(
      () => {
        void fetchAnnouncements();
      },
      3 * 60 * 1000,
    );

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return data;
};

export const Announcements = () => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const announcements = useAnnouncements();

  const updateScrollCues = useCallback(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }
    setCanScrollUp(el.scrollTop > 4);
    setCanScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    const content = contentRef.current;
    if (!el || !content) {
      return undefined;
    }
    // Observing content as well as the viewport catches announcements arriving, which grow scrollHeight without resizing the viewport
    const observer = new ResizeObserver(updateScrollCues);
    observer.observe(el);
    observer.observe(content);
    return () => {
      observer.disconnect();
    };
  }, [updateScrollCues]);

  useEffect(() => {
    const scrollTimeout = setTimeout(() => {
      bottomRef.current?.scrollIntoView();
    }, 50);

    return () => {
      clearTimeout(scrollTimeout);
    };
  }, [announcements]);

  const cards: JSX.Element[] = useMemo(() => {
    const theCards: JSX.Element[] = [];
    announcements.forEach((announcement) => {
      theCards.push(
        <Box key={announcement.id} sx={{ marginBottom: 1.5 }}>
          <Card sx={{ backgroundColor: 'background.elevated' }}>
            <CardHeader
              avatar={<Avatar aria-label="author avatar" src={announcement.authorAvatar} />}
              sx={{ paddingBottom: 0 }}
              titleTypographyProps={{
                sx: { color: 'primary.light', fontWeight: 600 },
              }}
              subheaderTypographyProps={{
                sx: { fontSize: '0.75rem' },
              }}
              title={announcement.authorDisplayName}
              subheader={`${announcement.timestamp.toLocaleTimeString()} ${announcement.timestamp.toDateString()}`}
            />
            <CardContent>
              {announcement.content.split('\n').map((content) => (
                <AnnouncementContent content={content.trim()} key={content} />
              ))}
            </CardContent>
          </Card>
        </Box>,
      );
    });
    return theCards;
  }, [announcements]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 40px)',
        minHeight: 280,
        position: 'sticky',
        top: 20,
      }}
    >
      <AppBar
        position="static"
        color="transparent"
        sx={{
          flexShrink: 0,
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
        }}
      >
        <Toolbar variant="dense" sx={{ minHeight: 56 }}>
          <Typography
            variant="subtitle1"
            noWrap
            component="div"
            sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
          >
            Announcements
          </Typography>
          <IconButton
            aria-label="Join our Discord"
            onClick={() => window.open('https://discord.gg/JTjbydmUAp', '_blank')}
          >
            <img src={`${appApiUrl}/files/discord.png`} alt="Discord Logo" style={{ width: 100, height: 34 }} />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Paper
        elevation={0}
        sx={{
          marginTop: 2,
          flexGrow: 1,
          minHeight: 0,
          boxSizing: 'border-box',
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          id="announcements-scroll"
          ref={scrollRef}
          onScroll={updateScrollCues}
          sx={{
            height: '100%',
            overflowY: 'auto',
            p: 1.5,
            scrollbarGutter: 'stable',
            scrollbarColor: 'rgba(255, 255, 255, 0.28) rgba(255, 255, 255, 0.06)',
          }}
        >
          <div ref={contentRef}>
            {cards}

            <div ref={bottomRef} />
          </div>
        </Box>
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 48,
            pointerEvents: 'none',
            opacity: canScrollUp ? 1 : 0,
            transition: 'opacity 150ms ease',
            background: (theme) =>
              `linear-gradient(180deg, ${theme.palette.background.paper}, ${alpha(theme.palette.background.paper, 0)})`,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 48,
            pointerEvents: 'none',
            opacity: canScrollDown ? 1 : 0,
            transition: 'opacity 150ms ease',
            background: (theme) =>
              `linear-gradient(0deg, ${theme.palette.background.paper}, ${alpha(theme.palette.background.paper, 0)})`,
          }}
        />
      </Paper>
    </Box>
  );
};
