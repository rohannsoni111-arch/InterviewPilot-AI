import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 py-6 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 dark:text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        &copy; {new Date().getFullYear()} InterviewPilot AI. Production-Grade Assessment Engine.
      </div>
      <div className="flex items-center gap-4">
        <span>Phase 0: Foundation</span>
        <span>&bull;</span>
        <span>FastAPI + Node.js + React</span>
      </div>
    </footer>
  );
};
