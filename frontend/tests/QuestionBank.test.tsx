import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QuestionBankPage } from '../src/pages/QuestionBankPage';
import { ToastProvider } from '../src/context/ToastContext';
import { api } from '../src/api/client';
import { InterviewType, DifficultyLevel } from '@interviewpilot/shared';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockQuestions = [
  {
    id: 'goog-001',
    title: 'Distributed Lock-Free Ring Buffer',
    company: 'Google',
    track: InterviewType.CODING,
    difficulty: DifficultyLevel.SENIOR,
    category: 'Concurrency & Low-Level Systems',
    acceptanceRate: 38,
    frequencyScore: 94,
    estimatedMinutes: 45,
    description: 'Design and implement a thread-safe, bounded lock-free Ring Buffer.',
    examples: [{ input: 'cap=4', output: '1' }],
    constraints: ['1 <= capacity <= 10^5'],
    starterCode: { python: 'class LockFreeRingBuffer:\n    pass\n' },
    hints: ['Use atomic sequence increments'],
    testCases: [{ input: 'test', expectedOutput: 'pass' }],
    tags: ['Concurrency', 'Google'],
  },
  {
    id: 'meta-002',
    title: 'Design Global Live Stream Video Comment Feed',
    company: 'Meta',
    track: InterviewType.SYSTEM_DESIGN,
    difficulty: DifficultyLevel.STAFF,
    category: 'Distributed Systems & Fan-Out',
    acceptanceRate: 29,
    frequencyScore: 96,
    estimatedMinutes: 45,
    description: 'Architect a distributed real-time comment and reaction streaming pipeline.',
    examples: [],
    constraints: ['P99 delivery latency < 150ms'],
    starterCode: { python: '# Architecture spec\n' },
    hints: ['Decouple comment ingestion from delivery clusters'],
    testCases: [],
    tags: ['System Design', 'Meta'],
  },
];

describe('QuestionBankPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getQuestions = vi.fn().mockResolvedValue({
      success: true,
      data: mockQuestions,
    });
    api.launchQuestionInterview = vi.fn().mockResolvedValue({
      success: true,
      data: { id: 'sim-session-123' },
    });
  });

  const renderComponent = () =>
    render(
      <BrowserRouter>
        <ToastProvider>
          <QuestionBankPage />
        </ToastProvider>
      </BrowserRouter>
    );

  it('renders Question Bank page header and questions list', async () => {
    renderComponent();

    expect(screen.getByText('FAANG & Tier-1 Company Question Bank')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Distributed Lock-Free Ring Buffer')).toBeInTheDocument();
      expect(screen.getByText('Design Global Live Stream Video Comment Feed')).toBeInTheDocument();
    });
  });

  it('filters questions when company buttons are clicked', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Distributed Lock-Free Ring Buffer')).toBeInTheDocument();
    });

    const metaButton = screen.getByRole('button', { name: /Meta/i });
    fireEvent.click(metaButton);

    expect(api.getQuestions).toHaveBeenCalledWith(
      expect.objectContaining({
        company: 'Meta',
      })
    );
  });

  it('opens problem details modal and starter code inspector', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Distributed Lock-Free Ring Buffer')).toBeInTheDocument();
    });

    const viewDetailsBtns = screen.getAllByText('View Details');
    fireEvent.click(viewDetailsBtns[0]);

    // Modal opens
    await waitFor(() => {
      expect(screen.getByText('Problem Statement')).toBeInTheDocument();
      expect(screen.getByText('Starter Template')).toBeInTheDocument();
    });

    // Toggle hints
    const revealHintsBtn = screen.getByText('Reveal Interviewer Hints');
    fireEvent.click(revealHintsBtn);
    expect(screen.getByText('Use atomic sequence increments')).toBeInTheDocument();
  });

  it('launches interview simulation room when Practice is clicked', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Distributed Lock-Free Ring Buffer')).toBeInTheDocument();
    });

    const practiceBtns = screen.getAllByText('Practice');
    fireEvent.click(practiceBtns[0]);

    await waitFor(() => {
      expect(api.launchQuestionInterview).toHaveBeenCalledWith('goog-001');
      expect(mockNavigate).toHaveBeenCalledWith('/interviews/sim-session-123/room');
    });
  });
});
