import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CodeEditor } from '../src/components/CodeEditor/CodeEditor';
import { ToastProvider } from '../src/context/ToastContext';
import { api } from '../src/api/client';
import { SupportedLanguage } from '@interviewpilot/shared';

vi.mock('../src/api/client', () => ({
  api: {
    post: vi.fn(),
  },
}));

describe('CodeEditor Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderEditor = (props = {}) => {
    return render(
      <ToastProvider>
        <CodeEditor {...props} />
      </ToastProvider>
    );
  };

  it('renders code workspace, language selector, and action buttons', () => {
    renderEditor();
    expect(screen.getByText('Code Workspace')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('Run Code')).toBeInTheDocument();
    expect(screen.getByText('AI Review')).toBeInTheDocument();
  });

  it('allows language switching and updates default template', () => {
    renderEditor();
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: SupportedLanguage.SQL } });
    expect(select).toHaveValue(SupportedLanguage.SQL);
    const textarea = screen.getByPlaceholderText(/Write your technical solution here/i) as HTMLTextAreaElement;
    expect(textarea.value).toContain('SELECT');
  });

  it('executes code and displays execution console output', async () => {
    (api.post as any).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          success: true,
          stdout: 'Result: [0, 1]',
          executionTimeMs: 15.2,
          testResults: [
            { id: '1', input: 'sample', expectedOutput: 'out', passed: true }
          ]
        }
      }
    });

    renderEditor();
    const runBtn = screen.getByText('Run Code');
    fireEvent.click(runBtn);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/code/run', expect.objectContaining({
        language: SupportedLanguage.PYTHON
      }));
      expect(screen.getByText(/Result: \[0, 1\]/i)).toBeInTheDocument();
      expect(screen.getByText(/15.2 ms/i)).toBeInTheDocument();
    });
  });

  it('triggers AI complexity review and shows findings', async () => {
    (api.post as any).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          verdict: 'optimal',
          summary: 'Clean algorithmic structure with O(n) runtime.',
          timeComplexity: 'O(n)',
          spaceComplexity: 'O(n)',
          keyInsights: ['Hash map lookup provides constant time checks.'],
          edgeCaseWarnings: []
        }
      }
    });

    renderEditor();
    const reviewBtn = screen.getByText('AI Review');
    fireEvent.click(reviewBtn);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/code/review', expect.objectContaining({
        language: SupportedLanguage.PYTHON
      }));
      expect(screen.getByText(/Clean algorithmic structure with O\(n\) runtime/i)).toBeInTheDocument();
      expect(screen.getByText('Time: O(n)')).toBeInTheDocument();
    });
  });
});
