import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Projects from '../Projects';
import { projectsAPI, clientsAPI } from '../../services/api';

vi.mock('../../services/api');

describe('Projects Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render projects page', () => {
    clientsAPI.getAll = vi.fn().mockResolvedValue({
      data: { success: true, data: [] },
    });
    projectsAPI.getAll = vi.fn().mockResolvedValue({
      data: { success: true, data: [] },
    });

    render(
      <BrowserRouter>
        <Projects />
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { name: /projects/i })).toBeInTheDocument();
  });

  it('should load and display projects', async () => {
    const mockProjects = [
      {
        id: '1',
        client_id: 'client-1',
        project_name: 'Test Project',
        project_type: 'seo',
        status: 'draft',
      },
    ];

    const mockClients = [
      {
        id: 'client-1',
        company_name: 'Test Company',
      },
    ];

    clientsAPI.getAll = vi.fn().mockResolvedValue({
      data: { success: true, data: mockClients },
    });
    projectsAPI.getAll = vi.fn().mockResolvedValue({
      data: { success: true, data: mockProjects },
    });

    render(
      <BrowserRouter>
        <Projects />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });
  });
});

