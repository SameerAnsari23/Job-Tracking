import { useId, useRef, useState } from 'react';
import type { DragEvent } from 'react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import { neutralLight, neutralDark, accent, accentDark, radius, typeScale, opacity } from '@/theme';
import { Icon } from '../foundation/Icon';
import { ValidationMessage } from './ValidationMessage';

export interface UploadedFileMeta {
  name: string;
  size: number;
  type: string;
}

export interface FileUploadProps {
  label: string;
  /** Accept filter, e.g. ".pdf,.docx" or "application/pdf". */
  accept?: string;
  /** Max size in bytes — larger files are rejected with a message. */
  maxSize?: number;
  /** Called with the accepted File. Transport is the CALLER's concern. */
  onFile: (file: File) => void;
  /** Currently selected file metadata (controlled display). */
  file?: UploadedFileMeta | null;
  onRemove?: () => void;
  disabled?: boolean;
  error?: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Dashed drop-zone (Phase 16.2/16.4). The zone is a REAL BUTTON opening the
 * native file dialog — drag-and-drop is an enhancement, never the only
 * path. Accept/reject outcomes announce via a status region.
 */
export function FileUpload({
  label,
  accept,
  maxSize,
  onFile,
  file = null,
  onRemove,
  disabled = false,
  error,
}: FileUploadProps) {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const n = dark ? neutralDark : neutralLight;
  const a = dark ? accentDark : accent;
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const [dragOver, setDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');

  const shownError = error ?? localError ?? undefined;

  const acceptFile = (candidate: File) => {
    if (maxSize !== undefined && candidate.size > maxSize) {
      setLocalError(`File is too large — maximum ${formatBytes(maxSize)}.`);
      setAnnouncement('File rejected: too large.');
      return;
    }
    setLocalError(null);
    setAnnouncement(`File selected: ${candidate.name}`);
    onFile(candidate);
  };

  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    if (disabled) return;
    const dropped = event.dataTransfer.files[0];
    if (dropped) acceptFile(dropped);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        hidden
        disabled={disabled}
        onChange={(e) => {
          const selected = e.target.files?.[0];
          if (selected) acceptFile(selected);
          e.target.value = ''; // allow re-selecting the same file
        }}
      />

      {!file && (
        <ButtonBase
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled) setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          aria-describedby={shownError ? `${inputId}-error` : undefined}
          sx={{
            width: '100%',
            minHeight: 160,
            borderRadius: `${radius.lg}px`,
            border: `2px dashed ${dragOver ? a[200] : shownError ? theme.palette.error.main : n[300]}`,
            backgroundColor: dragOver ? a[50] : 'transparent',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            color: theme.palette.text.secondary,
            ...(disabled ? { opacity: opacity.disabled } : {}),
            '&:hover': { backgroundColor: dragOver ? a[50] : n[100] },
          }}
        >
          <Icon name="file" size={24} />
          <Box sx={{ ...typeScale.textSm, fontWeight: 500, color: theme.palette.text.primary }}>
            {label}
          </Box>
          <Box sx={{ ...typeScale.textXs }}>
            Drag a file here or click to browse
            {maxSize !== undefined ? ` · up to ${formatBytes(maxSize)}` : ''}
          </Box>
        </ButtonBase>
      )}

      {file && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            p: 3,
            borderRadius: `${radius.lg}px`,
            border: `1px solid ${n[200]}`,
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <Icon name="file" size={20} />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Box
              sx={{
                ...typeScale.textSm,
                fontWeight: 500,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {file.name}
            </Box>
            <Box sx={{ ...typeScale.textXs, color: theme.palette.text.secondary }}>
              {formatBytes(file.size)}
            </Box>
          </Box>
          {onRemove && (
            <IconButton
              aria-label={`Remove ${file.name}`}
              onClick={onRemove}
              disabled={disabled}
              size="small"
            >
              <Icon name="trash" size={16} />
            </IconButton>
          )}
        </Box>
      )}

      {shownError && <ValidationMessage id={`${inputId}-error`}>{shownError}</ValidationMessage>}

      {/* Accept/reject announcements for screen readers. */}
      <Box
        role="status"
        aria-live="polite"
        sx={{
          position: 'absolute',
          width: 1,
          height: 1,
          overflow: 'hidden',
          clipPath: 'inset(50%)',
          whiteSpace: 'nowrap',
        }}
      >
        {announcement}
      </Box>
    </Box>
  );
}
