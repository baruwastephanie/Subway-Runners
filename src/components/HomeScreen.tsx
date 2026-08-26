import React from 'react';
import { Settings, Key, Star, Trophy, User, ShoppingCart, Calendar } from 'lucide-react';

interface HomeScreenProps {
  totalCoins: number;
  highScore: number;
  onPlay: () => void;
}

export default function HomeScreen({ totalCoins, highScore, onPlay }: HomeScreenProps) {
  return (
    <div 
      className="absolute inset-0 z-50 flex flex-col justify-between p-4 cursor-pointer"
      onClick={onPlay}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between mt-2" onClick={e => e.stopPropagation()}>
        {/* Resources container */}
        <div className="flex gap-2 bg-black/30 backdrop-blur-sm px-3 py-2 rounded-full shadow-lg">
          {/* Keys */}
          <div className="flex items-center gap-1 bg-sky-900/60 rounded-full px-2 py-0.5 border border-sky-400">
            <Key className="w-4 h-4 text-sky-300" />
            <span className="text-white font-bold text-sm shadow-sm">5</span>
          </div>
          {/* Coins */}
          <div className="flex items-center gap-1 bg-amber-900/60 rounded-full px-2 py-0.5 border border-amber-400">
            <div className="w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center">
              <Star className="w-3 h-3 text-white fill-white" />
            </div>
            <span className="text-white font-bold text-sm shadow-sm">{totalCoins.toLocaleString()}</span>
            <div className="w-4 h-4 bg-lime-500 rounded-full flex items-center justify-center text-white text-xs font-black ml-1 leading-none shadow-sm pb-0.5">+</div>
          </div>
        </div>

        {/* Right side: Multiplier and Settings */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span className="text-amber-400 font-black text-xl drop-shadow-md">x2</span>
            <Star className="w-8 h-8 text-amber-400 fill-amber-400 drop-shadow-md" />
          </div>
          <button className="text-white drop-shadow-md hover:scale-110 transition-transform">
            <Settings className="w-8 h-8 drop-shadow-md" />
          </button>
        </div>
      </div>

      {/* High Score Box */}
      <div className="self-start mt-6 bg-black/40 backdrop-blur-sm rounded-2xl flex items-center overflow-hidden border border-white/20 shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="bg-white/20 p-2">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
            <User className="w-8 h-8 text-sky-600" />
          </div>
        </div>
        <div className="px-4 py-2">
          <div className="text-white/80 font-bold text-xs uppercase tracking-wide">High Score</div>
          <div className="text-white font-black text-xl drop-shadow-md">{highScore.toLocaleString()}</div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center pointer-events-none">
        {/* Invisible spacer so the text is pushed down a bit but not to the very bottom */}
      </div>

      {/* Tap to Play Text */}
      <div className="text-center mb-8 pointer-events-none">
        <h1 className="text-white text-4xl font-black drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] animate-bounce">
          Tap to Play
        </h1>
      </div>

      {/* Bottom Nav */}
      <div className="flex justify-between items-end gap-2 px-2 pb-2" onClick={e => e.stopPropagation()}>
        <NavButton icon={<Trophy />} label="Missions" badge="1" />
        <NavButton icon={<User />} label="Me" badge="2" />
        <NavButton icon={<ShoppingCart />} label="Shop" badge="2" />
        <NavButton icon={<Calendar />} label="Events" />
      </div>
    </div>
  );
}

function NavButton({ icon, label, badge }: { icon: React.ReactNode, label: string, badge?: string }) {
  return (
    <button className="flex-1 flex flex-col items-center justify-center bg-blue-600/90 hover:bg-blue-500 transition-colors border-2 border-white/80 rounded-xl py-2 relative shadow-lg group">
      {badge && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm z-10">
          {badge}
        </div>
      )}
      <div className="text-white group-hover:scale-110 transition-transform drop-shadow-sm mb-1">
        {React.cloneElement(icon as React.ReactElement, { className: 'w-6 h-6' })}
      </div>
      <span className="text-white font-black text-[10px] tracking-wider uppercase drop-shadow-sm">{label}</span>
    </button>
  );
}
