import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProjectForm from '../ProjectForm';

describe('ProjectForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();
  const mockClients = [
    { id: '1', company_name: 'Client 1' },
    { id: '2', company_name: 'Client 2' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render form fields', () => {
    render(
      <ProjectForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
        clients={mockClients}
      />
    );

    expect(screen.getByLabelText(/client/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/project name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/project type/i)).toBeInTheDocument();
  });

  it('should render submit and cancel buttons', () => {
    render(
      <ProjectForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
        clients={mockClients}
      />
    );

    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <ProjectForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
        clients={mockClients}
      />
    );

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(mockOnCancel).toHaveBeenCalled();
  });
});

