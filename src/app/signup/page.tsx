
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import SmartCycleLogo from '@/components/icons/SmartCycleLogo';
import { UserPlus, Mail, KeyRound, Loader2, UserCircle, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';

// Zod schema for sign-up form validation
const signUpSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }).max(50),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string(),
}).superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Passwords do not match.",
      path: ["confirmPassword"],
    });
  }
});

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit: SubmitHandler<SignUpFormData> = async (data) => {
    setIsLoading(true);
    // Simulate API call for registration
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock registration success
    // In a real app, you'd send data to your backend for user creation
    // and handle potential errors like email already exists.
    console.log("Sign up data:", data);

    toast({
      title: "Account Created!",
      description: "Welcome to SmartCycle! You can now log in.",
    });
    router.push('/login'); // Redirect to login page after successful sign-up

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
          <UserPlus className="mx-auto h-10 w-10 text-primary mb-3" />
          <CardTitle className="text-3xl font-bold">Create Your Account</CardTitle>
          <CardDescription>Join SmartCycle and start your rewarding recycling journey today!</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="flex items-center">
                <UserCircle className="mr-2 h-4 w-4 text-muted-foreground" />
                Full Name
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="e.g. Alex Tan"
                {...register("fullName")}
                disabled={isLoading}
                className={cn(errors.fullName && "border-destructive")}
                autoComplete="name"
              />
              {errors.fullName && <p className="text-sm text-destructive mt-1">{errors.fullName.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="flex items-center">
                <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register("email")}
                disabled={isLoading}
                className={cn(errors.email && "border-destructive")}
                autoComplete="email"
              />
              {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="flex items-center">
                <KeyRound className="mr-2 h-4 w-4 text-muted-foreground" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Min. 8 characters"
                {...register("password")}
                disabled={isLoading}
                className={cn(errors.password && "border-destructive")}
                autoComplete="new-password"
              />
              {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="flex items-center">
                <KeyRound className="mr-2 h-4 w-4 text-muted-foreground" />
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                {...register("confirmPassword")}
                disabled={isLoading}
                className={cn(errors.confirmPassword && "border-destructive")}
                autoComplete="new-password"
              />
              {errors.confirmPassword && <p className="text-sm text-destructive mt-1">{errors.confirmPassword.message}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pt-2">
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              Create Account
            </Button>
             <p className="text-sm text-muted-foreground text-center">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline font-medium flex items-center justify-center sm:inline-flex">
                <LogIn className="mr-1 h-4 w-4 sm:hidden" /> Sign In
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
      <p className="mt-8 text-xs text-muted-foreground text-center max-w-md">
        By creating an account, you agree to SmartCycle&apos;s Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}

