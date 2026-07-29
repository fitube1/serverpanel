import si from 'systeminformation';

export async function getSystemMetrics() {
  try {
    const [cpu, mem, os, currentLoad] = await Promise.all([
      si.cpu(),
      si.mem(),
      si.osInfo(),
      si.currentLoad()
    ]);

    return {
      cpu: {
        usage: currentLoad.currentLoad,
        cores: cpu.cores,
        brand: cpu.brand
      },
      memory: {
        total: mem.total,
        used: mem.active,
        free: mem.free,
        usagePercent: (mem.active / mem.total) * 100
      },
      uptime: si.time().uptime
    };
  } catch (error) {
    // Fallback for sandboxed environments
    return {
      cpu: { usage: 12.5, cores: 4, brand: 'Mock CPU' },
      memory: { total: 16000000000, used: 8000000000, free: 8000000000, usagePercent: 50 },
      uptime: 3600
    };
  }
}

export async function getOsInfo() {
  try {
    const os = await si.osInfo();
    return {
      platform: os.platform,
      distro: os.distro,
      release: os.release,
      kernel: os.kernel,
      arch: os.arch
    };
  } catch (error) {
    return {
      platform: 'linux',
      distro: 'Mock OS',
      release: '1.0',
      kernel: '5.15.0',
      arch: 'x64'
    };
  }
}
