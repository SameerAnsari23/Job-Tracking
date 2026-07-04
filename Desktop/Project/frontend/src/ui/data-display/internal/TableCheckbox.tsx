import MuiCheckbox from '@mui/material/Checkbox';
import { useTheme } from '@mui/material/styles';

export interface TableCheckboxProps {
  'aria-label': string;
  checked?: boolean;
  indeterminate?: boolean;
  onChange?: () => void;
}

/**
 * Label-less selection checkbox for table header/row cells.
 *
 * ui/forms' Checkbox always renders a visible text label (by design — it's
 * a form field, not a bare control), which doesn't fit a dense table's
 * selection column. Rather than force a visible label into every row or
 * fight Checkbox's DOM internals with CSS, this wraps the bare MUI
 * Checkbox with the product's accent color and an aria-label only —
 * the one legitimate case in this phase where an existing component
 * doesn't fit and a thin primitive wrapper is justified instead.
 */
export function TableCheckbox({
  'aria-label': ariaLabel,
  checked,
  indeterminate,
  onChange,
}: TableCheckboxProps) {
  const theme = useTheme();
  return (
    <MuiCheckbox
      // MUI puts a top-level `aria-label` on the non-interactive wrapper
      // span, not the native input — the label must go through inputProps
      // to reach the element that actually carries the checkbox role.
      inputProps={{ 'aria-label': ariaLabel }}
      checked={checked}
      indeterminate={indeterminate}
      onChange={onChange}
      size="small"
      sx={{ color: theme.palette.text.disabled, '&.Mui-checked': { color: 'primary.main' } }}
    />
  );
}
