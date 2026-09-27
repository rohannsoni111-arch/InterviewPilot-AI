import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { PeerPairingPage } from '../src/pages/PeerPairingPage';
import { ToastProvider } from '../src/context/ToastContext';
import { AuthProvider } from '../src/context/AuthContext';
import { api } from '../src/api/client';
import { InterviewType, DifficultyLevel, HiringVerdict } from '@interviewpilot/shared';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockActiveRoom = {
  roomCode: 'PR-98A2',
  hostId: 'user-1',
  title: 'Distributed Systems & Concurrency Mock Round',
  track: InterviewType.CODING,
  difficulty: DifficultyLevel.SENIOR,
  participants: [
    { userId: 'user-1', name: 'Alice Host', role: 'interviewer' as const, isReady: true },
    { userId: 'user-2', name: 'Bob Peer', role: 'candidate' as const, isReady: true },
  ],
  code: '# Collaborative code\ndef solution():\n    return True\n',
  language: 'python',
  evaluatorNotes: 'Good algorithmic approach.',
  dimensionRatings: {
    'Problem Solving & Algorithms': 90,
    'System Architecture & Design': 88,
    'Code Quality & Execution': 85,
    'Communication & Leadership': 92,
  },
  status: 'active' as const,
  createdAt: new Date().toISOString(),
};

describe('PeerPairingPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.createPeerRoom = vi.fn().mockResolvedValue({
      success: true,
      data: mockActiveRoom,
    });
    api.getPeerRoom = vi.fn().mockResolvedValue({
      success: true,
      data: mockActiveRoom,
    });
    api.joinPeerRoom = vi.fn().mockResolvedValue({
      success: true,
      data: mockActiveRoom,
    });
    api.switchPeerRole = vi.fn().mockResolvedValue({
      success: true,
      data: { ...mockActiveRoom, participants: [{ userId: 'user-1', name: 'Alice', role: 'candidate', isReady: true }] },
    });
    api.syncPeerCode = vi.fn().mockResolvedValue({
      success: true,
      data: mockActiveRoom,
    });
    api.updatePeerNotes = vi.fn().mockResolvedValue({
      success: true,
      data: mockActiveRoom,
    });
    api.submitPeerEvaluation = vi.fn().mockResolvedValue({
      success: true,
      data: {
        ...mockActiveRoom,
        status: 'completed',
        completedEvaluation: {
          overallScore: 92,
          verdict: HiringVerdict.STRONG_HIRE,
          feedback: 'Exceptional systems concurrency discussion and clean code.',
          submittedBy: 'Alice Host',
          submittedAt: new Date().toISOString(),
        },
      },
    });
  });

  const renderLobby = () =>
    render(
      <MemoryRouter initialEntries={['/peer-pairing']}>
        <ToastProvider>
          <AuthProvider>
            <Routes>
              <Route path="/peer-pairing" element={<PeerPairingPage />} />
              <Route path="/peer-pairing/:roomCode" element={<PeerPairingPage />} />
            </Routes>
          </AuthProvider>
        </ToastProvider>
      </MemoryRouter>
    );

  const renderActiveRoom = (roomCode = 'PR-98A2') =>
    render(
      <MemoryRouter initialEntries={[`/peer-pairing/${roomCode}`]}>
        <ToastProvider>
          <AuthProvider>
            <Routes>
              <Route path="/peer-pairing/:roomCode" element={<PeerPairingPage />} />
            </Routes>
          </AuthProvider>
        </ToastProvider>
      </MemoryRouter>
    );

  it('renders peer pairing lobby with create and join room options', async () => {
    renderLobby();

    expect(screen.getByText('Peer-to-Peer Mock Interview Studio')).toBeInTheDocument();
    expect(screen.getByText('Create a Peer Session')).toBeInTheDocument();
    expect(screen.getByText('Join Active Room')).toBeInTheDocument();
    expect(screen.getByText('Create & Launch Studio Room')).toBeInTheDocument();
  });

  it('handles room creation and triggers navigation to room URL', async () => {
    renderLobby();

    const createBtn = screen.getByText('Create & Launch Studio Room');
    fireEvent.click(createBtn);

    await waitFor(() => {
      expect(api.createPeerRoom).toHaveBeenCalledWith(
        expect.objectContaining({
          track: InterviewType.CODING,
          difficulty: DifficultyLevel.SENIOR,
        })
      );
      expect(mockNavigate).toHaveBeenCalledWith('/peer-pairing/PR-98A2');
    });
  });

  it('handles joining room via room code input', async () => {
    renderLobby();

    const input = screen.getByPlaceholderText('PR-XXXX');
    fireEvent.change(input, { target: { value: 'PR-98A2' } });

    const joinBtn = screen.getByText('Join Peer Session');
    fireEvent.click(joinBtn);

    await waitFor(() => {
      expect(api.joinPeerRoom).toHaveBeenCalledWith('PR-98A2', { preferredRole: 'candidate' });
      expect(mockNavigate).toHaveBeenCalledWith('/peer-pairing/PR-98A2');
    });
  });

  it('renders active room with collaborative code editor and evaluator rubric', async () => {
    renderActiveRoom();

    await waitFor(() => {
      expect(screen.getByText('Distributed Systems & Concurrency Mock Round')).toBeInTheDocument();
      expect(screen.getByText('PR-98A2')).toBeInTheDocument();
      expect(screen.getByText('Live FAANG Evaluation Rubric')).toBeInTheDocument();
      expect(screen.getByText('Collaborative Editor')).toBeInTheDocument();
      expect(screen.getByText('Submit Peer Evaluation & Conclude')).toBeInTheDocument();
    });
  });

  it('allows switching between Interviewer and Candidate roles', async () => {
    renderActiveRoom();

    await waitFor(() => {
      expect(screen.getByText('Evaluator Mode')).toBeInTheDocument();
    });

    const candidateModeBtn = screen.getByText('Candidate Mode');
    fireEvent.click(candidateModeBtn);

    await waitFor(() => {
      expect(api.switchPeerRole).toHaveBeenCalledWith('PR-98A2', 'candidate');
    });
  });

  it('submits final peer assessment and renders completion summary modal', async () => {
    const completedData = {
      ...mockActiveRoom,
      status: 'completed' as const,
      completedEvaluation: {
        overallScore: 92,
        verdict: HiringVerdict.STRONG_HIRE,
        feedback: 'Exceptional systems concurrency discussion and clean code.',
        submittedBy: 'Alice Host',
        submittedAt: new Date().toISOString(),
      },
    };

    api.submitPeerEvaluation = vi.fn().mockResolvedValue({
      success: true,
      data: completedData,
    });

    renderActiveRoom();

    const submitBtn = await screen.findByText('Submit Peer Evaluation & Conclude');
    fireEvent.click(submitBtn);

    expect(await screen.findByText('Peer Assessment Completed')).toBeInTheDocument();
    expect(screen.getByText('Return to Dashboard')).toBeInTheDocument();
  });
});
