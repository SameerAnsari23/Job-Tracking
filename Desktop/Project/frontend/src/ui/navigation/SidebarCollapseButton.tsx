import IconButton from '@mui/material/IconButton';
import { sidebar } from '@/theme';
import { Icon } from '../foundation/Icon';
import { Tooltip } from '../foundation/Tooltip';

export interface SidebarCollapseButtonProps {
  collapsed: boolean;
  onToggle: () => void;
}

/** Toggles Sidebar's collapsed state; chevron direction mirrors the action. */
export function SidebarCollapseButton({ collapsed, onToggle }: SidebarCollapseButtonProps) {
  const label = collapsed ? 'Expand sidebar' : 'Collapse sidebar';

  return (
    <Tooltip content={label} placement="right">
      <IconButton
        aria-label={label}
        aria-pressed={collapsed}
        onClick={onToggle}
        size="small"
        sx={{
          color: sidebar.iconRest,
          '&:hover': { backgroundColor: sidebar.itemHover, color: sidebar.iconHover },
        }}
      >
        <Icon name={collapsed ? 'chevronRight' : 'chevronLeft'} size={16} />
      </IconButton>
    </Tooltip>
  );
}
