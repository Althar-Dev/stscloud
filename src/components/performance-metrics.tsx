
"use client";

import * as React from "react";
import { 
  Area, 
  AreaChart, 
  ResponsiveContainer, 
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cpu, HardDrive, MemoryStick, ArrowUpDown } from "lucide-react";

const generateData = () => {
  const points = [];
  const now = new Date();
  for (let i = 20; i >= 0; i--) {
    points.push({
      time: new Date(now.getTime() - i * 5000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      cpu: Math.floor(Math.random() * 30) + 10,
      memory: Math.floor(Math.random() * 20) + 40,
      network: Math.floor(Math.random() * 500) + 100,
    });
  }
  return points;
};

export function PerformanceMetrics() {
  const [data, setData] = React.useState<any[]>([]);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    setData(generateData());

    const interval = setInterval(() => {
      setData((prev) => {
        if (prev.length === 0) return generateData();
        const nextTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const lastPoint = prev[prev.length - 1];
        const next = {
          time: nextTime,
          cpu: Math.max(5, Math.min(95, lastPoint.cpu + (Math.random() * 8 - 4))),
          memory: Math.max(5, Math.min(95, lastPoint.memory + (Math.random() * 2 - 1))),
          network: Math.max(50, Math.min(1000, lastPoint.network + (Math.random() * 100 - 50))),
        };
        return [...prev.slice(1), next];
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard 
        title="CPU Usage" 
        value={`${latest.cpu.toFixed(1)}%`} 
        icon={Cpu} 
        color="hsl(var(--primary))" 
        data={data} 
        dataKey="cpu"
      />
      <MetricCard 
        title="Memory" 
        value={`${latest.memory.toFixed(1)}%`} 
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
          <div className="text-xl md:text-2xl font-bold font-headline text-orange-400">12.4 GB</div>
          <p className="text-[8px] md:text-[9px] text-muted-foreground font-bold tracking-widest uppercase">OF 100 GB TOTAL</p>
          <div className="mt-4 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-orange-400 transition-all duration-1000" style={{ width: '12.4%' }} />
          </div>
        </CardContent>
      </Card>
      <MetricCard 
        title="Network" 
        value={`${latest.network.toFixed(0)} KB/s`} 
        icon={ArrowUpDown} 
        color="hsl(var(--primary))" 
        data={data} 
        dataKey="network"
      />
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, color, data, dataKey }: any) {
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
