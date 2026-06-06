"use client";

import * as React from "react";
import { Terminal as TerminalIcon, Play, Square, RotateCcw, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface LogLine {
  id: string;
  timestamp: string;
  type: "info" | "error" | "warn" | "success";
  message: string;
}

export function TerminalConsole() {
  const [logs, setLogs] = React.useState<LogLine[]>([]);
  const [inputValue, setInputValue] = React.useState("");
  const [status, setStatus] = React.useState<"online" | "offline" | "starting">("offline");
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

  const handlePower = (action: "start" | "stop" | "restart") => {
    if (action === "start") {
      setStatus("starting");
      addLog("Initializing server boot sequence...", "info");
      setTimeout(() => {
        setStatus("online");
        addLog("Server successfully initialized and listening on port 8080", "success");
      }, 2000);
    } else if (action === "stop") {
      setStatus("offline");
      addLog("Gracefully shutting down server...", "warn");
      setTimeout(() => addLog("Server process exited with code 0", "info"), 1000);
    } else {
      handlePower("stop");
      setTimeout(() => handlePower("start"), 1500);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden rounded-xl terminal-container shadow-2xl">
      <div className="flex items-center justify-between p-3 border-b border-border/50 bg-secondary/30">
        <div className="flex items-center gap-2">
          <TerminalIcon className="size-4 text-primary" />
          <span className="text-xs font-headline font-semibold uppercase tracking-wider text-muted-foreground">Server Console</span>
          <div className="ml-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-background border border-border">
            <span className={cn(
              "size-2 rounded-full",
              status === "online" ? "bg-green-500 animate-pulse" : 
              status === "starting" ? "bg-yellow-500 animate-pulse" : "bg-red-500"
            )} />
            <span className="text-[10px] font-bold uppercase">{status}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="size-8 hover:bg-green-500/10 hover:text-green-500" onClick={() => handlePower("start")} disabled={status !== "offline"}>
            <Play className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="size-8 hover:bg-blue-500/10 hover:text-blue-500" onClick={() => handlePower("restart")}>
            <RotateCcw className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="size-8 hover:bg-red-500/10 hover:text-red-500" onClick={() => handlePower("stop")} disabled={status === "offline"}>
            <Square className="size-4" />
          </Button>
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
