import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../src/context/AuthContext';
import { ToastProvider } from '../src/context/ToastContext';
import { InterviewsListPage } from '../src/pages/InterviewsListPage';
import { api } from '../src/api/client';
import { InterviewType, DifficultyLevel, InterviewStatus } from '@interviewpilot/shared';

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

const renderInterviewsList = () => {
  return render(
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <InterviewsListPage />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

describe('InterviewsListPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty state when no interviews exist', async () => {
    (api.get as any).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          interviews: [],
          total: 0,
          page: 1,
          totalPages: 1
        }
      }
    });

    renderInterviewsList();

    await waitFor(() => {
      expect(screen.getByText(/No Interview Sessions Found/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Configure First Interview/i })).toBeInTheDocument();
    });
  });

  it('renders loaded interview sessions with status badges and topics', async () => {
    (api.get as any).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          interviews: [
            {
              id: 'int-123',
              title: 'SENIOR Backend Architect (SYSTEM DESIGN)',
              type: InterviewType.SYSTEM_DESIGN,
              difficulty: DifficultyLevel.SENIOR,
              status: InterviewStatus.COMPLETED,
              overallScore: 89,
              durationSeconds: 2400,
              topics: ['Raft Consensus', 'Kafka', 'PostgreSQL'],
              createdAt: new Date().toISOString()
            }
          ],
          total: 1,
          page: 1,
          totalPages: 1
        }
      }
    });

    renderInterviewsList();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /SENIOR Backend Architect/i })).toBeInTheDocument();
      expect(screen.getAllByText('Completed').length).toBeGreaterThan(0);
      expect(screen.getByText('89%')).toBeInTheDocument();
      expect(screen.getByText('Raft Consensus')).toBeInTheDocument();
    });
  });
});
