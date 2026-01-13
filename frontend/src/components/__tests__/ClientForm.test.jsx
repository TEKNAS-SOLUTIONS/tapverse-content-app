import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ClientForm from '../ClientForm';

describe('ClientForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render form fields', () => {
    render(
      <ClientForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    expect(screen.getByLabelText(/tapverse client id/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/website url/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/industry/i)).toBeInTheDocument();
  });

  it('should render submit and cancel buttons', () => {
    render(
      <ClientForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('should call onSubmit with form data', async () => {
    const user = userEvent.setup();
    
    render(
      <ClientForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    await user.type(screen.getByLabelText(/tapverse client id/i), 'client-1');
    await user.type(screen.getByLabelText(/company name/i), 'Test Company');
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <ClientForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should populate form with initial data', () => {
    const initialData = {
      tapverse_client_id: 'client-1',
      company_name: 'Test Company',
      website_url: 'https://test.com',
      industry: 'Technology',
    };

    render(
      <ClientForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
        initialData={initialData}
      />
    );

    expect(screen.getByDisplayValue('client-1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Company')).toBeInTheDocument();
  });
});

