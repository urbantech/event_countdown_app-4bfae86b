import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('node-fetch', () => jest.fn());

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('ResponsiveDesign Component', () => {
  it('renders correctly', () => {
    render(<ResponsiveDesign />);
    expect(screen.getByTestId('responsive_design-container')).toBeInTheDocument();
  });

  it('handles user interactions by resizing window', async () => {
    render(<ResponsiveDesign />);
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    });
    window.dispatchEvent(new Event('resize'));
    await waitFor(() => {
      expect(screen.getByTestId('responsive_design-container')).toHaveStyle('flex-direction: column');
    });

    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1200,
    });
    window.dispatchEvent(new Event('resize'));
    await waitFor(() => {
      expect(screen.getByTestId('responsive_design-container')).toHaveStyle('flex-direction: row');
    });
  });

  it('shows loading state while fetching data', async () => {
    global.fetch.mockResolvedValue({ json: jest.fn().mockResolvedValue([]) });
    render(<ResponsiveDesign />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    global.fetch.mockRejectedValue(new Error('API error'));
    render(<ResponsiveDesign />);
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it('is accessible', async () => {
    render(<ResponsiveDesign />);
    const container = screen.getByTestId('responsive_design-container');
    expect(container).toHaveAttribute('role', 'region');
    expect(container).toHaveAttribute('aria-label', 'Responsive Design Section');
  });
});