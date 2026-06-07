
"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  Rocket, 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth, useFirestore, useUser } from "@/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();
  const { user, loading: authLoading } = useUser();
  
  const type = searchParams.get("type") || "login";
  const [submitting, setSubmitting] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loadingProgress, setLoadingProgress] = React.useState(0);

  const isLogin = type === "login" || type === "signin";

  // Redirect if user is already logged in
  React.useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, authLoading, router]);

  // Simulate progress for Cloudflare-like effect
  React.useEffect(() => {
    if (authLoading || user) {
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 100) return 100;
          return prev + 2;
        });
      }, 30);
      return () => clearInterval(interval);
    }
  }, [authLoading, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast({
          title: "Welcome back!",
          description: "Successfully signed in to your account.",
        });
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential.user;
        
        // Create user profile in Firestore
        await setDoc(doc(db, "users", newUser.uid), {
          email: newUser.email,
          createdAt: serverTimestamp(),
          displayName: email.split('@')[0], // Default display name
        });

        toast({
          title: "Account created!",
          description: "Your STSCloud account is ready to use.",
        });
      }
      router.push("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Authentication failed",
        description: error.message || "An unexpected error occurred.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Minimalist branded loading without text, matched width icon and bar
  if (authLoading || user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-[160px] sm:max-w-[240px] flex flex-col items-center animate-in fade-in duration-700">
          <div className="relative w-full aspect-square">
            <Image 
              src="/img/icon.png" 
              alt="STSCloud" 
              fill 
              className="object-contain grayscale opacity-60" 
              priority
            />
          </div>
          <div className="w-full">
            <div className="h-[4px] w-full bg-secondary overflow-hidden rounded-full">
              <div 
                className="h-full bg-primary transition-all duration-300 ease-out" 
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <Link href="/" className="group transition-transform hover:scale-105 active:scale-95">
            <div className="w-16 h-16 rounded-2xl bg-secondary border border-border/50 flex items-center justify-center overflow-hidden">
              <Image src="/img/icon.png" alt="STSCloud" width={64} height={64} className="object-cover" />
            </div>
          </Link>
          <div className="space-y-2">
            <h1 className="text-3xl font-headline font-bold tracking-tight">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-muted-foreground text-sm max-w-[280px] mx-auto">
              {isLogin 
                ? "Access your cloud infrastructure and game nodes." 
                : "Join STSCloud and deploy your first server today."}
            </p>
          </div>
        </div>

        <Card className="border-border/50 bg-card shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-50" />
          
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-headline font-bold">
              {isLogin ? "Sign In" : "Register"}
            </CardTitle>
            <CardDescription className="text-xs">
              Enter your credentials to continue to STSCloud
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email Address</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@company.com" 
                    className="pl-10 bg-secondary/30 border-none h-11 focus-visible:ring-primary/40" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Password</Label>
                  {isLogin && (
                    <Button variant="link" className="text-[10px] p-0 h-auto text-muted-foreground hover:text-primary">
                      Forgot password?
                    </Button>
                  )}
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10 bg-secondary/30 border-none h-11 focus-visible:ring-primary/40" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-bold gap-2"
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>
                    {isLogin ? "Sign In" : "Get Started"}
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4 pb-8">
            <div className="text-center text-xs text-muted-foreground">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <Link 
                href={`/auth?type=${isLogin ? "signup" : "login"}`}
                className="text-primary font-bold hover:underline"
              >
                {isLogin ? "Create one" : "Sign in instead"}
              </Link>
            </div>
          </CardFooter>
        </Card>

        <div className="flex items-center justify-center gap-6 opacity-40 grayscale group-hover:grayscale-0 transition-all duration-500">
          <Badge variant="outline" className="bg-transparent border-none text-[10px] font-bold uppercase tracking-widest">PCI-DSS Compliant</Badge>
          <Badge variant="outline" className="bg-transparent border-none text-[10px] font-bold uppercase tracking-widest">256-bit AES</Badge>
        </div>
      </div>
    </div>
  );
}
