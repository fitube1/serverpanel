import { useEffect } from 'react';
import { useSystemStore } from '@/store/systemStore';
import { Cpu, MemoryStick, Clock, Activity, HardDrive } from 'lucide-react';

export default function Dashboard() {
  const { metrics, osInfo, fetchMetrics, fetchOsInfo } = useSystemStore();

  useEffect(() => {
    fetchOsInfo();
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 2000);
    return () => clearInterval(interval);
  }, [fetchMetrics, fetchOsInfo]);

  const formatBytes = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    return gb.toFixed(2) + ' GB';
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    return `${days}d ${hours}h`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between mb-2">
        <h1 className="text-2xl font-semibold tracking-tight text-white">System Overview</h1>
        <p className="text-xs italic text-slate-500">
          {osInfo ? `${osInfo.distro} ${osInfo.release} (${osInfo.arch}) • Kernel ${osInfo.kernel}` : 'Loading OS info...'}
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* CPU */}
        <div className="bg-[#16161a] border border-white/5 rounded p-5">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">CPU Usage</span>
            <span className="text-xs font-mono text-emerald-400 font-medium">
              {metrics?.cpu.usage.toFixed(1) || '0.0'}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: `${metrics?.cpu.usage || 0}%` }}></div>
          </div>
          <div className="mt-3 text-[10px] text-slate-500 font-mono truncate">
            {metrics?.cpu.brand || 'Loading...'} ({metrics?.cpu.cores} Cores)
          </div>
        </div>

        {/* Memory */}
        <div className="bg-[#16161a] border border-white/5 rounded p-5">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Memory</span>
            <span className="text-xs font-mono text-blue-400 font-medium">
              {metrics ? metrics.memory.usagePercent.toFixed(1) : '0.0'}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500" style={{ width: `${metrics?.memory.usagePercent || 0}%` }}></div>
          </div>
          <div className="mt-3 text-[10px] text-slate-500 font-mono">
            {metrics ? `${formatBytes(metrics.memory.used)} / ${formatBytes(metrics.memory.total)}` : 'Loading...'}
          </div>
        </div>

        {/* Uptime */}
        <div className="bg-[#16161a] border border-white/5 rounded p-5">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Uptime</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline">
            <span className="text-xl font-mono font-medium text-slate-300">
              {metrics ? formatUptime(metrics.uptime) : '0d 0h'}
            </span>
          </div>
          <div className="mt-3 text-[10px] text-slate-500 font-mono">
            Since last reboot
          </div>
        </div>

        {/* Load / Status */}
        <div className="bg-[#16161a] border border-white/5 rounded p-5">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">System Status</span>
            <Activity className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-center space-x-2 mt-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-sm font-medium text-white">Healthy</span>
          </div>
          <div className="mt-3 text-[10px] text-slate-500 font-mono">
            All services running
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#16161a] border border-white/5 rounded overflow-hidden flex flex-col h-full min-h-[380px]">
          <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Critical Services</span>
            <button className="text-[10px] text-blue-400 hover:underline">View all</button>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="text-[10px] uppercase text-slate-500 font-bold border-b border-white/5">
              <tr>
                <th className="px-5 py-2">Name</th>
                <th className="px-5 py-2">Status</th>
                <th className="px-5 py-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr className="hover:bg-white/[0.01] transition-colors">
                <td className="px-5 py-3 flex items-center gap-3">
                  <div className="h-6 w-6 rounded bg-slate-800 flex items-center justify-center text-[10px]">🐳</div>
                  <span>docker.service</span>
                </td>
                <td className="px-5 py-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">running</span>
                </td>
                <td className="px-5 py-3">
                  <button className="text-slate-500 hover:text-white">⋯</button>
                </td>
              </tr>
              <tr className="hover:bg-white/[0.01] transition-colors">
                <td className="px-5 py-3 flex items-center gap-3">
                  <div className="h-6 w-6 rounded bg-slate-800 flex items-center justify-center text-[10px]">🔥</div>
                  <span>ufw.service</span>
                </td>
                <td className="px-5 py-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">running</span>
                </td>
                <td className="px-5 py-3">
                  <button className="text-slate-500 hover:text-white">⋯</button>
                </td>
              </tr>
            </tbody>
          </table>
          <div className="mt-auto p-4 bg-black/20 border-t border-white/5">
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2 font-medium">
              <span>System Console</span>
              <span className="text-[10px] font-mono opacity-50">Live</span>
            </div>
            <div className="bg-black font-mono text-[11px] p-3 border border-white/5 rounded text-emerald-500/80 leading-relaxed h-24 overflow-y-auto">
              <p className="text-slate-500">[system] Fetching live metrics...</p>
              <p className="text-white">[audit] Admin session active.</p>
            </div>
          </div>
        </div>

        <div className="bg-[#16161a] border border-white/5 rounded overflow-hidden flex flex-col h-full">
          <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Audit Log</span>
          </div>
          <div className="flex-1 overflow-auto divide-y divide-white/5">
            <div className="px-5 py-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-white">System Boot</span>
                <span className="text-[10px] text-slate-500">Recent</span>
              </div>
              <p className="text-[11px] text-slate-400">ServerPanel initialized</p>
            </div>
            <div className="px-5 py-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-white">Auth Attempt</span>
                <span className="text-[10px] text-slate-500">Live</span>
              </div>
              <p className="text-[11px] text-slate-400">Local connection established</p>
            </div>
          </div>
          <div className="p-4 border-t border-white/5 bg-black/20">
            <button className="w-full rounded border border-white/10 bg-white/5 py-2 text-xs font-medium text-slate-300 hover:bg-white/10">Clear Security Audit</button>
          </div>
        </div>
      </div>
    </div>
  );
}
