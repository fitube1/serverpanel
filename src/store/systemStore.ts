import { create } from 'zustand';

interface SystemState {
  metrics: {
    cpu: { usage: number; cores: number; brand: string };
    memory: { total: number; used: number; free: number; usagePercent: number };
    uptime: number;
  } | null;
  osInfo: {
    platform: string;
    distro: string;
    release: string;
    kernel: string;
    arch: string;
  } | null;
  fetchMetrics: () => Promise<void>;
  fetchOsInfo: () => Promise<void>;
}

export const useSystemStore = create<SystemState>((set) => ({
  metrics: null,
  osInfo: null,
  fetchMetrics: async () => {
    try {
      const res = await fetch('/api/system/metrics');
      if (res.ok) {
        const data = await res.json();
        set({ metrics: data });
      }
    } catch (e) {
      console.error('Failed to fetch metrics', e);
    }
  },
  fetchOsInfo: async () => {
    try {
      const res = await fetch('/api/system/info');
      if (res.ok) {
        const data = await res.json();
        set({ osInfo: data });
      }
    } catch (e) {
      console.error('Failed to fetch OS info', e);
    }
  }
}));
