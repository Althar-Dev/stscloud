
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
  Loader2,
  User as UserIcon,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  Key
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth, useFirestore, useUser } from "@/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { sendVerificationCode, setSessionCookie } from "@/app/actions/auth-actions";
import { cn } from "@/lib/utils";

export const dynamic = 'force-dynamic';

function AuthContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();
  const { user, loading: authLoading } = useUser();
  
  const type = searchParams.get("type") || "login";
  const isLogin = type === "login" || type === "signin";

  const [submitting, setSubmitting] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [agreed, setAgreed] = React.useState(false);

  // Verification State
  const [showVerification, setShowVerification] = React.useState(false);
  const [verificationCode, setVerificationCode] = React.useState("");
  const [sentCode, setSentCode] = React.useState("");

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      handleLogin();
      return;
    }

    // Signup Validation
    if (password !== confirmPassword) {
      toast({ variant: "destructive", title: "Validation Error", description: "Passwords do not match." });
      return;
    }
    if (!agreed) {
      toast({ variant: "destructive", title: "Validation Error", description: "You must agree to the Legal Agreement." });
      return;
    }

    setSubmitting(true);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const result = await sendVerificationCode(email, code);

    if (result.success) {
      setSentCode(code);
      setShowVerification(true);
      toast({ title: "Code Sent", description: `Verification code sent to ${email}` });
    } else {
      toast({ variant: "destructive", title: "Email Error", description: result.error || "Failed to send verification code." });
    }
    setSubmitting(false);
  };

  const handleLogin = async () => {
    setSubmitting(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      // Sync session to shared domain cookie
      await setSessionCookie(res.user.uid);
      
      toast({ title: "Welcome back!", description: "Successfully signed in to your account." });
      
      // Redirect to client subdomain
      window.location.href = "https://client.stscloud.id/";
    } catch (error: any) {
      toast({ variant: "destructive", title: "Authentication failed", description: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode !== sentCode) {
      toast({ variant: "destructive", title: "Invalid Code", description: "The verification code you entered is incorrect." });
      return;
    }

    setSubmitting(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;
      
      await updateProfile(newUser, { displayName: username });
      await setDoc(doc(db, "users", newUser.uid), {
        email: newUser.email,
        displayName: username,
        createdAt: serverTimestamp(),
        dev: false
      });

      // Sync session to shared domain cookie
      await setSessionCookie(newUser.uid);

      toast({ title: "Account created!", description: "Welcome to STSCloud." });
      window.location.href = "https://client.stscloud.id/";
    } catch (error: any) {
      toast({ variant: "destructive", title: "Registration failed", description: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.03),transparent_70%)] pointer-events-none" />
      
      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="flex flex-col items-center text-center space-y-4">
          <Link href="/" className="group transition-transform hover:scale-105 active:scale-95">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden">
              <Image src="/img/icons.png" alt="STSCloud" width={64} height={64} className="object-cover" />
            </div>
          </Link>
          <div className="space-y-2">
            <h1 className="text-3xl font-headline font-bold tracking-tight">
              {showVerification ? "Verify Email" : isLogin ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-muted-foreground text-sm max-w-[280px] mx-auto leading-relaxed">
              {showVerification 
                ? `Enter the 6-digit code sent to ${email}`
                : isLogin 
                  ? "Access your cloud infrastructure and game nodes." 
                  : "Join STSCloud and deploy your first server today."}
            </p>
          </div>
        </div>

        <Card className="border-border/50 bg-card shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-50" />
          
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-headline font-bold">
                {showVerification ? "Verification" : isLogin ? "Sign In" : "Register"}
              </CardTitle>
              {!showVerification && (
                <Badge variant="outline" className="text-[8px] uppercase font-bold tracking-[0.2em] border-primary/20 text-primary">
                  {isLogin ? "Client Portal" : "New Instance"}
                </Badge>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {showVerification ? (
              <form onSubmit={handleVerifyAndRegister} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Confirmation Code</Label>
                  <div className="relative group">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <Input 
                      placeholder="Enter 6-digit code" 
                      className="pl-10 bg-secondary/30 border-none h-12 text-center text-xl font-code tracking-[0.5em] focus-visible:ring-primary/40" 
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      maxLength={6}
                      required 
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold gap-2" disabled={submitting}>
                    {submitting ? <Loader2 className="size-5 animate-spin" /> : <>Verify & Create Account <ArrowRight className="size-4" /></>}
                  </Button>
                  <Button variant="ghost" className="text-xs h-10 gap-2" onClick={() => setShowVerification(false)} disabled={submitting}>
                    <ArrowLeft className="size-4" /> Edit Information
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleInitialSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Username</Label>
                    <div className="relative group">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                      <Input 
                        id="username" 
                        placeholder="JohnDoe_99" 
                        className="pl-10 bg-secondary/30 border-none h-11 focus-visible:ring-primary/40" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required 
                      />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Email Address</Label>
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
                <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Password</Label>
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
                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Confirm Password</Label>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                        <Input 
                          id="confirm-password" 
                          type="password" 
                          placeholder="••••••••" 
                          className="pl-10 bg-secondary/30 border-none h-11 focus-visible:ring-primary/40" 
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required 
                        />
                      </div>
                    </div>
                  )}
                </div>

                {!isLogin && (
                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox id="terms" checked={agreed} onCheckedChange={(val) => setAgreed(!!val)} />
                    <label htmlFor="terms" className="text-[10px] text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      I agree to the <Link href="/legal" className="text-primary hover:underline font-bold">Legal Agreement</Link> and data privacy policy.
                    </label>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-bold gap-2 mt-2 shadow-lg shadow-primary/20"
                  disabled={submitting}
                >
                  {submitting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <>
                      {isLogin ? "Sign In" : "Register Account"}
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4 pb-8">
            <div className="text-center text-xs text-muted-foreground">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button 
                onClick={() => {
                  setShowVerification(false);
                  router.push(isLogin ? "/auth?type=signup" : "/auth?type=login");
                }}
                className="text-primary font-bold hover:underline"
              >
                {isLogin ? "Create one" : "Sign in instead"}
              </button>
            </div>
          </CardFooter>
        </Card>

        <div className="flex items-center justify-center gap-6 opacity-40 grayscale group-hover:grayscale-0 transition-all duration-500">
          <div className="w-px h-3 bg-border" />
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-primary" />
            <span className="text-[8px] font-bold uppercase tracking-widest">256-bit AES</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="size-8 animate-spin text-primary" /></div>}>
      <AuthContent />
    </React.Suspense>
  );
}
