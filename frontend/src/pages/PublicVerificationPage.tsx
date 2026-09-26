import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { IPublicVerifiedReport, HiringVerdict } from '@interviewpilot/shared';
import { api } from '../api/client';
import {
  ShieldCheck,
  ShieldAlert,
  Award,
  CheckCircle2,
  Copy,
  Printer,
  Sparkles,
  Target,
  Hash
} from 'lucide-react';

const VERDICT_CONFIG: Record<
  HiringVerdict,
  { label: string; bg: string; text: string; border: string; desc: string }
> = {
  [HiringVerdict.STRONG_HIRE]: {
    label: 'Strong Hire',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    desc: 'Exceeded the bar across algorithmic rigor, architectural design, and communication.'
  },
  [HiringVerdict.HIRE]: {
    label: 'Hire',
    bg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
    text: 'text-indigo-400',
    border: 'border-indigo-500/30',
    desc: 'Met expectations for the target seniority bar with solid fundamentals.'
  },
  [HiringVerdict.LEAN_HIRE]: {
    label: 'Lean Hire',
    bg: 'bg-cyan-500/10 dark:bg-cyan-500/20',
    text: 'text-cyan-400',
    border: 'border-cyan-500/30',
    desc: 'Demonstrated good problem-solving, with minor growth areas in edge cases or depth.'
  },
  [HiringVerdict.LEAN_NO_HIRE]: {
    label: 'Lean No Hire',
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    desc: 'Below threshold in key assessment criteria; recommend targeted practice.'
  },
  [HiringVerdict.NO_HIRE]: {
    label: 'No Hire',
    bg: 'bg-rose-500/10 dark:bg-rose-500/20',
    text: 'text-rose-400',
    border: 'border-rose-500/30',
    desc: 'Substantial gaps identified in critical problem-solving or execution domains.'
  }
};

export const PublicVerificationPage: React.FC = () => {
  const { badgeId } = useParams<{ badgeId: string }>();
  const [report, setReport] = useState<IPublicVerifiedReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadVerifiedReport() {
      if (!badgeId) return;
      try {
        setLoading(true);
        setError(null);
        const res = await api.getPublicVerifiedReport!(badgeId);
        if (res.success && res.data) {
          setReport(res.data);
        } else {
          setError(res.error?.message || 'Assessment certificate not found or invalid.');
        }
      } catch (err: any) {
        setError(err.response?.data?.error?.message || 'Failed to verify assessment certificate.');
      } finally {
        setLoading(false);
      }
    }

    loadVerifiedReport();
  }, [badgeId]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-300">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold tracking-wide">Verifying Cryptographic Certificate...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-slate-100">Certificate Verification Failed</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            {error || 'The requested verification badge is invalid or has expired.'}
          </p>
          <Link
            to="/"
            className="inline-block px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
          >
            Go to InterviewPilot AI
          </Link>
        </div>
      </div>
    );
  }

  const { badge, summary, strengths, weaknesses, categoryBreakdown } = report;
  const verdictStyle = VERDICT_CONFIG[badge.verdict] || VERDICT_CONFIG[HiringVerdict.HIRE];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 selection:bg-indigo-500/30">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation & Action Bar (Hidden in Print) */}
        <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-100">InterviewPilot Recruiter Hub</div>
              <div className="text-[11px] text-slate-400">Cryptographically Verified Candidate Report</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
              title="Copy public verification link"
            >
              <Copy className="w-3.5 h-3.5 text-indigo-400" />
              <span>{copied ? 'Copied Link!' : 'Share Badge'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-md"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Official Certificate</span>
            </button>
          </div>
        </div>

        {/* Official Certificate Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden space-y-8">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Certificate Header Badge */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Cryptographically Verified</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
                Technical Assessment Certificate
              </h1>
              <p className="text-xs text-slate-400">
                Issued for candidate <strong className="text-slate-200">{badge.candidateName}</strong> for{' '}
                <span className="text-indigo-400 font-semibold">{badge.targetRole}</span>
              </p>
            </div>

            <div className="text-right sm:text-right space-y-1 font-mono">
              <div className="text-[11px] text-slate-500 uppercase tracking-wider">Badge ID</div>
              <div className="text-sm font-bold text-indigo-400 bg-indigo-950/40 px-3 py-1 rounded-lg border border-indigo-500/20">
                {badge.badgeId}
              </div>
            </div>
          </div>

          {/* Core Score & Verdict Highlight */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-slate-950/80 rounded-2xl border border-slate-800/80 text-center space-y-2">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Assessment Score</div>
              <div className="text-4xl font-extrabold text-slate-100 font-mono">
                {badge.overallScore}<span className="text-sm text-slate-500 font-normal">/100</span>
              </div>
              <div className="text-[11px] text-slate-500">Benchmark: Top Tier Senior Bar</div>
            </div>

            <div className="p-5 bg-slate-950/80 rounded-2xl border border-slate-800/80 text-center space-y-2">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Hiring Recommendation</div>
              <div className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-extrabold uppercase border ${verdictStyle.bg} ${verdictStyle.text} ${verdictStyle.border}`}>
                <Award className="w-4 h-4" />
                <span>{verdictStyle.label}</span>
              </div>
              <div className="text-[11px] text-slate-400">{verdictStyle.desc}</div>
            </div>

            <div className="p-5 bg-slate-950/80 rounded-2xl border border-slate-800/80 text-center space-y-2">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Anti-Cheat Proctoring</div>
              <div className="text-2xl font-bold text-emerald-400 flex items-center justify-center gap-1.5 font-mono">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>{badge.integrityScore}% Clean</span>
              </div>
              <div className="text-[11px] text-slate-500 capitalize">Status: {badge.integrityFlag} integrity</div>
            </div>
          </div>

          {/* Assessment Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-950/50 rounded-2xl border border-slate-800/60 text-xs">
            <div>
              <span className="text-slate-500 block">Interview Track</span>
              <span className="font-semibold text-slate-200 capitalize">{(badge.interviewType || '').replace(/_/g, ' ')}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Difficulty Seniority</span>
              <span className="font-semibold text-slate-200 capitalize">{badge.difficulty}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Completion Date</span>
              <span className="font-semibold text-slate-200">{new Date(badge.completedAt).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Issued Timestamp</span>
              <span className="font-semibold text-slate-200">{new Date(badge.issuedAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>AI Evaluation Debrief</span>
            </h3>
            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed">
              {summary}
            </div>
          </div>

          {/* 5-Dimensional Competency Breakdown */}
          {categoryBreakdown && categoryBreakdown.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-400" />
                <span>Competency Dimension Breakdown</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {categoryBreakdown.map((cat) => (
                  <div key={cat.name} className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">{cat.name}</span>
                      <span className="font-mono font-bold text-indigo-400">{cat.score}/{cat.maxScore}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-teal-400 rounded-full"
                        style={{ width: `${Math.min(100, (cat.score / cat.maxScore) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-400">{cat.feedback}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strengths & Growth Areas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl space-y-2">
              <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wide">
                <CheckCircle2 className="w-3.5 h-3.5" /> Key Candidate Strengths
              </h4>
              <ul className="space-y-1 text-xs text-slate-300">
                {strengths.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-400">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-amber-950/20 border border-amber-500/20 rounded-2xl space-y-2">
              <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wide">
                <Award className="w-3.5 h-3.5" /> Growth & Calibration Notes
              </h4>
              <ul className="space-y-1 text-xs text-slate-300">
                {(weaknesses || []).map((w: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-amber-400">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Cryptographic Hash Signature Footer */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                <Hash className="w-3 h-3 text-indigo-400" />
                <span>SHA-256 Tamper-Proof Audit Hash</span>
              </div>
              <div className="font-mono text-[11px] text-slate-400 break-all select-all">
                {badge.verificationHash}
              </div>
            </div>

            <div className="text-right sm:text-right shrink-0">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Authenticated By</div>
              <div className="font-bold text-slate-300">InterviewPilot Engine v1.0</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
