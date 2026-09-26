import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../src/context/AuthContext';
import { ToastProvider } from '../src/context/ToastContext';
import { DashboardPage } from '../src/pages/DashboardPage';
import { api } from '../src/api/client';
import { UserRole, InterviewType, DifficultyLevel, InterviewStatus } from '@interviewpilot/shared';

vi.mock('../src/api/client', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() },
    },
    defaults: { headers: { common: {} } },
  },
}));

const renderDashboard = () => {
  return render(
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <DashboardPage />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

describe('DashboardPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty state correctly for new candidates', async () => {
    (api.get as any).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          hasData: false,
          user: {
            name: 'Morgan Vance',
            role: UserRole.CANDIDATE,
            headline: 'Frontend Engineer',
            targetRoles: ['Senior Frontend Developer']
          },
          metrics: {
            readinessScore: null,
            readinessTrend: null,
            totalInterviews: 0,
            completedInterviews: 0,
            totalPracticeSeconds: 0,
            averageScore: null
          },
          skillBreakdown: [],
          progressHistory: [],
          recentInterviews: [],
          recentWeaknesses: [],
          recentImprovements: [],
          recommendedPractice: [
            {
              id: 'rec-1',
              topic: 'System Architecture Fundamentals',
              type: InterviewType.SYSTEM_DESIGN,
              priority: 'high',
              reason: 'Initial baseline assessment to measure architectural design readiness.',
              suggestedDurationMinutes: 45
            }
          ]
        }
      }
    });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/Welcome back, Morgan Vance/i)).toBeInTheDocument();
      expect(screen.getByText(/No Historical Assessments Yet/i)).toBeInTheDocument();
      expect(screen.getByText(/System Architecture Fundamentals/i)).toBeInTheDocument();
    });
  });

  it('renders populated state with metrics, skills, and recent interviews', async () => {
    (api.get as any).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          hasData: true,
          user: {
            name: 'Taylor Swift',
            role: UserRole.CANDIDATE,
            headline: 'Staff Backend Architect',
            targetRoles: ['Staff Engineer']
          },
          metrics: {
            readinessScore: 88,
            readinessTrend: 5,
            totalInterviews: 4,
            completedInterviews: 4,
            totalPracticeSeconds: 7200,
            averageScore: 86
          },
          skillBreakdown: [
            {
              skill: 'Distributed Systems',
              score: 90,
              benchmark: 75,
              assessmentsCount: 3,
              status: 'proficient'
            }
          ],
          progressHistory: [
            {
              date: 'Sep 25',
              score: 82,
              interviewType: InterviewType.TECHNICAL,
              interviewTitle: 'Microservices & Sharding'
            }
          ],
          recentInterviews: [
            {
              id: 'int-1',
              title: 'Microservices & Sharding',
              type: InterviewType.TECHNICAL,
              difficulty: DifficultyLevel.STAFF,
              status: InterviewStatus.COMPLETED,
              overallScore: 90,
              durationSeconds: 3600,
              topics: ['PostgreSQL', 'Kafka'],
              createdAt: new Date().toISOString()
            }
          ],
          recentWeaknesses: [
            {
              topic: 'Raft Consensus',
              description: 'Raft Consensus: Edge case network partition recovery',
              frequency: 2,
              severity: 'moderate'
            }
          ],
          recentImprovements: [
            {
              topic: 'System Partitioning',
              delta: 8,
              description: 'Clear consistency vs availability tradeoffs'
            }
          ],
          recommendedPractice: [
            {
              id: 'rec-1',
              topic: 'Distributed Storage Engines',
              type: InterviewType.SYSTEM_DESIGN,
              priority: 'high',
              reason: 'Refine quorum consistency mechanics.',
              suggestedDurationMinutes: 40
            }
          ]
        }
      }
    });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getAllByText(/88%/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Distributed Systems/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Microservices & Sharding/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Raft Consensus/i).length).toBeGreaterThan(0);
    });
  });
});
