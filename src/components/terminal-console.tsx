
"use client";

import * as React from "react";
import { Terminal as TerminalIcon, Send } from "lucide-react";
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
}

export function TerminalConsole({ externalStatus }: TerminalConsoleProps) {
  const [logs, setLogs] = React.useState<LogLine[]>([]);
  const [inputValue, setInputValue] = React.useState("");
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const addLog = (message: string, type: LogLine["type"] = "info") => {
    const newLine: LogLine = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
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

  // Sync logs with status changes
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
    addLog(`> ${inputValue}`, "info");
    setInputValue("");
    
    // Mock response
    setTimeout(() => {
      if (inputValue.toLowerCase() === "help") {
        addLog("Available commands: help, status, list, stop, restart", "success");
      } else {
        addLog(`Unknown command: ${inputValue}. Type 'help' for options.`, "error");
      }
    }, 400);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden rounded-xl terminal-container shadow-2xl">
      <div className="flex items-center justify-between p-3 border-b border-border/50 bg-secondary/30">
        <div className="flex items-center gap-2">
          <TerminalIcon className="size-4 text-primary" />
          <Badge 
            variant="outline" 
            className={cn(
              "text-[10px] font-bold uppercase tracking-wider px-2 py-0 h-5",
              externalStatus === "online" ? "border-green-500/50 text-green-500 bg-green-500/5" :
              externalStatus === "starting" ? "border-yellow-500/50 text-yellow-500 bg-yellow-500/5" :
              "border-red-500/50 text-red-500 bg-red-500/5"
            )}
          >
            {externalStatus || "offline"}
          </Badge>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto font-code text-sm leading-relaxed custom-scrollbar"
      >
        {logs.length === 0 ? (
          <div className="text-muted-foreground italic flex flex-col items-center justify-center h-full gap-2 opacity-50">
            <TerminalIcon className="size-8" />
            <p>Console ready. Start server to see logs.</p>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="mb-1 animate-in fade-in slide-in-from-left-2 duration-300">
              <span className="text-muted-foreground opacity-50 mr-3 tabular-nums">[{log.timestamp}]</span>
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

      <form onSubmit={handleCommand} className="p-3 border-t border-border/50 bg-secondary/20 flex gap-2">
        <Input 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter command..." 
          className="h-9 bg-background/50 border-none ring-1 ring-border/50 focus-visible:ring-primary/50 font-code text-xs"
        />
        <Button type="submit" size="sm" className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white">
          <Send className="size-3.5 mr-2" />
          Execute
        </Button>
      </form>
    </div>
  );
}
