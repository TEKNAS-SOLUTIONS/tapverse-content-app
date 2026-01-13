import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App', () => {
  it('should render app with routing', () => {
    render(<App />);

    expect(screen.getByText('Tapverse Content Automation')).toBeInTheDocument();
  });
});

