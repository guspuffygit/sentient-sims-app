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
  TypographyVariant,
} from '@mui/material';
import axios from 'axios';
import log from 'electron-log';
import { appApiUrl } from 'main/sentient-sims/constants';
import { JSX, useEffect, useMemo, useRef, useState } from 'react';

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
  let variant: TypographyVariant = 'body2';
  let displayedText = content;

  if (content.startsWith('## ')) {
    variant = 'h6';
    displayedText = content.substring(3, content.length);
    return (
      <Typography variant={variant} sx={{ color: 'text.primary', marginBottom: 1 }}>
        {displayedText}
      </Typography>
    );
  }

  return (
    <Typography variant="body2" sx={{ color: 'text.primary', marginBottom: 1 }}>
      {parseMarkdownLinks(content).map((segment, index) => {
        if (segment.type === 'text') {
          return <span key={index}>{segment.content}</span>;
        }

        return (
          <Link
            key={index}
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
        const response = await axios.get<AnnouncementMessage[]>(`${appApiUrl}/announcements`);
        const rawData = response.data;

        const formattedData: AnnouncementMessage[] = rawData.map((announcement: any) => ({
          ...announcement,
          timestamp: new Date(announcement.timestamp), // Date doesnt parse with JSON.parse(), so it must be converted from a string to Date
        }));

        setData(formattedData);
      } catch (err) {
        log.error('Failed to fetch announcements:', err);
      }
    };

    fetchAnnouncements();

    const intervalId = setInterval(fetchAnnouncements, 3 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  return data;
};

export const Announcements = () => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const announcements = useAnnouncements();

  useEffect(() => {
    const scrollTimeout = setTimeout(() => {
      bottomRef.current?.scrollIntoView();
    }, 50);

    return () => clearTimeout(scrollTimeout);
  }, [announcements]);

  const cards: JSX.Element[] = useMemo(() => {
    const theCards: JSX.Element[] = [];
    announcements.forEach((announcement) => {
      theCards.push(
        <Box sx={{ marginBottom: 1 }}>
          <Card sx={{ maxWidth: 345 }}>
            <CardHeader
              avatar={<Avatar aria-label="recipe" src={announcement.authorAvatar} />}
              sx={{ paddingBottom: 0 }}
              titleTypographyProps={{
                sx: { color: '#ff0000' },
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
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar sx={{ backgroundColor: '#313339' }}>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}>
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
        sx={{
          marginTop: 2,
          flexGrow: 1,
          height: 'calc(100vh - 120px)',
          boxSizing: 'border-box',
          p: 2,
          backgroundColor: '#313339',
          overflowY: 'auto',
        }}
      >
        {cards}

        <div ref={bottomRef} />
      </Paper>
    </Box>
  );
};
