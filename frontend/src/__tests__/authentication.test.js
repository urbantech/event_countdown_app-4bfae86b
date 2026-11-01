import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('node-fetch', () => jest.fn());

beforeEach(() => {
  jest.clearAllMocks();
});

const mockSuccessResponse = {
  json: jest.fn().mockResolvedValue({ token: 'mockToken' }),
};

const mockErrorResponse = {
  json: jest.fn().mockResolvedValue({ error: 'Invalid credentials' }),
};

describe('Authentication Component', () => {
  it('renders correctly', () => {
    render(<Authentication />);
    expect(screen.getByTestId('authentication-container')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('handles user interactions', async () => {
    render(<Authentication />);
    userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    userEvent.type(screen.getByLabelText(/password/i), 'password123');
    userEvent.click(screen.getByRole('button', { name: /login/i }));

    global.fetch.mockResolvedValue(mockSuccessResponse);
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.ainative.studio/api/v1/auth/login',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123',
          }),
        })
      )
    );
  });

  it('shows loading state', async () => {
    render(<Authentication />);
    userEvent.click(screen.getByRole('button', { name: /login/i }));
    expect(screen.getByText(/loading.../i)).toBeInTheDocument();

    global.fetch.mockResolvedValue(mockSuccessResponse);
    await waitFor(() => expect(screen.queryByText(/loading.../i)).not.toBeInTheDocument());
  });

  it('handles API errors', async () => {
    render(<Authentication />);
    userEvent.click(screen.getByRole('button', { name: /login/i }));

    global.fetch.mockResolvedValue({
      ...mockErrorResponse,
      status: 401,
    });
    await waitFor(() => expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument());
  });

  it('is accessible', async () => {
    const { container } = render(<Authentication />);
    expect(container).toHaveNoViolations();
  });
});