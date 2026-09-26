import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from '../src/context/ToastContext';
import { AuthProvider } from '../src/context/AuthContext';
import { ResumesPage } from '../src/pages/ResumesPage';
import { api } from '../src/api/client';

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

const mockResumeSummaries = [
  {
    id: 'res-1',
    title: 'Senior Systems Engineer Resume',
    fileName: 'alex_systems.txt',
    skillsCount: 6,
    topSkills: ['TypeScript', 'Go', 'Docker', 'Redis', 'Kubernetes'],
    experienceCount: 2,
    createdAt: new Date().toISOString()
  }
];

const mockResumeDetail = {
  id: 'res-1',
  userId: 'user-1',
  title: 'Senior Systems Engineer Resume',
  fileName: 'alex_systems.txt',
  fileType: 'txt',
  rawText: 'Alex Rivers\nSenior Systems Engineer\nSkills: TypeScript, Go, Docker',
  parsedData: {
    candidateName: 'Alex Rivers',
    email: 'alex.rivers@example.com',
    phone: '(555) 123-4567',
    summary: 'Seasoned systems engineer building distributed backends.',
    skills: {
      technical: ['TypeScript', 'Go', 'Distributed Systems'],
      frameworks: ['React', 'Node.js', 'FastAPI'],
      tools: ['Docker', 'Kubernetes', 'Redis'],
      soft: ['Mentorship', 'Architecture']
    },
    experience: [
      {
        company: 'CloudScale Technologies',
        role: 'Senior Systems Engineer',
        duration: '2022 - Present',
        highlights: ['Engineered high-throughput Raft consensus layer', 'Maintained 99.99% uptime']
      }
    ],
    education: [
      {
        institution: 'Stanford University',
        degree: 'B.S. in Computer Science',
        graduationYear: '2020'
      }
    ],
    projects: [
      {
        name: 'Distributed Key-Value Engine',
        description: 'Consistent hashing with LSM-Tree storage engine.',
        technologies: ['Go', 'Raft']
      }
    ]
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const mockMatchResult = {
  matchScore: 92,
  targetRole: 'Senior Distributed Systems Architect',
  matchedSkills: ['TypeScript', 'Go', 'Docker', 'Redis'],
  missingSkills: ['Terraform'],
  strengthSummary: 'Exceptional alignment in Go, Docker, and distributed consensus.',
  gapSummary: 'Minor gap in IaC tools like Terraform.',
  recommendedFocusTopics: ['Go Concurrency', 'Redis Partitioning'],
  suggestedSeniority: 'senior',
  tailoredInterviewPrompts: [
    'How do you manage partition tolerance under high-frequency writes in Go?'
  ]
};

const renderResumesPage = () => {
  return render(
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <ResumesPage />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

describe('ResumesPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders resume list and detailed structured taxonomy', async () => {
    (api.get as any).mockImplementation((url: string) => {
      if (url === '/resumes') {
        return Promise.resolve({ data: { success: true, data: mockResumeSummaries } });
      }
      if (url.includes('/resumes/res-1')) {
        return Promise.resolve({ data: { success: true, data: mockResumeDetail } });
      }
      return Promise.reject(new Error('Not found'));
    });

    renderResumesPage();

    await waitFor(() => {
      expect(screen.getByText('Resume Hub & JD Match Engine')).toBeInTheDocument();
      expect(screen.getByText('Senior Systems Engineer Resume')).toBeInTheDocument();
      expect(screen.getByText('Alex Rivers')).toBeInTheDocument();
      expect(screen.getByText('alex.rivers@example.com')).toBeInTheDocument();
    });

    // Check Skills Taxonomy
    expect(screen.getByText('Extracted Skills Taxonomy')).toBeInTheDocument();
    expect(screen.getByText('Distributed Systems')).toBeInTheDocument();
    expect(screen.getByText('CloudScale Technologies')).toBeInTheDocument();
    expect(screen.getByText('Stanford University')).toBeInTheDocument();
  });

  it('allows opening upload modal and submitting new resume', async () => {
    (api.get as any).mockResolvedValue({ data: { success: true, data: [] } });
    (api.post as any).mockResolvedValue({ data: { success: true, data: mockResumeDetail } });

    renderResumesPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Upload New Resume/i })).toBeInTheDocument();
    });

    // Open upload modal
    fireEvent.click(screen.getByRole('button', { name: /Upload New Resume/i }));
    expect(screen.getByText('Upload & Parse Technical Resume')).toBeInTheDocument();

    // Fill resume content
    const textarea = screen.getByPlaceholderText(/Paste your full resume text/i);
    fireEvent.change(textarea, {
      target: { value: 'Alex Rivers\nSenior Engineer\nSkills: Python, TypeScript, Docker' }
    });

    // Submit
    const submitBtn = screen.getByRole('button', { name: /Parse & Save Resume/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/resumes', expect.objectContaining({
        rawText: expect.stringContaining('Alex Rivers')
      }));
    });
  });

  it('runs interactive JD match analysis and renders fit score gauge', async () => {
    (api.get as any).mockImplementation((url: string) => {
      if (url === '/resumes') {
        return Promise.resolve({ data: { success: true, data: mockResumeSummaries } });
      }
      return Promise.resolve({ data: { success: true, data: mockResumeDetail } });
    });

    (api.post as any).mockResolvedValue({ data: { success: true, data: mockMatchResult } });

    renderResumesPage();

    await waitFor(() => {
      expect(screen.getByText('Live Job Description Matcher')).toBeInTheDocument();
    });

    // Run Match
    const matchBtn = screen.getByRole('button', { name: /Run Semantic Fit Match/i });
    fireEvent.click(matchBtn);

    await waitFor(() => {
      expect(screen.getByText('92%')).toBeInTheDocument();
      expect(screen.getByText(/Matched Proficiencies/i)).toBeInTheDocument();
      expect(screen.getByText('Configure Tailored Interview')).toBeInTheDocument();
    });
  });
});
