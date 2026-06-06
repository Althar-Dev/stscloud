
"use client";

import * as React from "react";
import { BrainCircuit, Loader2, Save, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateOptimizedServerConfigs, type GenerateOptimizedServerConfigsOutput } from "@/ai/flows/generate-optimized-server-configs";
import { toast } from "@/hooks/use-toast";

export function AIConfigTool() {
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<GenerateOptimizedServerConfigsOutput | null>(null);
  const [formData, setFormData] = React.useState({
    gameName: "Minecraft",
    playerCount: 20,
    resourceUsage: "medium" as const,
    performanceGoals: "High FPS, stable TPS, low latency"
  });

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const output = await generateOptimizedServerConfigs(formData);
      setResult(output);
      toast({
        title: "Optimization Complete",
        description: "AI has generated optimized settings for your instance.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Optimization Failed",
        description: "There was an error generating your configuration.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <BrainCircuit className="size-5 text-primary" />
            Config Intelligence
          </CardTitle>
          <CardDescription>Tell STS AI about your needs to get optimized parameters.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="game">Game Profile</Label>
            <Input 
              id="game" 
              value={formData.gameName}
              onChange={(e) => setFormData(p => ({ ...p, gameName: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="players">Expected Players</Label>
              <Input 
                id="players" 
                type="number"
                value={formData.playerCount}
                onChange={(e) => setFormData(p => ({ ...p, playerCount: parseInt(e.target.value) }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="usage">Resource Profile</Label>
              <Select 
                value={formData.resourceUsage}
                onValueChange={(v: any) => setFormData(p => ({ ...p, resourceUsage: v }))}
              >
                <SelectTrigger id="usage">
                  <SelectValue placeholder="Select usage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Eco (Low Usage)</SelectItem>
                  <SelectItem value="medium">Balanced</SelectItem>
                  <SelectItem value="high">Extreme Performance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="goals">Performance Goals</Label>
            <Input 
              id="goals" 
              placeholder="e.g., minimal latency, high tick rate"
              value={formData.performanceGoals}
              onChange={(e) => setFormData(p => ({ ...p, performanceGoals: e.target.value }))}
            />
          </div>
          <Button 
            className="w-full mt-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20" 
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Generate Optimized Config
          </Button>
        </CardContent>
      </Card>

      <Card className={cn(
        "bg-card border-border/50 relative overflow-hidden transition-all duration-500",
        !result && "opacity-50 grayscale pointer-events-none"
      )}>
        {!result && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-background/20 backdrop-blur-sm">
            <div className="text-center p-6 bg-secondary/80 rounded-xl border border-border">
              <Wand2 className="size-8 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">Waiting for generation parameters...</p>
            </div>
          </div>
        )}
        <CardHeader>
          <CardTitle className="font-headline flex items-center justify-between">
            Optimization Result
            <Button size="sm" variant="ghost" className="h-8 gap-2 text-xs">
              <Save className="size-3" /> Apply Config
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Launch Parameters</h4>
            <pre className="p-3 bg-black/40 rounded-lg text-xs font-code text-accent border border-primary/20 overflow-x-auto">
              {result?.launchParameters || "bin/server-exec --port 25565 --max-players 20 --optimized-io"}
            </pre>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Optimized Settings</h4>
            <div className="p-3 bg-black/40 rounded-lg text-xs font-code text-slate-300 border border-border whitespace-pre-wrap max-h-48 overflow-y-auto custom-scrollbar">
              {result?.optimizedSettings || "performance-mode=true\ntick-rate=20\nnetwork-compression=256\nview-distance=10"}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
