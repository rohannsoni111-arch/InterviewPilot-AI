import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from '../src/context/ToastContext';
import { AuthProvider } from '../src/context/AuthContext';
import { AnalyticsPage } from '../src/pages/AnalyticsPage';
import { api } from '../src/api/client';
import { InterviewType } from '@interviewpilot/shared';

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

const mockEmptyAnalytics = {
  hasData: false,
  overallReadinessScore: null,
  readinessTier: 'Calibration Required',
  readinessVelocityDelta: 0,
  estimatedTimeToTargetBar: 'Complete 1st session to calibrate',
  trackCompetencies: [],
  dimensionAnalytics: [],
  trajectory: [],
  weaknessHeatmap: [],
  totalSessions: 0,
  completedSessions: 0,
  totalPracticeHours: 0,
  averageIntegrityScore: null
};

const mockPopulatedAnalytics = {
  hasData: true,
  overallReadinessScore: 88,
  readinessTier: 'Senior Engineer Ready',
  readinessVelocityDelta: 14,
  estimatedTimeToTargetBar: '4-7 days (2 targeted drills)',
  trackCompetencies: [
    {
      track: InterviewType.CODING,
      title: 'Data Structures & Algorithms',
      score: 85,
      sessionsCount: 3,
      benchmark: 75,
      status: 'proficient'
    },
    {
      track: InterviewType.SYSTEM_DESIGN,
      title: 'System Design & Scalability',
      score: 92,
      sessionsCount: 2,
      benchmark: 75,
      status: 'proficient'
    },
    {
      track: InterviewType.TECHNICAL,
      title: 'Technical Architecture & Internals',
      score: 80,
      sessionsCount: 1,
      benchmark: 75,
      status: 'proficient'
    },
    {
      track: InterviewType.SQL,
      title: 'SQL & Data Engineering',
      score: 70,
      sessionsCount: 1,
      benchmark: 75,
      status: 'developing'
    },
    {
      track: InterviewType.BEHAVIORAL,
      title: 'Behavioral & STAR Leadership',
      score: 60,
      sessionsCount: 1,
      benchmark: 75,
      status: 'needs_practice'
    }
  ],
  dimensionAnalytics: [
    {
      dimension: 'Technical & Algorithmic Correctness',
      score: 88,
      trend: 6,
      status: 'exceeds'
    },
    {
      dimension: 'Problem-Solving & Architectural Depth',
      score: 90,
      trend: 4,
      status: 'exceeds'
    },
    {
      dimension: 'Communication Clarity & Structure',
      score: 82,
      trend: 2,
      status: 'meets'
    },
    {
      dimension: 'Edge Cases & Scalability Handling',
      score: 85,
      trend: 5,
      status: 'exceeds'
    },
    {
      dimension: 'Code & Implementation Quality',
      score: 86,
      trend: 3,
      status: 'exceeds'
    }
  ],
  trajectory: [
    {
      date: '2026-09-20',
      score: 82,
      interviewType: InterviewType.CODING,
      interviewTitle: 'DSA Baseline'
    },
    {
      date: '2026-09-24',
      score: 92,
      interviewType: InterviewType.SYSTEM_DESIGN,
      interviewTitle: 'Distributed Systems'
    }
  ],
  weaknessHeatmap: [
    {
      topic: 'Database Partitioning & Failover Lag',
      category: 'Architecture & System Design',
      recurrenceCount: 3,
      severity: 'critical',
      remediationSuggestion: 'Conduct a focused 30-min drill on Raft replay log SLAs.'
    },
    {
      topic: 'Dynamic Programming Space Optimization',
      category: 'Algorithms',
      recurrenceCount: 2,
      severity: 'moderate',
      remediationSuggestion: 'Practice tabulating rolling arrays.'
    }
  ],
  totalSessions: 5,
  completedSessions: 5,
  totalPracticeHours: 4.5,
  averageIntegrityScore: 97
};

const renderAnalyticsPage = () => {
  return render(
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AnalyticsPage />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

describe('AnalyticsPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty baseline state when candidate has no completed interviews', async () => {
    (api.get as any).mockResolvedValueOnce({
      data: { success: true, data: mockEmptyAnalytics }
    });

    renderAnalyticsPage();

    await waitFor(() => {
      expect(screen.getByText('No Analytics Baseline Available Yet')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Launch First Diagnostic Interview/i })).toBeInTheDocument();
    });
  });

  it('renders comprehensive multi-track skill radar and readiness analytics', async () => {
    (api.get as any).mockResolvedValueOnce({
      data: { success: true, data: mockPopulatedAnalytics }
    });

    renderAnalyticsPage();

    await waitFor(() => {
      expect(screen.getByText('Multi-Track Competency & Skill Radar')).toBeInTheDocument();
      expect(screen.getByText('88')).toBeInTheDocument();
      expect(screen.getByText('+14% growth velocity')).toBeInTheDocument();
      expect(screen.getByText('Senior Engineer Ready')).toBeInTheDocument();
      expect(screen.getByText('97%')).toBeInTheDocument();
    });

    // Verify Multi-Track Competencies
    expect(screen.getByText('Multi-Track Competency Radar')).toBeInTheDocument();
    expect(screen.getByText('Data Structures & Algorithms')).toBeInTheDocument();
    expect(screen.getAllByText(/85%/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('System Design & Scalability')).toBeInTheDocument();
    expect(screen.getAllByText(/92%/i).length).toBeGreaterThanOrEqual(1);

    // Verify 5-Dimensional Breakdown
    expect(screen.getByText('5-Dimensional Mastery')).toBeInTheDocument();
    expect(screen.getByText('Technical & Algorithmic Correctness')).toBeInTheDocument();

    // Verify Weakness Recurrence Heatmap
    expect(screen.getByText('Weakness Recurrence Heatmap & Targeted Remediation')).toBeInTheDocument();
    expect(screen.getByText('Database Partitioning & Failover Lag')).toBeInTheDocument();
    expect(screen.getByText('critical (3x recurrent)')).toBeInTheDocument();
  });
});
