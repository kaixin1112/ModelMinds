"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardFooter, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import MaterialIcon from "@/components/MaterialIcon";
import { getWeeklyChallenges, type Challenge } from "@/services/challenge-service";
import { Trophy, CalendarDays, CheckCircle, XCircle, Loader2, Gift, Star, Recycle, Archive, Container, GlassWater, Info, Sparkles, PackageOpen, Cpu } from "lucide-react";
import { format, formatDistanceToNowStrict, isPast, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const getChallengeIcon = (challenge: Challenge): React.ReactNode => {
  const iconProps = { className: "h-8 w-8" }; // Slightly larger for card header as main visual
  if (challenge.iconName) {
    switch (challenge.iconName) {
      case 'Recycle': return <Recycle {...iconProps} />;
      case 'Gift': return <Gift {...iconProps} />;
      case 'Star': return <Star {...iconProps} />;
      case 'Archive': return <Archive {...iconProps} />;
      case 'Container': return <Container {...iconProps} />;
      case 'GlassWater': return <GlassWater {...iconProps} />;
      case 'Sparkles': return <Sparkles {...iconProps} />;
      case 'Cpu': return <Cpu {...iconProps} />; // Added for E-Waste
      default: return <Trophy {...iconProps} />; // Default to Trophy if iconName is unknown
    }
  }
  if (challenge.targetMaterial && challenge.targetMaterial !== 'Any' && challenge.unit !== 'transactions') {
    return <MaterialIcon materialType={challenge.targetMaterial} className="h-8 w-8" />;
  }
  return <Trophy {...iconProps} />; // Fallback icon
};


export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function loadChallenges() {
      setIsLoading(true);
      try {
        const fetchedChallenges = await getWeeklyChallenges();
        setChallenges(fetchedChallenges);
      } catch (error)
       {
        console.error("Failed to load challenges:", error);
        toast({
          title: "Error",
          description: "Could not load challenges. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    loadChallenges();
  }, [toast]);

  const getStatus = (challenge: Challenge): { text: string; icon: React.ReactNode, colorClass: string, badgeVariant: "default" | "secondary" | "destructive" | "outline" } => {
    const endDate = parseISO(challenge.endDate);
    if (challenge.isCompleted) {
      return { text: "Completed!", icon: <CheckCircle className="h-4 w-4 text-primary" />, colorClass: "text-primary", badgeVariant: "default" };
    }
    if (isPast(endDate)) {
      return { text: "Expired", icon: <XCircle className="h-4 w-4 text-destructive" />, colorClass: "text-destructive", badgeVariant: "destructive" };
    }
    return { text: "Active", icon: <Trophy className="h-4 w-4 text-accent" />, colorClass: "text-accent", badgeVariant: "secondary" };
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex flex-col items-center justify-center h-full">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground text-lg">Loading Challenges...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 text-center">
        <Sparkles className="mx-auto mb-3 h-12 w-12 text-accent" /> 
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Recycling Challenges
        </h1>
        <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
          Spice up your recycling! Join weekly challenges, crush goals, earn points, and make recycling an adventure.
        </p>
      </div>

      {challenges.length === 0 && !isLoading && (
        <Card className="shadow-lg max-w-md mx-auto">
          <CardHeader className="items-center text-center">
            <PackageOpen className="h-16 w-16 text-accent mx-auto mb-4" /> 
            <CardTitle className="text-2xl">No Challenges Right Now!</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">Looks like our challenge board is taking a quick breather. Check back soon for new and exciting ways to recycle and earn!</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {challenges.map((challenge) => {
          const progressPercentage = Math.min(
            (challenge.currentAmount / challenge.targetAmount) * 100,
            100
          );
          const endDate = parseISO(challenge.endDate);
          const challengeStatus = getStatus(challenge);
          
          let timeRemainingText = "";
          if (challengeStatus.text === "Active") {
            timeRemainingText = `Ends in ${formatDistanceToNowStrict(endDate, { addSuffix: false })}`;
          } else if (challengeStatus.text === "Expired") {
            timeRemainingText = `Ended on ${format(endDate, 'MMM d, yyyy')}`;
          } else if (challengeStatus.text === "Completed!") {
             timeRemainingText = challenge.completionDate ? `Completed on ${format(parseISO(challenge.completionDate), 'MMM d, yyyy')}` : `Completed by ${format(endDate, 'MMM d, yyyy')}`;
          }

          return (
            <Card 
              key={challenge.id} 
              className={cn(
                "shadow-lg hover:shadow-xl transition-all duration-300 ease-out flex flex-col transform hover:-translate-y-1 overflow-hidden", 
                challenge.color, 
                (challenge.isCompleted || challengeStatus.text === "Expired") ? "opacity-80 grayscale-[30%]" : ""
              )}
            >
              <CardHeader className={cn("pb-3 pt-4")}>
                <div className="flex items-center justify-between mb-3">
                    <span className={cn("p-2 rounded-lg", 
                      challengeStatus.text === "Completed!" ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary" :
                      challengeStatus.text === "Expired" ? "bg-destructive/10 text-destructive dark:bg-destructive/20" :
                      "bg-accent/10 text-accent dark:bg-accent/20")}>
                      {getChallengeIcon(challenge)}
                    </span>
                   <div className={cn("flex items-center text-xs font-medium whitespace-nowrap", challengeStatus.colorClass)}>
                      {challengeStatus.icon}
                      <span className="ml-1">{challengeStatus.text}</span>
                   </div>
                </div>
                <div>
                  <CardTitle className="text-md font-semibold leading-tight">{challenge.title}</CardTitle>
                  <Badge 
                    variant={challengeStatus.badgeVariant} 
                    className={cn("mt-1 text-xs", 
                        challenge.isCompleted ? "bg-primary text-primary-foreground" : 
                        challengeStatus.text === "Expired" ? "bg-destructive text-destructive-foreground" : 
                        "bg-accent text-accent-foreground"
                      )}
                  >
                    {challenge.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-grow space-y-3 pt-0">
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{challenge.description}</p>
                
                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-xs font-medium text-foreground">Progress:</span>
                    <span className="text-xs text-muted-foreground">
                      {challenge.currentAmount.toLocaleString()} / {challenge.targetAmount.toLocaleString()} {challenge.unit}
                    </span>
                  </div>
                  <Progress 
                    value={progressPercentage} 
                    aria-label={`${challenge.title} progress`} 
                    className={cn(
                      "h-2.5 rounded-full", 
                      challengeStatus.text === "Completed!" ? "[&>*]:bg-primary" :      
                      challengeStatus.text === "Active" ? "[&>*]:bg-accent" :              
                      "[&>*]:bg-muted-foreground"                                         
                    )}
                  />
                </div>

                <div className="flex items-center text-xs text-muted-foreground">
                  <Gift className="h-3.5 w-3.5 mr-1.5 text-accent" />
                  Reward: <span className="font-semibold text-foreground ml-1">{challenge.rewardPoints} points</span>
                </div>
               
              </CardContent>
              <CardFooter className="border-t pt-3 mt-auto bg-card/50 dark:bg-card/20 rounded-b-lg">
                 <div className="flex justify-between items-center w-full">
                   <div className="text-xs text-muted-foreground flex items-center">
                      <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
                      {timeRemainingText}
                   </div>
                   <Button 
                    variant="ghost" 
                    size="sm" 
                    className={cn("text-xs text-primary hover:bg-primary/10",(challenge.isCompleted || challengeStatus.text === "Expired") ? "opacity-60 cursor-not-allowed" : "")}
                    onClick={() => toast({ title: challenge.title, description: "Detailed view coming soon!"})}
                    disabled={challenge.isCompleted || challengeStatus.text === "Expired"}
                   >
                     View Details
                   </Button>
                 </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <Alert className="mt-12 max-w-2xl mx-auto bg-primary/5 border-primary/20 text-primary-foreground dark:bg-primary/10 dark:text-primary-foreground">
        <Info className="h-5 w-5 text-primary" />
        <AlertTitle className="font-semibold text-primary">Keep an Eye Out!</AlertTitle>
        <AlertDescription className="text-primary/90">
          New challenges pop up regularly. Complete them to earn points, unlock achievements, and contribute to a greener planet!
        </AlertDescription>
      </Alert>
    </div>
  );
}
