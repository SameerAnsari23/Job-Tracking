import type { FormEventHandler, ReactNode } from 'react';
import Box from '@mui/material/Box';

export interface FormLayoutProps {
  /** 2-column collapses to 1 below md (Phase 16.4). */
  columns?: 1 | 2;
  /** Right-aligned action row — primary action rightmost. */
  footer?: ReactNode;
  /** Pin the footer for long dialog forms. */
  stickyFooter?: boolean;
  onSubmit?: FormEventHandler<HTMLFormElement>;
  children: ReactNode;
}

/**
 * Page/dialog-level form arrangement: renders a real <form> (Enter submits,
 * RHF handleSubmit attaches here), 32px section gap, responsive columns.
 */
export function FormLayout({
  columns = 1,
  footer,
  stickyFooter = false,
  onSubmit,
  children,
}: FormLayoutProps) {
  return (
    <Box
      component="form"
      onSubmit={onSubmit}
      noValidate
      sx={{ display: 'flex', flexDirection: 'column', gap: 8 }}
    >
      <Box
        sx={{
          display: 'grid',
          gap: 8,
          gridTemplateColumns: columns === 2 ? { xs: '1fr', md: '1fr 1fr' } : '1fr',
        }}
      >
        {children}
      </Box>
      {footer && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 3,
            ...(stickyFooter && {
              position: 'sticky',
              bottom: 0,
              backgroundColor: 'background.paper',
              py: 4,
              borderTop: 1,
              borderColor: 'divider',
            }),
          }}
        >
          {footer}
        </Box>
      )}
    </Box>
  );
}
