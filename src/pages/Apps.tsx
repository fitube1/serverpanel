import { useEffect, useState } from 'react';
import { Box, Search, Plus, Download, Info } from 'lucide-react';

interface AppItem {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export default function Apps() {
  const [apps, setApps] = useState<AppItem[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/apps')
      .then(res => res.json())
      .then(data => setApps(data))
      .catch(console.error);
  }, []);

  const filteredApps = apps.filter(app => app.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">App Store</h1>
          <p className="text-xs italic text-slate-500 mt-1">Install and manage containerized applications.</p>
        </div>
        <button className="flex h-8 items-center gap-2 rounded bg-blue-500/10 px-3 text-xs font-medium text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors">
          <Plus className="w-3.5 h-3.5" />
          Add Repository
        </button>
      </div>

      <div className="flex items-center bg-[#16161a] border border-white/5 rounded px-4 py-2">
        <Search className="w-4 h-4 text-slate-500 mr-3" />
        <input 
          type="text" 
          placeholder="Search applications..." 
          className="flex-1 bg-transparent border-none focus:outline-none text-sm text-slate-300 placeholder-slate-600 py-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredApps.map(app => (
          <div key={app.id} className="bg-[#16161a] border border-white/5 rounded p-5 flex flex-col hover:border-white/10 transition-colors">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 rounded border border-white/5 bg-white/[0.02] flex items-center justify-center shrink-0">
                <Box className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-white">{app.name}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{app.description}</p>
              </div>
            </div>
            
            <div className="mt-auto pt-4 flex items-center gap-3 border-t border-white/5">
              <button className="flex-1 flex items-center justify-center h-8 rounded border border-white/10 bg-white/5 text-xs font-medium text-slate-300 hover:bg-white/10 transition-colors">
                <Download className="w-3.5 h-3.5 mr-2" />
                Install
              </button>
              <button className="flex h-8 w-8 items-center justify-center rounded border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 transition-colors">
                <Info className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
