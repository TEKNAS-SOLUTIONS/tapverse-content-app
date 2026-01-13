import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from '../Home';

describe('Home', () => {
  it('should render welcome message', () => {
    render(<Home />);
    
    expect(screen.getByText('Welcome')).toBeInTheDocument();
    expect(screen.getByText('Tapverse Content Automation System')).toBeInTheDocument();
  });
});

