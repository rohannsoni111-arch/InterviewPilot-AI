import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IQuestionBankItem,
  InterviewType,
  DifficultyLevel,
} from '@interviewpilot/shared';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import {
  Building2,
  Search,
  Sparkles,
  Layers,
  Clock,
  HelpCircle,
  X,
  Play,
  Flame
} from 'lucide-react';

const COMPANIES = [
  'All',
  'Google',
  'Meta',
  'Amazon',
  'Netflix',
  'Stripe',
  'Anthropic',
];

const TRACK_TABS: { label: string; value: string }[] = [
  { label: 'All Tracks', value: 'all' },
  { label: 'Coding (DSA)', value: InterviewType.CODING },
  { label: 'System Design', value: InterviewType.SYSTEM_DESIGN },
  { label: 'SQL & Data', value: InterviewType.SQL },
  { label: 'Behavioral', value: InterviewType.BEHAVIORAL },
];

export const QuestionBankPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [questions, setQuestions] = useState<IQuestionBankItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState('All');
  const [selectedTrack, setSelectedTrack] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState<IQuestionBankItem | null>(null);
  const [isLaunching, setIsLaunching] = useState<string | null>(null);
  const [showHints, setShowHints] = useState(false);
  const [previewLanguage, setPreviewLanguage] = useState<'python' | 'typescript' | 'sql'>('python');

  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (selectedCompany !== 'All') params.company = selectedCompany;
      if (selectedTrack !== 'all') params.track = selectedTrack;
      if (selectedDifficulty !== 'all') params.difficulty = selectedDifficulty;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      if (api.getQuestions) {
        const res = await api.getQuestions(params);
        if (res?.data) {
          setQuestions(res.data);
        }
      }
    } catch {
      showToast('Failed to load questions', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [selectedCompany, selectedTrack, selectedDifficulty]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchQuestions();
  };

  const handleLaunchSimulation = async (questionId: string) => {
    try {
      setIsLaunching(questionId);
      if (api.launchQuestionInterview) {
        const res = await api.launchQuestionInterview(questionId);
        if (res?.data?.id) {
          showToast('Live interview room configured with question!', 'success');
          navigate(`/interviews/${res.data.id}/room`);
          return;
        }
      }
      showToast('Could not launch simulation room', 'error');
    } catch {
      showToast('Error creating interview simulation', 'error');
    } finally {
      setIsLaunching(null);
    }
  };

  const getCompanyColor = (company: string) => {
    switch (company.toLowerCase()) {
      case 'google':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'meta':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      case 'amazon':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'netflix':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'stripe':
        return 'bg-violet-500/10 text-violet-400 border-violet-500/30';
      case 'anthropic':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
            <Building2 className="w-3.5 h-3.5" />
            Curated Problem Library
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            FAANG & Tier-1 Company Question Bank
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-world technical questions tagged by company, track, test cases, and instant AI simulation launchers.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>{questions.length} Verified Problems</span>
        </div>
      </div>

      {/* Company Selector Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {COMPANIES.map((company) => {
          const isSelected = selectedCompany === company;
          return (
            <button
              key={company}
              onClick={() => setSelectedCompany(company)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 border ${
                isSelected
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              {company !== 'All' && <Building2 className="w-3 h-3" />}
              <span>{company}</span>
            </button>
          );
        })}
      </div>

      {/* Track, Difficulty & Search Bar */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        {/* Track Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800/80 overflow-x-auto">
          {TRACK_TABS.map((tab) => {
            const isSelected = selectedTrack === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setSelectedTrack(tab.value)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  isSelected
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search & Difficulty */}
        <div className="flex items-center gap-3 flex-1 sm:flex-initial">
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Difficulties</option>
            <option value={DifficultyLevel.ENTRY}>Entry Level</option>
            <option value={DifficultyLevel.MID}>Mid Level</option>
            <option value={DifficultyLevel.SENIOR}>Senior</option>
            <option value={DifficultyLevel.STAFF}>Staff / Principal</option>
          </select>

          <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search problems, topics, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </form>
        </div>
      </div>

      {/* Questions Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-400 text-sm animate-pulse">
          Loading curated problem sets...
        </div>
      ) : questions.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
          <Layers className="w-8 h-8 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-200">No matching questions found</h3>
          <p className="text-xs text-slate-400">Try adjusting your company filter or search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {questions.map((q) => (
            <div
              key={q.id}
              className="p-5 bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-3xl space-y-4 transition-all flex flex-col justify-between group shadow-lg"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getCompanyColor(q.company)}`}>
                    {q.company}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-800/80 px-2 py-0.5 rounded-md">
                    {q.difficulty}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-1">
                  {q.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {q.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {q.tags.slice(0, 3).map((t) => (
                    <span key={t} className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800/60">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    {q.acceptanceRate}% accept
                  </span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    ~{q.estimatedMinutes}m
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setSelectedQuestion(q);
                      setShowHints(false);
                    }}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleLaunchSimulation(q.id)}
                    disabled={isLaunching === q.id}
                    className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 disabled:opacity-50"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>{isLaunching === q.id ? 'Launching...' : 'Practice'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Problem Detail & Starter Code Modal */}
      {selectedQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getCompanyColor(selectedQuestion.company)}`}>
                  {selectedQuestion.company}
                </span>
                <h2 className="text-base sm:text-lg font-bold text-slate-100">{selectedQuestion.title}</h2>
              </div>
              <button
                onClick={() => setSelectedQuestion(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-sm">
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Problem Statement</h4>
                <p className="text-slate-200 leading-relaxed">{selectedQuestion.description}</p>
              </div>

              {/* Constraints */}
              {selectedQuestion.constraints?.length > 0 && (
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1 text-xs">
                  <span className="font-bold text-slate-300 block mb-1">Constraints:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-400 font-mono">
                    {selectedQuestion.constraints.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Starter Code Viewer */}
              {selectedQuestion.starterCode && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Starter Template</span>
                    <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                      {selectedQuestion.starterCode.python && (
                        <button
                          onClick={() => setPreviewLanguage('python')}
                          className={`px-2 py-0.5 rounded ${previewLanguage === 'python' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                        >
                          Python
                        </button>
                      )}
                      {selectedQuestion.starterCode.typescript && (
                        <button
                          onClick={() => setPreviewLanguage('typescript')}
                          className={`px-2 py-0.5 rounded ${previewLanguage === 'typescript' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                        >
                          TypeScript
                        </button>
                      )}
                      {selectedQuestion.starterCode.sql && (
                        <button
                          onClick={() => setPreviewLanguage('sql')}
                          className={`px-2 py-0.5 rounded ${previewLanguage === 'sql' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                        >
                          SQL
                        </button>
                      )}
                    </div>
                  </div>
                  <pre className="p-3 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-xs text-indigo-300 overflow-x-auto">
                    {selectedQuestion.starterCode[previewLanguage] || selectedQuestion.starterCode.python}
                  </pre>
                </div>
              )}

              {/* Hints */}
              {selectedQuestion.hints?.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowHints(!showHints)}
                    className="text-xs font-semibold text-indigo-400 flex items-center gap-1 hover:underline"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    {showHints ? 'Hide Architectural Hints' : 'Reveal Interviewer Hints'}
                  </button>
                  {showHints && (
                    <ul className="mt-2 p-3 bg-indigo-950/20 border border-indigo-500/20 rounded-xl space-y-1 text-xs text-indigo-200 list-disc list-inside animate-fadeIn">
                      {selectedQuestion.hints.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">
                {selectedQuestion.category} • {selectedQuestion.estimatedMinutes} min target
              </span>
              <button
                onClick={() => handleLaunchSimulation(selectedQuestion.id)}
                disabled={isLaunching === selectedQuestion.id}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isLaunching === selectedQuestion.id ? 'Starting Session...' : 'Start AI Interview Simulation'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
