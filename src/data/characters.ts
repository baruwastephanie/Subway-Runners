export type CurrencyType = 'coins' | 'keys';

export interface Character {
  id: string;
  name: string;
  cost: number;
  currency: CurrencyType;
  colors: {
    primary: string;
    secondary: string;
    skin: string;
    hair: string;
    shoes: string;
  };
}

export const CHARACTERS: Character[] = [
  {
    id: 'default',
    name: 'Santa Girl',
    cost: 0,
    currency: 'coins',
    colors: { primary: '#cc1d1d', secondary: '#ffffff', skin: '#fcd8ba', hair: '#4a2f1d', shoes: '#555555' }
  },
  {
    id: 'runner1',
    name: 'Jake',
    cost: 50,
    currency: 'coins',
    colors: { primary: '#3b82f6', secondary: '#ef4444', skin: '#fcd8ba', hair: '#1f2937', shoes: '#10b981' }
  },
  {
    id: 'runner2',
    name: 'Tricky',
    cost: 100,
    currency: 'coins',
    colors: { primary: '#ec4899', secondary: '#f59e0b', skin: '#fcd8ba', hair: '#facc15', shoes: '#3b82f6' }
  },
  {
    id: 'runner3',
    name: 'Fresh',
    cost: 200,
    currency: 'coins',
    colors: { primary: '#10b981', secondary: '#3b82f6', skin: '#8b5a2b', hair: '#111827', shoes: '#ef4444' }
  },
  {
    id: 'runner4',
    name: 'Yutani',
    cost: 500,
    currency: 'coins',
    colors: { primary: '#84cc16', secondary: '#22c55e', skin: '#4ade80', hair: '#14532d', shoes: '#052e16' }
  },
  {
    id: 'runner5',
    name: 'Lucy',
    cost: 1000,
    currency: 'coins',
    colors: { primary: '#8b5cf6', secondary: '#d946ef', skin: '#fcd8ba', hair: '#ec4899', shoes: '#6366f1' }
  },
  {
    id: 'runner6',
    name: 'Ninja',
    cost: 50,
    currency: 'keys',
    colors: { primary: '#111827', secondary: '#374151', skin: '#fcd8ba', hair: '#000000', shoes: '#111827' }
  },
  {
    id: 'runner7',
    name: 'Tagbot',
    cost: 80,
    currency: 'keys',
    colors: { primary: '#94a3b8', secondary: '#cbd5e1', skin: '#94a3b8', hair: '#475569', shoes: '#334155' }
  },
  {
    id: 'runner8',
    name: 'Zombie',
    cost: 100,
    currency: 'keys',
    colors: { primary: '#15803d', secondary: '#047857', skin: '#86efac', hair: '#166534', shoes: '#4b5563' }
  },
  {
    id: 'runner9',
    name: 'King',
    cost: 200,
    currency: 'keys',
    colors: { primary: '#eab308', secondary: '#ca8a04', skin: '#fcd8ba', hair: '#ffffff', shoes: '#a16207' }
  }
];
