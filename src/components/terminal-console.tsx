
"use client";

import * as React from "react";
import { Terminal as TerminalIcon, Send, Play, RotateCcw, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LogLine {
  id: string;
  timestamp: string;
  type: "info" | "error" | "warn" | "success";
  message: string;
}

interface TerminalConsoleProps {
  externalStatus?: "online" | "offline" | "starting";
  onPowerAction?: (action: "start" | "stop" | "restart") => void;
}

export function TerminalConsole({ externalStatus, onPowerAction }: TerminalConsoleProps) {
  const [logs, setLogs] = React.useState<LogLine[]>([]);
  const [inputValue, setInputValue] = React.useState("");
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const addLog = (message: string, type: LogLine["type"] = "info") => {
    const newLine: LogLine = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type,
      message,
    };
    setLogs((prev) => [...prev.slice(-99), newLine]);
  };

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const lastStatus = React.useRef(externalStatus);
  React.useEffect(() => {
    if (externalStatus !== lastStatus.current) {
      if (externalStatus === "starting") {
        addLog("Initializing server boot sequence...", "info");
      } else if (externalStatus === "online") {
        addLog("Server successfully initialized and listening on port 8080", "success");
      } else if (externalStatus === "offline") {
        addLog("Server process exited with code 0", "info");
      }
      lastStatus.current = externalStatus;
    }
  }, [externalStatus]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    addLog(`$ ${inputValue}`, "info");
    setInputValue("");
    
    setTimeout(() => {
      const cmd = inputValue.toLowerCase().trim();
      if (cmd === "help") {
        addLog("Available commands: help, status, list, stop, restart", "success");
      } else if (cmd === "status") {
        addLog(`Current status: ${externalStatus || "offline"}`, "info");
      } else if (cmd === "list") {
        addLog("No active processes found.", "warn");
      } else {
        addLog(`Unknown command: ${inputValue}. Type 'help' for options.`, "error");
      }
    }, 400);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden rounded-xl terminal-container shadow-2xl border-border/50">
      <div className="flex items-center justify-between p-2 md:p-3 border-b border-border/50 bg-secondary/30">
        <div className="flex items-center gap-2">
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

        <div className="flex items-center gap-1.5 bg-background/50 p-1 rounded-lg border border-border/50">
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
        className="flex-1 p-3 md:p-5 overflow-y-auto font-code text-[11px] md:text-sm leading-relaxed custom-scrollbar bg-[#0c0c0f]"
      >
        {logs.length === 0 ? (
          <div className="text-muted-foreground italic flex flex-col items-center justify-center h-full gap-2 opacity-50">
            <TerminalIcon className="size-8 md:size-10" />
            <p className="text-xs md:text-sm">Console ready. Start server to see logs.</p>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="mb-1.5 animate-in fade-in slide-in-from-left-1 duration-300">
              <span className="text-muted-foreground opacity-40 mr-3 tabular-nums text-[10px] md:text-xs">[{log.timestamp}]</span>
              <span className={cn(
                log.type === "error" ? "text-red-400" :
                log.type === "warn" ? "text-yellow-400" :
                log.type === "success" ? "text-green-400" : "text-slate-300"
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
            placeholder="Run command..." 
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
