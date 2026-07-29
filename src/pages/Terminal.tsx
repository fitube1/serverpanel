import { useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

export default function Terminal() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new XTerm({
      theme: {
        background: '#0a0a0a',
        foreground: '#f5f5f5',
        cursor: '#f5f5f5',
      },
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      fontSize: 14,
    });
    
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    
    term.open(terminalRef.current);
    fitAddon.fit();
    
    term.writeln('\x1b[1;34mWelcome to ServerPanel Web Terminal\x1b[0m');
    term.writeln('Connecting to local shell environment...');
    term.write('\r\n$ ');

    xtermRef.current = term;

    const handleResize = () => {
      fitAddon.fit();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
    };
  }, []);

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-baseline justify-between mb-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Terminal</h1>
          <p className="text-xs italic text-slate-500 mt-1">Direct shell access to the host machine.</p>
        </div>
      </div>

      <div className="flex-1 bg-black/40 border border-white/5 rounded overflow-hidden p-4 min-h-[500px]">
        <div ref={terminalRef} className="h-full w-full" />
      </div>
    </div>
  );
}
