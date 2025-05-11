
"use client";

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode as QrCodeIcon, User, Fingerprint, AlertCircle } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Mock user details, in a real app, this would come from auth context or API
const MOCK_USER_DATA = {
  name: "Demo User",
  walletId: "SCWLT-DEMO-12345",
};

export default function ScanQrPage() {
  const [userData, setUserData] = useState<{ name: string; walletId: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [qrError, setQrError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate fetching user data
    const timer = setTimeout(() => {
      setUserData(MOCK_USER_DATA);
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const qrCodeDataString = useMemo(() => {
    if (!userData) return null;
    // Constructing a JSON string for the QR code.
    // The 'type' field can help the scanner differentiate QR codes.
    // Timestamp can be useful for QR code expiry or logging in a real system.
    return JSON.stringify({
      type: "smartcycle_user_identification",
      walletId: userData.walletId,
      name: userData.name,
      timestamp: new Date().toISOString(),
    });
  }, [userData]);

  const qrCodeImageUrl = useMemo(() => {
    if (!qrCodeDataString) return null;
    try {
      return `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(qrCodeDataString)}&ecc=M&margin=10`;
    } catch (error) {
      console.error("Error generating QR code URL:", error);
      setQrError("Could not generate the QR code. Please try again later.");
      return null;
    }
  }, [qrCodeDataString]);

  return (
    <div className="container mx-auto py-8 px-4 flex flex-col items-center">
      <div className="mb-8 text-center max-w-2xl">
        <QrCodeIcon className="mx-auto mb-4 h-12 w-12 text-primary" />
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Scan at Machine
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Present this QR code to any SmartCycle vending machine to identify yourself and start recycling.
        </p>
      </div>

      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Your SmartCycle ID</CardTitle>
          <CardDescription>This code is unique to your account.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          {isLoading ? (
            <div className="space-y-4 w-full">
              <Skeleton className="h-[256px] w-[256px] rounded-lg mx-auto" />
              <Skeleton className="h-6 w-3/4 mx-auto" />
              <Skeleton className="h-5 w-1/2 mx-auto" />
            </div>
          ) : qrError ? (
             <Alert variant="destructive" className="w-full">
                <AlertCircle className="h-5 w-5" />
                <AlertTitle>QR Code Error</AlertTitle>
                <AlertDescription>{qrError}</AlertDescription>
            </Alert>
          ) : qrCodeImageUrl && userData ? (
            <>
              <div className="p-4 bg-white rounded-lg shadow-md inline-block border">
                <Image
                  src={qrCodeImageUrl}
                  alt="Your SmartCycle QR Code"
                  width={256}
                  height={256}
                  priority // Load QR code faster
                  data-ai-hint="qr code user"
                  onError={() => setQrError("Failed to load the QR code image. Please check your internet connection or try again.")}
                />
              </div>
              <div className="text-center space-y-1 pt-2 border-t w-full">
                <div className="flex items-center justify-center text-lg font-medium text-foreground">
                  <User className="mr-2 h-5 w-5 text-primary" />
                  <span>{userData.name}</span>
                </div>
                <div className="flex items-center justify-center text-sm text-muted-foreground">
                  <Fingerprint className="mr-2 h-4 w-4 text-accent" />
                  <span>Wallet ID: {userData.walletId}</span>
                </div>
              </div>
            </>
          ) : (
             <Alert variant="destructive" className="w-full">
                <AlertCircle className="h-5 w-5" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>Could not load user data to generate QR code.</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Alert className="mt-10 max-w-md w-full bg-primary/5 border-primary/20 text-primary-foreground dark:bg-primary/10 dark:text-primary-foreground">
        <QrCodeIcon className="h-5 w-5 text-primary" />
        <AlertTitle className="font-semibold text-primary">How to Use</AlertTitle>
        <AlertDescription className="text-primary/90 text-sm">
          <ol className="list-decimal list-inside space-y-1 mt-1">
            <li>Approach any SmartCycle vending machine.</li>
            <li>Locate the QR code scanner on the machine.</li>
            <li>Align this QR code with the scanner until it's recognized.</li>
            <li>Follow machine prompts to complete your transaction.</li>
          </ol>
        </AlertDescription>
      </Alert>
    </div>
  );
}
