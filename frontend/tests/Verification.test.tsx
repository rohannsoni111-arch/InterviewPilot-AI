import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { PublicVerificationPage } from '../src/pages/PublicVerificationPage';
import { api } from '../src/api/client';
import { HiringVerdict, InterviewType, DifficultyLevel } from '@interviewpilot/shared';

const mockReport = {
  badge: {
    badgeId: 'IP-V9B8C1A2F3E',
    verificationHash: '9b8c1a2f3e4d5c6b7a8f9e0d1c2b3a4f5e6d7c8b9a0f1e2d3c4b5a6f7e8d9c0b',
    shareableUrl: '/verify/IP-V9B8C1A2F3E',
    candidateName: 'Alex Mercer',
    targetRole: 'Senior Staff Infrastructure Engineer',
    interviewType: InterviewType.SYSTEM_DESIGN,
    difficulty: DifficultyLevel.STAFF,
    overallScore: 94,
    verdict: HiringVerdict.STRONG_HIRE,
    integrityScore: 99,
    integrityFlag: 'clean' as const,
    completedAt: '2026-09-26T20:00:00.000Z',
    issuedAt: '2026-09-26T20:05:00.000Z',
  },
  summary: 'Exemplary mastery of high-throughput distributed architectures, consensus protocols, and proactive communication.',
  strengths: [
    'Deep knowledge of Raft and Paxos consensus models',
    'Clear and structured capacity estimation equations',
  ],
  weaknesses: [
    'Could briefly elaborate on cross-region data egress costs',
  ],
  categoryBreakdown: [
    {
      name: 'System Design & Scalability',
      score: 96,
      maxScore: 100,
      feedback: 'Flawless partitioning and fault tolerance design.',
    },
    {
      name: 'Communication & Leadership',
      score: 92,
      maxScore: 100,
      feedback: 'Articulate and driven by engineering trade-offs.',
    },
  ],
};

describe('PublicVerificationPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getPublicVerifiedReport = vi.fn().mockResolvedValue({
      success: true,
      data: mockReport,
    });
  });

  const renderComponent = (badgeId = 'IP-V9B8C1A2F3E') =>
    render(
      <MemoryRouter initialEntries={[`/verify/${badgeId}`]}>
        <Routes>
          <Route path="/verify/:badgeId" element={<PublicVerificationPage />} />
        </Routes>
      </MemoryRouter>
    );

  it('renders verified candidate assessment certificate with SHA-256 hash', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Technical Assessment Certificate')).toBeInTheDocument();
      expect(screen.getByText('IP-V9B8C1A2F3E')).toBeInTheDocument();
      expect(screen.getByText('Alex Mercer')).toBeInTheDocument();
      expect(screen.getByText('Senior Staff Infrastructure Engineer')).toBeInTheDocument();
      expect(screen.getByText('94')).toBeInTheDocument();
      expect(screen.getByText('Strong Hire')).toBeInTheDocument();
      expect(screen.getByText(/99% Clean/i)).toBeInTheDocument();
      expect(screen.getByText('9b8c1a2f3e4d5c6b7a8f9e0d1c2b3a4f5e6d7c8b9a0f1e2d3c4b5a6f7e8d9c0b')).toBeInTheDocument();
      expect(screen.getByText('Exemplary mastery of high-throughput distributed architectures, consensus protocols, and proactive communication.')).toBeInTheDocument();
    });
  });

  it('displays candidate strengths, breakdown dimensions, and copy link action', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Deep knowledge of Raft and Paxos consensus models')).toBeInTheDocument();
      expect(screen.getByText('System Design & Scalability')).toBeInTheDocument();
      expect(screen.getByText('96/100')).toBeInTheDocument();
      expect(screen.getByText('Print Official Certificate')).toBeInTheDocument();
    });
  });

  it('renders error state when verification badge is invalid or not found', async () => {
    api.getPublicVerifiedReport = vi.fn().mockResolvedValue({
      success: false,
      error: { message: 'Assessment certificate not found or invalid.' },
    });

    renderComponent('INVALID-BADGE');

    await waitFor(() => {
      expect(screen.getByText('Certificate Verification Failed')).toBeInTheDocument();
      expect(screen.getByText('Assessment certificate not found or invalid.')).toBeInTheDocument();
    });
  });
});
