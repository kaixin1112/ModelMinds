
import type { Challenge } from '@/models/challenge';
import { addDays, formatISO, startOfWeek, endOfWeek } from 'date-fns';

const today = new Date();
const startOfThisWeek = startOfWeek(today, { weekStartsOn: 1 }); // Monday
const endOfThisWeek = endOfWeek(today, { weekStartsOn: 1 });

const mockChallenges: Challenge[] = [
  {
    id: 'weekly-plastic-hero',
    title: 'Plastic Hero Challenge',
    description: 'Recycle plastic items and become a hero for the environment this week!',
    targetMaterial: 'Plastic',
    targetAmount: 5,
    currentAmount: 2.5,
    unit: 'kg',
    rewardPoints: 150,
    startDate: formatISO(startOfThisWeek),
    endDate: formatISO(endOfThisWeek),
    category: 'Weekly',
    iconName: 'Recycle', 
    color: 'bg-sky-500/10 dark:bg-sky-700/30 border-sky-500/40 dark:border-sky-600/50',
  },
  {
    id: 'glass-collector-pro',
    title: 'Glass Collector Pro',
    description: 'Show your dedication by recycling glass bottles and jars.',
    targetMaterial: 'Glass',
    targetAmount: 10,
    currentAmount: 8,
    unit: 'items',
    rewardPoints: 200,
    startDate: formatISO(startOfThisWeek),
    endDate: formatISO(endOfThisWeek),
    category: 'Weekly',
    iconName: 'GlassWater', 
    color: 'bg-lime-500/10 dark:bg-lime-700/30 border-lime-500/40 dark:border-lime-600/50',
  },
  {
    id: 'ewaste-eradicator-sprint', // Changed ID
    title: 'E-Waste Eradicator Sprint', // Changed title
    description: 'Dispose of your old gadgets responsibly! Recycle electronic waste and earn bonus points.', // Changed description
    targetMaterial: 'Electronic Waste', // Changed target material
    targetAmount: 3, // Kept target amount, unit might need adjustment for e-waste (e.g., items or kg)
    currentAmount: 3, // Completed
    unit: 'kg', // Kept unit as kg, could be 'items' for e-waste
    rewardPoints: 100,
    startDate: formatISO(addDays(startOfThisWeek, -7)), 
    endDate: formatISO(addDays(endOfThisWeek, -7)),
    isCompleted: true,
    completionDate: formatISO(addDays(endOfThisWeek, -8)), 
    category: 'Weekly',
    iconName: 'Cpu', // Changed icon (Cpu from lucide-react as a placeholder for e-waste)
    color: 'bg-primary/10 dark:bg-primary/20 border-primary/40 dark:border-primary/50',
  },
  {
    id: 'metal-master-mission',
    title: 'Metal Master Mission',
    description: 'Collect and recycle metal cans and items for a hefty point reward.',
    targetMaterial: 'Metal',
    targetAmount: 2,
    currentAmount: 0.5,
    unit: 'kg',
    rewardPoints: 120,
    startDate: formatISO(startOfThisWeek),
    endDate: formatISO(endOfThisWeek),
    category: 'Weekly',
    iconName: 'Container', 
    color: 'bg-slate-400/10 dark:bg-slate-600/30 border-slate-400/40 dark:border-slate-500/50',
  },
  {
    id: 'all-star-recycler-event',
    title: 'All-Star Recycler Event',
    description: 'Recycle any combination of materials to reach the target weight and win big!',
    targetMaterial: 'Any', 
    targetAmount: 10,
    currentAmount: 7.8,
    unit: 'kg',
    rewardPoints: 300,
    startDate: formatISO(today),
    endDate: formatISO(addDays(today, 14)), 
    category: 'Special Event',
    iconName: 'Star',
    color: 'bg-purple-500/10 dark:bg-purple-700/30 border-purple-500/40 dark:border-purple-600/50',
  },
  {
    id: 'first-transaction-bonus',
    title: 'First Step to Green!',
    description: 'Complete your first recycling transaction and get bonus points.',
    targetMaterial: 'Any',
    targetAmount: 1,
    currentAmount: 0,
    unit: 'transactions',
    rewardPoints: 50,
    startDate: formatISO(addDays(startOfThisWeek, -30)), 
    endDate: formatISO(addDays(endOfThisWeek, 30)),
    category: 'Milestone',
    iconName: 'Gift', 
    color: 'bg-pink-500/10 dark:bg-pink-700/30 border-pink-500/40 dark:border-pink-600/50',
  },
  {
    id: 'paper-power-push',
    title: 'Paper Power Push',
    description: 'Collect all your waste paper and contribute to this week\'s paper drive.',
    targetMaterial: 'Paper',
    targetAmount: 4,
    currentAmount: 1.2,
    unit: 'kg',
    rewardPoints: 90,
    startDate: formatISO(startOfThisWeek),
    endDate: formatISO(endOfThisWeek),
    category: 'Weekly',
    iconName: 'Sparkles', 
    color: 'bg-yellow-500/10 dark:bg-yellow-700/30 border-yellow-500/40 dark:border-yellow-600/50',
  }
];

export async function getWeeklyChallenges(): Promise<Challenge[]> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return mockChallenges.map(challenge => {
    // Ensure completion date is set if completed and not already set
    const isCurrentlyCompleted = challenge.currentAmount >= challenge.targetAmount && !isPast(new Date(challenge.endDate));
    if (isCurrentlyCompleted && !challenge.isCompleted) {
        challenge.isCompleted = true;
        challenge.completionDate = formatISO(new Date()); // Set completion to now if just completed
    } else if (challenge.isCompleted && !challenge.completionDate) {
        // If marked completed but no date, set to end date or today if end date passed
        challenge.completionDate = isPast(new Date(challenge.endDate)) ? challenge.endDate : formatISO(new Date());
    }


    return challenge;
  }).sort((a,b) => {
    const aIsActive = !a.isCompleted && !isPast(new Date(a.endDate));
    const bIsActive = !b.isCompleted && !isPast(new Date(b.endDate));
    const aIsExpired = !a.isCompleted && isPast(new Date(a.endDate));
    const bIsExpired = !b.isCompleted && isPast(new Date(b.endDate));

    if (aIsActive && !bIsActive) return -1; // Active challenges first
    if (!aIsActive && bIsActive) return 1;

    if (aIsActive && bIsActive) return new Date(a.endDate).getTime() - new Date(b.endDate).getTime(); // Sort active by soonest end date

    if (a.isCompleted && !b.isCompleted) return -1; // Completed challenges before expired/future
    if (!a.isCompleted && b.isCompleted) return 1;
    
    if (a.isCompleted && b.isCompleted) return new Date(b.completionDate!).getTime() - new Date(a.completionDate!).getTime(); // Sort completed by most recent

    if (aIsExpired && !bIsExpired) return 1; // Expired challenges last
    if (!aIsExpired && bIsExpired) return -1;
    if (aIsExpired && bIsExpired) return new Date(a.endDate).getTime() - new Date(b.endDate).getTime(); // Sort expired by end date

    // Fallback for challenges that are not active, not completed, not expired (e.g. future challenges)
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
  });
}

function isPast(date: Date): boolean {
  const todayAtMidnight = new Date();
  todayAtMidnight.setHours(0, 0, 0, 0);
  
  const compareDate = new Date(date);
  // For end date, consider it past if the day after the end date has begun
  compareDate.setDate(compareDate.getDate() + 1); 
  compareDate.setHours(0,0,0,0);

  return compareDate <= todayAtMidnight;
}

