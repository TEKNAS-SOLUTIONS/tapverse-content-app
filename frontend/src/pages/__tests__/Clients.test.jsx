import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Clients from '../Clients';
import { clientsAPI } from '../../services/api';

vi.mock('../../services/api');

describe('Clients Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render clients page', () => {
    clientsAPI.getAll = vi.fn().mockResolvedValue({
      data: { success: true, data: [] },
    });

    render(
      <BrowserRouter>
        <Clients />
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { name: /clients/i })).toBeInTheDocument();
  });

  it('should load and display clients', async () => {
    const mockClients = [
      {
        id: '1',
        tapverse_client_id: 'client-1',
        company_name: 'Test Company',
        website_url: 'https://test.com',
        industry: 'Technology',
      },
    ];

    clientsAPI.getAll = vi.fn().mockResolvedValue({
      data: { success: true, data: mockClients },
    });

    render(
      <BrowserRouter>
        <Clients />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Company')).toBeInTheDocument();
    });
  });

  it('should show error message on API failure', async () => {
    clientsAPI.getAll = vi.fn().mockRejectedValue(new Error('API Error'));

    render(
      <BrowserRouter>
        <Clients />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});

