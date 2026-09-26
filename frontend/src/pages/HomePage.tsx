import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Terminal, 
  Cpu, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  Radio
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const HomePage: React.FC = () => {
  const { showToast } = useToast();

  const handleTestToast = () => {
    showToast('InterviewPilot notification system functioning normally.', 'success');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-sm">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
            <Radio className="w-3 h-3 animate-pulse" />
            Phase 0 Foundation Active & Healthy
          </div>
          
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            InterviewPilot AI
          </h1>
          
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            An adaptive interview simulation and technical assessment platform. Engineered with isolated sandboxes, deterministic rubric evaluations, real-time voice streaming, and multi-dimensional candidate readiness tracking.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              to="/health"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 text-sm font-medium rounded-lg transition-colors"
            >
              Inspect System Health
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={handleTestToast}
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium rounded-lg transition-colors"
            >
              Test Notification
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-900">
            <Terminal className="w-4 h-4" />
          </div>
          <h3 className="font-medium text-slate-900 dark:text-slate-100 text-sm">Backend API Service</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Express.js + TypeScript engine with graceful degradation, MongoDB persistence, and Redis cache layer.
          </p>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
          <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200 dark:border-purple-900">
            <Cpu className="w-4 h-4" />
          </div>
          <h3 className="font-medium text-slate-900 dark:text-slate-100 text-sm">AI Service Engine</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            FastAPI + Pydantic async service for resume parsing, vector embeddings, and LLM evaluation orchestration.
          </p>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-900">
            <Layers className="w-4 h-4" />
          </div>
          <h3 className="font-medium text-slate-900 dark:text-slate-100 text-sm">Adaptive Assessment</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Dynamic difficulty adjustments, context-grounded follow-ups, and deterministic rubric evaluations.
          </p>
        </div>
      </div>

      <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-6">
        <h2 className="text-base font-semibold mb-4 text-slate-900 dark:text-slate-100">Phase 0 Foundation Checklist</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Monorepo workspaces & shared types</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Express.js backend with logging & health checks</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>FastAPI microservice structure</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Single Light/Dark theme controller</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Accessible global toast notification manager</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>React ErrorBoundary & resilient state fallbacks</span>
          </div>
        </div>
      </div>
    </div>
  );
};
