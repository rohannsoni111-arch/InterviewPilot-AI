import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Activity, RefreshCw, Server, Database, Cpu, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

interface HealthData {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime: number;
  timestamp: string;
  environment: string;
  services: {
    database: { status: string };
    redis: { status: string };
    aiService?: { status: string; url?: string };
  };
}

export const HealthPage: React.FC = () => {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/health');
      if (res.data?.success && res.data?.data) {
        setData(res.data.data);
      } else {
        throw new Error('Malformed health check response');
      }
    } catch (err: any) {
      setError(err?.message || 'Could not reach backend health endpoint');
    } finally {
      setLoading(false);
      setLastRefreshed(new Date());
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
      case 'reachable':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {status}
          </span>
        );
      case 'degraded':
      case 'mocked':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
            <AlertTriangle className="w-3.5 h-3.5" />
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
            <XCircle className="w-3.5 h-3.5" />
            {status || 'unknown'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-500" />
            System Status & Health
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Live connectivity telemetry across backend services, persistence layers, and microservices.
          </p>
        </div>
        <button
          onClick={fetchHealth}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {loading && !data && (
        <div className="flex items-center justify-center p-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {error && (
        <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-sm flex items-center gap-3">
          <XCircle className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-medium">Backend Connectivity Notice</p>
            <p className="text-xs mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {data && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
              <span className="text-xs text-slate-400">System Status</span>
              <div>{getStatusBadge(data.status)}</div>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
              <span className="text-xs text-slate-400">Version</span>
              <p className="text-sm font-semibold font-mono text-slate-800 dark:text-slate-200">v{data.version}</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
              <span className="text-xs text-slate-400">Environment</span>
              <p className="text-sm font-semibold uppercase text-slate-800 dark:text-slate-200">{data.environment}</p>
            </div>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl divide-y divide-slate-100 dark:divide-slate-800">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Server className="w-5 h-5 text-slate-500" />
                <div>
                  <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">Backend API Engine</h4>
                  <p className="text-xs text-slate-400">Uptime: {Math.floor(data.uptime)} seconds</p>
                </div>
              </div>
              {getStatusBadge('healthy')}
            </div>

            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-slate-500" />
                <div>
                  <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">MongoDB Connection</h4>
                  <p className="text-xs text-slate-400">State: {data.services.database.status}</p>
                </div>
              </div>
              {getStatusBadge(data.services.database.status)}
            </div>

            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-slate-500" />
                <div>
                  <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">Redis Cache</h4>
                  <p className="text-xs text-slate-400">State: {data.services.redis.status}</p>
                </div>
              </div>
              {getStatusBadge(data.services.redis.status)}
            </div>

            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Cpu className="w-5 h-5 text-slate-500" />
                <div>
                  <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">AI Microservice (FastAPI)</h4>
                  <p className="text-xs text-slate-400">Target: {data.services.aiService?.url || 'N/A'}</p>
                </div>
              </div>
              {getStatusBadge(data.services.aiService?.status)}
            </div>
          </div>

          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Timestamp: {data.timestamp}</span>
            <span>Last checked: {lastRefreshed.toLocaleTimeString()}</span>
          </div>
        </div>
      )}
    </div>
  );
};
