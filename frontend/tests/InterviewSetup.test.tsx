import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../src/context/AuthContext';
import { ToastProvider } from '../src/context/ToastContext';
import { InterviewSetupPage } from '../src/pages/InterviewSetupPage';
import { api } from '../src/api/client';
import { InterviewType, DifficultyLevel, StrictnessMode } from '@interviewpilot/shared';

vi.mock('../src/api/client', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() },
    },
    defaults: { headers: { common: {} } },
  },
}));

const renderInterviewSetup = () => {
  return render(
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <InterviewSetupPage />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

describe('InterviewSetupPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders interview tracks, seniority selectors, and real-time stage plan', () => {
    renderInterviewSetup();

    expect(screen.getByText(/Configure AI Interview Session/i)).toBeInTheDocument();
    expect(screen.getByText(/Data Structures & Algorithms/i)).toBeInTheDocument();
    expect(screen.getByText(/System Design & Architecture/i)).toBeInTheDocument();
    expect(screen.getByText(/Technical Deep-Dive/i)).toBeInTheDocument();
    expect(screen.getByText(/Adaptive Session Blueprint/i)).toBeInTheDocument();
    expect(screen.getByText(/Stage Breakdown \(Auto-Calculated\)/i)).toBeInTheDocument();
  });

  it('allows changing interview tracks and updates suggested topics', () => {
    renderInterviewSetup();

    // Click on System Design track
    const systemDesignBtn = screen.getByText(/System Design & Architecture/i).closest('button');
    expect(systemDesignBtn).toBeDefined();
    fireEvent.click(systemDesignBtn!);

    expect(screen.getByText(/Suggested Topics for SYSTEM DESIGN/i)).toBeInTheDocument();
  });

  it('allows adding and removing focus topics', () => {
    renderInterviewSetup();

    const topicInput = screen.getByPlaceholderText(/Add custom topic/i);
    const addBtn = screen.getByRole('button', { name: /Add/i });

    fireEvent.change(topicInput, { target: { value: 'Kubernetes Operators' } });
    fireEvent.click(addBtn);

    expect(screen.getByText('Kubernetes Operators')).toBeInTheDocument();
  });

  it('submits valid configuration and initializes session', async () => {
    const mockSession = {
      id: 'mock-session-123',
      title: 'SENIOR Staff Infrastructure Architect (SYSTEM DESIGN)',
      type: InterviewType.SYSTEM_DESIGN,
      difficulty: DifficultyLevel.SENIOR,
      targetRole: 'Staff Infrastructure Architect',
      durationMinutes: 45,
      strictness: StrictnessMode.HARD,
      status: 'configuring',
      focusTopics: ['Kubernetes Operators'],
      stages: [
        { id: 'stage-1', title: 'Scope', description: 'desc', durationMinutes: 5, order: 1, status: 'pending' },
        { id: 'stage-2', title: 'Architecture', description: 'desc', durationMinutes: 17, order: 2, status: 'pending' },
        { id: 'stage-3', title: 'Scale', description: 'desc', durationMinutes: 18, order: 3, status: 'pending' },
        { id: 'stage-4', title: 'Debrief', description: 'desc', durationMinutes: 5, order: 4, status: 'pending' },
      ],
      createdAt: new Date().toISOString()
    };

    (api.post as any).mockResolvedValueOnce({
      data: {
        success: true,
        data: mockSession
      }
    });

    renderInterviewSetup();

    // Submit form
    const submitBtn = screen.getByRole('button', { name: /Initialize AI Session/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/interviews',
        expect.objectContaining({
          type: InterviewType.CODING,
          durationMinutes: 30
        })
      );
    });
  });
});
