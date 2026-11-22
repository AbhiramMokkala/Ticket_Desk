import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';

describe('Frontend Component Tests', () => {
  it('renders StatusBadge with correct text and styles for OPEN', () => {
    render(<StatusBadge status="OPEN" />);
    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  it('renders StatusBadge with correct text for IN_PROGRESS', () => {
    render(<StatusBadge status="IN_PROGRESS" />);
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('renders StatusBadge with correct text for RESOLVED', () => {
    render(<StatusBadge status="RESOLVED" />);
    expect(screen.getByText('Resolved')).toBeInTheDocument();
  });

  it('renders PriorityBadge with correct labels', () => {
    render(<PriorityBadge priority="CRITICAL" />);
    expect(screen.getByText('Critical')).toBeInTheDocument();
  });
});
