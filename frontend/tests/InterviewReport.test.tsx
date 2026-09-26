import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ToastProvider } from '../src/context/ToastContext';
import { AuthProvider } from '../src/context/AuthContext';
import { InterviewReportPage } from '../src/pages/InterviewReportPage';
import { api } from '../src/api/client';
import {
  InterviewType,
  DifficultyLevel,
  InterviewStatus,
  HiringVerdict
} from '@interviewpilot/shared';

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
  id: 'session-123',
  userId: 'user-123',
  title: 'Senior Distributed Systems Interview',
  targetRole: 'Senior Software Engineer',
  type: InterviewType.TECHNICAL_SYSTEM_DESIGN,
  difficulty: DifficultyLevel.HARD,
  durationMinutes: 45,
  status: InterviewStatus.COMPLETED,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  stages: [
    {
      id: 'stage-intro',
      title: 'System Architecture Overview',
      description: 'High-level design discussion',
      durationMinutes: 15,
      order: 1,
      status: 'completed'
    },
    {
      id: 'stage-deep-dive',
      title: 'Data Layer & Sharding',
      description: 'Database partitioning and consensus',
      durationMinutes: 30,
      order: 2,
      status: 'completed'
    }
  ]
};

const mockReport = {
  overallScore: 88,
  verdict: HiringVerdict.STRONG_HIRE,
  summary: 'Demonstrated exceptional grasp of distributed consensus and cache consistency protocols.',
  dimensionScores: [
    {
      dimension: 'Technical Problem Solving',
      score: 90,
      maxScore: 100,
      feedback: 'Excellent decomposition of the partitioned storage engine.',
      status: 'exceeds'
    },
    {
      dimension: 'System Architecture & Scalability',
      score: 92,
      maxScore: 100,
      feedback: 'Proposed elegant multi-region replication strategy with Raft.',
      status: 'exceeds'
    },
    {
      dimension: 'Communication & Collaboration',
      score: 85,
      maxScore: 100,
      feedback: 'Articulate walkthrough of trade-offs and bottleneck identification.',
      status: 'meets'
    },
    {
      dimension: 'Code Quality & Correctness',
      score: 82,
      maxScore: 100,
      feedback: 'Clean interfaces and robust error handling.',
      status: 'meets'
    },
    {
      dimension: 'Edge Cases & Resiliency',
      score: 89,
      maxScore: 100,
      feedback: 'Thorough consideration of network partitions and failovers.',
      status: 'exceeds'
    }
  ],
  stageEvaluations: [
    {
      stageId: 'stage-intro',
      stageTitle: 'System Architecture Overview',
      score: 86,
      feedback: 'Solid opening architecture with comprehensive data flow analysis.',
      keyObservations: ['Clear high-level diagram', 'Identified primary bottlenecks early'],
      strengths: ['Effective diagramming style'],
      areasForImprovement: ['Could quantify expected QPS throughput earlier']
    },
    {
      stageId: 'stage-deep-dive',
      stageTitle: 'Data Layer & Sharding',
      score: 95,
      feedback: 'Outstanding deep dive into sharding and replication.',
      keyObservations: ['Consistent hashing implementation', 'Deadlock avoidance strategy'],
      strengths: ['Mastery of consensus mechanics'],
      areasForImprovement: ['Mention read-replica lag replication nuances']
    }
  ],
  strengths: [
    'Deep understanding of Raft consensus protocol and distributed locks',
    'Effective trade-off communication between latency vs availability',
    'Proactive failure recovery design'
  ],
  weaknesses: [
    'Further clarify write-ahead log replay SLAs during cold starts',
    'Benchmark network serialization overhead (Protobuf vs JSON)'
  ],
  actionPlan: [
    'Practice designing distributed transaction 2PC vs Saga patterns',
    'Review LSM-Tree vs B-Tree compaction trade-offs under high write workloads'
  ],
  generatedAt: new Date().toISOString()
};

const renderReportPage = (sessionId = 'session-123') => {
  return render(
    <MemoryRouter initialEntries={[`/interviews/${sessionId}/report`]}>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route path="/interviews/:id/report" element={<InterviewReportPage />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </MemoryRouter>
  );
};

describe('InterviewReportPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading spinner initially', async () => {
    (api.get as any).mockImplementation(() => new Promise(() => {})); // Never resolves

    renderReportPage();

    expect(screen.getByText(/Generating In-Depth AI Assessment Report & Scorecards/i)).toBeInTheDocument();
  });

  it('renders full evaluation report and dimensional scorecards', async () => {
    (api.get as any).mockImplementation((url: string) => {
      if (url.includes('/report')) {
        return Promise.resolve({ data: { success: true, data: mockReport } });
      }
      return Promise.resolve({ data: { success: true, data: mockSession } });
    });

    renderReportPage();

    // Verify Overall Score & Verdict
    await waitFor(() => {
      expect(screen.getByText('88')).toBeInTheDocument();
      expect(screen.getByText('Strong Hire')).toBeInTheDocument();
      expect(screen.getByText('Senior Distributed Systems Interview')).toBeInTheDocument();
    });

    // Verify Executive Summary
    expect(
      screen.getByText(/Demonstrated exceptional grasp of distributed consensus/i)
    ).toBeInTheDocument();

    // Verify Dimension Breakdown
    expect(screen.getByText('5-Dimensional Competency Breakdown')).toBeInTheDocument();
    expect(screen.getByText('Technical Problem Solving')).toBeInTheDocument();
    expect(screen.getByText('90/100')).toBeInTheDocument();
    expect(screen.getByText('System Architecture & Scalability')).toBeInTheDocument();
    expect(screen.getByText('92/100')).toBeInTheDocument();

    // Verify Strengths & Growth Areas
    expect(screen.getByText(/Demonstrated Strengths/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Deep understanding of Raft consensus protocol/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Target Growth Areas & Gaps/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Further clarify write-ahead log replay SLAs/i)
    ).toBeInTheDocument();

    // Verify Stage by Stage Evaluation
    expect(screen.getByText(/Stage-by-Stage Evaluation Timeline/i)).toBeInTheDocument();
    expect(screen.getByText('System Architecture Overview')).toBeInTheDocument();
    expect(screen.getByText('Data Layer & Sharding')).toBeInTheDocument();

    // Verify Recommended Action Plan / Roadmap
    expect(screen.getByText(/Personalized Practice Roadmap/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Practice designing distributed transaction 2PC vs Saga patterns/i)
    ).toBeInTheDocument();
  });

  it('allows toggling stage accordion breakdown', async () => {
    (api.get as any).mockImplementation((url: string) => {
      if (url.includes('/report')) {
        return Promise.resolve({ data: { success: true, data: mockReport } });
      }
      return Promise.resolve({ data: { success: true, data: mockSession } });
    });

    renderReportPage();

    await waitFor(() => {
      expect(screen.getByText('Data Layer & Sharding')).toBeInTheDocument();
    });

    // The stage observations are rendered by default (expanded)
    expect(screen.getByText('Deadlock avoidance strategy')).toBeInTheDocument();

    // Find and click the toggle button for stage-deep-dive
    const stageButton = screen.getByRole('button', { name: /Data Layer & Sharding/i });
    fireEvent.click(stageButton);

    // After collapse, observations inside accordion should not be visible
    expect(screen.queryByText('Deadlock avoidance strategy')).not.toBeInTheDocument();

    // Click again to expand
    fireEvent.click(stageButton);
    expect(screen.getByText('Deadlock avoidance strategy')).toBeInTheDocument();
  });

  it('renders error message when report is missing', async () => {
    (api.get as any).mockRejectedValueOnce(new Error('Session not found'));

    renderReportPage();

    await waitFor(() => {
      expect(screen.getByText(/Evaluation report not found/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Return to Interviews/i })).toBeInTheDocument();
    });
  });
});
