"use client";

import * as React from "react";
import { Terminal as TerminalIcon, Send, Play, RotateCcw, Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getServerLogs } from "@/app/actions/server-files";

interface LogLine {
  id: string;
  timestamp: string;
  type: "info" | "error" | "warn" | "success";
  message: string;
}

interface TerminalConsoleProps {
  serverId?: string;
  externalStatus?: "online" | "offline" | "starting";
  onPowerAction?: (action: "start" | "stop" | "restart") => void;
}

export function TerminalConsole({ serverId, externalStatus, onPowerAction }: TerminalConsoleProps) {
  const [logs, setLogs] = React.useState<LogLine[]>([]);
  const [inputValue, setInputValue] = React.useState("");
  const [isInitializing, setIsInitializing] = React.useState(true);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const addLog = React.useCallback((message: string, type: LogLine["type"] = "info") => {
    const newLine: LogLine = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type,
      message,
    };
    setLogs((prev) => [...prev.slice(-199), newLine]);
  }, []);

  // Fetch logs from file system
  const fetchLogs = React.useCallback(async () => {
    if (!serverId) return;
    
    const result = await getServerLogs(serverId);
    if (result.success && result.content) {
      const lines = result.content.split('\n').filter(l => l.trim());
      const mappedLogs: LogLine[] = lines.map((line, i) => {
        let type: LogLine["type"] = "info";
        if (line.includes('[ERROR]')) type = "error";
        if (line.includes('[SUCCESS]')) type = "success";
        if (line.includes('[SYSTEM]') || line.includes('[STS]')) type = "info";
        if (line.includes('[DEBUG]')) type = "warn";

        let timestamp = "LIVE";
        let displayMessage = line;
        
        const timestampMatch = line.match(/^\[(.*?)\]/);
        if (timestampMatch) {
          const rawTime = timestampMatch[1];
          timestamp = rawTime.includes('T') ? rawTime.split('T')[1].split('.')[0] : rawTime;
          displayMessage = line.replace(timestampMatch[0], '').trim();
        }

        return {
          id: `fs-${i}-${line.length}`,
          timestamp,
          type,
          message: displayMessage,
        };
      });
      
      setLogs(mappedLogs);
    }
    setIsInitializing(false);
  }, [serverId]);

  React.useEffect(() => {
    // Initial fetch
    fetchLogs();
    
    // Fast polling for real-time feel
    const pollInterval = setInterval(() => {
      if (externalStatus !== 'offline') {
        fetchLogs();
      }
    }, 500);

    return () => clearInterval(pollInterval);
  }, [fetchLogs, externalStatus]);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    addLog(`$ ${inputValue}`, "info");
    setInputValue("");
    
    setTimeout(() => {
      const cmd = inputValue.toLowerCase().trim();
      if (cmd === "help") {
        addLog("Available commands: help, status, list, clear", "success");
      } else if (cmd === "status") {
        addLog(`Instance Status: ${externalStatus || "offline"}`, "info");
      } else if (cmd === "clear") {
        setLogs([]);
      } else {
        addLog(`Unknown command: ${inputValue}. Local terminal only.`, "error");
      }
    }, 400);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden rounded-xl terminal-container shadow-2xl border-border/50 bg-[#0c0c0f]">
      <div className="flex items-center justify-between p-2 md:p-3 border-b border-border/50 bg-secondary/30">
        <div className="flex items-center gap-1 md:gap-2">
          <div className="flex items-center gap-1.5 px-2 mr-1">
            <div className="size-2.5 rounded-full bg-red-500" />
            <div className="size-2.5 rounded-full bg-yellow-500" />
            <div className="size-2.5 rounded-full bg-green-500" />
          </div>
          
          <Badge 
            variant="outline" 
            className={cn(
              "text-[9px] md:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 h-6 flex items-center gap-1.5 transition-all duration-500",
              externalStatus === "online" ? "border-green-500/50 text-green-500 bg-green-500/5" :
              externalStatus === "starting" ? "border-yellow-500/50 text-yellow-500 bg-yellow-500/5" :
              "border-red-500/50 text-red-500 bg-red-500/5"
            )}
          >
            <span className={cn(
              "size-1.5 rounded-full",
              externalStatus === "online" ? "bg-green-500 animate-pulse" :
              externalStatus === "starting" ? "bg-yellow-500 animate-pulse" :
              "bg-red-500"
            )} />
            {externalStatus || "offline"}
          </Badge>
        </div>

        <div className="flex items-center gap-1 bg-background/50 p-1 rounded-lg border border-border/50">
          <Button 
            variant="ghost" 
            size="icon" 
            className="size-7 md:size-8 hover:bg-green-500/10 hover:text-green-500 transition-colors" 
            onClick={() => onPowerAction?.("start")} 
            disabled={externalStatus !== "offline"}
          >
            <Play className="size-3.5 md:size-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="size-7 md:size-8 hover:bg-blue-500/10 hover:text-blue-500 transition-colors" 
            onClick={() => onPowerAction?.("restart")}
            disabled={externalStatus === "offline"}
          >
            <RotateCcw className="size-3.5 md:size-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="size-7 md:size-8 hover:bg-red-500/10 hover:text-red-500 transition-colors" 
            onClick={() => onPowerAction?.("stop")} 
            disabled={externalStatus === "offline"}
          >
            <Square className="size-3.5 md:size-4" />
          </Button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 p-3 md:p-5 overflow-y-auto font-code text-[11px] md:text-sm leading-relaxed custom-scrollbar"
      >
        {isInitializing && logs.length === 0 ? (
          <div className="flex items-center gap-2 opacity-50">
            <Loader2 className="size-3 animate-spin text-primary" />
            <span className="text-xs">Connecting to node...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-muted-foreground italic flex flex-col items-center justify-center h-full gap-2 opacity-30">
            <TerminalIcon className="size-8 md:size-10" />
            <p className="text-xs md:text-sm text-center">Terminal ready. Start server to see logs.</p>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="mb-1.5 animate-in fade-in slide-in-from-left-1 duration-200 flex items-start gap-3">
              <span className="text-muted-foreground opacity-40 tabular-nums text-[10px] md:text-xs shrink-0 mt-0.5">[{log.timestamp}]</span>
              <span className={cn(
                "break-all",
                log.type === "error" ? "text-red-400 font-bold" :
                log.type === "warn" ? "text-yellow-400" :
                log.type === "success" ? "text-green-400 font-semibold" : "text-slate-300"
              )}>
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleCommand} className="p-2 md:p-3 border-t border-border/50 bg-secondary/20 flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-bold text-xs pointer-events-none">
            $
          </span>
          <Input 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Run console command..." 
            className="h-9 md:h-10 bg-background/50 border-none ring-1 ring-border/50 focus-visible:ring-primary/50 font-code text-xs md:text-sm pl-7"
          />
        </div>
        <Button type="submit" size="sm" className="h-9 md:h-10 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 px-3 md:px-5">
          <Send className="size-3.5 md:size-4 mr-2" />
          <span className="hidden xs:inline">Send</span>
        </Button>
      </form>
    </div>
  );
}