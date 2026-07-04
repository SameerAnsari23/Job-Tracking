import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import { Icon } from '../foundation/Icon';
import { Spinner } from '../foundation/Spinner';
import { Typography } from '../foundation/Typography';
import { EmptyState } from '../layout/EmptyState';

export type ResumeViewerStatus = 'loading' | 'available' | 'unavailable';

export interface ResumeViewerProps {
  status: ResumeViewerStatus;
  filename?: string;
  /** Bytes — formatted here (display formatting, not business logic). */
  fileSize?: number;
  /** Preformatted display string — no date computation here. */
  updatedAt?: string;
  /** The actual document preview (an <iframe>, a PDF-viewer library's output…) — rendering it is out of scope here. */
  embedSlot?: ReactNode;
  downloadSlot?: ReactNode;
  fullscreenSlot?: ReactNode;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Resume/document frame (Phase 16.4) — no PDF rendering logic here at all;
 * `embedSlot` is whatever preview element the feature layer wires up. This
 * component only owns metadata display and the loading/unavailable states.
 */
export function ResumeViewer({
  status,
  filename,
  fileSize,
  updatedAt,
  embedSlot,
  downloadSlot,
  fullscreenSlot,
}: ResumeViewerProps) {
  if (status === 'loading') {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          minHeight: 160,
        }}
      >
        <Spinner size={20} label="Loading resume" />
      </Box>
    );
  }

  if (status === 'unavailable') {
    return (
      <EmptyState
        icon="file"
        title="No resume uploaded"
        description="Upload a resume to preview it here."
      />
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        <Box sx={{ color: 'text.secondary', display: 'inline-flex' }}>
          <Icon name="file" size={20} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {filename && (
            <Typography variant="textSm" truncate={1}>
              {filename}
            </Typography>
          )}
          <Typography variant="textXs" color="secondary">
            {[fileSize != null ? formatBytes(fileSize) : null, updatedAt]
              .filter(Boolean)
              .join(' · ')}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {downloadSlot}
          {fullscreenSlot}
        </Box>
      </Box>
      {embedSlot && (
        <Box
          sx={{
            borderRadius: 2,
            overflow: 'hidden',
            border: 1,
            borderColor: 'divider',
            minHeight: 320,
          }}
        >
          {embedSlot}
        </Box>
      )}
    </Box>
  );
}
