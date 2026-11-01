import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('node-fetch', () => jest.fn());

describe('EventManagement Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    test('renders correctly', async () => {
        global.fetch.mockResolvedValue({
            json: jest.fn().mockResolvedValue([{ id: 1, title: 'Test Event', date: '2023-12-31' }])
        });
        render(<EventManagement />);
        expect(screen.getByTestId('event_management-container')).toBeInTheDocument();
        await waitFor(() => expect(screen.getByText(/Test Event/i)).toBeInTheDocument());
    });

    test('handles user interactions - creating an event', async () => {
        const mockCreateResponse = { id: 2, title: 'New Event', date: '2024-01-01' };
        global.fetch.mockImplementationOnce(() => Promise.resolve())
                    .mockImplementationOnce(() => Promise.resolve({ json: jest.fn().mockResolvedValue(mockCreateResponse) }));
        render(<EventManagement />);
        userEvent.click(screen.getByText(/Create Event/i));
        userEvent.type(screen.getByPlaceholderText(/Title/i), 'New Event');
        userEvent.type(screen.getByPlaceholderText(/Date/i), '2024-01-01');
        userEvent.click(screen.getByText(/Save/i));
        await waitFor(() => expect(screen.getByText(/New Event/i)).toBeInTheDocument());
    });

    test('shows loading state while fetching events', async () => {
        global.fetch.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 500)));
        render(<EventManagement />);
        expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
        await waitFor(() => expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument());
    });

    test('handles API errors when fetching events', async () => {
        global.fetch.mockRejectedValue(new Error('Failed to fetch'));
        render(<EventManagement />);
        await waitFor(() => expect(screen.getByText(/Failed to load events/i)).toBeInTheDocument());
    });

    test('is accessible', async () => {
        global.fetch.mockResolvedValue({
            json: jest.fn().mockResolvedValue([{ id: 1, title: 'Accessible Event', date: '2023-12-31' }])
        });
        render(<EventManagement />);
        expect(screen.getByText(/Accessible Event/i)).toHaveAttribute('aria-label', 'Accessible Event');
        expect(screen.getByRole('button', { name: /Create Event/i })).toBeEnabled();
    });
});