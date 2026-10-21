import { Box, Button, Chip, CircularProgress, Typography, alpha } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { MappingFinding, MappingFlag, MappingReview } from 'main/sentient-sims/models/MappingReview';

type MappingReviewPanelProps = {
  review?: MappingReview;
  loading: boolean;
  // The suggestion with the sims' names filled in, as the input shows text
  suggestionText?: string;
  onUseSuggestion?: () => void;
};

const FLAG_LABELS: Record<MappingFlag, string> = {
  AI_DIRECTIVE: 'Talks to the AI',
  UNWARRANTED_CONTEXT: 'Adds what the interaction does not say',
  HARDCODED_NAME: 'Names a sim',
  RAW_PRONOUN: 'Bare pronoun',
  NON_ENGLISH: 'Not in English',
  BROKEN: 'Will not render right',
  VERBOSE: 'Too long',
};

const VERDICTS: Record<MappingReview['verdict'], { label: string; color: 'success' | 'warning' | 'error' }> = {
  good: { label: 'Good to save', color: 'success' },
  needs_work: { label: 'Could be tighter', color: 'warning' },
  bad: { label: 'Fix before saving', color: 'error' },
};

function findingColor(finding: MappingFinding): 'error' | 'warning' | 'default' {
  if (finding.confidence === 'low') {
    return 'default';
  }
  return finding.flag === 'VERBOSE' || finding.flag === 'UNWARRANTED_CONTEXT' ? 'warning' : 'error';
}

function FindingRow({ finding }: { finding: MappingFinding }) {
  const muted = finding.confidence === 'low';
  return (
    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', opacity: muted ? 0.75 : 1 }}>
      <Chip
        size="small"
        label={FLAG_LABELS[finding.flag]}
        color={findingColor(finding)}
        variant={muted ? 'outlined' : 'filled'}
        sx={{ flexShrink: 0, marginTop: '1px' }}
      />
      <Box sx={{ minWidth: 0 }}>
        {finding.quote ? (
          <Typography
            component="span"
            variant="body2"
            sx={{ fontStyle: 'italic', color: 'text.secondary', marginRight: 0.75, wordBreak: 'break-word' }}
          >
            “{finding.quote}”
          </Typography>
        ) : null}
        <Typography component="span" variant="body2">
          {finding.why}
          {muted ? ' (maybe)' : ''}
        </Typography>
      </Box>
    </Box>
  );
}

export function MappingReviewPanel({ review, loading, suggestionText, onUseSuggestion }: MappingReviewPanelProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          padding: 1.5,
          borderRadius: '10px',
          border: (theme) => `1px solid ${theme.palette.divider}`,
          backgroundColor: 'background.elevated',
          marginBottom: 2,
        }}
      >
        <CircularProgress size={16} />
        <Typography variant="body2" color="text.secondary">
          Reading your mapping against the mapping guidelines…
        </Typography>
      </Box>
    );
  }

  if (!review) {
    return null;
  }

  const verdict = VERDICTS[review.verdict];

  return (
    <Box
      sx={{
        padding: 2,
        borderRadius: '10px',
        border: (theme) => `1px solid ${alpha(theme.palette[verdict.color].main, 0.35)}`,
        backgroundColor: (theme) => alpha(theme.palette[verdict.color].main, 0.06),
        marginBottom: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
        <Chip label={verdict.label} color={verdict.color} size="small" sx={{ fontWeight: 600 }} />
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {review.summary}
        </Typography>
      </Box>

      {review.findings.length > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {review.findings.map((finding) => (
            <FindingRow key={`${finding.flag}-${finding.quote ?? ''}-${finding.why}`} finding={finding} />
          ))}
        </Box>
      ) : null}

      {review.suggestion && suggestionText ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            padding: 1.5,
            borderRadius: '8px',
            backgroundColor: 'background.paper',
            border: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', marginBottom: 0.25 }}>
              Suggested rewrite
            </Typography>
            <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
              {suggestionText}
            </Typography>
          </Box>
          {onUseSuggestion ? (
            <Button size="small" variant="outlined" color="primary" onClick={onUseSuggestion} sx={{ flexShrink: 0 }}>
              Use it
            </Button>
          ) : null}
        </Box>
      ) : null}

      {review.aiError ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="caption" color="text.secondary">
            {review.aiError}
          </Typography>
          {review.inSettings ? (
            <Button
              size="small"
              variant="text"
              onClick={() => {
                void navigate('/settings');
              }}
            >
              Open Settings
            </Button>
          ) : null}
        </Box>
      ) : null}
    </Box>
  );
}
