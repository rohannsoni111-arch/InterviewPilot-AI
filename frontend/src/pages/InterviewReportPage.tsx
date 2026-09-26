import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  IInterviewEvaluationReport,
  IInterviewSession,
  HiringVerdict
} from '@interviewpilot/shared';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  Target,
  ListOrdered,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';

const VERDICT_CONFIG: Record<
  HiringVerdict,
  { label: string; bg: string; text: string; border: string; desc: string }
> = {
  [HiringVerdict.STRONG_HIRE]: {
    label: 'Strong Hire',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/30',
    desc: 'Exceeded the bar across algorithmic rigor, architectural design, and communication.'
  },
  [HiringVerdict.HIRE]: {
    label: 'Hire',
    bg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
    text: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-500/30',
    desc: 'Met expectations for the target seniority bar with solid fundamentals.'
  },
  [HiringVerdict.LEAN_HIRE]: {
    label: 'Lean Hire',
    bg: 'bg-cyan-500/10 dark:bg-cyan-500/20',
    text: 'text-cyan-600 dark:text-cyan-400',
    border: 'border-cyan-500/30',
    desc: 'Demonstrated good problem-solving, with minor growth areas in edge cases or depth.'
  },
  [HiringVerdict.LEAN_NO_HIRE]: {
    label: 'Lean No Hire',
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/30',
    desc: 'Below threshold in key assessment criteria; recommend targeted practice.'
  },
  [HiringVerdict.NO_HIRE]: {
    label: 'No Hire',
    bg: 'bg-rose-500/10 dark:bg-rose-500/20',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-500/30',
    desc: 'Significant gaps identified across technical execution or system design.'
  }
};

export const InterviewReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [session, setSession] = useState<IInterviewSession | null>(null);
  const [report, setReport] = useState<IInterviewEvaluationReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedStages, setExpandedStages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchReport = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const [sessionRes, reportRes] = await Promise.all([
          api.get(`/interviews/${id}`),
          api.get(`/interviews/${id}/report`)
        ]);

        if (sessionRes.data.success) {
          setSession(sessionRes.data.data);
        }

        if (reportRes.data.success) {
          setReport(reportRes.data.data);
          // Default expand all stages
          if (reportRes.data.data.stageEvaluations) {
            const initialExpanded: Record<string, boolean> = {};
            reportRes.data.data.stageEvaluations.forEach((s: any) => {
              initialExpanded[s.stageId] = true;
            });
            setExpandedStages(initialExpanded);
          }
        }
      } catch (err: unknown) {
        const error = err as any;
        showToast(error.response?.data?.error?.message || error.message || 'Could not load evaluation report', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [id, showToast]);

  const toggleStage = (stageId: string) => {
    setExpandedStages((prev) => ({ ...prev, [stageId]: !prev[stageId] }));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 font-medium text-sm animate-pulse">
          Generating In-Depth AI Assessment Report & Scorecards...
        </p>
      </div>
    );
  }

  if (!report || !session) {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="text-rose-500 text-lg font-bold">Evaluation report not found</div>
        <Link
          to="/interviews"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Return to Interviews
        </Link>
      </div>
    );
  }

  const verdictStyle = VERDICT_CONFIG[report.verdict] || VERDICT_CONFIG[HiringVerdict.HIRE];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-fadeIn">
      {/* Back Link & Header Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/interviews"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Interviews
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to="/interviews/new"
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-md"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Practice Another Track</span>
          </Link>

          <Link
            to="/dashboard"
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>

      {/* Hero Evaluation Summary Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left: Overall Score Dial */}
          <div className="md:col-span-4 flex flex-col items-center justify-center p-6 bg-slate-950/80 rounded-2xl border border-slate-800/80 text-center">
            <div className="relative flex items-center justify-center">
              <div className="w-28 h-28 rounded-full border-4 border-indigo-500/30 flex items-center justify-center bg-indigo-950/20">
                <span className="text-4xl font-extrabold text-slate-100 font-mono tracking-tight">
                  {report.overallScore}
                </span>
                <span className="text-xs text-slate-400 absolute bottom-4">/100</span>
              </div>
            </div>

            <div className="mt-3">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Readiness</div>
              <div
                className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase border ${verdictStyle.bg} ${verdictStyle.text} ${verdictStyle.border}`}
              >
                <Award className="w-3.5 h-3.5" />
                {verdictStyle.label}
              </div>
            </div>
          </div>

          {/* Right: Assessment Meta & Executive Summary */}
          <div className="md:col-span-8 space-y-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-1">
                <span className="capitalize font-bold text-indigo-400">{(session.type || '').replace(/_/g, ' ')}</span>
                <span>•</span>
                <span className="capitalize">{session.difficulty || 'Intermediate'} Bar</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {session.durationMinutes || 45} min
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {new Date(report.generatedAt || Date.now()).toLocaleDateString()}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-slate-100">{session.title}</h1>
              <p className="text-xs text-slate-400 mt-1">{verdictStyle.desc}</p>
            </div>

            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <div className="font-bold text-slate-200 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-400" /> Executive AI Debrief
              </div>
              {report.summary}
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Dimensional Competency Scorecard */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base sm:text-lg font-bold text-slate-100">5-Dimensional Competency Breakdown</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.dimensionScores.map((dim) => (
            <div
              key={dim.dimension}
              className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">{dim.dimension}</span>
                <span className="text-xs font-mono font-bold text-indigo-400">{dim.score}/100</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    dim.score >= 80
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : dim.score >= 65
                      ? 'bg-gradient-to-r from-indigo-500 to-cyan-400'
                      : 'bg-gradient-to-r from-amber-500 to-rose-400'
                  }`}
                  style={{ width: `${dim.score}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                <p className="line-clamp-1">{dim.feedback}</p>
                <span
                  className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ml-2 flex-shrink-0 ${
                    dim.status === 'exceeds'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : dim.status === 'meets'
                      ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {dim.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths vs Areas for Improvement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>Demonstrated Strengths</span>
          </div>

          <ul className="space-y-2.5 text-xs text-slate-300">
            {report.strengths.map((s, idx) => (
              <li key={idx} className="flex items-start gap-2.5 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                <span className="leading-relaxed">{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Growth Areas */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Target Growth Areas & Gaps</span>
          </div>

          <ul className="space-y-2.5 text-xs text-slate-300">
            {report.weaknesses.map((w, idx) => (
              <li key={idx} className="flex items-start gap-2.5 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                <span className="leading-relaxed">{w}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Stage-by-Stage Performance Timeline */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <ListOrdered className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base sm:text-lg font-bold text-slate-100">Stage-by-Stage Evaluation Timeline</h2>
        </div>

        <div className="space-y-3 pt-2">
          {report.stageEvaluations.map((stage, idx) => {
            const isExpanded = !!expandedStages[stage.stageId];

            return (
              <div
                key={stage.stageId}
                className="bg-slate-950/70 border border-slate-800 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleStage(stage.stageId)}
                  className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-slate-900/60 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-600/20 text-indigo-400 text-xs font-bold flex items-center justify-center border border-indigo-500/30">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-200">{stage.stageTitle}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">{stage.feedback}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-indigo-400">{stage.score}/100</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-5 pt-0 border-t border-slate-800/80 text-xs space-y-3 mt-3">
                    <div>
                      <div className="font-semibold text-slate-300 mb-1">Key Observations:</div>
                      <ul className="list-disc list-inside text-slate-400 space-y-0.5">
                        {stage.keyObservations.map((obs, i) => (
                          <li key={i}>{obs}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-xl text-emerald-300">
                        <div className="font-bold mb-1">Highlights:</div>
                        <ul className="list-disc list-inside text-[11px] space-y-0.5 text-emerald-400/90">
                          {stage.strengths.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 bg-amber-950/20 border border-amber-900/40 rounded-xl text-amber-300">
                        <div className="font-bold mb-1">Opportunities to Improve:</div>
                        <ul className="list-disc list-inside text-[11px] space-y-0.5 text-amber-400/90">
                          {stage.areasForImprovement.map((a, i) => (
                            <li key={i}>{a}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Candidate Proctoring & Integrity Telemetry Card */}
      {report.proctoringReport && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {report.proctoringReport.flagLevel === 'clean' ? (
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-amber-400" />
              )}
              <h2 className="text-base sm:text-lg font-bold text-slate-100">Candidate Proctoring & Integrity Telemetry</h2>
            </div>

            <div
              className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase border flex items-center gap-1.5 ${
                report.proctoringReport.flagLevel === 'clean'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : report.proctoringReport.flagLevel === 'suspicious'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}
            >
              <span>Status: {report.proctoringReport.flagLevel}</span>
              <span>•</span>
              <span className="font-mono">{report.proctoringReport.integrityScore}/100</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl">
              <span className="text-xs text-slate-400">Integrity Score</span>
              <div className="text-xl font-extrabold font-mono text-indigo-400 mt-1">
                {report.proctoringReport.integrityScore}%
              </div>
            </div>

            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl">
              <span className="text-xs text-slate-400">Window Blurs / Tab Switches</span>
              <div className="text-xl font-extrabold font-mono text-slate-200 mt-1">
                {report.proctoringReport.tabSwitchCount}
              </div>
            </div>

            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl">
              <span className="text-xs text-slate-400">Clipboard Injections</span>
              <div className="text-xl font-extrabold font-mono text-slate-200 mt-1">
                {report.proctoringReport.pasteCount}
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-300 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 leading-relaxed">
            {report.proctoringReport.summary}
          </p>
        </div>
      )}

      {/* Actionable Practice Roadmap */}
      <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
        <div className="flex items-center gap-2 text-indigo-300">
          <BookOpen className="w-5 h-5" />
          <h2 className="text-base sm:text-lg font-bold text-slate-100">Personalized Practice Roadmap</h2>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Based on the performance metrics across all 4 stages, here is your customized 3-step mastery curriculum:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {report.actionPlan.map((action, i) => (
            <div
              key={i}
              className="p-4 bg-slate-950/80 border border-indigo-500/20 rounded-2xl flex flex-col justify-between gap-3"
            >
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-indigo-600/20 text-indigo-400 rounded-md border border-indigo-500/30">
                  Step 0{i + 1}
                </span>
                <p className="text-xs text-slate-200 mt-2 leading-relaxed">{action}</p>
              </div>

              <button
                onClick={() => navigate('/interviews/new')}
                className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 transition-colors self-start"
              >
                <span>Launch practice drill</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
