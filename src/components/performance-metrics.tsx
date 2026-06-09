"use client";

import * as React from "react";
import { 
  Area, 
  AreaChart, 
  ResponsiveContainer, 
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cpu, HardDrive, MemoryStick, ArrowUpDown } from "lucide-react";

interface PerformanceMetricsProps {
  status: "online" | "offline" | "starting";
  actualDiskUsageMB?: number;
  resources?: {
    cpu: string;
    ram: string;
    disk: string;
  };
}

export function PerformanceMetrics({ status, resources, actualDiskUsageMB = 0 }: PerformanceMetricsProps) {
  const [data, setData] = React.useState<any[]>([]);
  const [mounted, setMounted] = React.useState(false);

  // Generate initial zeroed or random data based on status
  const generateData = React.useCallback(() => {
    const points = [];
    const now = new Date();
    const isOffline = status === "offline";
    
    for (let i = 20; i >= 0; i--) {
      points.push({
        time: new Date(now.getTime() - i * 5000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        cpu: isOffline ? 0 : (status === "starting" ? Math.floor(Math.random() * 40) + 10 : Math.floor(Math.random() * 15) + 5),
        memory: isOffline ? 0 : (status === "starting" ? Math.floor(Math.random() * 20) + 5 : Math.floor(Math.random() * 10) + 20),
        network: isOffline ? 0 : Math.floor(Math.random() * 100) + 10,
      });
    }
    return points;
  }, [status]);

  React.useEffect(() => {
    setMounted(true);
    setData(generateData());

    const interval = setInterval(() => {
      setData((prev) => {
        const isOffline = status === "offline";
        if (prev.length === 0) return generateData();
        
        const nextTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const lastPoint = prev[prev.length - 1];
        
        let nextCpu, nextMemory, nextNetwork;

        if (isOffline) {
          nextCpu = 0;
          nextMemory = 0;
          nextNetwork = 0;
        } else if (status === "starting") {
          nextCpu = Math.max(10, Math.min(60, lastPoint.cpu + (Math.random() * 10 - 5)));
          nextMemory = Math.max(5, Math.min(30, lastPoint.memory + (Math.random() * 4 - 2)));
          nextNetwork = Math.max(0, Math.min(500, lastPoint.network + (Math.random() * 50 - 25)));
        } else {
          nextCpu = Math.max(2, Math.min(98, lastPoint.cpu + (Math.random() * 6 - 3)));
          nextMemory = Math.max(10, Math.min(95, lastPoint.memory + (Math.random() * 2 - 1)));
          nextNetwork = Math.max(10, Math.min(2000, lastPoint.network + (Math.random() * 150 - 75)));
        }

        const next = {
          time: nextTime,
          cpu: nextCpu,
          memory: nextMemory,
          network: nextNetwork,
        };
        return [...prev.slice(1), next];
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [generateData, status]);

  if (!mounted || data.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-card border-border/50 h-[140px] md:h-[160px] animate-pulse">
            <CardContent className="h-full flex items-center justify-center">
              <div className="w-1/3 h-4 bg-secondary rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const latest = data[data.length - 1];
  const diskLimit = resources?.disk || "2GB";
  const diskLimitMB = parseFloat(diskLimit) * (diskLimit.includes("GB") ? 1024 : 1);
  const diskUsagePercentage = Math.min(100, (actualDiskUsageMB / diskLimitMB) * 100);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard 
        title="CPU Usage" 
        value={`${latest.cpu.toFixed(1)}%`} 
        limit={resources?.cpu || "100%"}
        icon={Cpu} 
        color="hsl(var(--primary))" 
        data={data} 
        dataKey="cpu"
      />
      <MetricCard 
        title="Memory" 
        value={`${latest.memory.toFixed(1)}%`} 
        limit={resources?.ram || "1.5GB"}
        icon={MemoryStick} 
        color="hsl(var(--accent))" 
        data={data} 
        dataKey="memory"
      />
      <Card className="bg-card border-border/50 overflow-hidden relative group h-full">
        <div className="absolute top-2 right-2 p-3">
          <HardDrive className="size-6 md:size-8 text-orange-400 opacity-20 group-hover:opacity-100 transition-opacity" />
        </div>
        <CardHeader className="flex flex-row items-center justify-between pb-2 relative">
          <CardTitle className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Disk Usage</CardTitle>
        </CardHeader>
        <CardContent className="relative pb-6">
          <div className="text-xl md:text-2xl font-bold font-headline text-orange-400">
            {actualDiskUsageMB < 1 ? `${(actualDiskUsageMB * 1024).toFixed(1)} KB` : `${(actualDiskUsageMB / 1024).toFixed(2)} GB`}
          </div>
          <p className="text-[8px] md:text-[9px] text-muted-foreground font-bold tracking-widest uppercase">OF {diskLimit} TOTAL</p>
          <div className="mt-4 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-orange-400 transition-all duration-1000" 
              style={{ width: `${Math.max(2, diskUsagePercentage)}%` }} 
            />
          </div>
        </CardContent>
      </Card>
      <MetricCard 
        title="Network" 
        value={`${latest.network.toFixed(0)} KB/s`} 
        limit="1Gbps"
        icon={ArrowUpDown} 
        color="hsl(var(--primary))" 
        data={data} 
        dataKey="network"
      />
    </div>
  );
}

function MetricCard({ title, value, limit, icon: Icon, color, data, dataKey }: any) {
  return (
    <Card className="bg-card border-border/50 overflow-hidden relative group">
      <div className="absolute top-2 right-2 p-3">
        <Icon className="size-6 md:size-8 opacity-20 group-hover:opacity-100 transition-opacity" style={{ color }} />
      </div>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pb-0">
        <div className="text-xl md:text-2xl font-bold font-headline" style={{ color }}>{value}</div>
        <div className="text-[8px] md:text-[9px] text-muted-foreground font-bold tracking-widest uppercase mt-0.5">LIMIT: {limit}</div>
        <div className="h-[50px] md:h-[60px] w-full mt-3 md:mt-4 -mx-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey={dataKey} 
                stroke={color} 
                strokeWidth={2} 
                fillOpacity={1} 
                fill={`url(#gradient-${dataKey})`} 
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
