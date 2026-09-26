import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  IAnalyticsResponse,
  InterviewType
} from '@interviewpilot/shared';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import {
  BarChart3,
  TrendingUp,
  Award,
  Clock,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Layers,
  Code,
  Flame,
  AlertTriangle,
  PlayCircle
} from 'lucide-react';

const TRACK_ICONS: Record<string, any> = {
  [InterviewType.CODING]: Code,
  [InterviewType.SYSTEM_DESIGN]: Layers,
  [InterviewType.TECHNICAL]: Sparkles,
  [InterviewType.SQL]: BarChart3,
  [InterviewType.BEHAVIORAL]: Award
};

export const AnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [analytics, setAnalytics] = useState<IAnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/dashboard/analytics');
      if (res.data.success) {
        setAnalytics(res.data.data);
      }
    } catch (err: unknown) {
      const error = err as any;
      showToast(error.response?.data?.error?.message || 'Could not load analytics', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const launchDrill = (topic: string, track: InterviewType = InterviewType.TECHNICAL) => {
    navigate('/interviews/new', {
      state: {
        focusTopics: [topic],
        type: track
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 font-medium text-sm animate-pulse">
          Synthesizing Multi-Track Competency Radars & Trajectory Analytics...
        </p>
      </div>
    );
  }

  if (!analytics || !analytics.hasData) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-6 animate-fadeIn">
        <div className="w-16 h-16 rounded-3xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
          <BarChart3 className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-100">No Analytics Baseline Available Yet</h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Complete at least one adaptive technical interview session to unlock your multi-track skill radar, readiness velocity, and weakness recurrence heatmap.
          </p>
        </div>
        <Link
          to="/interviews/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-600/20 transition-all"
        >
          <PlayCircle className="w-4 h-4" />
          <span>Launch First Diagnostic Interview</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-fadeIn">
      {/* Header Section */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Performance Intelligence
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Multi-Track Competency & Skill Radar
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Historical readiness trajectory, multi-track proficiency radar, and actionable weakness recurrence heatmaps.
          </p>
        </div>

        <Link
          to="/interviews/new"
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20"
        >
          <Sparkles className="w-4 h-4" />
          <span>Launch Calibration Drill</span>
        </Link>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Readiness Score */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-2 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Readiness</span>
            <Award className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-100 font-mono">
              {analytics.overallReadinessScore}
            </span>
            <span className="text-xs text-slate-500 font-mono">/100</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold pt-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+{analytics.readinessVelocityDelta}% growth velocity</span>
          </div>
        </div>

        {/* Metric 2: Readiness Tier */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-2 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Estimated Tier</span>
            <Sparkles className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-lg font-bold text-slate-100 line-clamp-1">
            {analytics.readinessTier}
          </div>
          <div className="text-[11px] text-slate-400 line-clamp-1 pt-1">
            ETA: {analytics.estimatedTimeToTargetBar}
          </div>
        </div>

        {/* Metric 3: Practice Volume */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-2 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Practice Time</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-100 font-mono">
              {analytics.totalPracticeHours}
            </span>
            <span className="text-xs text-slate-400">hours</span>
          </div>
          <div className="text-xs text-slate-400 pt-1">
            Across {analytics.completedSessions} completed sessions
          </div>
        </div>

        {/* Metric 4: Integrity Score */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-2 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Integrity Score</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-400 font-mono">
              {analytics.averageIntegrityScore}%
            </span>
          </div>
          <div className="text-xs text-slate-400 pt-1">
            Proctoring telemetry verified clean
          </div>
        </div>
      </div>

      {/* Main Analysis Section: Multi-Track Competencies + 5-Dimensional Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Multi-Track Competency Matrix (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-400">
              <Layers className="w-5 h-5" />
              <h2 className="text-base font-bold text-slate-100">Multi-Track Competency Radar</h2>
            </div>
            <span className="text-xs text-slate-400">Benchmark: 75%</span>
          </div>

          <div className="space-y-4 pt-1">
            {analytics.trackCompetencies.map((t) => {
              const Icon = TRACK_ICONS[t.track] || Layers;
              return (
                <div
                  key={t.track}
                  className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-indigo-950/50 text-indigo-400 border border-indigo-800/40">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-200">{t.title}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {t.sessionsCount} session(s) assessed
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-extrabold font-mono text-indigo-400">
                        {t.score > 0 ? `${t.score}%` : 'Uncalibrated'}
                      </span>
                      <span
                        className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                          t.status === 'proficient'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : t.status === 'developing'
                            ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        t.score >= 80
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          : t.score >= 65
                          ? 'bg-gradient-to-r from-indigo-500 to-cyan-400'
                          : 'bg-gradient-to-r from-amber-500 to-rose-400'
                      }`}
                      style={{ width: `${Math.max(8, t.score)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: 5-Dimensional Mastery Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-indigo-400">
            <Sparkles className="w-5 h-5" />
            <h2 className="text-base font-bold text-slate-100">5-Dimensional Mastery</h2>
          </div>

          <div className="space-y-3 pt-1">
            {analytics.dimensionAnalytics.map((dim) => (
              <div
                key={dim.dimension}
                className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300">{dim.dimension}</span>
                  <span className="font-mono font-bold text-indigo-400">{dim.score}%</span>
                </div>

                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${dim.score}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span className="capitalize">{dim.status} expected standard</span>
                  <span className="text-emerald-400 font-semibold">+{dim.trend}% trend</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weakness Recurrence Heatmap & Gap Mitigation Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-400">
            <Flame className="w-5 h-5" />
            <h2 className="text-base sm:text-lg font-bold text-slate-100">
              Weakness Recurrence Heatmap & Targeted Remediation
            </h2>
          </div>
          <span className="text-xs text-slate-400">Ranked by recurrence frequency</span>
        </div>

        {analytics.weaknessHeatmap.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-950/60 rounded-2xl border border-dashed border-slate-800">
            No recurring weaknesses detected. Candidate performance meets target thresholds across evaluated rounds.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            {analytics.weaknessHeatmap.map((w, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-950/80 border border-slate-800 hover:border-indigo-500/40 rounded-2xl space-y-3 flex flex-col justify-between transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                        w.severity === 'critical'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : w.severity === 'moderate'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                      }`}
                    >
                      {w.severity} ({w.recurrenceCount}x recurrent)
                    </span>
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  </div>

                  <h3 className="text-xs font-bold text-slate-200 line-clamp-2">{w.topic}</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{w.remediationSuggestion}</p>
                </div>

                <button
                  onClick={() => launchDrill(w.topic)}
                  className="w-full py-2 rounded-xl bg-slate-900 hover:bg-indigo-600 text-indigo-300 hover:text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-800 hover:border-indigo-600"
                >
                  <span>Launch Practice Drill</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
