import { screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { renderWithTheme, inBothThemes } from '@/test/renderWithTheme';
import { ResumeViewer } from './ResumeViewer';

describe('ResumeViewer', () => {
  it('loading state shows a labeled spinner', () => {
    renderWithTheme(<ResumeViewer status="loading" />);
    expect(screen.getByRole('status', { name: 'Loading resume' })).toBeInTheDocument();
  });

  it('unavailable state shows an empty-state message', () => {
    renderWithTheme(<ResumeViewer status="unavailable" />);
    expect(screen.getByText('No resume uploaded')).toBeInTheDocument();
  });

  inBothThemes('available state renders filename and formatted size', (mode) => {
    renderWithTheme(
      <ResumeViewer
        status="available"
        filename="resume.pdf"
        fileSize={182_000}
        updatedAt="3 days ago"
      />,
      mode,
    );
    expect(screen.getByText('resume.pdf')).toBeInTheDocument();
    expect(screen.getByText(/178 KB/)).toBeInTheDocument();
    expect(screen.getByText(/3 days ago/)).toBeInTheDocument();
  });

  it('renders the download and fullscreen slots', () => {
    renderWithTheme(
      <ResumeViewer
        status="available"
        filename="resume.pdf"
        downloadSlot={<button>Download</button>}
        fullscreenSlot={<button>Fullscreen</button>}
      />,
    );
    expect(screen.getByRole('button', { name: 'Download' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Fullscreen' })).toBeInTheDocument();
  });

  it('renders the embed slot when given, contained in its own region', () => {
    renderWithTheme(
      <ResumeViewer status="available" embedSlot={<iframe title="resume preview" />} />,
    );
    expect(screen.getByTitle('resume preview')).toBeInTheDocument();
  });

  it('does not render the embed region when no embedSlot is given', () => {
    const { container } = renderWithTheme(
      <ResumeViewer status="available" filename="resume.pdf" />,
    );
    expect(container.querySelector('iframe')).not.toBeInTheDocument();
  });

  it('has no axe violations in all three statuses', async () => {
    const { container, rerender } = renderWithTheme(<ResumeViewer status="loading" />);
    expect(await axe(container)).toHaveNoViolations();
    rerender(<ResumeViewer status="unavailable" />);
    expect(await axe(container)).toHaveNoViolations();
    rerender(<ResumeViewer status="available" filename="resume.pdf" fileSize={1000} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
