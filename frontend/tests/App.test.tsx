import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../src/App';

describe('Frontend App Component', () => {
  it('renders the InterviewPilot title and header correctly', () => {
    render(<App />);
    const headings = screen.getAllByText(/InterviewPilot/i);
    expect(headings.length).toBeGreaterThan(0);
  });

  it('renders the theme toggle and health navigation link', () => {
    render(<App />);
    const healthLinks = screen.getAllByText(/System Health/i);
    expect(healthLinks.length).toBeGreaterThan(0);
  });
});
