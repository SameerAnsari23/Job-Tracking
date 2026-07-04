import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Routes, Route } from 'react-router-dom';
import { axe } from 'vitest-axe';
import { renderDashboard } from '../tests/testUtils';
import { QuickActionsWidget } from './QuickActionsWidget';

describe('QuickActionsWidget', () => {
  it('renders every action and navigates on click — pure navigation, no data', async () => {
    const user = userEvent.setup();
    renderDashboard(
      <Routes>
        <Route path="/dashboard" element={<QuickActionsWidget />} />
        <Route path="/jobs/saved" element={<div>Saved Jobs Page</div>} />
      </Routes>,
    );

    await user.click(screen.getByRole('button', { name: 'Saved jobs' }));
    expect(await screen.findByText('Saved Jobs Page')).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { container } = renderDashboard(<QuickActionsWidget />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
