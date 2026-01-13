import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Layout from '../Layout';

describe('Layout', () => {
  it('should render header with title', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    expect(screen.getByText('Tapverse Content Automation')).toBeInTheDocument();
  });

  it('should render children', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});

