export type MissionType = 'coins' | 'keys' | 'chars';

export interface Mission {
  id: string;
  title: string;
  target: number;
  type: MissionType;
  reward: number;
}

export const MISSIONS: Mission[] = [
  { id: 'coins_500', title: 'Collect 500 coins', target: 500, type: 'coins', reward: 200 },
  { id: 'coins_1000', title: 'Collect 1000 coins', target: 1000, type: 'coins', reward: 500 },
  { id: 'keys_50', title: 'Collect 50 keys', target: 50, type: 'keys', reward: 200 },
  { id: 'keys_100', title: 'Collect 100 keys', target: 100, type: 'keys', reward: 500 },
  { id: 'chars_3', title: 'Unlock 3 new characters', target: 3, type: 'chars', reward: 500 },
];
