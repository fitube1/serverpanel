import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Box, TerminalSquare, HardDrive, Settings, LogOut, Server } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Applications', href: '/apps', icon: Box },
  { name: 'Terminal', href: '/terminal', icon: TerminalSquare },
  { name: 'Storage', href: '/storage', icon: HardDrive },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-[#0a0a0c] text-slate-300">
      {/* Top Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/5 bg-[#0f0f12] px-6 text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 font-bold tracking-tight text-white" style={{ fontFamily: 'Google Sans Flex, sans-serif' }}>
            <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-600">
              <div className="h-3 w-3 bg-white"></div>
            </div>
            ServerPanel
            <span className="ml-1 text-[10px] font-medium tracking-widest text-slate-500 uppercase">v2.4.0</span>
          </div>
          <div className="h-4 w-px bg-white/10 hidden md:block"></div>
          <div className="hidden md:flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              Local Server
            </span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-white/5 bg-[#0f0f12] p-4 flex-col gap-1 hidden md:flex">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">System</div>
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex w-full items-center gap-3 rounded px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-blue-500/10 text-blue-400 font-medium'
                    : 'text-slate-400 hover:bg-white/5'
                )
              }
            >
              <item.icon className={cn("w-4 h-4 shrink-0", "opacity-70")} />
              {item.name}
            </NavLink>
          ))}

          <div className="mt-auto">
            <button className="flex w-full items-center gap-3 rounded px-3 py-2 text-sm hover:bg-white/5 transition-colors text-slate-400">
              <LogOut className="w-4 h-4 shrink-0 opacity-40" />
              Logout
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
