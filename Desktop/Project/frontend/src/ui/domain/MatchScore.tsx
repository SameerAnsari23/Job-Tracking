import Box from '@mui/material/Box';
import { Progress } from '../foundation/Progress';
import { Tooltip } from '../foundation/Tooltip';
import { Typography } from '../foundation/Typography';
import type { TypographyColor } from '../foundation/Typography';

export interface MatchScoreProps {
  /** 0–100. The feature layer decides whether to render this at all — never fabricate a score. */
  score: number;
  size?: number;
  /** Tooltip slot — e.g. "Matches your Backend Engineer profile". */
  tooltip?: string;
  /** Threshold at/above which the ring turns success-toned (default 80). */
  strongThreshold?: number;
  /** Threshold at/above which the ring turns accent-toned; below it, neutral (default 50). */
  moderateThreshold?: number;
}

/**
 * Ring match-score indicator (Phase 16.4): percentage + color thresholds +
 * an optional tooltip explaining the match. Presentation only — the score
 * itself always arrives as a prop; this component never computes one.
 */
export function MatchScore({
  score,
  size = 32,
  tooltip,
  strongThreshold = 80,
  moderateThreshold = 50,
}: MatchScoreProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const strong = clamped >= strongThreshold;
  const moderate = !strong && clamped >= moderateThreshold;

  const progressTone = strong ? 'success' : 'accent';
  const textColor: TypographyColor = strong ? 'success' : moderate ? 'accent' : 'secondary';

  const ring = (
    <Box sx={{ position: 'relative', display: 'inline-flex', width: size, height: size }}>
      <Progress
        variant="ring"
        value={clamped}
        size={size}
        tone={progressTone}
        aria-label={`Match score ${clamped}%`}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="labelXs" tabularNums as="span" color={textColor}>
          {clamped}
        </Typography>
      </Box>
    </Box>
  );

  return tooltip ? <Tooltip content={tooltip}>{ring}</Tooltip> : ring;
}
