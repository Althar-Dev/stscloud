
"use client";

import * as React from "react";
import { 
  Area, 
  AreaChart, 
  ResponsiveContainer, 
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cpu, HardDrive, MemoryStick } from "lucide-react";

const generateData = () => {
  const points = [];
  const now = new Date();
  for (let i = 20; i >= 0; i--) {
    points.push({
      time: new Date(now.getTime() - i * 5000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      cpu: Math.floor(Math.random() * 30) + 10,
      memory: Math.floor(Math.random() * 20) + 40,
    });
  }
  return points;
};

export function PerformanceMetrics() {
  const [data, setData] = React.useState<any[]>([]);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    // Only run on client to prevent hydration mismatch
    setMounted(true);
    setData(generateData());

    const interval = setInterval(() => {
      setData((prev) => {
        if (prev.length === 0) return generateData();
        const nextTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const lastPoint = prev[prev.length - 1];
        const next = {
          time: nextTime,
          cpu: Math.max(5, Math.min(95, lastPoint.cpu + (Math.random() * 10 - 5))),
          memory: Math.max(5, Math.min(95, lastPoint.memory + (Math.random() * 4 - 2))),
        };
        return [...prev.slice(1), next];
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Hydration safety: render skeleton on server and first client pass
  if (!mounted || data.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-card border-border/50 h-[160px] animate-pulse">
            <CardContent className="h-full flex items-center justify-center">
              <div className="w-1/2 h-4 bg-secondary rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const latest = data[data.length - 1];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      <Card className="bg-card border-border/50 overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
          <HardDrive className="size-12 text-orange-400" />
        </div>
        <CardHeader className="flex flex-row items-center justify-between pb-2 relative">
          <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Disk Usage</CardTitle>
          <HardDrive className="size-4 text-orange-400" />
        </CardHeader>
        <CardContent className="relative">
          <div className="text-2xl font-bold font-headline">12.4 GB</div>
          <p className="text-[10px] text-muted-foreground font-bold tracking-widest">OF 100 GB TOTAL</p>
          <div className="mt-4 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-orange-400 transition-all duration-1000" style={{ width: '12.4%' }} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, color, data, dataKey }: any) {
  return (
    <Card className="bg-card border-border/50 overflow-hidden relative">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{title}</CardTitle>
        <Icon className="size-4" style={{ color }} />
      </CardHeader>
      <CardContent className="pb-0">
        <div className="text-2xl font-bold font-headline" style={{ color }}>{value}</div>
        <div className="h-[60px] w-full mt-4 -mx-6">
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
