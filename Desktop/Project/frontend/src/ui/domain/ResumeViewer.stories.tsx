import type { Meta, StoryObj } from '@storybook/react';
import Box from '@mui/material/Box';
import { ResumeViewer } from './ResumeViewer';
import { Button } from '../foundation/Button';
import { Icon } from '../foundation/Icon';

const meta: Meta = { title: 'Domain/ResumeViewer' };
export default meta;

export const Loading: StoryObj = {
  render: () => (
    <Box sx={{ maxWidth: 480 }}>
      <ResumeViewer status="loading" />
    </Box>
  ),
};

export const Unavailable: StoryObj = {
  render: () => (
    <Box sx={{ maxWidth: 480 }}>
      <ResumeViewer status="unavailable" />
    </Box>
  ),
};

export const Available: StoryObj = {
  render: () => (
    <Box sx={{ maxWidth: 480 }}>
      <ResumeViewer
        status="available"
        filename="sam-ansari-resume.pdf"
        fileSize={182_000}
        updatedAt="Updated 3 days ago"
        downloadSlot={
          <Button variant="ghost" iconOnly aria-label="Download resume">
            <Icon name="externalLink" size={16} />
          </Button>
        }
        fullscreenSlot={
          <Button variant="ghost" iconOnly aria-label="View fullscreen">
            <Icon name="search" size={16} />
          </Button>
        }
      />
    </Box>
  ),
};

export const WithEmbeddedPreview: StoryObj = {
  render: () => (
    <Box sx={{ maxWidth: 480 }}>
      <ResumeViewer
        status="available"
        filename="sam-ansari-resume.pdf"
        fileSize={182_000}
        embedSlot={
          <Box
            sx={{
              width: '100%',
              height: 320,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'text.disabled',
              fontSize: 12,
            }}
          >
            [ PDF preview renders here ]
          </Box>
        }
      />
    </Box>
  ),
};
