import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IResumeSummary,
  IResume,
  IResumeMatchResult
} from '@interviewpilot/shared';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import {
  FileText,
  Upload,
  Plus,
  Trash2,
  Sparkles,
  ArrowRight,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Wand2,
  CheckCircle2,
  AlertTriangle,
  Code
} from 'lucide-react';

export const ResumesPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [resumes, setResumes] = useState<IResumeSummary[]>([]);
  const [selectedResume, setSelectedResume] = useState<IResume | null>(null);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [rawResumeText, setRawResumeText] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // JD Matcher state
  const [jdRole, setJdRole] = useState('Senior Full-Stack Engineer');
  const [jdText, setJdText] = useState(
    'We are seeking a Senior Full-Stack Engineer with strong expertise in TypeScript, React, Node.js, Distributed Systems, Docker, and PostgreSQL.'
  );
  const [matchResult, setMatchResult] = useState<IResumeMatchResult | null>(null);
  const [isMatching, setIsMatching] = useState(false);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    setIsLoadingList(true);
    try {
      const res = await api.get('/resumes');
      if (res.data.success) {
        setResumes(res.data.data);
        if (res.data.data.length > 0) {
          fetchResumeDetail(res.data.data[0].id);
        } else {
          setSelectedResume(null);
        }
      }
    } catch (err: unknown) {
      const error = err as any;
      showToast(error.response?.data?.error?.message || 'Could not load resumes', 'error');
    } finally {
      setIsLoadingList(false);
    }
  };

  const fetchResumeDetail = async (id: string) => {
    setIsLoadingDetail(true);
    try {
      const res = await api.get(`/resumes/${id}`);
      if (res.data.success) {
        setSelectedResume(res.data.data);
      }
    } catch (err: unknown) {
      const error = err as any;
      showToast(error.response?.data?.error?.message || 'Could not load resume detail', 'error');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawResumeText.trim()) {
      showToast('Please provide resume text content', 'error');
      return;
    }

    setIsUploading(true);
    try {
      const res = await api.post('/resumes', {
        title: uploadTitle.trim() || 'My Technical Resume',
        rawText: rawResumeText.trim()
      });

      if (res.data.success) {
        showToast('Resume parsed and saved successfully!', 'success');
        setIsUploadOpen(false);
        setUploadTitle('');
        setRawResumeText('');
        fetchResumes();
      }
    } catch (err: unknown) {
      const error = err as any;
      showToast(error.response?.data?.error?.message || 'Failed to upload resume', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this resume?')) return;

    try {
      await api.delete(`/resumes/${id}`);
      showToast('Resume deleted', 'success');
      fetchResumes();
    } catch (err: unknown) {
      const error = err as any;
      showToast(error.response?.data?.error?.message || 'Failed to delete resume', 'error');
    }
  };

  const handleRunMatch = async () => {
    if (!selectedResume && !rawResumeText.trim()) {
      showToast('Please select or upload a resume first', 'error');
      return;
    }
    if (!jdText.trim()) {
      showToast('Please enter a target job description', 'error');
      return;
    }

    setIsMatching(true);
    try {
      const res = await api.post('/resumes/match', {
        resumeId: selectedResume?.id,
        jobDescription: jdText.trim(),
        targetRole: jdRole.trim()
      });

      if (res.data.success) {
        setMatchResult(res.data.data);
        showToast(`Matched! Fit Score: ${res.data.data.matchScore}%`, 'success');
      }
    } catch (err: unknown) {
      const error = err as any;
      showToast(error.response?.data?.error?.message || 'Failed to analyze JD match', 'error');
    } finally {
      setIsMatching(false);
    }
  };

  const launchTailoredDrill = () => {
    if (!matchResult) return;
    navigate('/interviews/new', {
      state: {
        targetRole: matchResult.targetRole,
        focusTopics: matchResult.recommendedFocusTopics,
        resumeId: selectedResume?.id
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            AI Profile Intelligence
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Resume Hub & JD Match Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Upload candidate resumes to extract structured skill graphs and benchmark profile fit against target job descriptions.
          </p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Upload New Resume</span>
        </button>
      </div>

      {/* Main Grid: Left Column (Resumes List & JD Matcher) + Right Column (Parsed Resume Viewer) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Resume Selection Cards */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>Uploaded Resumes ({resumes.length})</span>
              </h2>
            </div>

            {isLoadingList ? (
              <div className="py-8 text-center text-xs text-slate-400 animate-pulse">
                Loading resumes...
              </div>
            ) : resumes.length === 0 ? (
              <div className="p-6 bg-slate-950/60 rounded-2xl border border-dashed border-slate-800 text-center space-y-3">
                <Upload className="w-8 h-8 text-slate-600 mx-auto" />
                <div className="text-xs text-slate-400">No resumes uploaded yet</div>
                <button
                  onClick={() => setIsUploadOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 text-xs font-semibold transition-colors"
                >
                  Upload your first resume
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {resumes.map((r) => {
                  const isSelected = selectedResume?.id === r.id;
                  return (
                    <div
                      key={r.id}
                      onClick={() => fetchResumeDetail(r.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-indigo-950/40 border-indigo-500/50 shadow-md'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-slate-200">{r.title}</div>
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          {r.topSkills.slice(0, 3).map((s, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-1.5 py-0.5 bg-slate-900 border border-slate-800 text-indigo-400 rounded-md font-mono"
                            >
                              {s}
                            </span>
                          ))}
                          {r.skillsCount > 3 && (
                            <span className="text-[10px] text-slate-500 font-mono">
                              +{r.skillsCount - 3} more
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleDelete(r.id, e)}
                          title="Delete Resume"
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Interactive JD Matcher Tool */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-indigo-400">
              <Wand2 className="w-4 h-4" />
              <h2 className="text-sm font-bold text-slate-200">Live Job Description Matcher</h2>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Target Role Title
                </label>
                <input
                  type="text"
                  value={jdRole}
                  onChange={(e) => setJdRole(e.target.value)}
                  placeholder="e.g. Senior Backend Architect"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Job Description / Role Requirements
                </label>
                <textarea
                  rows={4}
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  placeholder="Paste target job requirements and tech stack..."
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <button
                onClick={handleRunMatch}
                disabled={isMatching || !selectedResume}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
              >
                {isMatching ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Run Semantic Fit Match</span>
                  </>
                )}
              </button>
            </div>

            {/* Match Result Display */}
            {matchResult && (
              <div className="p-4 bg-slate-950/90 border border-indigo-500/30 rounded-2xl space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Semantic Fit Score</span>
                  <span className="text-lg font-extrabold font-mono text-indigo-400">
                    {matchResult.matchScore}%
                  </span>
                </div>

                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-teal-400 rounded-full transition-all duration-500"
                    style={{ width: `${matchResult.matchScore}%` }}
                  />
                </div>

                <div className="space-y-2 text-[11px]">
                  <div>
                    <span className="font-bold text-emerald-400 flex items-center gap-1 mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Matched Proficiencies:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {matchResult.matchedSkills.map((s, i) => (
                        <span key={i} className="px-2 py-0.5 bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 rounded font-mono">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {matchResult.missingSkills.length > 0 && (
                    <div className="pt-1">
                      <span className="font-bold text-amber-400 flex items-center gap-1 mb-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Missing / Growth Gaps:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {matchResult.missingSkills.map((s, i) => (
                          <span key={i} className="px-2 py-0.5 bg-amber-950/40 border border-amber-800/60 text-amber-300 rounded font-mono">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={launchTailoredDrill}
                  className="w-full mt-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-indigo-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Configure Tailored Interview</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (7 cols): Detailed Parsed Resume Breakdown */}
        <div className="lg:col-span-7">
          {isLoadingDetail ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-xs text-slate-400 animate-pulse">
              Parsing and extracting structured profile data...
            </div>
          ) : !selectedResume ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-2">
              <FileText className="w-10 h-10 text-slate-600 mx-auto" />
              <div className="text-sm font-bold text-slate-300">Select a resume to inspect</div>
              <p className="text-xs">View extracted technical skills, frameworks, tools, and experience history.</p>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              {/* Profile Header */}
              <div className="border-b border-slate-800 pb-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-xl font-bold text-slate-100">
                      {selectedResume.parsedData.candidateName || selectedResume.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                      {selectedResume.parsedData.email && <span>{selectedResume.parsedData.email}</span>}
                      {selectedResume.parsedData.phone && <span>• {selectedResume.parsedData.phone}</span>}
                    </div>
                  </div>
                </div>

                {selectedResume.parsedData.summary && (
                  <p className="text-xs text-slate-300 mt-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 leading-relaxed">
                    {selectedResume.parsedData.summary}
                  </p>
                )}
              </div>

              {/* Extracted Skills Taxonomy */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-indigo-400" />
                  Extracted Skills Taxonomy
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5">
                    <span className="text-[11px] font-bold text-indigo-300">Technical & Languages</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedResume.parsedData.skills.technical.map((s, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 bg-slate-900 text-slate-300 rounded font-mono">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5">
                    <span className="text-[11px] font-bold text-teal-300">Frameworks & Libraries</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedResume.parsedData.skills.frameworks.map((s, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 bg-slate-900 text-slate-300 rounded font-mono">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5">
                    <span className="text-[11px] font-bold text-cyan-300">Infrastructure & Tools</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedResume.parsedData.skills.tools.map((s, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 bg-slate-900 text-slate-300 rounded font-mono">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5">
                    <span className="text-[11px] font-bold text-amber-300">Practices & Soft Skills</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedResume.parsedData.skills.soft.map((s, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 bg-slate-900 text-slate-300 rounded font-mono">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Work Experience */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                  Work Experience History
                </h3>

                <div className="space-y-2.5">
                  {selectedResume.parsedData.experience.map((exp, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-200">{exp.role}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{exp.duration}</span>
                      </div>
                      <div className="text-[11px] text-indigo-400 font-medium">{exp.company}</div>
                      {exp.highlights.length > 0 && (
                        <ul className="list-disc list-inside text-[11px] text-slate-400 space-y-0.5 pt-1">
                          {exp.highlights.map((h, i) => (
                            <li key={i}>{h}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Education & Projects */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                    Education
                  </h3>
                  {selectedResume.parsedData.education.map((edu, idx) => (
                    <div key={idx} className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-xs space-y-0.5">
                      <div className="font-bold text-slate-200">{edu.degree}</div>
                      <div className="text-slate-400">{edu.institution}</div>
                      {edu.graduationYear && <div className="text-[10px] text-slate-500">{edu.graduationYear}</div>}
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <FolderGit2 className="w-3.5 h-3.5 text-indigo-400" />
                    Key Projects
                  </h3>
                  {selectedResume.parsedData.projects.map((proj, idx) => (
                    <div key={idx} className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-xs space-y-0.5">
                      <div className="font-bold text-slate-200">{proj.name}</div>
                      <div className="text-slate-400 line-clamp-1">{proj.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upload Resume Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Upload className="w-4 h-4 text-indigo-400" />
                Upload & Parse Technical Resume
              </h3>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="text-slate-500 hover:text-slate-300 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Resume Title / Label
                </label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Senior Backend / Distributed Systems Resume"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Resume Content (Text, Markdown, or Paste)
                </label>
                <textarea
                  rows={8}
                  required
                  value={rawResumeText}
                  onChange={(e) => setRawResumeText(e.target.value)}
                  placeholder="Paste your full resume text or markdown here..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2"
                >
                  {isUploading ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Parse & Save Resume</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
