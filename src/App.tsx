/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Game from './components/Game';
import UI from './components/UI';
import HomeScreen from './components/HomeScreen';

export default function App() {
  const [appPhase, setAppPhase] = useState<'splash' | 'loading' | 'home' | 'game'>('splash');
  const [coins, setCoins] = useState(0);
  const [totalCoins, setTotalCoins] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    // Load from local storage
    const savedCoins = localStorage.getItem('totalCoins');
    const savedScore = localStorage.getItem('highScore');
    if (savedCoins) setTotalCoins(parseInt(savedCoins, 10));
    if (savedScore) setHighScore(parseInt(savedScore, 10));

    let loadingTimer: ReturnType<typeof setTimeout>;
    const splashTimer = setTimeout(() => {
      setAppPhase('loading');
      loadingTimer = setTimeout(() => {
        setAppPhase('home');
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

  const handleGameOver = () => {
    setGameOver(true);
    
    // Update high score
    const newHighScore = Math.max(Math.floor(score), highScore);
    setHighScore(newHighScore);
    localStorage.setItem('highScore', newHighScore.toString());
    
    // Update total coins
    const newTotalCoins = totalCoins + coins;
    setTotalCoins(newTotalCoins);
    localStorage.setItem('totalCoins', newTotalCoins.toString());
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
      {appPhase === 'home' && (
        <HomeScreen 
          totalCoins={totalCoins} 
          highScore={highScore} 
          onPlay={() => {
            resetGame();
            setAppPhase('game');
          }} 
        />
      )}
      <Game 
        key={resetKey}
        isPaused={isPaused || gameOver || appPhase !== 'game'} 
        onGameOver={handleGameOver} 
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
