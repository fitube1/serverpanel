import { ReactNode } from 'react';

export function PlaceholderPage({ title, description }: { title: string, description: string }) {
  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between mb-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">{title}</h1>
          <p className="text-xs italic text-slate-500 mt-1">{description}</p>
        </div>
      </div>
      <div className="bg-[#16161a] border border-white/5 rounded p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
        <h3 className="text-sm font-medium text-white mb-2 uppercase tracking-wider">Module Under Development</h3>
        <p className="text-xs text-slate-500 max-w-md">
          The {title.toLowerCase()} module is part of the planned architecture but is currently being implemented.
        </p>
      </div>
    </div>
  );
}
