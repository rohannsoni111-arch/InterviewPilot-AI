import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { IDashboardData } from '@interviewpilot/shared';
import { 
  Sparkles, 
  ArrowRight, 
  Activity, 
  Clock, 
  TrendingUp, 
  Layers, 
  AlertCircle, 
  CheckCircle2, 
  Play, 
  BookOpen, 
  RefreshCw, 
  ShieldAlert,
  BarChart2,
  CheckCircle
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<IDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/dashboard/summary');
      if (res.data?.success && res.data?.data) {
        setData(res.data.data);
      } else {
        throw new Error('Malformed dashboard response');
      }
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || err?.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const formatDuration = (seconds: number) => {
    if (!seconds) return '0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getScoreColor = (score: number | null | undefined) => {
    if (score === null || score === undefined) return 'text-slate-400';
    if (score >= 85) return 'text-emerald-500';
    if (score >= 70) return 'text-blue-500';
    if (score >= 55) return 'text-amber-500';
    return 'text-rose-500';
  };

  const getReadinessTier = (score: number | null) => {
    if (score === null) return 'Uncalibrated';
    if (score >= 85) return 'Industry Ready (Top 10%)';
    if (score >= 75) return 'Competitive Candidate';
    if (score >= 60) return 'Developing Competency';
    return 'Foundational Practice Required';
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-36 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 rounded-2xl text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
        <h2 className="text-base font-semibold text-rose-800 dark:text-rose-200">Could not load dashboard data</h2>
        <p className="text-xs text-rose-600 dark:text-rose-400 max-w-md mx-auto">{error}</p>
        <button
          onClick={fetchDashboard}
          className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-medium transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry Request
        </button>
      </div>
    );
  }

  const { metrics, hasData, skillBreakdown, progressHistory, recentInterviews, recentWeaknesses, recentImprovements, recommendedPractice } = data;

  return (
    <div className="space-y-6 max-w-7xl animate-fade-in">
      {/* Welcome Banner */}
      <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-900">
              <Sparkles className="w-3.5 h-3.5" />
              Adaptive Candidate Intelligence
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Welcome back, {data.user.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              {data.user.headline
                ? `${data.user.headline} • Target: ${data.user.targetRoles.join(', ') || 'Software Engineer'}`
                : 'Track your technical depth, algorithmic performance, and interview readiness.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/interviews/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 text-xs sm:text-sm font-medium rounded-lg shadow-sm transition-colors whitespace-nowrap"
            >
              <Play className="w-4 h-4 fill-current" />
              Quick-Start Interview
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Readiness Score */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Interview Readiness</span>
            <Activity className="w-4 h-4 text-brand-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-bold font-mono ${getScoreColor(metrics.readinessScore)}`}>
              {metrics.readinessScore !== null ? `${metrics.readinessScore}%` : 'N/A'}
            </span>
            {metrics.readinessTrend !== null && (
              <span className={`text-xs font-semibold flex items-center ${metrics.readinessTrend >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                {metrics.readinessTrend >= 0 ? `+${metrics.readinessTrend}%` : `${metrics.readinessTrend}%`}
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
            {getReadinessTier(metrics.readinessScore)}
          </p>
        </div>

        {/* Total Interviews */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Completed Assessments</span>
            <Layers className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-slate-100">
              {metrics.completedInterviews}
            </span>
            <span className="text-xs text-slate-400">of {metrics.totalInterviews} sessions</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {metrics.completedInterviews > 0 ? 'Calibrated scoring active' : 'Awaiting baseline session'}
          </p>
        </div>

        {/* Average Score */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Average Score</span>
            <BarChart2 className="w-4 h-4 text-purple-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-bold font-mono ${getScoreColor(metrics.averageScore)}`}>
              {metrics.averageScore !== null ? `${metrics.averageScore}%` : 'N/A'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Target benchmark: 75%
          </p>
        </div>

        {/* Practice Time */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Total Practice Time</span>
            <Clock className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-slate-100">
              {formatDuration(metrics.totalPracticeSeconds)}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Simulated under interview conditions
          </p>
        </div>
      </div>

      {/* Main Grid: Progress & Skill Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress History Card */}
        <div className="lg:col-span-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-5 sm:p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brand-500" />
                Performance Progress Trajectory
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Score evolution across chronological assessment sessions.
              </p>
            </div>
          </div>

          {!hasData || progressHistory.length === 0 ? (
            <div className="py-12 px-4 text-center space-y-3 bg-slate-50 dark:bg-slate-950/40 rounded-lg border border-dashed border-slate-200 dark:border-slate-800">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <BarChart2 className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300">No Historical Assessments Yet</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                Complete your first interview simulation to generate historical trend analytics and difficulty calibration.
              </p>
              <Link
                to="/interviews/new"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors"
              >
                Launch Assessment
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Visual SVG Progress Curve */}
              <div className="h-44 w-full pt-4">
                <div className="flex items-end justify-between h-32 gap-3 px-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                  {progressHistory.map((pt, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                      {/* Tooltip */}
                      <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow pointer-events-none whitespace-nowrap z-10">
                        {pt.interviewTitle}: {pt.score}%
                      </div>
                      <div
                        className="w-full max-w-[36px] bg-brand-500/80 hover:bg-brand-500 rounded-t transition-all duration-300"
                        style={{ height: `${Math.max(pt.score, 10)}%` }}
                      />
                      <span className="text-[10px] text-slate-400 truncate w-full text-center">
                        {pt.date}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-2">
                <span>Earliest Session</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">Target Benchmark: 75%</span>
                <span>Latest Session</span>
              </div>
            </div>
          )}
        </div>

        {/* Skill Breakdown Card */}
        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-5 sm:p-6 space-y-4 shadow-sm">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-500" />
              Topic & Skill Mastery
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Aggregated domain proficiency.
            </p>
          </div>

          {skillBreakdown.length === 0 ? (
            <div className="py-10 text-center space-y-2 bg-slate-50 dark:bg-slate-950/40 rounded-lg border border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-400 italic">No skill evaluations recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {skillBreakdown.slice(0, 5).map((skillItem) => (
                <div key={skillItem.skill} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800 dark:text-slate-200">{skillItem.skill}</span>
                    <span className="font-mono text-slate-500 dark:text-slate-400">{skillItem.score}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                    {/* Benchmark marker at 75% */}
                    <div className="absolute top-0 bottom-0 left-[75%] w-0.5 bg-slate-400 z-10" />
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        skillItem.score >= 80
                          ? 'bg-emerald-500'
                          : skillItem.score >= 60
                          ? 'bg-brand-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${skillItem.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Weaknesses, Improvements, & Practice Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Weaknesses */}
        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-5 sm:p-6 space-y-3 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            Key Growth Areas
          </h2>
          {recentWeaknesses.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-6 text-center">
              Complete interviews to identify targeted areas for reinforcement.
            </p>
          ) : (
            <div className="space-y-2">
              {recentWeaknesses.map((w, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-rose-800 dark:text-rose-200">{w.topic}</span>
                    <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300">
                      {w.severity}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">{w.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Improvements */}
        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-5 sm:p-6 space-y-3 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            Demonstrated Gains
          </h2>
          {recentImprovements.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-6 text-center">
              Progress increments and mastery breakthroughs will appear here.
            </p>
          ) : (
            <div className="space-y-2">
              {recentImprovements.map((imp, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-emerald-800 dark:text-emerald-200">{imp.topic}</span>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">+{imp.delta}% accuracy</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">{imp.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommended Practice */}
        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-5 sm:p-6 space-y-3 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-brand-500" />
            Recommended Practice
          </h2>
          <div className="space-y-2.5">
            {recommendedPractice.map((rec) => (
              <div key={rec.id} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{rec.topic}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-medium">
                    {rec.suggestedDurationMinutes}m
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{rec.reason}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Interviews Activity List */}
      <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-5 sm:p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Recent Interview Sessions</h2>
          <Link to="/interviews" className="text-xs text-brand-600 dark:text-brand-400 hover:underline">
            View All
          </Link>
        </div>

        {recentInterviews.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 italic bg-slate-50 dark:bg-slate-950/40 rounded-lg">
            No interview sessions created yet. Click "Quick-Start Interview" above to launch your first session.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-medium">
                <tr>
                  <th className="pb-2">Session Title</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Difficulty</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Score</th>
                  <th className="pb-2">Duration</th>
                  <th className="pb-2">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {recentInterviews.map((session) => (
                  <tr key={session.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 font-medium text-slate-900 dark:text-slate-100">{session.title}</td>
                    <td className="py-3 capitalize">{session.type.replace('_', ' ')}</td>
                    <td className="py-3">
                      <span className="uppercase text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {session.difficulty}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        {session.status}
                      </span>
                    </td>
                    <td className="py-3 font-mono font-semibold">
                      {session.overallScore !== undefined ? `${session.overallScore}%` : '-'}
                    </td>
                    <td className="py-3 text-slate-400">{formatDuration(session.durationSeconds)}</td>
                    <td className="py-3 text-slate-400">{new Date(session.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
