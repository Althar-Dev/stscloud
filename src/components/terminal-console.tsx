
"use client";

import * as React from "react";
import { Terminal as TerminalIcon, Send, Play, RotateCcw, Square, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getServerLogs, clearServerLogs } from "@/app/actions/server-files";
import { sendServerInput } from "@/app/actions/server-power";
import AnsiFilter from "ansi-to-html";

const ansiConverter = new AnsiFilter({
  newline: false,
  escapeXML: true,
  stream: true
});

interface LogLine {
  id: string;
  timestamp?: string;
  isSystem: boolean;
  type: "info" | "error" | "warn" | "success" | "user";
  message: string;
  html?: string;
}

interface TerminalConsoleProps {
  serverId?: string;
  externalStatus?: "online" | "offline" | "starting";
  onPowerAction?: (action: "start" | "stop" | "restart") => void;
  isExpired?: boolean;
}

// Optimized individual log entry for performance
const LogItem = React.memo(({ log }: { log: LogLine }) => {
  return (
    <div className="mb-0.5 animate-in fade-in duration-200 flex items-start gap-1 whitespace-pre">
      {log.isSystem ? (
        <>
          <span className="text-primary font-bold shrink-0">[STS]</span>
          <span className="text-neutral-500 tabular-nums shrink-0">[{log.timestamp}]</span>
        </>
      ) : null}
      {log.html ? (
        <span 
          className={cn(
            "break-normal",
            log.type === "error" ? "text-red-400 font-bold" :
            log.type === "warn" ? "text-yellow-400" :
            log.type === "success" ? "text-green-400 font-semibold" : 
            "text-slate-200"
          )}
          dangerouslySetInnerHTML={{ __html: log.html }}
        />
      ) : (
        <span 
          className={cn(
            "break-normal min-h-[1em]",
            log.type === "error" ? "text-red-400 font-bold" :
            log.type === "warn" ? "text-yellow-400" :
            log.type === "success" ? "text-green-400 font-semibold" : 
            "text-slate-200"
          )}
        >
          {log.message}
        </span>
      )}
    </div>
  );
});

LogItem.displayName = "LogItem";

export function TerminalConsole({ serverId, externalStatus, onPowerAction, isExpired }: TerminalConsoleProps) {
  const [logs, setLogs] = React.useState<LogLine[]>([]);
  const [inputValue, setInputValue] = React.useState("");
  const [isInitializing, setIsInitializing] = React.useState(true);
  const [isSticky, setIsSticky] = React.useState(true);
  const [isSending, setIsSending] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const lastRawLogs = React.useRef<string>("");
  
  // Track initial status for clear logic
  const initialStatusRef = React.useRef<string | null>(null);
  const hasClearedOnMount = React.useRef(false);

  const fetchLogs = React.useCallback(async () => {
    if (!serverId) return;
    
    const result = await getServerLogs(serverId);
    if (result.success && result.content !== undefined) {
      // Performance: Skip state update if logs haven't changed
      if (result.content === lastRawLogs.current) {
        setIsInitializing(false);
        return;
      }
      
      lastRawLogs.current = result.content;
      const lines = result.content.split('\n');
      
      // Pre-calculating HTML and types once during data reception instead of during render
      const mappedLogs: LogLine[] = lines.map((line, i) => {
        let type: LogLine["type"] = "user";
        let isSystem = false;
        let timestamp = "";
        let displayMessage = line;

        const stsMatch = line.match(/^\[STS\]\s*\[(.*?)\]/);
        
        if (stsMatch) {
          isSystem = true;
          type = "info";
          timestamp = stsMatch[1];
          displayMessage = line.replace(/^\[STS\]\s*\[.*?\]/, '').trim();
          
          if (displayMessage.includes('[ERROR]')) type = "error";
          else if (displayMessage.includes('[SUCCESS]')) type = "success";
          else if (displayMessage.includes('[DEBUG]')) type = "warn";
        }

        return {
          id: `log-${i}-${line.length}`,
          timestamp,
          isSystem,
          type,
          message: displayMessage,
          html: ansiConverter.toHtml(displayMessage)
        };
      });
      
      setLogs(mappedLogs.slice(-300));
    } else if (result.success && !result.content) {
      if (lastRawLogs.current !== "") {
        lastRawLogs.current = "";
        setLogs([]);
      }
    }
    setIsInitializing(false);
  }, [serverId]);

  React.useEffect(() => {
    if (externalStatus && initialStatusRef.current === null) {
      initialStatusRef.current = externalStatus;
      if (externalStatus === "offline" && !hasClearedOnMount.current && serverId) {
        hasClearedOnMount.current = true;
        clearServerLogs(serverId).then(() => {
          setLogs([]);
          lastRawLogs.current = "";
        });
      }
    }
  }, [externalStatus, serverId]);

  React.useEffect(() => {
    fetchLogs();
    // Reduced frequency to 1.2s to improve UI responsiveness
    const pollInterval = setInterval(fetchLogs, 1200);
    return () => clearInterval(pollInterval);
  }, [fetchLogs]);

  React.useEffect(() => {
    if (isSticky && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isSticky]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const atBottom = scrollHeight - clientHeight <= scrollTop + 50;
    setIsSticky(atBottom);
  };

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !serverId || isSending || isExpired) return;
    
    const text = inputValue;
    setInputValue("");
    setIsSending(true);
    
    try {
      await sendServerInput(serverId, text);
    } catch (err) {
      console.error("Failed to send input:", err);
    } finally {
      setIsSending(false);
      fetchLogs();
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden rounded-xl terminal-container shadow-2xl border-border/50 bg-[#0c0c0f]">
      <div className="flex items-center justify-between p-2 md:p-3 border-b border-border/50 bg-secondary/30">
        <div className="flex items-center gap-1 md:gap-2">
          <div className="flex items-center gap-1.5 px-2 mr-1">
            <div className="size-2.5 rounded-full bg-red-500/80" />
            <div className="size-2.5 rounded-full bg-yellow-500/80" />
            <div className="size-2.5 rounded-full bg-green-500/80" />
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
          <Button variant="ghost" size="icon" className="size-7 md:size-8 hover:bg-green-500/10 hover:text-green-500" onClick={() => onPowerAction?.("start")} disabled={externalStatus !== "offline" || isExpired}>
            <Play className="size-3.5 md:size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="size-7 md:size-8 hover:bg-blue-500/10 hover:text-blue-500" onClick={() => onPowerAction?.("restart")} disabled={externalStatus === "offline" || isExpired}>
            <RotateCcw className="size-3.5 md:size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="size-7 md:size-8 hover:bg-red-500/10 hover:text-red-500" onClick={() => onPowerAction?.("stop")} disabled={externalStatus === "offline"}>
            <Square className="size-3.5 md:size-4" />
          </Button>
        </div>
      </div>

      <div 
        ref={scrollRef} 
        onScroll={handleScroll}
        className="flex-1 p-3 md:p-5 overflow-y-auto font-code text-[11px] md:text-sm leading-[1.2] custom-scrollbar scroll-smooth overflow-x-auto"
      >
        {isInitializing && logs.length === 0 ? (
          <div className="flex items-center gap-2 opacity-50">
            <Loader2 className="size-3 animate-spin text-primary" />
            <span className="text-xs">Connecting...</span>
          </div>
        ) : isExpired && logs.length === 0 ? (
          <div className="text-destructive italic flex flex-col items-center justify-center h-full gap-2 opacity-60">
            <AlertTriangle className="size-8 md:size-10" />
            <p className="text-xs md:text-sm text-center font-bold">Subscription expired. Please renew to boot.</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-muted-foreground italic flex flex-col items-center justify-center h-full gap-2 opacity-30">
            <TerminalIcon className="size-8 md:size-10" />
            <p className="text-xs md:text-sm text-center">Ready for execution. Press Start to boot.</p>
          </div>
        ) : (
          logs.map((log) => (
            <LogItem key={log.id} log={log} />
          ))
        )}
      </div>

      <form onSubmit={handleCommand} className="p-2 md:p-3 border-t border-border/50 bg-secondary/20 flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-bold text-xs pointer-events-none">$</span>
          <input 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={isExpired ? "Operational functions disabled" : (externalStatus === 'online' ? "Type command or input..." : "Server is offline")} 
            className="flex h-9 md:h-10 w-full rounded-md bg-background/50 border-none ring-1 ring-border/50 focus-visible:ring-primary/50 font-code text-xs md:text-sm pl-7 px-3 outline-none"
            disabled={externalStatus !== 'online' || isSending || isExpired}
          />
        </div>
        <Button 
          type="submit" 
          size="sm" 
          className="h-9 md:h-10 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 px-3 md:px-5"
          disabled={externalStatus !== 'online' || isSending || isExpired}
        >
          {isSending ? <Loader2 className="size-3.5 md:size-4 animate-spin" /> : <Send className="size-3.5 md:size-4 mr-2" />}
          <span className="hidden xs:inline">Execute</span>
        </Button>
      </form>
    </div>
  );
}
