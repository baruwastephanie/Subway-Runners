/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Game from './components/Game';
import UI from './components/UI';
import HomeScreen from './components/HomeScreen';
import MissionsScreen from './components/MissionsScreen';
import MeScreen from './components/MeScreen';
import { MISSIONS } from './data/missions';

export default function App() {
  const [appPhase, setAppPhase] = useState<'splash' | 'loading' | 'home' | 'game' | 'missions' | 'me'>('splash');
  const [coins, setCoins] = useState(0);
  const [keys, setKeys] = useState(0);
  const [totalCoins, setTotalCoins] = useState(0);
  const [totalKeys, setTotalKeys] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  
  const [unlockedCharacters, setUnlockedCharacters] = useState<string[]>(['default']);
  const [activeCharacterId, setActiveCharacterId] = useState('default');

  const [missionStatus, setMissionStatus] = useState<Record<string, 'incomplete' | 'completed' | 'collected'>>({});
  const [notifiedMissions, setNotifiedMissions] = useState<string[]>([]);

  const [resetKey, setResetKey] = useState(0);

  // Helper to check for completed missions
  const checkMissions = (currentCoins: number, currentKeys: number, charsCount: number, currentStatus: Record<string, string>) => {
    let updated = false;
    const newStatus = { ...currentStatus };
    const newlyCompleted: string[] = [];
    
    MISSIONS.forEach(m => {
      if (newStatus[m.id]) return; 
      let progress = 0;
      if (m.type === 'coins') progress = currentCoins;
      if (m.type === 'keys') progress = currentKeys;
      if (m.type === 'chars') progress = charsCount;
      if (progress >= m.target) {
        newStatus[m.id] = 'completed';
        newlyCompleted.push(m.title);
        updated = true;
      }
    });
    
    if (updated) {
      setMissionStatus(newStatus as any);
      localStorage.setItem('missionStatus', JSON.stringify(newStatus));
      if (newlyCompleted.length > 0) {
        setNotifiedMissions(prev => [...prev, ...newlyCompleted]);
      }
    }
    return newStatus;
  };

  useEffect(() => {
    // Load from local storage
    const savedCoins = localStorage.getItem('totalCoins');
    const savedKeys = localStorage.getItem('totalKeys');
    const savedScore = localStorage.getItem('highScore');
    const savedMissions = localStorage.getItem('missionStatus');
    const savedUnlocked = localStorage.getItem('unlockedCharacters');
    const savedActive = localStorage.getItem('activeCharacterId');
    
    let initCoins = 0;
    let initKeys = 0;
    let initStatus = {};

    // First time players get 0
    if (savedCoins) initCoins = parseInt(savedCoins, 10);
    else localStorage.setItem('totalCoins', '0');
    
    if (savedKeys) initKeys = parseInt(savedKeys, 10);
    else localStorage.setItem('totalKeys', '0');

    if (savedScore) setHighScore(parseInt(savedScore, 10));
    else localStorage.setItem('highScore', '0');

    if (savedMissions) initStatus = JSON.parse(savedMissions);
    
    if (savedUnlocked) setUnlockedCharacters(JSON.parse(savedUnlocked));
    if (savedActive) setActiveCharacterId(savedActive);
    
    setTotalCoins(initCoins);
    setTotalKeys(initKeys);
    setMissionStatus(initStatus as any);
    
    // Retroactively check missions in case they passed thresholds before missions were added
    checkMissions(initCoins, initKeys, savedUnlocked ? JSON.parse(savedUnlocked).length : 1, initStatus);


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
    setKeys(0);
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

    // Update total keys
    const newTotalKeys = totalKeys + keys;
    setTotalKeys(newTotalKeys);
    localStorage.setItem('totalKeys', newTotalKeys.toString());

    // Check newly completed missions
    checkMissions(newTotalCoins, newTotalKeys, unlockedCharacters.length, missionStatus);
  };

  const handleCollectReward = (missionId: string, reward: number) => {
    const newStatus = { ...missionStatus, [missionId]: 'collected' };
    setMissionStatus(newStatus as any);
    localStorage.setItem('missionStatus', JSON.stringify(newStatus));
    
    const newTotalCoins = totalCoins + reward;
    setTotalCoins(newTotalCoins);
    localStorage.setItem('totalCoins', newTotalCoins.toString());
    
    // Check if the rewarded coins triggered any new missions
    checkMissions(newTotalCoins, totalKeys, unlockedCharacters.length, newStatus);
  };

  const handleUnlockCharacter = (id: string, cost: number, currency: 'coins' | 'keys') => {
    if (currency === 'coins') {
      if (totalCoins < cost) return false;
      const newTotalCoins = totalCoins - cost;
      setTotalCoins(newTotalCoins);
      localStorage.setItem('totalCoins', newTotalCoins.toString());
    } else {
      if (totalKeys < cost) return false;
      const newTotalKeys = totalKeys - cost;
      setTotalKeys(newTotalKeys);
      localStorage.setItem('totalKeys', newTotalKeys.toString());
    }

    const newUnlocked = [...unlockedCharacters, id];
    setUnlockedCharacters(newUnlocked);
    localStorage.setItem('unlockedCharacters', JSON.stringify(newUnlocked));
    
    // Check missions for characters
    checkMissions(currency === 'coins' ? totalCoins - cost : totalCoins, currency === 'keys' ? totalKeys - cost : totalKeys, newUnlocked.length, missionStatus);
    
    return true;
  };

  const handleSelectCharacter = (id: string) => {
    setActiveCharacterId(id);
    localStorage.setItem('activeCharacterId', id);
  };

  return (
    <div className="w-screen h-screen relative overflow-hidden bg-sky-300 touch-none">
      {notifiedMissions.length > 0 && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-3 w-[90%] max-w-sm pointer-events-auto">
          {notifiedMissions.map((title, i) => (
            <div key={i} className="bg-green-500 text-white p-4 rounded-2xl shadow-2xl border-4 border-white flex flex-col items-center gap-2 animate-bounce">
              <div className="font-black text-xl tracking-wide drop-shadow-md">MISSION COMPLETE!</div>
              <div className="font-bold text-center mb-1">{title}</div>
              <div className="flex gap-2 w-full">
                <button 
                  onClick={() => setNotifiedMissions(prev => prev.filter((_, idx) => idx !== i))} 
                  className="flex-1 bg-black/20 rounded-xl py-2 font-black text-sm hover:bg-black/30 transition-colors"
                >
                  DISMISS
                </button>
                <button 
                  onClick={() => { 
                    setNotifiedMissions(prev => prev.filter((_, idx) => idx !== i)); 
                    setAppPhase('missions'); 
                  }} 
                  className="flex-1 bg-white text-green-600 rounded-xl py-2 font-black text-sm hover:bg-slate-100 transition-colors"
                >
                  MISSIONS
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
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
          totalKeys={totalKeys}
          highScore={highScore} 
          onPlay={() => {
            resetGame();
            setAppPhase('game');
          }} 
          onMissionsClick={() => setAppPhase('missions')}
          onMeClick={() => setAppPhase('me')}
        />
      )}
      {appPhase === 'missions' && (
        <MissionsScreen
          totalCoins={totalCoins}
          totalKeys={totalKeys}
          unlockedCharactersCount={unlockedCharacters.length}
          missionStatus={missionStatus}
          onCollect={handleCollectReward}
          onBack={() => setAppPhase('home')}
        />
      )}
      {appPhase === 'me' && (
        <MeScreen
          totalCoins={totalCoins}
          totalKeys={totalKeys}
          unlockedCharacters={unlockedCharacters}
          activeCharacterId={activeCharacterId}
          onUnlock={handleUnlockCharacter}
          onSelect={handleSelectCharacter}
          onBack={() => setAppPhase('home')}
        />
      )}
      <Game 
        key={resetKey}
        isPaused={isPaused || gameOver || appPhase !== 'game'} 
        characterId={activeCharacterId}
        onGameOver={handleGameOver} 
        onCoinCollect={() => setCoins(c => c + 1)}
        onKeyCollect={() => setKeys(k => k + 1)}
        onScoreUpdate={(s) => setScore(s)}
      />
      {appPhase === 'game' && (
        <UI 
          coins={coins} 
          keys={keys}
          score={score}
          isPaused={isPaused} 
          gameOver={gameOver}
          onPauseToggle={() => setIsPaused(!isPaused)}
          onRestart={resetGame}
          onHome={() => setAppPhase('home')}
        />
      )}
    </div>
  );
}
