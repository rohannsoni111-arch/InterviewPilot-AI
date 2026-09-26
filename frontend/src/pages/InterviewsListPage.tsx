import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  InterviewType,
  InterviewStatus,
  IInterviewSummary
} from '@interviewpilot/shared';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import {
  Plus,
  Trash2,
  Filter,
  Layers,
  Code,
  Cpu,
  Database,
  Users,
  FileCheck,
  Shuffle,
  Calendar,
  Award,
  ChevronRight
} from 'lucide-react';

const TYPE_ICONS: Record<InterviewType, React.ElementType> = {
  [InterviewType.CODING]: Code,
  [InterviewType.SYSTEM_DESIGN]: Layers,
  [InterviewType.TECHNICAL]: Cpu,
  [InterviewType.SQL]: Database,
  [InterviewType.BEHAVIORAL]: Users,
  [InterviewType.RESUME_DEFENSE]: FileCheck,
  [InterviewType.MIXED]: Shuffle
};

export const InterviewsListPage: React.FC = () => {
  const { showToast } = useToast();

  const [interviews, setInterviews] = useState<IInterviewSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchInterviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = { limit: '50' };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (typeFilter !== 'all') params.type = typeFilter;

      const res = await api.get('/interviews', { params });
      if (res.data.success) {
        setInterviews(res.data.data.interviews || []);
      } else {
        throw new Error(res.data.error?.message || 'Failed to load interviews');
      }
    } catch (err: unknown) {
      const error = err as any;
      const message = error.response?.data?.error?.message || error.message || 'Could not fetch interview sessions';
      showToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, typeFilter, showToast]);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this interview session?')) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await api.delete(`/interviews/${id}`);
      if (res.data.success) {
        showToast('The interview session was deleted.', 'info');
        setInterviews(prev => prev.filter(i => i.id !== id));
      } else {
        throw new Error(res.data.error?.message || 'Failed to delete interview');
      }
    } catch (err: unknown) {
      const error = err as any;
      const message = error.response?.data?.error?.message || error.message || 'Could not remove session';
      showToast(message, 'error');
    } finally {
      setDeletingId(null);
    }
  };



  const getStatusBadge = (status: InterviewStatus) => {
    switch (status) {
      case InterviewStatus.COMPLETED:
        return (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Completed
          </span>
        );
      case InterviewStatus.IN_PROGRESS:
        return (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            In Progress
          </span>
        );
      case InterviewStatus.CONFIGURING:
        return (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            Configured
          </span>
        );
      case InterviewStatus.PAUSED:
        return (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            Paused
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
            Interview Sessions
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Manage your AI interview simulations, launch new assessments, and review past transcripts.
          </p>
        </div>

        <Link
          to="/interviews/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          New Interview
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'All Sessions' },
            { id: InterviewStatus.CONFIGURING, label: 'Configured' },
            { id: InterviewStatus.IN_PROGRESS, label: 'In Progress' },
            { id: InterviewStatus.COMPLETED, label: 'Completed' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                statusFilter === tab.id
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Track Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 w-full md:w-auto"
          >
            <option value="all">All Tracks</option>
            <option value={InterviewType.CODING}>Coding & Algorithms</option>
            <option value={InterviewType.SYSTEM_DESIGN}>System Design</option>
            <option value={InterviewType.TECHNICAL}>Technical Deep Dive</option>
            <option value={InterviewType.SQL}>SQL & Data</option>
            <option value={InterviewType.BEHAVIORAL}>Behavioral (STAR)</option>
            <option value={InterviewType.RESUME_DEFENSE}>Resume Defense</option>
            <option value={InterviewType.MIXED}>Mixed Assessment</option>
          </select>
        </div>
      </div>

      {/* Content Section */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse space-y-3">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
              <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : interviews.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">No Interview Sessions Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
              {statusFilter !== 'all' || typeFilter !== 'all'
                ? 'No interviews match your selected filter criteria. Try resetting the filters.'
                : 'You have not initialized any AI interview sessions yet. Launch your first simulation in seconds.'}
            </p>
          </div>
          <Link
            to="/interviews/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Configure First Interview
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {interviews.map(session => {
            const Icon = TYPE_ICONS[session.type] || Layers;
            return (
              <div
                key={session.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          {session.difficulty.toUpperCase()} • {session.type.replace('_', ' ').toUpperCase()}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-brand-600 transition-colors">
                          {session.title}
                        </h3>
                      </div>
                    </div>
                    {getStatusBadge(session.status)}
                  </div>

                  {/* Topics chips */}
                  {session.topics && session.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {session.topics.slice(0, 3).map(topic => (
                        <span
                          key={topic}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        >
                          {topic}
                        </span>
                      ))}
                      {session.topics.length > 3 && (
                        <span className="text-[10px] text-slate-400 self-center">
                          +{session.topics.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(session.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                    {session.overallScore !== undefined && (
                      <span className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                        <Award className="w-3.5 h-3.5" />
                        {session.overallScore}%
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={e => handleDelete(session.id, e)}
                      disabled={deletingId === session.id}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title="Delete Session"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <Link
                      to={`/interviews/${session.id}/room`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs transition-all"
                    >
                      Enter Room
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>

            );
          })}
        </div>
      )}
    </div>
  );
};
