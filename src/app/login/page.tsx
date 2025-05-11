
"use client";

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Import useRouter
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import SmartCycleLogo from '@/components/icons/SmartCycleLogo';
import { LogIn, Mail, KeyRound, Loader2, UserPlus } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter(); // Initialize router

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    // Basic validation (more robust validation would be needed in a real app)
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock login success
    // In a real app, you'd verify credentials and handle errors
    if (email === "user@example.com" && password === "password123") {
      toast({
        title: "Login Successful",
        description: "Welcome back to SmartCycle!",
      });
      // Redirect to the main app (e.g., /scan-qr or /wallet)
      router.push('/scan-qr'); 
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background p-4">
      <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
        <SmartCycleLogo className="h-8 w-8" />
        <span className="text-xl font-semibold">SmartCycle</span>
      </Link>
      
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <LogIn className="mx-auto h-10 w-10 text-primary mb-3" />
          <CardTitle className="text-3xl font-bold">Welcome Back!</CardTitle>
          <CardDescription>Sign in to your SmartCycle account to continue your recycling journey.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center">
                <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center">
                <KeyRound className="mr-2 h-4 w-4 text-muted-foreground" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                autoComplete="current-password"
              />
            </div>
             <div className="text-right text-sm">
              <Link href="#" className="text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-4 w-4" />
              )}
              Sign In
            </Button>
             <p className="text-sm text-muted-foreground text-center">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-primary hover:underline font-medium flex items-center justify-center sm:inline-flex">
                 <UserPlus className="mr-1 h-4 w-4 sm:hidden"/> Create one
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
      <p className="mt-8 text-xs text-muted-foreground text-center max-w-md">
        By signing in, you agree to SmartCycle&apos;s Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}

