import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import ButtonBase from '@mui/material/ButtonBase';
import { useTheme } from '@mui/material/styles';
import { accent, accentDark, duration, easing } from '@/theme';
import { Icon } from '../foundation/Icon';
import type { IconName } from '../foundation/Icon';
import { Avatar } from '../foundation/Avatar';
import { Typography } from '../foundation/Typography';

export interface NotificationData {
  id: string;
  /** Selects the leading icon (match/expiry/system…) — the icon-per-type map is the caller's. */
  icon: IconName;
  title: string;
  body?: string;
  /** Preformatted relative time — no date computation here. */
  timestamp: string;
  read: boolean;
  avatarSrc?: string;
}

export interface NotificationItemProps {
  notification: NotificationData;
  onRead?: () => void;
  onDelete?: () => void;
  onNavigate?: () => void;
  /** drawer = 68px compact · page = 80px (Phase 16.2). */
  density?: 'drawer' | 'page';
}

/**
 * A single notification row (Phase 16.2/16.3): unread dot, type icon or
 * avatar, title/body/timestamp, hover-revealed delete. Marking read is an
 * explicit act (row click or the mark-read affordance), never automatic —
 * that policy lives in the feature layer; this component just exposes the
 * callback. Touch devices get the delete control always visible (no swipe
 * gesture — a deliberate simplification: a visible button covers the same
 * outcome without inventing gesture-recognition code in this phase).
 */
export function NotificationItem({
  notification,
  onRead,
  onDelete,
  onNavigate,
  density = 'page',
}: NotificationItemProps) {
  const theme = useTheme();
  const a = theme.palette.mode === 'dark' ? accentDark : accent;
  const height = density === 'drawer' ? 68 : 80;

  const handleActivate = () => {
    if (!notification.read) onRead?.();
    onNavigate?.();
  };

  return (
    <Box
      data-state={notification.read ? 'read' : 'unread'}
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 3,
        minHeight: height,
        px: 4,
        py: 3,
        borderRadius: 1,
        backgroundColor: notification.read ? 'transparent' : 'action.hover',
        transition: `background-color ${duration.slow}ms ${easing.easeOut}, opacity ${duration.slow}ms ${easing.easeOut}`,
        '&:hover': { backgroundColor: 'action.hover', '& .notification-delete': { opacity: 1 } },
      }}
    >
      <Box sx={{ display: 'flex', gap: 2, flexShrink: 0, alignItems: 'flex-start', pt: 0.5 }}>
        <Box
          role={notification.read ? undefined : 'status'}
          aria-label={notification.read ? undefined : 'Unread'}
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: notification.read ? 'transparent' : a[500],
            flexShrink: 0,
            mt: 1,
          }}
        />
        {notification.avatarSrc !== undefined ? (
          <Avatar src={notification.avatarSrc} size={30} />
        ) : (
          <Box sx={{ color: 'text.secondary', display: 'inline-flex', mt: 0.5 }}>
            <Icon name={notification.icon} size={18} />
          </Box>
        )}
      </Box>

      <ButtonBase
        onClick={handleActivate}
        sx={{
          flex: 1,
          minWidth: 0,
          textAlign: 'left',
          display: 'block',
          borderRadius: 1,
        }}
      >
        <Typography
          variant="textSm"
          color={notification.read ? 'secondary' : 'primary'}
          truncate={1}
        >
          {notification.title}
        </Typography>
        {notification.body && (
          <Typography variant="textSm" color="secondary" truncate={1}>
            {notification.body}
          </Typography>
        )}
        <Typography variant="textXs" color="secondary" tabularNums>
          {notification.timestamp}
        </Typography>
      </ButtonBase>

      {onDelete && (
        <IconButton
          className="notification-delete"
          aria-label={`Delete notification: ${notification.title}`}
          size="small"
          onClick={onDelete}
          sx={{
            opacity: 0,
            transition: `opacity ${duration.fast}ms ${easing.easeOut}`,
            '@media (hover: none)': { opacity: 1 },
          }}
        >
          <Icon name="close" size={14} />
        </IconButton>
      )}
    </Box>
  );
}
