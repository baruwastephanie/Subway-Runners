import React from 'react';
import { ArrowLeft, Trophy, Star, CheckCircle, Gift, Home } from 'lucide-react';
import { MISSIONS } from '../data/missions';

interface MissionsScreenProps {
  totalCoins: number;
  totalKeys: number;
  missionStatus: Record<string, 'incomplete' | 'completed' | 'collected'>;
  onCollect: (id: string, reward: number) => void;
  onBack: () => void;
}

export default function MissionsScreen({ totalCoins, totalKeys, missionStatus, onCollect, onBack }: MissionsScreenProps) {
  return (
    <div className="absolute inset-0 z-[150] bg-sky-900 flex flex-col p-4 touch-none overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={onBack}
          className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center border-2 border-white/40 transition-colors"
        >
          <Home className="w-8 h-8 text-white" />
        </button>
        <h1 className="text-3xl font-black text-white drop-shadow-md flex items-center gap-2">
          <Trophy className="w-8 h-8 text-yellow-400" />
          MISSIONS
        </h1>
      </div>

      {/* Missions List */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-12 pr-2 custom-scrollbar">
        {MISSIONS.map(mission => {
          const status = missionStatus[mission.id] || 'incomplete';
          let progress = 0;
          if (mission.type === 'coins') progress = totalCoins;
          if (mission.type === 'keys') progress = totalKeys;
          if (mission.type === 'chars') progress = 0; // Placeholder
          
          const isCompleted = status === 'completed';
          const isCollected = status === 'collected';
          const displayProgress = Math.min(progress, mission.target);
          const percent = Math.min(100, (displayProgress / mission.target) * 100);

          return (
            <div key={mission.id} className={`bg-white rounded-2xl p-4 shadow-xl border-4 ${isCompleted ? 'border-green-400' : isCollected ? 'border-slate-300 opacity-60' : 'border-sky-200'}`}>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-black text-slate-700 text-lg leading-tight">{mission.title}</h3>
                <div className="flex items-center gap-1 bg-amber-100 px-2 py-1 rounded-lg border border-amber-300 shadow-sm shrink-0">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="font-black text-amber-600 text-sm">{mission.reward}</span>
                </div>
              </div>
              
              {/* Progress bar */}
              {!isCollected && !isCompleted && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
                    <span>Progress</span>
                    <span>{displayProgress} / {mission.target}</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              {isCompleted && (
                <button 
                  onClick={() => onCollect(mission.id, mission.reward)}
                  className="w-full mt-3 py-3 bg-green-500 hover:bg-green-400 text-white rounded-xl font-black text-lg shadow-[0_4px_0_rgb(21,128,61)] active:shadow-[0_0px_0_rgb(21,128,61)] active:translate-y-[4px] transition-all flex justify-center items-center gap-2"
                >
                  <Gift className="w-5 h-5" />
                  COLLECT REWARD
                </button>
              )}

              {isCollected && (
                <div className="w-full mt-2 py-2 bg-slate-100 text-slate-400 rounded-xl font-bold text-sm flex justify-center items-center gap-2 border border-slate-200">
                  <CheckCircle className="w-5 h-5" />
                  COMPLETED
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
