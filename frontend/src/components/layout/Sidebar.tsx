import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Activity, 
  Layers, 
  Cpu, 
  Database, 
  FileText, 
  BarChart3, 
  ShieldAlert
} from 'lucide-react';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ open, setOpen }) => {
  const links = [
    { to: '/', label: 'Overview', icon: Home },
    { to: '/health', label: 'System Health', icon: Activity },
    { to: '/interviews', label: 'Interviews (Phase 3+)', icon: Layers },
    { to: '/coding', label: 'Code Sandbox (Phase 10+)', icon: Cpu },
    { to: '/sql', label: 'SQL Sandbox (Phase 12+)', icon: Database },
    { to: '/resume', label: 'Resume Intel (Phase 6+)', icon: FileText },
    { to: '/analytics', label: 'Analytics (Phase 20+)', icon: BarChart3 },
  ];

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-30 w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 transition-transform duration-200 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full justify-between p-4">
          <div className="space-y-1">
            <div className="px-3 py-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Platform Core
            </div>
            {links.map(link => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-50'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-slate-200'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </div>

          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-xs space-y-1 text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
              <ShieldAlert className="w-3.5 h-3.5 text-brand-500" />
              Phase 0 Active
            </div>
            <p className="leading-relaxed">Foundation architecture and shell operational.</p>
          </div>
        </div>
      </aside>
    </>
  );
};
