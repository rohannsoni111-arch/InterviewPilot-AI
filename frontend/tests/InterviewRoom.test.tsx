import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../src/context/AuthContext';
import { ToastProvider } from '../src/context/ToastContext';
import { InterviewRoomPage } from '../src/pages/InterviewRoomPage';
import { api } from '../src/api/client';
import { InterviewType, DifficultyLevel, StrictnessMode, InterviewStatus } from '@interviewpilot/shared';

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

const mockSession = {
  id: 'session-live-101',
  title: 'SENIOR Staff Infrastructure Architect (SYSTEM DESIGN)',
  type: InterviewType.SYSTEM_DESIGN,
  difficulty: DifficultyLevel.SENIOR,
  targetRole: 'Staff Infrastructure Architect',
  durationMinutes: 45,
  durationSeconds: 0,
  strictness: StrictnessMode.HARD,
  status: InterviewStatus.IN_PROGRESS,
  focusTopics: ['Distributed Caching', 'Raft Consensus'],
  stages: [
    { id: 'stage-1', title: 'Scope & Requirements', description: 'Clarify constraints', durationMinutes: 5, order: 1, status: 'active' },
    { id: 'stage-2', title: 'High-Level Architecture', description: 'Sketch services', durationMinutes: 17, order: 2, status: 'pending' },
    { id: 'stage-3', title: 'Deep Dive & Scalability', description: 'Optimize bottlenecks', durationMinutes: 18, order: 3, status: 'pending' },
    { id: 'stage-4', title: 'Debrief', description: 'Closing review', durationMinutes: 5, order: 4, status: 'pending' },
  ],
  currentStageIndex: 0,
  messages: [
    {
      id: 'msg-init',
      role: 'interviewer',
      content: 'Welcome to Stage 1! How would you design a distributed cache with Raft consensus?',
      stageId: 'stage-1',
      stageIndex: 0,
      timestamp: new Date().toISOString(),
      suggestedFollowUps: ['Explain quorum replication', 'State read/write latency bounds']
    }
  ],
  createdAt: new Date().toISOString()
};

const renderInterviewRoom = (sessionId = 'session-live-101') => {
  return render(
    <MemoryRouter initialEntries={[`/interviews/${sessionId}/room`]}>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route path="/interviews/:id/room" element={<InterviewRoomPage />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </MemoryRouter>
  );
};

describe('InterviewRoomPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders live room header, stage stepper, and initial opening message', async () => {
    (api.get as any).mockResolvedValueOnce({
      data: {
        success: true,
        data: mockSession
      }
    });

    renderInterviewRoom();

    await waitFor(() => {
      expect(screen.getByText('SENIOR Staff Infrastructure Architect (SYSTEM DESIGN)')).toBeInTheDocument();
      expect(screen.getAllByText('Scope & Requirements').length).toBeGreaterThan(0);
      expect(screen.getByText(/How would you design a distributed cache with Raft consensus\?/i)).toBeInTheDocument();
      expect(screen.getByText('Explain quorum replication')).toBeInTheDocument();
    });
  });

  it('sends candidate response and renders updated turns', async () => {
    (api.get as any).mockResolvedValueOnce({
      data: {
        success: true,
        data: mockSession
      }
    });

    const updatedSession = {
      ...mockSession,
      messages: [
        ...mockSession.messages,
        {
          id: 'cand-1',
          role: 'candidate',
          content: 'I would use a 3-node leader-follower topology with append entries RPCs.',
          timestamp: new Date().toISOString()
        },
        {
          id: 'int-2',
          role: 'interviewer',
          content: 'Good. How does the leader election handle split-brain during a network partition?',
          stageId: 'stage-1',
          stageIndex: 0,
          timestamp: new Date().toISOString(),
          suggestedFollowUps: ['Explain term increments', 'Discuss majority quorum']
        }
      ]
    };

    (api.post as any).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          session: updatedSession,
          message: updatedSession.messages[2]
        }
      }
    });

    renderInterviewRoom();

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Type your technical response/i)).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/Type your technical response/i);
    fireEvent.change(input, {
      target: { value: 'I would use a 3-node leader-follower topology with append entries RPCs.' }
    });

    const sendBtn = screen.getByTitle('Send Response');
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/interviews/session-live-101/turn',
        expect.objectContaining({
          content: 'I would use a 3-node leader-follower topology with append entries RPCs.'
        })
      );
      expect(screen.getByText(/How does the leader election handle split-brain/i)).toBeInTheDocument();
    });
  });

  it('allows advancing stage to next stage', async () => {
    (api.get as any).mockResolvedValueOnce({
      data: {
        success: true,
        data: mockSession
      }
    });

    const stage2Session = {
      ...mockSession,
      currentStageIndex: 1,
      stages: [
        { ...mockSession.stages[0], status: 'completed' },
        { ...mockSession.stages[1], status: 'active' },
        mockSession.stages[2],
        mockSession.stages[3]
      ],
      messages: [
        ...mockSession.messages,
        {
          id: 'msg-stage2',
          role: 'interviewer',
          content: 'Transitioning to Stage 2: High-Level Architecture.',
          stageId: 'stage-2',
          stageIndex: 1,
          timestamp: new Date().toISOString()
        }
      ]
    };

    (api.post as any).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          session: stage2Session,
          message: stage2Session.messages[1]
        }
      }
    });

    renderInterviewRoom();

    await waitFor(() => {
      expect(screen.getByText('Next Stage')).toBeInTheDocument();
    });

    const nextStageBtn = screen.getByText('Next Stage');
    fireEvent.click(nextStageBtn);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/interviews/session-live-101/advance-stage');
      expect(screen.getByText('Transitioning to Stage 2: High-Level Architecture.')).toBeInTheDocument();
    });
  });
});
