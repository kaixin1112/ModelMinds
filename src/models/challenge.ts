export interface Challenge {
  id: string;
  title: string;
  description: string;
  targetMaterial: string; // e.g., 'Plastic', 'Glass', 'Any'
  targetAmount: number; // e.g., 5 (kg), 3 (items)
  currentAmount: number;
  unit: 'kg' | 'items' | 'transactions';
  rewardPoints: number;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  isCompleted?: boolean; // Calculated or set
  completionDate?: string; // ISO date string, set when challenge is completed
  category: 'Weekly' | 'Special Event' | 'Milestone';
  iconName?: string; // Optional: for a specific Lucide icon related to the challenge theme
  color?: string; // Optional: for theming the card, e.g. 'bg-green-100'
}
