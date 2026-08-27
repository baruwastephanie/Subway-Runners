import React from 'react';
import { Pause, Play, RotateCcw, Key, Home } from 'lucide-react';

interface UIProps {
  coins: number;
  keys: number;
  score: number;
  isPaused: boolean;
  gameOver: boolean;
  onPauseToggle: () => void;
  onRestart: () => void;
  onHome: () => void;
  onEndGame: () => void;
}

export default function UI({ coins, keys, score, isPaused, gameOver, onPauseToggle, onRestart, onHome, onEndGame }: UIProps) {
  return (
    <div className="absolute inset-0 pointer-events-none select-none">
      {/* Top UI */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-auto">
        <button 
          onClick={onPauseToggle}
          className="w-12 h-12 bg-blue-500 rounded-xl border-4 border-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        >
          {isPaused && !gameOver ? <Play fill="white" className="w-6 h-6 text-white" /> : <Pause fill="white" className="w-6 h-6 text-white" />}
        </button>

        <div className="flex flex-col items-end gap-2">
          {/* Collectibles Row */}
          <div className="flex gap-2">
            {/* Keys Counter */}
            <div className="bg-sky-900/80 backdrop-blur rounded-full px-3 py-1.5 border border-sky-400 flex items-center gap-1.5 shadow-lg">
              <Key className="w-5 h-5 text-sky-300" />
              <span className="text-white font-black text-lg shadow-sm">{keys}</span>
            </div>
            {/* Coins Counter */}
            <div className="bg-slate-800/80 backdrop-blur rounded-full px-4 py-2 border-2 border-white/20 flex items-center gap-2 shadow-lg">
              <span className="text-white font-black text-xl">{coins}</span>
              <div className="w-6 h-6 bg-yellow-400 rounded-full border-2 border-yellow-600 flex items-center justify-center">
                <div className="w-3 h-3 bg-yellow-200 rounded-full"></div>
              </div>
            </div>
          </div>
          <div className="text-white font-black text-2xl drop-shadow-md">
            {Math.floor(score)}m
          </div>
        </div>
      </div>

      {/* Game Over Screen */}
      {gameOver && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center pointer-events-auto backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-10 max-w-md w-full mx-4 shadow-2xl flex flex-col items-center border-8 border-slate-200">
            <h2 className="text-4xl font-black text-slate-800 mb-2">GAME OVER!</h2>
            <p className="text-slate-500 font-bold text-lg mb-6">Score: {Math.floor(score)}m</p>
            
            <div className="flex items-center gap-4 mb-8 bg-slate-100 rounded-2xl px-6 py-4 w-full justify-center">
              <div className="w-8 h-8 bg-yellow-400 rounded-full border-2 border-yellow-600 flex items-center justify-center shadow-sm">
                <div className="w-4 h-4 bg-yellow-200 rounded-full"></div>
              </div>
              <span className="text-3xl font-black text-slate-800">{coins}</span>
            </div>

            <button 
              onClick={onRestart}
              className="w-full py-4 mb-4 bg-green-500 hover:bg-green-400 text-white rounded-2xl font-black text-xl shadow-[0_6px_0_rgb(21,128,61)] active:shadow-[0_0px_0_rgb(21,128,61)] active:translate-y-[6px] transition-all flex justify-center items-center gap-2"
            >
              <RotateCcw className="w-6 h-6" />
              PLAY AGAIN
            </button>

            <button 
              onClick={onHome}
              className="w-full py-4 bg-blue-500 hover:bg-blue-400 text-white rounded-2xl font-black text-xl shadow-[0_6px_0_rgb(29,78,216)] active:shadow-[0_0px_0_rgb(29,78,216)] active:translate-y-[6px] transition-all flex justify-center items-center gap-2"
            >
              <Home className="w-6 h-6" />
              HOME
            </button>
          </div>
        </div>
      )}

      {/* Pause Screen */}
      {isPaused && !gameOver && (
        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-8 pointer-events-auto backdrop-blur-sm">
          <button 
            onClick={onPauseToggle}
            className="w-24 h-24 bg-blue-500 hover:bg-blue-400 rounded-full border-8 border-white flex items-center justify-center shadow-2xl active:scale-95 transition-transform pl-2"
          >
            <Play fill="white" className="w-10 h-10 text-white" />
          </button>

          <button 
            onClick={onEndGame}
            className="px-8 py-4 bg-red-500 hover:bg-red-400 text-white rounded-2xl font-black text-xl shadow-[0_6px_0_rgb(185,28,28)] active:shadow-[0_0px_0_rgb(185,28,28)] active:translate-y-[6px] transition-all flex justify-center items-center gap-2"
          >
            <Home className="w-6 h-6" />
            END GAME
          </button>
        </div>
      )}
    </div>
  );
}
