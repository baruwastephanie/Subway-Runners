/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Game from './components/Game';
import UI from './components/UI';

export default function App() {
  const [appPhase, setAppPhase] = useState<'splash' | 'loading' | 'game'>('splash');
  const [coins, setCoins] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);

  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    let loadingTimer: ReturnType<typeof setTimeout>;
    const splashTimer = setTimeout(() => {
      setAppPhase('loading');
      loadingTimer = setTimeout(() => {
        setAppPhase('game');
      }, 5000);
    }, 3000);
    return () => {
      clearTimeout(splashTimer);
      if (loadingTimer) clearTimeout(loadingTimer);
    };
  }, []);

  const resetGame = () => {
    setCoins(0);
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    setResetKey(k => k + 1);
  };

  return (
    <div className="w-screen h-screen relative overflow-hidden bg-sky-300 touch-none">
      {appPhase === 'splash' && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black">
          <img 
            src="https://i.postimg.cc/BbkfgcmG/Chat-GPT-Image-Aug-23-2026-05-49-25-AM.png" 
            alt="Splash Screen" 
            className="w-full h-full object-cover" 
            referrerPolicy="no-referrer"
          />
        </div>
      )}
      {appPhase === 'loading' && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black">
          <img 
            src="https://i.postimg.cc/HxQrFzJW/Chat-GPT-Image-Aug-26-2026-02-19-08-PM.png" 
            alt="Loading Screen" 
            className="w-full h-full object-cover" 
            referrerPolicy="no-referrer"
          />
        </div>
      )}
      <Game 
        key={resetKey}
        isPaused={isPaused || gameOver || appPhase !== 'game'} 
        onGameOver={() => setGameOver(true)} 
        onCoinCollect={() => setCoins(c => c + 1)}
        onScoreUpdate={(s) => setScore(s)}
      />
      {appPhase === 'game' && (
        <UI 
          coins={coins} 
          score={score}
          isPaused={isPaused} 
          gameOver={gameOver}
          onPauseToggle={() => setIsPaused(!isPaused)}
          onRestart={resetGame}
        />
      )}
    </div>
  );
}
