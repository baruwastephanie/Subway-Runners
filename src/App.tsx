/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Game from './components/Game';
import UI from './components/UI';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [coins, setCoins] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);

  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    return () => clearTimeout(timer);
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
      {showSplash && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black">
          <img 
            src="https://i.postimg.cc/BbkfgcmG/Chat-GPT-Image-Aug-23-2026-05-49-25-AM.png" 
            alt="Splash Screen" 
            className="w-full h-full object-cover" 
            referrerPolicy="no-referrer"
          />
        </div>
      )}
      <Game 
        key={resetKey}
        isPaused={isPaused || gameOver || showSplash} 
        onGameOver={() => setGameOver(true)} 
        onCoinCollect={() => setCoins(c => c + 1)}
        onScoreUpdate={(s) => setScore(s)}
      />
      {!showSplash && (
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
